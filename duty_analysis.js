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

const CLOUD_FUNCTION_URL = "https://pdf-analyxer-225817792244.asia-northeast3.run.app";

let activeResultTab = 'tab1';
let selectedPdfFiles = [];
let currentTab1Markdown = "";
let currentTab2Markdown = "";
let globalRawExcelData = {};

function closeDutyWindow() {
    window.close();
}

document.addEventListener('DOMContentLoaded', () => {
    const userName = localStorage.getItem('rion_logged_user') || '게스트';
    const nameEl = document.getElementById('loggedUserName');
    if (nameEl) nameEl.innerText = userName;

    // 알릴의무 분석 및 검토 중 메인 창 자동 로그아웃 방지
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

function togglePasswordVisibility() {
    const pwdInput = document.getElementById('pdfPasswordInput');
    if (!pwdInput) return;
    pwdInput.type = pwdInput.type === 'password' ? 'text' : 'password';
}

function toggleDebugVisibility() {
    const content = document.getElementById('dutyDebugContent');
    const icon = document.getElementById('debugToggleIcon');
    if (!content || !icon) return;
    if (content.classList.contains('hidden')) {
        content.classList.remove('hidden');
        icon.innerText = '▲';
    } else {
        content.classList.add('hidden');
        icon.innerText = '▼';
    }
}

function switchResultTab(tabName) {
    activeResultTab = tabName;
    const btn1 = document.getElementById('tabBtn1');
    const btn2 = document.getElementById('tabBtn2');
    const tab1Content = document.getElementById('tab1Content');
    const tab2Content = document.getElementById('tab2Content');
    const excelBtnText = document.getElementById('excelBtnText');

    if (tabName === 'tab1') {
        btn1.className = "flex-1 sm:flex-none px-4 py-2 font-bold text-xs rounded-lg bg-slate-900 text-white transition shadow-sm";
        btn2.className = "flex-1 sm:flex-none px-4 py-2 font-bold text-xs rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition";
        tab1Content.classList.remove('hidden');
        tab2Content.classList.add('hidden');
        if (excelBtnText) excelBtnText.innerText = "[신규] 분석보고서 다운로드";
    } else {
        btn2.className = "flex-1 sm:flex-none px-4 py-2 font-bold text-xs rounded-lg bg-slate-900 text-white transition shadow-sm";
        btn1.className = "flex-1 sm:flex-none px-4 py-2 font-bold text-xs rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition";
        tab2Content.classList.remove('hidden');
        tab1Content.classList.add('hidden');
        if (excelBtnText) excelBtnText.innerText = "[통합] 고지위반 점검보고서 다운로드";
    }
}

function changeContractCount(delta) {
    const input = document.getElementById('contractCountInput');
    let val = parseInt(input.value) || 0;
    val = Math.max(0, Math.min(10, val + delta));
    input.value = val;
    renderContractDateInputs();
}

function renderContractDateInputs() {
    const count = parseInt(document.getElementById('contractCountInput').value) || 0;
    const container = document.getElementById('contractDatesContainer');
    container.innerHTML = '';
    if (count === 0) return;
    const todayStr = new Date().toISOString().split('T')[0];
    for (let i = 0; i < count; i++) {
        const div = document.createElement('div');
        div.className = "bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1";
        div.innerHTML = `
            <label class="block text-[11px] font-bold text-slate-700">#${i + 1} 계약 체결일 (청약일)</label>
            <input type="date" id="contractDate_${i}" value="${todayStr}" class="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 focus:border-blue-500">
        `;
        container.appendChild(div);
    }
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

const dropZone = document.getElementById('pdfDropZone');
if (dropZone) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    dropZone.addEventListener('click', function(e) {
        if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'A') {
            document.getElementById('pdfFileInput').click();
        }
    });
    dropZone.addEventListener('dragover', function() {
        this.classList.add('border-blue-500', 'bg-blue-50');
    });
    dropZone.addEventListener('dragleave', function() {
        this.classList.remove('border-blue-500', 'bg-blue-50');
    });
    dropZone.addEventListener('drop', function(e) {
        this.classList.remove('border-blue-500', 'bg-blue-50');
        const dt = e.dataTransfer;
        if (dt && dt.files && dt.files.length > 0) {
            processFiles(dt.files);
            document.getElementById('pdfFileInput').files = dt.files;
        }
    });
}

function handlePdfSelect(event) {
    if (event.target.files && event.target.files.length > 0) processFiles(event.target.files);
}

function processFiles(files) {
    const pdfOnly = Array.from(files).filter(f => f.name.toLowerCase().endsWith('.pdf') || f.type === 'application/pdf');
    if (pdfOnly.length === 0) {
        alert('PDF 파일만 업로드할 수 있습니다.');
        return;
    }
    selectedPdfFiles = pdfOnly;
    const nameDisplay = document.getElementById('pdfFileNameDisplay');
    if (nameDisplay) {
        nameDisplay.innerHTML = selectedPdfFiles.map(f => `📄 ${f.name}`).join('<br>');
        nameDisplay.classList.add('text-blue-600');
    }
}

function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
    });
}

