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

    // 보험금 탐색 및 셀 편집 중 메인 창 자동 로그아웃 방지
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

// 세대별 보상하지 않는 손해 판별 (1~5세대 변천사 로직)
function isExcludedByGeneration(hospital, name, code, typeNum) {
    const h = hospital || "";
    const n = name || "";
    const c = code || "";
    
    const isDental = h.includes('치과') || c.startsWith('K0');
    const isOriental = h.includes('한방') || h.includes('한의원');
    const isProctology = n.includes('치질') || n.includes('치핵') || n.includes('항문') || c.startsWith('I84') || c.startsWith('K64');
    const isPsychiatry = n.includes('정신') || n.includes('우울') || n.includes('치매') || c.startsWith('F');

    // 1세대는 상기 항목 모두 보상 제외
    if (typeNum === 1) {
        if (isDental || isOriental || isProctology || isPsychiatry) return true;
    }
    
    // 2~5세대는 급여 보장 등 조건부 보장이므로 일단 면책시키지 않음
    return false;
}

// 실손 세대별 공제금 계산기 (5세대 반영)
function calculateDeduction(cost, type, hospitalName) {
    let deduction = 0;
    let typeNum = parseInt(type);
    let isPharmacy = hospitalName.includes('약국');
    
    if (typeNum === 1) {
        deduction = 5000;
    } else if (typeNum === 2 || typeNum === 3) {
        deduction = isPharmacy ? 8000 : 15000;
        let percentDeduction = cost * 0.1;
        deduction = Math.max(deduction, percentDeduction);
    } else if (typeNum === 4) {
        deduction = cost * 0.2;
    } else if (typeNum === 5) {
        deduction = isPharmacy ? 8000 : 10000; 
        let percentDeduction = cost * 0.2;
        deduction = Math.max(deduction, percentDeduction);
    }
    return Math.min(deduction, cost); 
}

// 4. 메인 분석 함수 (클라우드 런 API 통신)
async function startAnalysis() {
    const pdfPassword = document.getElementById('pdfPassword').value;
    const silsoneType = document.getElementById('silsoneType').value;
    const typeNum = parseInt(silsoneType);
    
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
        
        const basicRecords = data.basicRecords || [];
        const creditRecords = data.creditRecords || [];

        if (basicRecords.length === 0 && creditRecords.length === 0) {
            throw new Error("분석된 데이터가 없습니다. 원본 파일이 맞는지 확인해주세요.");
        }

        let unclaimedRecords = [];
        
        // 신용정보원 기지급 건 전체 출력
        let paidRecords = creditRecords.map(credit => ({
            date: credit.date,
            hospital: "-",
            company: credit.company,
            paidAmount: credit.paidAmount
        }));

        basicRecords.forEach(basic => {
            const bDate = new Date(basic.date);
            
            // ±3일 오차범위 매칭
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
                let claimable = 0;
                let deduction = 0;
                let hospName = basic.hospital;
                
                if (isExcludedByGeneration(basic.hospital, basic.name, basic.code, typeNum)) {
                    deduction = basic.cost;
                    hospName += ` <span class="text-rose-500">[1세대 면책]</span>`;
                } else {
                    deduction = calculateDeduction(basic.cost, silsoneType, basic.hospital);
                    claimable = basic.cost - deduction;
                }
                
                if (claimable > 0) {
                    unclaimedRecords.push({
                        date: basic.date,
                        hospital: hospName,
                        code: basic.code,
                        name: basic.name,
                        cost: basic.cost,
                        deduction: deduction,
                        claimable: claimable
                    });
                }
            }
        });

        unclaimedRecords.sort((a, b) => a.hospital.localeCompare(b.hospital));
        
        document.getElementById('waitingSection').style.display = 'none';
        document.getElementById('resultSection').style.display = 'block';
        renderTables(unclaimedRecords, paidRecords);

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
            <td contenteditable="true" onblur="updateTotal()" class="whitespace-nowrap">${record.cost.toLocaleString()}원</td>
            <td contenteditable="true" onblur="updateTotal()" class="whitespace-nowrap">${record.deduction.toLocaleString()}원</td>
            <td contenteditable="true" class="font-bold text-orange-600 bg-orange-50 whitespace-nowrap" onblur="updateTotal()">${record.claimable.toLocaleString()}</td>
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
