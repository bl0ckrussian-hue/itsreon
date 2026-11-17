// 보안 접근 점검 (비로그인 접근 즉시 차단)
(function checkRionAuth() {
    const user = localStorage.getItem('rion_logged_user');
    const session = localStorage.getItem('rion_session_id');
    if (!user || !session) {
        alert('보안 접근입니다. 메인 홈페이지에서 로그인 후 이용해 주세요.');
        window.close();
        location.replace('./index.html');
    }
})();

const CLOUD_RUN_URL = "https://insurancemoney-225817792244.asia-northeast3.run.app";

let uploadedFiles = [];
// 서버에서 한 번 추출한 원본 데이터를 보관하여 세대 변경 시 즉시 재계산 지원
let cachedBasicRecords = [];
let cachedCreditRecords = [];

function closeMoneyWindow() {
    window.close();
}

function triggerMoneyFileInput() {
    const input = document.getElementById('fileInput');
    if (input) input.click();
}

// 1. 사용자 이름 불러오기 및 자동 로그아웃 방지
document.addEventListener("DOMContentLoaded", () => {
    const userName = localStorage.getItem('rion_logged_user') || '사용자';
    const nameEl = document.getElementById('displayUserName');
    if (nameEl) nameEl.innerText = userName;

    const syncRionActivity = () => {
        if (localStorage.getItem('rion_logged_user')) {
            localStorage.setItem('rion_last_activity', Date.now().toString());
        }
    };
    syncRionActivity();
    ['mousedown', 'keypress', 'scroll', 'touchstart'].forEach(evt =>
        document.addEventListener(evt, syncRionActivity, { passive: true })
    );
    setInterval(syncRionActivity, 3 * 60 * 1000);
});

// 2. 파일 드래그 앤 드롭 및 리스트 관리 로직
const dropzone = document.getElementById('dropzone');
const fileListEl = document.getElementById('fileList');

if (dropzone) {
    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
    });
    dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('dragover');
    });
    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });
}

function handleFiles(files) {
    const newFiles = Array.from(files).filter(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
    if (newFiles.length === 0) {
        alert('PDF 파일만 업로드 가능합니다.');
        return;
    }
    uploadedFiles = [...uploadedFiles, ...newFiles];
    renderFileList();
}

function removeFile(index) {
    uploadedFiles.splice(index, 1);
    renderFileList();
}

function renderFileList() {
    if (!fileListEl) return;
    if (uploadedFiles.length === 0) {
        fileListEl.classList.add('hidden');
        return;
    }
    fileListEl.classList.remove('hidden');
    fileListEl.innerHTML = uploadedFiles.map((file, idx) => `
        <div class="flex items-center justify-between bg-slate-100 px-4 py-2.5 rounded-lg border border-slate-200">
            <div class="flex items-center gap-2 text-sm text-slate-700 font-medium truncate">
                <span>📄</span> <span class="truncate">${file.name}</span> <span class="text-xs text-slate-400 whitespace-nowrap">(${(file.size/1024).toFixed(1)} KB)</span>
            </div>
            <button type="button" onclick="removeFile(${idx}); event.stopPropagation();" class="text-slate-400 hover:text-rose-500 font-bold ml-2 shrink-0">✕</button>
        </div>
    `).join('');
}

const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = error => reject(error);
});

// =========================================================================
// 3. 실비 마스터급 세대별 정밀 계산 엔진 (데이터 한계 보정 포함)
// =========================================================================

// 3-1. 병원명 기반 요양기관 종별 판별
function classifyFacility(hospitalName) {
    const h = (hospitalName || "").replace(/\s+/g, '');
    if (h.includes('약국')) return 'PHARMACY';

    // 상급종합병원 및 종합병원급 키워드
    const generalKeywords = [
        '대학교', '대학병원', '종합병원', '의료원', '아산병원', '삼성서울',
        '세브란스', '성모병원', '길병원', '백병원', '차병원', '보훈병원',
        '적십자병원', '경찰병원', '일산병원', '암센터', '원자력병원', '효성병원', '성모병원', '하나병원'
    ];
    if (generalKeywords.some(kw => h.includes(kw))) return 'GENERAL_HOSP';

    // 일반 병원급 (치과병원, 한방병원, 요양병원 포함)
    if (h.includes('병원')) return 'HOSPITAL';

    // 그 외 의원, 치과의원, 한의원, 보건소 등
    return 'CLINIC';
}