function downloadParsedRawExcel() {
    if (!globalRawExcelData || Object.keys(globalRawExcelData).length === 0 || globalRawExcelData['기본진료정보'].length === 0) {
        alert('우선 PDF를 업로드하고 [분석 실행]을 눌러 데이터를 추출해 주세요.');
        return;
    }

    const wb = XLSX.utils.book_new();
    
    for (let sheetName in globalRawExcelData) {
        const sheetData = globalRawExcelData[sheetName];
        if (sheetData.length > 0) {
            let header = [];
            if (sheetName === '기본진료정보' || sheetName === '교통사고기본') header = ["순번", "진료시작일", "병·의원&약국", "진단과", "입원/외래", "상병코드", "상병명", "내원일수", "총진료비", "건강보험등", "내가낸의료비"];
            else if (sheetName === '세부진료정보' || sheetName === '교통사고세부') header = ["순번", "진료시작일", "병·의원&약국", "진료내역", "코드명", "1회투약량", "1일투여횟수", "총투약일수"];
            else if (sheetName === '처방조제정보') header = ["순번", "진료시작일", "병·의원&약국", "약품명", "성분명", "1회투약량", "1일투여횟수", "총투약일수"];
            
            const wsData = [header, ...sheetData];
            const ws = XLSX.utils.aoa_to_sheet(wsData);
            XLSX.utils.book_append_sheet(wb, ws, sheetName);
        }
    }

    const timeStr = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 12);
    XLSX.writeFile(wb, `심평원_원본추출데이터_${timeStr}.xlsx`);
}

function buildOriginalAnalysisPrompt(analysisData, fileNames) {
    const { diseaseAgg, summaryCounts } = analysisData;
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const today = new Date(utc + (9 * 60 * 60 * 1000)); 

    const diffDaysFn = (dateStr) => {
        if (!dateStr || dateStr.length < 8) return 9999;
        const dt = new Date(parseInt(dateStr.substring(0, 4)), parseInt(dateStr.substring(5, 7)) - 1, parseInt(dateStr.substring(8, 10)));
        const diffTime = today.getTime() - dt.getTime();
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    };

    const totalCostStr = summaryCounts && summaryCounts.totalCost ? summaryCounts.totalCost.toLocaleString() + "원" : "0원";
    let markdownRows = "";

    const critical6Keywords = ["암", "악성신생물", "협심증", "심근경색", "뇌졸중", "뇌출혈", "뇌경색", "간경화", "간경변", "심장판막"];

    for (let dis in diseaseAgg) {
        const agg = diseaseAgg[dis];
        let isTarget = false;
        const reason = [];

        let validVisitCnt = 0; 
        const yearlyVisits = {};
        let recent3Month = false;
        let hasPriorRecord = false;
        let has5YearRecord = false; 
        
        agg.visitDates.forEach(d => {
            const diff = diffDaysFn(d);
            if (diff >= 0 && diff <= 365 * 5) {
                validVisitCnt += 1;
                has5YearRecord = true;
                const y = d.substring(0, 4);
                yearlyVisits[y] = (yearlyVisits[y] || 0) + 1;
                
                if (diff <= 90) recent3Month = true;
                else if (diff > 90) hasPriorRecord = true;
            }
        });

        const validAdmits = agg.admits.filter(e => {
            const diff = diffDaysFn(e.date);
            if (diff >= 0 && diff <= 365 * 5) {
                has5YearRecord = true;
                if (diff <= 90) recent3Month = true;
                else if (diff > 90) hasPriorRecord = true;
                return true;
            }
            return false;
        });

        const validSurgs = agg.surgs.filter(e => diffDaysFn(e.date) >= 0 && diffDaysFn(e.date) <= 365*5);
        const validTests = agg.tests.filter(e => diffDaysFn(e.date) >= 0 && diffDaysFn(e.date) <= 365);

        let isCritical6 = false;
        if (has5YearRecord) {
            for (let kw of critical6Keywords) {
                if (dis.includes(kw)) {
                    isCritical6 = true;
                    isTarget = true;
                    reason.push("6대질병 치료력");
                    break;
                }
            }
        }

        let isSimplified3MonthNew = false;
        if (recent3Month && !hasPriorRecord) {
            isSimplified3MonthNew = true;
        }

        if (recent3Month) { isTarget = true; reason.push("3개월내 내원"); }
        if (validTests.length > 0) { isTarget = true; reason.push("1년내 검사"); }
        if (validAdmits.length > 0) { isTarget = true; reason.push("입원"); }
        if (validSurgs.length > 0) { isTarget = true; reason.push("수술"); }
        if (validVisitCnt >= 7) { isTarget = true; reason.push("7일이상치료"); }
        if (agg.totalMedDays >= 30) { isTarget = true; reason.push("30일이상투약"); }

        if (isSimplified3MonthNew) {
            reason.push("간편심사_3개월신규");
        }

        if (!isTarget) continue;

        let visitStr = `${validVisitCnt}회`;
        if (validVisitCnt >= 7 && Object.keys(yearlyVisits).length > 0) {
            const yearList = Object.keys(yearlyVisits).sort().reverse().map(y => `${y}년(${yearlyVisits[y]}회)`).join('<br>');
            visitStr = `${validVisitCnt}회<br>(${yearList})`;
        }

        const allDates = [...agg.visitDates.filter(d => diffDaysFn(d) >= 0 && diffDaysFn(d) <= 365 * 5), ...validAdmits.map(a => a.date)].sort();
        const firstDate = allDates.length > 0 ? allDates[0] : "-";
        const lastDate = allDates.length > 0 ? allDates[allDates.length - 1] : "-";
        
        const fDateFmt = firstDate || "-";
        const lDateFmt = lastDate || "-";
        
        const hospitalsStr = agg.hospitals.join(', ');
        
        const uniqueReasons = [...new Set(reason)];
        const reasonStr = uniqueReasons.join(', ');

        let mainRowSurg = validSurgs.length > 0 ? "예" : "아니오";
        let mainRowSurgName = validSurgs.length > 0 ? validSurgs[0].name + (validSurgs.length > 1 ? " 외" : "") : "-";
        
        let totalAdmitDays = validAdmits.reduce((acc, curr) => acc + curr.days, 0);
        let admitStr = totalAdmitDays > 0 ? `${totalAdmitDays}일` : "-";
        let costStr = agg.totalCost > 0 ? agg.totalCost.toLocaleString() + "원" : "0원";

        const medNamesStr = agg.medNames.length > 0 ? `[처방] ${agg.medNames.join(', ')}` : "";

        // 1. 메인 행 출력 (약물을 제거하고 병명만 표기)
        markdownRows += `| ${dis} | ${hospitalsStr} | ${fDateFmt} | ${lDateFmt} | ${visitStr} | ${admitStr} | **${mainRowSurg}** | **${mainRowSurgName}** | **<span style="color:${isCritical6 ? 'red' : 'inherit'}">${reasonStr}</span>** | **${costStr}** |\n`;

        // 2. 처방 내역을 하부 행으로 추가하고 나머지 칸은 하이픈(-)으로 통합 기재
        if (medNamesStr) {
            markdownRows += `| ↳ | **${medNamesStr}** | - | - | - | - | - | - | - | - |\n`;
        }

        validAdmits.forEach(ad => {
            let dFmt = ad.date.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
            markdownRows += `| ↳ | | ${dFmt} | ${dFmt} | - | ${ad.days}일 | 아니오 | - | 입원 상세내역 | - |\n`;
        });

        validSurgs.forEach(sg => {
            let dFmt = sg.date.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
            markdownRows += `| ↳ | | ${dFmt} | ${dFmt} | - | - | 예 | **${sg.name}** | 수술/시술 상세내역 | - |\n`;
        });
    }

    if (markdownRows === "") markdownRows = "| 기고지 위반 의심내역 없음 | - | - | - | - | - | - | - | - | - |\n";

    const prompt = `[시스템 설정 및 역할]
당신은 최고 수준의 보험 심사 시스템 내 'AI 감독관' 입니다.
당신 내부에는 두 명의 독립적인 'AI 심사자 A'와 'AI 심사자 B'가 존재합니다.

[절대원칙 지침]
1. [AI 3중 검증 로직]: 
   - 하부 행(↳)에 표기된 \`[처방] 약품명...\`을 바탕으로, 주상병과 명백히 다른 별개의 질환 치료목적으로 보이는 약일 경우에만 1열의 병명 아랫줄에 \`<br>**(유추) 질환명**\`을 확정하여 기재합니다.
   - 분석 후 \`[처방] 약품명...\` 하부 행(↳)은 지우지 말고 그대로 출력하십시오.
2. [원문 조작 금지]: 추출된 **"수술 및 시술 명칭(띄어쓰기 포함)"**, 처방 내역, 횟수, 행 개수, 금액은 100% 동일하게 복사해서 출력하십시오. 절대 요약하거나 임의로 묶지 마십시오.
3. 비고란의 출력은 "3개월내 내원", "1년내 검사", "입원", "수술", "7일이상치료", "30일이상투약", "6대질병 치료력" 중에서만 표기하십시오.
   👉 **단, 표에 '간편심사_3개월신규'가 적혀있다면 출력 시 '3개월내 내원(신규)'로 글자를 바꾸어 출력하십시오.**

---
**[사전 완성된 마크다운 데이터 (AI 교차 검증용 원본)]**
| 질병명 (진단코드) | 병원명 | 최초진료일 | 최종진료일 | 통원(횟수) | 입원(일수) | 수술(여부) | 수술 및 시술 명칭 | 비고 | 내가 낸 의료비 |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: | :--- | :--- | :---: |
${markdownRows}

---
### **[최종 심사 보고서]**
(🚨 반드시 고객 성명을 파일명(${fileNames})에서 찾아 "**OOO님의 보험 점검을 위한 알릴의무분석 보고서입니다. (총 내가 낸 의료비: ${totalCostStr})**" 로 시작하십시오. AI 교차 검증 과정은 노출하지 말고 오직 최종 표 2개만 출력하십시오.)

#### 1️⃣ [일반심사] 표준 알릴의무 (요약)
| 질병명 (진단코드) | 병원명 | 최초진료일 | 최종진료일 | 통원(횟수) | 입원(일수) | 수술(여부) | 수술 및 시술 명칭 | 비고 | 내가 낸 의료비 |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: | :--- | :--- | :---: |

#### 2️⃣ [간편심사] 유병자(3-N-5) 기준 위반 사항
*(위 1번 표 전체를 바탕으로, '입원', '수술', '6대질병 치료력' 이력이 있거나 비고란에 '3개월내 내원(신규)'가 포함된 행만 필터링하여 기재하십시오. 기존에 치료받던 단순 통원만 있는 건은 엄격히 제외합니다. 대상이 없으면 '해당 없음'으로 기재하십시오.)*
`;
    return { prompt, summaryCounts, markdownRows };
}