// 3-2. 입원 / 외래 판별 (기본진료정보 원문 데이터 '입원/외래' 기준 100% 반영, 금액 추정 제거)
function getVisitType(recordInOut) {
    const io = (recordInOut || "").trim();
    if (io.includes('입원')) return 'INPATIENT';
    return 'OUTPATIENT';
}

// 3-3. 세대별 면책(보상 제외) 상병 및 기관 판별
// 주의: 심평원 상병코드는 앞에 'A'(양방) 등이 붙는 경우가 있어 정규식으로 표준 KCD 코드 추출 (예: AK047 -> K047)
function normalizeKcdCode(rawCode) {
    const clean = (rawCode || "").trim().toUpperCase();
    // 앞에 A(양방)나 B(한방) 등이 붙고 뒤에 알파벳+숫자가 오는 심평원 특유 포맷 보정
    const match = clean.match(/^[AB]?([A-Z]\d{2,4})/);
    return match ? match[1] : clean;
}

function isExcludedByGeneration(hospital, name, rawCode, silsoneType) {
    const h = hospital || "";
    const n = name || "";
    const kcd = normalizeKcdCode(rawCode);

    // 비급여/예방/검진/미용 목적 코드 (Z코드 중 치과보철 장착 등 단순 처치성 제외 검토)
    const isDental = h.includes('치과') || kcd.startsWith('K0');
    const isOriental = h.includes('한방') || h.includes('한의원');
    const isProctology = n.includes('치질') || n.includes('치핵') || n.includes('치열') || n.includes('항문') || kcd.startsWith('I84') || kcd.startsWith('K60') || kcd.startsWith('K61') || kcd.startsWith('K64');
    const isPsychiatry = n.includes('정신') || n.includes('우울') || n.includes('치매') || n.includes('불안') || n.includes('불면') || kcd.startsWith('F') || kcd.startsWith('G30');

    // 1세대(손보/생보 공통): 치과, 한방, 치질, 정신과·치매 면책
    if (silsoneType.startsWith('1')) {
        if (isDental || isOriental || isProctology || isPsychiatry) return true;
    }

    // 2~5세대: 심평원 기본진료정보의 '내가 낸 의료비'는 국민건강보험이 적용된 '급여 본인부담금'이므로
    // 치과/한방/항문질환 급여분은 보상 대상에 포함됨.
    // 단, 정신질환(F코드) 중 치매(F00~F03, G30)나 2016년 이후 주요 급여 정신질환 외 일반 비보장 영역은
    // 심평원 급여 내역에 잡히므로 보수적으로 유지하되 치과보철장치(Z463) 등 명백한 비보장 보조기 코드는 제외
    if (kcd.startsWith('Z46')) return true;

    return false;
}

// 3-4. 세대별·종별·입통원별 공제액 및 청구가능금액 정밀 산출
function calculateIndemnityPrecise(cost, silsoneType, hospitalName, recordInOut) {
    if (!cost || cost <= 0) return { deduction: 0, claimable: 0, badge: '' };

    const facility = classifyFacility(hospitalName);
    const visitType = getVisitType(recordInOut);

    // 종별 정액 최소 공제금 기준 (2·3세대 표준)
    const stdMinDeduct =
        facility === 'PHARMACY' ? 8000 :
        facility === 'CLINIC' ? 10000 :
        facility === 'HOSPITAL' ? 15000 : 20000; // 상급·종합 2만원

    let claimable = 0;
    let badge = visitType === 'INPATIENT' ? '입원' : '';

    switch (silsoneType) {
        case '1_nonlife': // 1세대 손보형 (구실손 표준: 상해/질병 통원 5천원 공제, 입원 100%)
            if (visitType === 'INPATIENT') {
                claimable = Math.min(cost, 50000000); // 입원 본인부담금 0원
            } else {
                const cap = facility === 'PHARMACY' ? 100000 : 300000; // 외래 30만 / 약제 10만 일반 한도
                claimable = Math.min(Math.max(0, cost - 5000), cap);
            }
            break;

        case '1_life': // 1세대 생보형 (통원 5천원 공제 후 80%, 입원 80% 보장)
            if (visitType === 'INPATIENT') {
                claimable = Math.floor(cost * 0.8);
            } else {
                const afterDeduct = Math.max(0, cost - 5000);
                claimable = Math.min(Math.floor(afterDeduct * 0.8), 200000);
            }
            break;

        case '2': // 2세대 표준화 실손 (선택형 기준: 입원 90%, 외래 종별 1/1.5/2만 or 10% 중 큰 금액, 약국 8천 or 10%)
            if (visitType === 'INPATIENT') {
                const selfPay = Math.min(Math.ceil(cost * 0.1), 2000000); // 연간 본인부담 상한 200만 반영
                claimable = Math.max(0, cost - selfPay);
            } else {
                const deduct = Math.max(stdMinDeduct, Math.ceil(cost * 0.1));
                const cap = facility === 'PHARMACY' ? 50000 : 250000; // 표준형 합산 30만(외래 25만/약제 5만)
                claimable = Math.min(Math.max(0, cost - deduct), cap);
            }
            break;

        case '3': // 3세대 착한실손 (심평원 데이터=급여 100% 가정 -> 입원 급여 10% 공제, 통원 MAX(종별정액, 10%))
            if (visitType === 'INPATIENT') {
                const selfPay = Math.min(Math.ceil(cost * 0.1), 2000000);
                claimable = Math.max(0, cost - selfPay);
            } else {
                const deduct = Math.max(stdMinDeduct, Math.ceil(cost * 0.1));
                const cap = facility === 'PHARMACY' ? 50000 : 250000;
                claimable = Math.min(Math.max(0, cost - deduct), cap);
            }
            break;

        case '4': // 4세대 실손 (급여 20% 공제 / 통원 최소공제: 의원·병원 1만원, 상급·종합 2만원, 약국 1만원)
            if (visitType === 'INPATIENT') {
                const selfPay = Math.min(Math.ceil(cost * 0.2), 2000000);
                claimable = Math.max(0, cost - selfPay);
            } else {
                const minDed4 = (facility === 'GENERAL_HOSP') ? 20000 : 10000; // 약국·의원·병원 1만, 상급·종합 2만
                const deduct = Math.max(minDed4, Math.ceil(cost * 0.2));
                claimable = Math.min(Math.max(0, cost - deduct), 200000); // 4세대 급여 통원 회당 20만 한도
            }
            break;

        case '5': // 5세대 실손 (2026.05 기준: 급여 20% 공제 / 병·의원 1만, 상급·종합 2만, 약제 8천원 or 20% / 통원 20만 한도)
        default:
            if (visitType === 'INPATIENT') {
                const selfPay = Math.min(Math.ceil(cost * 0.2), 2000000);
                claimable = Math.max(0, cost - selfPay);
            } else {
                const minDed5 =
                    facility === 'PHARMACY' ? 8000 :
                    facility === 'GENERAL_HOSP' ? 20000 : 10000;
                const deduct = Math.max(minDed5, Math.ceil(cost * 0.2));
                const cap = facility === 'PHARMACY' ? 50000 : 200000; // 통원 회당 20만 한도
                claimable = Math.min(Math.max(0, cost - deduct), cap);
            }
            break;
    }

    // 10원 단위 절사 등 원단위 깔끔하게 정리 (원문 금액 - 청구가능금액 = 실질 공제액)
    claimable = Math.max(0, Math.round(claimable));
    const effectiveDeduction = Math.max(0, cost - claimable);

    return {
        deduction: effectiveDeduction,
        claimable: claimable,
        badge: badge
    };
}

// =========================================================================
// 4. 데이터 매칭 및 렌더링 파이프라인
// =========================================================================