function buildViolationCheckPrompt(analysisData, targetDate, fileNames) {
    const { diseaseAgg, summaryCounts } = analysisData || {};
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const targetKST = targetDate ? targetDate : new Date(utc + (9 * 60 * 60 * 1000)); 

    const diffDaysFn = (dateStr) => {
        if (!dateStr || dateStr.length < 8) return 9999;
        const dt = new Date(parseInt(dateStr.substring(0, 4)), parseInt(dateStr.substring(5, 7)) - 1, parseInt(dateStr.substring(8, 10)));
        const diffTime = targetKST.getTime() - dt.getTime();
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    };

    const totalCostStr = summaryCounts && summaryCounts.totalCost ? summaryCounts.totalCost.toLocaleString() + "원" : "0원";
    let markdownRows = "";
    let summaryTab2 = { visit3mCount: 0, surg: 0, admit: 0, med30: 0, visit7: 0 }; 

    const critical6Keywords = ["암", "악성신생물", "협심증", "심근경색", "뇌졸중", "뇌출혈", "뇌경색", "간경화", "간경변", "심장판막"];

    for (let dis in diseaseAgg) {
        const agg = diseaseAgg[dis];
        let isTarget = false;
        const reason = [];

        let validVisitCnt = 0; 
        const yearlyVisits = {};
        let hasRecent3MonthRecord = false; 
        let hasPriorRecord = false;   
        let has5YearRecord = false;
        
        agg.visitDates.forEach(d => {
            const diff = diffDaysFn(d);
            if (diff >= 0 && diff <= 365 * 5) {
                validVisitCnt += 1;
                has5YearRecord = true;
                const y = d.substring(0, 4);
                yearlyVisits[y] = (yearlyVisits[y] || 0) + 1;
                
                if (diff <= 90) hasRecent3MonthRecord = true;
                else if (diff > 90) hasPriorRecord = true;
            }
        });

        const validAdmits = agg.admits.filter(e => {
            const diff = diffDaysFn(e.date);
            if (diff >= 0 && diff <= 365 * 5) {
                has5YearRecord = true;
                if (diff <= 90) hasRecent3MonthRecord = true;
                else if (diff > 90) hasPriorRecord = true;
                return true;
            }
            return false;
        });
        
        const validSurgs = agg.surgs.filter(e => diffDaysFn(e.date) >= 0 && diffDaysFn(e.date) <= 365*5);
        const validTests = agg.tests.filter(e => diffDaysFn(e.date) >= 0 && diffDaysFn(e.date) <= 365);

        let isCritical6 = false;
        if (has5YearRecord) {
            for (let kw of critical6Keywords) {
                if (dis.includes(kw)) {
                    isCritical6 = true;
                    isTarget = true;
                    reason.push("6대질병 치료력");
                    break;
                }
            }
        }

        let isSimplified3MonthNew = false;
        if (hasRecent3MonthRecord && !hasPriorRecord) {
            isSimplified3MonthNew = true;
        }

        if (hasRecent3MonthRecord) { isTarget = true; reason.push("3개월내 내원"); }
        if (validTests.length > 0) { isTarget = true; reason.push("1년내 검사"); }
        if (validAdmits.length > 0) { isTarget = true; reason.push("입원"); }
        if (validSurgs.length > 0) { isTarget = true; reason.push("수술"); }
        if (validVisitCnt >= 7) { isTarget = true; reason.push("7일이상치료"); }

        let validMedDays = 0;
        for (let d in agg.meds) {
            const diff = diffDaysFn(d);
            if (diff >= 0 && diff <= 365 * 5) {
                validMedDays += agg.meds[d];
            }
        }
        if (validMedDays >= 30) { isTarget = true; reason.push("30일이상투약"); }

        if (isSimplified3MonthNew) {
            reason.push("간편심사_3개월신규");
        }

        if (!isTarget || (validVisitCnt === 0 && validAdmits.length === 0)) continue;

        if (hasRecent3MonthRecord) summaryTab2.visit3mCount++;
        summaryTab2.surg += validSurgs.length;
        summaryTab2.admit += validAdmits.length;
        if (validMedDays >= 30) summaryTab2.med30++;
        if (validVisitCnt >= 7) summaryTab2.visit7++;

        let visitStr = `${validVisitCnt}회`;
        if (validVisitCnt >= 7 && Object.keys(yearlyVisits).length > 0) {
            const yearList = Object.keys(yearlyVisits).sort().reverse().map(y => `${y}년(${yearlyVisits[y]}회)`).join('<br>');
            visitStr = `${validVisitCnt}회<br>(${yearList})`;
        }

        const allDates = [...agg.visitDates.filter(d => diffDaysFn(d) >= 0 && diffDaysFn(d) <= 365 * 5), ...validAdmits.map(a => a.date)].sort();
        const firstDate = allDates.length > 0 ? allDates[0] : "-";
        const lastDate = allDates.length > 0 ? allDates[allDates.length - 1] : "-";
        
        const fDateFmt = firstDate || "-";
        const lDateFmt = lastDate || "-";
        
        const hospitalsStr = agg.hospitals.join(', ');
        
        const uniqueReasons = [...new Set(reason)];
        const reasonStr = uniqueReasons.join(', ');

        let mainRowSurg = validSurgs.length > 0 ? "예" : "아니오";
        let mainRowSurgName = validSurgs.length > 0 ? validSurgs[0].name + (validSurgs.length > 1 ? " 외" : "") : "-";
        
        let totalAdmitDays = validAdmits.reduce((acc, curr) => acc + curr.days, 0);
        let admitStr = totalAdmitDays > 0 ? `${totalAdmitDays}일` : "-";
        let costStr = agg.totalCost > 0 ? agg.totalCost.toLocaleString() + "원" : "0원";

        markdownRows += `| ${dis} | ${hospitalsStr} | ${fDateFmt} | ${lDateFmt} | ${visitStr} | ${admitStr} | **${mainRowSurg}** | **${mainRowSurgName}** | **<span style="color:${isCritical6 ? 'red' : 'inherit'}">${reasonStr}</span>** | **${costStr}** |\n`;

        const medNamesStr = (validMedDays > 0 && agg.medNames.length > 0) ? `[처방] ${agg.medNames.join(', ')}` : "";
        if (medNamesStr) {
            markdownRows += `| ↳ | **${medNamesStr}** | - | - | - | - | - | - | - | - |\n`;
        }

        validAdmits.forEach(ad => {
            let dFmt = ad.date.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
            markdownRows += `| ↳ | | ${dFmt} | ${dFmt} | - | ${ad.days}일 | 아니오 | - | 입원 상세내역 | - |\n`;
        });

        validSurgs.forEach(sg => {
            let dFmt = sg.date.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
            markdownRows += `| ↳ | | ${dFmt} | ${dFmt} | - | - | 예 | **${sg.name}** | 수술/시술 상세내역 | - |\n`;
        });
    }

    if (markdownRows === "") markdownRows = "| 기계약 고지위반 의심내역 없음 | - | - | - | - | - | - | - | - | - |\n";
    const targetDateStr = targetKST.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

    const prompt = `[시스템 설정 및 역할]
당신은 최고 수준의 보험 심사 시스템 내 'AI 감독관' 입니다.
🕒 **분석 요청 시점(입력된 청약일 기준):** ${targetDateStr}

🚨 **[절대원칙 - 텍스트 조작 금지]**
1. [AI 3중 검증 로직]: 두 명의 AI 심사자가 교차 검증을 진행하여 처방 약물을 유추 병명으로 표기합니다. 
   - 하부 행(↳)에 표기된 \`[처방] 약품명...\`을 바탕으로 1열의 병명 아랫줄에 \`<br>**(유추) 질환명**\`을 확정하여 기재합니다.
   - 분석 후 \`[처방] 약품명...\` 하부 행(↳)은 지우지 말고 그대로 출력하십시오.
2. 아래 [사전 완성된 마크다운 데이터]의 **"수술 및 시술 명칭(띄어쓰기 포함)"**, 처방 내역, 횟수, 행 개수, 금액은 100% 동일하게 복사해서 출력하십시오. 절대 요약하거나 임의로 묶지 마십시오.
3. 비고란의 출력은 "3개월내 내원", "1년내 검사", "입원", "수술", "7일이상치료", "30일이상투약", "6대질병 치료력" 중에서만 표기하십시오.
   👉 **단, 표에 '간편심사_3개월신규'가 적혀있다면 출력 시 '3개월내 내원(신규)'로 글자를 바꾸어 출력하십시오.**

---
**[사전 완성된 마크다운 데이터]**
| 질병명 (진단코드) | 병원명 | 최초진료일 | 최종진료일 | 통원(횟수) | 입원(일수) | 수술(여부) | 수술 및 시술 명칭 | 비고 | 내가 낸 의료비 |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: | :--- | :--- | :---: |
${markdownRows}

---
### **[최종 심사 보고서]**
(🚨 반드시 고객 성명을 파일명(${fileNames})에서 찾아 "**OOO님의 기계약 고지위반 점검 검토 보고서입니다. (총 내가 낸 의료비: ${totalCostStr})**" 로 시작하십시오.)

#### 1️⃣ [일반심사] 표준 알릴의무 (요약)
| 질병명 (진단코드) | 병원명 | 최초진료일 | 최종진료일 | 통원(횟수) | 입원(일수) | 수술(여부) | 수술 및 시술 명칭 | 비고 | 내가 낸 의료비 |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: | :--- | :--- | :---: |

#### 2️⃣ [간편심사] 유병자(3-N-5) 기준 위반 사항
*(위 1번 표 전체를 바탕으로, '입원', '수술', '6대질병 치료력' 이력이 있거나 비고란에 '3개월내 내원(신규)'가 포함된 행만 필터링하여 기재하십시오. 기존에 치료받던 단순 통원만 있는 건은 엄격히 제외합니다. 대상이 없으면 '해당 없음'으로 기재하십시오.)*
`;
    return { prompt, summaryTab2 };
}