function buildAndRenderResults() {
    if (cachedBasicRecords.length === 0 && cachedCreditRecords.length === 0) return;

    const silsoneSelect = document.getElementById('silsoneType');
    const silsoneType = silsoneSelect ? silsoneSelect.value : '4';

    let unclaimedRecords = [];

    // 신용정보원 기지급 건 전체 출력 초기화
    let paidRecords = cachedCreditRecords.map(credit => ({
        date: credit.date,
        hospital: "-",
        company: credit.company,
        paidAmount: credit.paidAmount
    }));

    cachedBasicRecords.forEach(basic => {
        const bDate = new Date(basic.date);

        // ±3일 오차범위 기지급 매칭
        const matchedIndex = paidRecords.findIndex(credit => {
            const cDate = new Date(credit.date);
            const diffDays = Math.abs((cDate - bDate) / (1000 * 60 * 60 * 24));
            return diffDays <= 3;
        });

        if (matchedIndex !== -1) {
            if (paidRecords[matchedIndex].hospital === "-") {
                paidRecords[matchedIndex].hospital = basic.hospital;
            } else if (!paidRecords[matchedIndex].hospital.includes(basic.hospital)) {
                paidRecords[matchedIndex].hospital += `, ${basic.hospital}`;
            }
        } else {
            // 면책 판별
            if (isExcludedByGeneration(basic.hospital, basic.name, basic.code, silsoneType)) {
                return; // 청구 가능 0원 배제 원칙에 따라 즉시 스킵
            }

            const calc = calculateIndemnityPrecise(basic.cost, silsoneType, basic.hospital, basic.inOut);

            if (calc.claimable > 0) {
                const displayHosp = calc.badge
                    ? `${basic.hospital} <span class="ml-1 text-[11px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">${calc.badge}</span>`
                    : basic.hospital;

                unclaimedRecords.push({
                    date: basic.date,
                    rawHospital: basic.hospital,
                    hospital: displayHosp,
                    code: basic.code,
                    name: basic.name,
                    cost: basic.cost,
                    deduction: calc.deduction,
                    claimable: calc.claimable
                });
            }
        }
    });

    // 같은 병원·약국끼리 정렬 (동일 병원은 최신 진료일 순)
    unclaimedRecords.sort((a, b) => {
        const cmp = a.rawHospital.localeCompare(b.rawHospital);
        return cmp !== 0 ? cmp : b.date.localeCompare(a.date);
    });

    document.getElementById('waitingSection').style.display = 'none';
    document.getElementById('resultSection').style.display = 'block';
    renderTables(unclaimedRecords, paidRecords);
}

// 실손 세대 드롭다운 변경 시 서버 재요청 없이 즉시 재계산
function recalculateCurrentData() {
    if (cachedBasicRecords.length > 0 || cachedCreditRecords.length > 0) {
        buildAndRenderResults();
    }
}

// 4-1. 메인 분석 함수 (클라우드 런 API 통신)
async function startAnalysis() {
    const pdfPassword = document.getElementById('pdfPassword').value;

    if (uploadedFiles.length === 0) {
        alert('찾기를 실행할 PDF 파일을 먼저 업로드해주세요.');
        if (window.innerWidth < 768) {
            document.getElementById('uploadSection').scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
    }

    const btn = document.getElementById('btnAnalyze');
    btn.innerHTML = `<span class="animate-pulse">찾는 중... 잠시만 기다려주세요</span>`;
    btn.disabled = true;
    btn.classList.replace('bg-blue-600', 'bg-slate-400');

    try {
        const base64Files = await Promise.all(uploadedFiles.map(file => toBase64(file)));

        const response = await fetch(CLOUD_RUN_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                files_data: base64Files,
                password: pdfPassword
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "서버 통신 오류가 발생했습니다. 비밀번호를 다시 확인해주세요.");
        }

        cachedBasicRecords = data.basicRecords || [];
        cachedCreditRecords = data.creditRecords || [];

        if (cachedBasicRecords.length === 0 && cachedCreditRecords.length === 0) {
            throw new Error("분석된 데이터가 없습니다. 원본 파일이 맞는지 확인해주세요.");
        }

        buildAndRenderResults();

        if (window.innerWidth < 768) {
            setTimeout(() => {
                document.getElementById('resultSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 300);
        }

    } catch (error) {
        alert(error.message);
    } finally {
        btn.innerHTML = `<span>🚀 찾기 실행</span>`;
        btn.disabled = false;
        btn.classList.replace('bg-slate-400', 'bg-blue-600');
    }
}

function renderTables(unclaimed, paid) {
    const unclaimedTbody = document.querySelector('#unclaimedTable tbody');
    const paidTbody = document.querySelector('#paidTable tbody');
    unclaimedTbody.innerHTML = '';
    paidTbody.innerHTML = '';

    let total = 0;

    unclaimed.forEach(record => {
        total += record.claimable;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="whitespace-nowrap">${record.date}</td>
            <td class="whitespace-nowrap">${record.hospital}</td>
            <td class="whitespace-nowrap">${record.code}</td>
            <td class="whitespace-nowrap">${record.name}</td>
            <td contenteditable="true" onblur="onRowCostOrDeductEdit(this)" class="whitespace-nowrap">${record.cost.toLocaleString()}원</td>
            <td contenteditable="true" onblur="onRowCostOrDeductEdit(this)" class="whitespace-nowrap">${record.deduction.toLocaleString()}원</td>
            <td contenteditable="true" class="font-bold text-orange-600 bg-orange-50 whitespace-nowrap" onblur="onRowClaimableEdit(this)">${record.claimable.toLocaleString()}원</td>
        `;
        unclaimedTbody.appendChild(tr);
    });

    paid.forEach(record => {
        const tr = document.createElement('tr');
        tr.className = 'row-paid';
        tr.innerHTML = `
            <td class="whitespace-nowrap">${record.date}</td>
            <td class="whitespace-nowrap">${record.hospital}</td>
            <td class="whitespace-nowrap">${record.company}</td>
            <td class="whitespace-nowrap">${record.paidAmount.toLocaleString()}원</td>
        `;
        paidTbody.appendChild(tr);
    });

    document.getElementById('totalClaimableAmount').innerText = total.toLocaleString() + '원';
}

// '내가 낸 의료비' 또는 '예상 공제금액' 셀을 수정하면 해당 행의 '청구 가능 금액'도 자동 연동
function onRowCostOrDeductEdit(cell) {
    const row = cell.parentElement;
    if (!row || row.cells.length < 7) return;

    const cost = parseInt(row.cells[4].innerText.replace(/[^0-9]/g, '')) || 0;
    const deduct = parseInt(row.cells[5].innerText.replace(/[^0-9]/g, '')) || 0;
    const newClaimable = Math.max(0, cost - deduct);

    row.cells[4].innerText = cost.toLocaleString() + '원';
    row.cells[5].innerText = deduct.toLocaleString() + '원';
    row.cells[6].innerText = newClaimable.toLocaleString() + '원';

    updateTotal();
}

// '청구 가능 금액' 셀을 직접 수정했을 때 포맷 정리 및 총합 갱신
function onRowClaimableEdit(cell) {
    const val = parseInt(cell.innerText.replace(/[^0-9]/g, '')) || 0;
    cell.innerText = val.toLocaleString() + '원';
    updateTotal();
}

function updateTotal() {
    const rows = document.querySelectorAll('#unclaimedTable tbody tr');
    let newTotal = 0;
    rows.forEach(row => {
        let valText = row.cells[6].innerText.replace(/[^0-9]/g, '');
        let val = parseInt(valText) || 0;
        newTotal += val;
    });
    document.getElementById('totalClaimableAmount').innerText = newTotal.toLocaleString() + '원';
}

// 5. 엑셀 다운로드 (SheetJS)
function downloadExcel() {
    const unclaimedTable = document.getElementById('unclaimedTable');
    const paidTable = document.getElementById('paidTable');

    if (unclaimedTable.rows.length <= 1 && paidTable.rows.length <= 1) {
        alert("다운로드할 분석 결과가 없습니다.");
        return;
    }

    let wb = XLSX.utils.book_new();
    let ws1 = XLSX.utils.table_to_sheet(unclaimedTable);
    let ws2 = XLSX.utils.table_to_sheet(paidTable);

    XLSX.utils.book_append_sheet(wb, ws1, "청구가능내역 (미청구)");
    XLSX.utils.book_append_sheet(wb, ws2, "기지급내역 (완료)");

    const userName = localStorage.getItem('rion_logged_user') || '고객';
    XLSX.writeFile(wb, `못받은보험금_분석결과_${userName}팀장.xlsx`);
}

// 보안: 우클릭, 드래그, 소스보기(F12/Ctrl+U) 차단 (입력창 및 금액 편집 셀은 정상 허용)
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});

document.addEventListener('selectstart', function(e) {
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName) || e.target.isContentEditable) return;
    e.preventDefault();
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'F12') {
        e.preventDefault();
    }
    if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i')) {
        e.preventDefault();
    }
    if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) {
        e.preventDefault();
    }
    if (e.ctrlKey && (e.key === 'C' || e.key === 'c')) {
        if (['INPUT', 'TEXTAREA'].includes(e.target.tagName) || e.target.isContentEditable) return;
        e.preventDefault();
    }
});