async function callGeminiApi(promptText, key) {
    const proxyUrl = "https://script.google.com/macros/s/AKfycbwz9QL6wb6GUlgygtnMOwsvXzbA2eZuhx-JIXQc-1TZCiAWZdV0IUxaqg7GbcMoO72P/exec";
    try {
        const res = await fetch(proxyUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ prompt: promptText })
        });
        const data = await res.json();
        if (data && data.candidates && data.candidates.length > 0) {
            return data.candidates[0].content.parts[0].text;
        }
        throw new Error("분석 응답을 받지 못했습니다.");
    } catch (e) {
        throw new Error(e.message);
    }
}

async function executeCloudAnalysis() {
    const pdfPassword = document.getElementById('pdfPasswordInput').value.trim();

    if (!selectedPdfFiles || selectedPdfFiles.length === 0) {
        alert('진료기록 PDF 파일을 먼저 첨부해주세요.');
        return;
    }
    
    document.getElementById('emptyState').classList.add('hidden');
    const progressArea = document.getElementById('dutyProgressArea');
    const progressText = document.getElementById('dutyProgressText');
    const progressBar = document.getElementById('dutyProgressBar');
    const progressPercent = document.getElementById('dutyProgressPercent');
    const resultContainer = document.getElementById('dutyResultContainer');

    progressArea.classList.remove('hidden');
    resultContainer.classList.add('hidden');

    let progressTimer = null;
    let currentP = 0;
    function startFakeProgress(start, cap, intervalSpeed) {
        currentP = start;
        if (progressTimer) clearInterval(progressTimer);
        progressTimer = setInterval(() => {
            if (currentP < cap) {
                currentP += 1;
                progressBar.style.width = currentP + '%';
                progressPercent.innerText = currentP + '%';
            }
        }, intervalSpeed);
    }

    try {
        progressText.innerText = `☁️ 파일을 안전하게 전송 중입니다...`;
        startFakeProgress(0, 30, 200); 

        const fileDataArray = [];
        for (let i = 0; i < selectedPdfFiles.length; i++) {
            fileDataArray.push(await getBase64(selectedPdfFiles[i]));
        }

        progressText.innerText = "⚙️ 데이터 분석 중...";
        startFakeProgress(30, 60, 300); 

        const response = await fetch(CLOUD_FUNCTION_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ files_data: fileDataArray, password: pdfPassword })
        });

        let analysisData = null;
        try {
            analysisData = await response.json();
        } catch(e) {
        }

        if (!response.ok) {
            if (analysisData && analysisData.error && analysisData.error.includes("비밀번호")) {
                throw new Error("PWD_ERROR");
            }
            throw new Error("서버와 통신 에러가 발생했습니다.");
        }
        
        if (analysisData && analysisData.error) {
            if (analysisData.error.includes("비밀번호")) {
                throw new Error("PWD_ERROR");
            }
            throw new Error(analysisData.error);
        }

        globalRawExcelData = analysisData.rawExcelData;

        const fileNames = selectedPdfFiles.map(f => f.name).join(', ');
        const { prompt: promptTab1, summaryCounts, markdownRows } = buildOriginalAnalysisPrompt(analysisData, fileNames);

        document.getElementById('dutyDebugContent').innerHTML = `
            <div class="text-amber-400 font-bold mb-2">📊 [데이터 추출 완료]</div>
            <div class="text-[10px] text-emerald-300 mb-1">▶ 통원/입원/수술/투약 통합 엑셀 행 (AI에 전달되는 최종 데이터)</div>
            <pre class="text-slate-300 pl-2 border-l-2 border-slate-600 overflow-x-auto text-[10px]">\n${markdownRows}</pre>
            <div class="text-[10px] text-rose-300 mt-3 mb-1">▶ 시스템 감지 수술/시술 목록</div>
            <pre class="text-slate-300 pl-2 border-l-2 border-slate-600 text-[10px]">\n${analysisData.detectedInfo.surgeries.join('\n') || '없음'}</pre>
            <div class="text-[10px] text-blue-300 mt-3 mb-1">▶ 시스템 감지 처방 목록 (AI가 이걸 보고 유추 상병을 만듭니다)</div>
            <pre class="text-slate-300 pl-2 border-l-2 border-slate-600 text-[10px]">\n${analysisData.detectedInfo.long_term_meds.join('\n') || '없음'}</pre>
        `;

        // 1. 신규 분석 요약 카드 5개 생성 (3개월내 내원 추가)
        const now = new Date();
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        const today = new Date(utc + (9 * 60 * 60 * 1000));
        let visit3mCountTab1 = 0;
        
        for (let dis in analysisData.diseaseAgg) {
            let recent3Month = false;
            const agg = analysisData.diseaseAgg[dis];
            
            agg.visitDates.forEach(d => {
                if (!d || d.length < 8) return;
                const dt = new Date(parseInt(d.substring(0, 4)), parseInt(d.substring(5, 7)) - 1, parseInt(d.substring(8, 10)));
                const diffDays = Math.floor((today.getTime() - dt.getTime()) / (1000 * 60 * 60 * 24));
                if (diffDays >= 0 && diffDays <= 90) recent3Month = true;
            });
            
            agg.admits.forEach(a => {
                const d = a.date;
                if (!d || d.length < 8) return;
                const dt = new Date(parseInt(d.substring(0, 4)), parseInt(d.substring(5, 7)) - 1, parseInt(d.substring(8, 10)));
                const diffDays = Math.floor((today.getTime() - dt.getTime()) / (1000 * 60 * 60 * 24));
                if (diffDays >= 0 && diffDays <= 90) recent3Month = true;
            });
            
            if (recent3Month) visit3mCountTab1++;
        }

        const summaryCardsEl = document.getElementById('dutySummaryCards');
        summaryCardsEl.className = "grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs flex-shrink-0";
        summaryCardsEl.innerHTML = `
            <div class="bg-amber-50 p-3.5 rounded-xl border border-amber-100 text-center shadow-sm">
                <span class="text-[10px] font-bold text-amber-600 block">3개월내 내원</span>
                <span class="text-lg font-black text-amber-700 mt-0.5 block">${visit3mCountTab1} 건</span>
            </div>
            <div class="bg-rose-50 p-3.5 rounded-xl border border-rose-100 text-center shadow-sm">
                <span class="text-[10px] font-bold text-rose-600 block">수술/시술</span>
                <span class="text-lg font-black text-rose-700 mt-0.5 block">${summaryCounts.surg} 건</span>
            </div>
            <div class="bg-blue-50 p-3.5 rounded-xl border border-blue-100 text-center shadow-sm">
                <span class="text-[10px] font-bold text-blue-600 block">입원</span>
                <span class="text-lg font-black text-blue-700 mt-0.5 block">${summaryCounts.admit} 건</span>
            </div>
            <div class="bg-emerald-50 p-3.5 rounded-xl border border-emerald-100 text-center shadow-sm">
                <span class="text-[10px] font-bold text-emerald-600 block">30일 이상 투약</span>
                <span class="text-lg font-black text-emerald-700 mt-0.5 block">${summaryCounts.med30} 건</span>
            </div>
            <div class="bg-indigo-50 p-3.5 rounded-xl border border-indigo-100 text-center shadow-sm">
                <span class="text-[10px] font-bold text-indigo-600 block">7일 이상 치료</span>
                <span class="text-lg font-black text-indigo-700 mt-0.5 block">${summaryCounts.visit7} 건</span>
            </div>
        `;

        progressText.innerText = "🤖 분석 보고서를 작성 중입니다...";
        startFakeProgress(60, 95, 800); 

        const aiMarkdown1 = await callGeminiApi(promptTab1, "");
        currentTab1Markdown = aiMarkdown1;

        // 신규심사 홈페이지 화면에서 [처방] 내역 열을 가로로 하나로 통합(colspan=9)
        let htmlView1 = window.marked ? window.marked.parse(aiMarkdown1) : `<pre>${aiMarkdown1}</pre>`;
        htmlView1 = htmlView1.replace(/<tr>\s*<td[^>]*>↳<\/td>\s*<td[^>]*>(.*?)<\/td>(?:\s*<td[^>]*>.*?<\/td>){8}\s*<\/tr>/g, function(match, p1) {
            if (p1.includes('[처방]')) {
                return `<tr><td style="text-align:center;">↳</td><td colspan="9" style="text-align:left;">${p1}</td></tr>`;
            }
            return match;
        });

        // 2. 기계약 점검 보고서 생성
        const contractCount = parseInt(document.getElementById('contractCountInput').value) || 0;
        if (contractCount > 0) {
            let fullOldMarkdown = "";
            let fullOldCardsHtml = ""; 
            
            for (let contractIdx = 0; contractIdx < contractCount; contractIdx++) {
                const dateInput = document.getElementById(`contractDate_${contractIdx}`);
                const dVal = dateInput ? dateInput.value : "";
                if (dVal) {
                    const parts = dVal.split('-');
                    const targetDateObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
                    
                    progressText.innerText = `⏳ 계약 #${contractIdx + 1} (${dVal}) 기준으로 고지위반 점검 중...`;
                    
                    const { prompt: promptTab2, summaryTab2 } = buildViolationCheckPrompt(analysisData, targetDateObj, fileNames);
                    const aiRespOld = await callGeminiApi(promptTab2, "");
                    
                    fullOldCardsHtml += `
                    <div class="mb-6">
                        <h3 class="text-sm font-bold text-slate-800 mb-2">📑 계약 #${contractIdx + 1} (청약일: ${dVal}) 요약</h3>
                        <div class="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                            <div class="bg-amber-50 p-3.5 rounded-xl border border-amber-100 text-center shadow-sm">
                                <span class="text-[10px] font-bold text-amber-600 block">3개월내 내원</span>
                                <span class="text-lg font-black text-amber-700 mt-0.5 block">${summaryTab2.visit3mCount} 건</span>
                            </div>
                            <div class="bg-rose-50 p-3.5 rounded-xl border border-rose-100 text-center shadow-sm">
                                <span class="text-[10px] font-bold text-rose-600 block">수술/시술</span>
                                <span class="text-lg font-black text-rose-700 mt-0.5 block">${summaryTab2.surg} 건</span>
                            </div>
                            <div class="bg-blue-50 p-3.5 rounded-xl border border-blue-100 text-center shadow-sm">
                                <span class="text-[10px] font-bold text-blue-600 block">입원</span>
                                <span class="text-lg font-black text-blue-700 mt-0.5 block">${summaryTab2.admit} 건</span>
                            </div>
                            <div class="bg-emerald-50 p-3.5 rounded-xl border border-emerald-100 text-center shadow-sm">
                                <span class="text-[10px] font-bold text-emerald-600 block">30일 이상 투약</span>
                                <span class="text-lg font-black text-emerald-700 mt-0.5 block">${summaryTab2.med30} 건</span>
                            </div>
                            <div class="bg-indigo-50 p-3.5 rounded-xl border border-indigo-100 text-center shadow-sm">
                                <span class="text-[10px] font-bold text-indigo-600 block">7일 이상 치료</span>
                                <span class="text-lg font-black text-indigo-700 mt-0.5 block">${summaryTab2.visit7} 건</span>
                            </div>
                        </div>
                    </div>`;

                    fullOldMarkdown += `\n\n### 📑 계약 #${contractIdx + 1} (청약일: ${dVal})\n> **주의:** 포함되지 않은 진료기록은 분석에서 제외되었습니다.\n\n` + aiRespOld + "\n\n---";
                }
            }
            currentTab2Markdown = fullOldMarkdown;
            
            let htmlView2 = window.marked ? window.marked.parse(fullOldMarkdown) : `<pre>${fullOldMarkdown}</pre>`;
            htmlView2 = htmlView2.replace(/<tr>\s*<td[^>]*>↳<\/td>\s*<td[^>]*>(.*?)<\/td>(?:\s*<td[^>]*>.*?<\/td>){8}\s*<\/tr>/g, function(match, p1) {
                if (p1.includes('[처방]')) {
                    return `<tr><td style="text-align:center;">↳</td><td colspan="9" style="text-align:left;">${p1}</td></tr>`;
                }
                return match;
            });

            document.getElementById('violationNoticeBox').innerHTML = `<p class="text-blue-600 mb-4">계약 체결일(청약일) 기준으로 고지위반 사항을 점검하였습니다.</p>` + fullOldCardsHtml;
            document.getElementById('dutyAiReportBox2').innerHTML = htmlView2;
            document.getElementById('dutyAiReportBox2').classList.remove('hidden');
            document.getElementById('tab2Content').classList.add('hidden');
        } else {
            currentTab2Markdown = "";
        }

        if (progressTimer) clearInterval(progressTimer);
        progressBar.style.width = '100%';
        progressPercent.innerText = '100%';
        progressText.innerText = "✨ 분석 완료!";

        setTimeout(() => {
            progressArea.classList.add('hidden');
            resultContainer.classList.remove('hidden');
            document.getElementById('dutyAiReportBox1').innerHTML = htmlView1;
            switchResultTab('tab1');
        }, 500);

    } catch (error) {
        if (progressTimer) clearInterval(progressTimer);
        progressArea.classList.add('hidden');
        document.getElementById('emptyState').classList.remove('hidden'); 
        
        if (error.message === "PWD_ERROR") {
            alert("❌ PDF 비밀번호를 다시 확인해주세요.\n(비밀번호가 틀렸거나 파일이 손상되었습니다.)");
        } else {
            alert(`❌ 통신 및 시스템 오류 발생: ${error.message}`);
        }
    }
}

function exportDutyToExcel() {
    const isTab1 = (activeResultTab === 'tab1');
    const mdText = isTab1 ? currentTab1Markdown : currentTab2Markdown;

    if (!mdText) {
        alert('다운로드할 분석 결과가 없습니다.');
        return;
    }
    
    const wb = XLSX.utils.book_new();
    const now = new Date();
    const timeStr = now.toISOString().replace(/[-:T]/g, '').slice(0, 12);
    
    const styleTitle = { font: { bold: true, sz: 14 }, fill: { fgColor: { rgb: "E7E6E6" } }, alignment: { vertical: "center" } };
    const styleText = { alignment: { wrapText: true, vertical: "top" } };
    const styleHeader = { font: { bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "4472C4" } }, alignment: { horizontal: "center", vertical: "center", wrapText: true }, border: { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } } };
    const styleCell = { alignment: { vertical: "top", wrapText: true }, border: { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } } };

    const processSection = (lines, sheetName, isOld) => {
        const rows = [];
        const rowStyles = []; 
        const merges = [];

        if (isOld) {
            rows.push(["분석 기준일: 기계약 점검"]);
            rows.push(["주의: 포함되지 않은 진료기록은 제외된 결과입니다."]);
            rows.push(["--------------------------------------------------"]);
        } else {
            rows.push([`분석 일시: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`]);
            rows.push(["기준일: 현재 (신규가입)"]);
            rows.push(["--------------------------------------------------"]);
        }
        
        rowStyles.push([{...styleText}]);
        rowStyles.push([{...styleText}]);
        rowStyles.push([{...styleText}]);

        let tableBuffer = [];
        lines.forEach(line => {
            if (line.includes('|')) {
                if (line.includes('---')) return;
                let rowData = line.trim().split('|').map(colVal => colVal.trim().replace(/<br>/g, '\n').replace(/\*\*/g, ''));
                if (rowData.length > 0 && rowData[0] === '') rowData.shift();
                if (rowData.length > 0 && rowData[rowData.length - 1] === '') rowData.pop();
                if (rowData.length > 0) tableBuffer.push(rowData);
            } else {
                if (tableBuffer.length > 0) {
                    const colsCount = Math.max(...tableBuffer.map(r => r.length));
                    tableBuffer.forEach((r, rIdx) => {
                        let safeR = [], styleR = [];
                        for (let cIdx = 0; cIdx < colsCount; cIdx++) {
                            safeR.push(r[cIdx] || "");
                            styleR.push(rIdx === 0 ? {...styleHeader} : {...styleCell});
                        }
                        
                        if (rIdx > 0 && safeR[0].includes('↳') && safeR[1].includes('[처방]')) {
                            for (let i = 2; i < colsCount; i++) safeR[i] = "";
                            merges.push({ s: { r: rows.length, c: 1 }, e: { r: rows.length, c: colsCount - 1 } });
                        }
                        
                        rows.push(safeR);
                        rowStyles.push(styleR);
                    });
                    rows.push([]);
                    rowStyles.push([]);
                    tableBuffer = [];
                }
                const cleanLine = line.replace(/#/g, '').trim();
                if (cleanLine) {
                    rows.push([cleanLine]);
                    rowStyles.push([cleanLine.includes("심사]") || cleanLine.includes("기준") ? {...styleTitle} : {...styleText}]);
                }
            }
        });

        if (tableBuffer.length > 0) {
            const colsCount = Math.max(...tableBuffer.map(r => r.length));
            tableBuffer.forEach((r, rIdx) => {
                let safeR = [], styleR = [];
                for (let cIdx = 0; cIdx < colsCount; cIdx++) {
                    safeR.push(r[cIdx] || "");
                    styleR.push(rIdx === 0 ? {...styleHeader} : {...styleCell});
                }
                
                if (rIdx > 0 && safeR[0].includes('↳') && safeR[1].includes('[처방]')) {
                    for (let i = 2; i < colsCount; i++) safeR[i] = "";
                    merges.push({ s: { r: rows.length, c: 1 }, e: { r: rows.length, c: colsCount - 1 } });
                }
                
                rows.push(safeR);
                rowStyles.push(styleR);
            });
        }

        const ws = XLSX.utils.aoa_to_sheet(rows);
        ws['!cols'] = [ {wch: 25}, {wch: 20}, {wch: 12}, {wch: 12}, {wch: 10}, {wch: 10}, {wch: 10}, {wch: 30}, {wch: 40}, {wch: 15} ]; 
        
        if (merges.length > 0) ws['!merges'] = merges;
        
        for (let r = 0; r < rows.length; r++) {
            for (let cIdx = 0; cIdx < (rows[r] ? rows[r].length : 0); cIdx++) {
                const cellRef = XLSX.utils.encode_cell({c: cIdx, r: r});
                if (!ws[cellRef]) continue;
                if (rowStyles[r] && rowStyles[r][cIdx]) ws[cellRef].s = rowStyles[r][cIdx];
            }
        }
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
    };

    if (isTab1) {
        processSection(mdText.split('\n'), "심사보고서", false);
        XLSX.writeFile(wb, `AI_신규심사_${timeStr}.xlsx`);
    } else {
        const contractSections = mdText.split(/### 📑 계약/);
        let sheetCount = 0;
        contractSections.forEach(section => {
            if (!section.trim()) return;
            sheetCount++;
            const lines = section.split('\n');
            processSection(lines, `계약_${sheetCount}`, true);
        });
        XLSX.writeFile(wb, `AI_고지위반점검_통합_${timeStr}.xlsx`);
    }
}

// 보안: 우클릭, 드래그, 소스보기(F12/Ctrl+U) 차단 스크립트
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});

document.addEventListener('selectstart', function(e) {
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
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
        if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
        e.preventDefault();
    }
});
