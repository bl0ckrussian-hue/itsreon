// ==========================================
// ⚙️ [설정 및 전역 상태] itsrion DB 배정 엔진
// ==========================================
const GAS_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbwYWxSTVuMtFzkrlP4R0XxCvLixE2liAx3w82ySLhh4BVvAb6I4rCS0RBEOVgp7LfzF/exec";

const currentAgent = localStorage.getItem('rion_logged_user');
let modifiedRows = new Set();
let currentModalIndex = null;
let currentModalPrefix = '';

let currentSchIndex = null;
let currentSchPrefix = '';
let isArchiveTabOpen = false; // 하단 30일 경과 탭 열림 상태 유지

// ==========================================
// 🛡️ [보안 엔진] 캡처 방지, 우클릭·드래그·복사·소스보기(F12) 원천 차단
// ==========================================
(function initProtection() {
    document.addEventListener('contextmenu', e => e.preventDefault());
    document.addEventListener('selectstart', e => e.preventDefault());
    window.addEventListener('dragstart', e => e.preventDefault());

    document.addEventListener('copy', e => {
        e.preventDefault();
        try { navigator.clipboard.writeText(''); } catch (err) {}
        alert('개인정보 보호를 위해 복사는 금지되어 있습니다.');
    });

    window.addEventListener('cut', e => e.preventDefault());

    // 캡처 도구 실행 등으로 포커스 이탈 시 화면 블러 처리 (녹취 IFRAME 클릭 예외)
    window.addEventListener('blur', () => {
        if (document.activeElement && document.activeElement.tagName === 'IFRAME') return;
        document.body.classList.add('blurred', 'capture-protect-mode');
    });

    window.addEventListener('focus', () => {
        document.body.classList.remove('blurred', 'capture-protect-mode');
    });

    // 키보드 단축키 차단 (F12, 개발자도구, 소스보기, 복사, 저장, 인쇄, 캡처)
    document.addEventListener('keydown', e => {
        const keyLower = e.key ? e.key.toLowerCase() : '';

        if (e.key === 'F12') {
            e.preventDefault();
            return;
        }
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && keyLower === 'i') {
            e.preventDefault();
            return;
        }
        if ((e.ctrlKey || e.metaKey) && (keyLower === 'u' || keyLower === 's' || keyLower === 'c' || keyLower === 'p')) {
            e.preventDefault();
            try { navigator.clipboard.writeText(''); } catch (err) {}
            return;
        }
        if (
            e.key === 'PrintScreen' ||
            e.keyCode === 44 ||
            (e.altKey && e.shiftKey && keyLower === 's') ||
            (e.metaKey && e.shiftKey && keyLower === 's')
        ) {
            e.preventDefault();
            try { navigator.clipboard.writeText(''); } catch (err) {}
            alert('고객 정보 보호를 위해 화면 캡처 및 복사가 금지되어 있습니다.');
        }
    });
})();

// ==========================================
// 🚀 [초기화] 로그인 검증 및 메인 세션 활성 동기화
// ==========================================
function initDbAssignApp() {
    if (!currentAgent) {
        alert('보안 접근입니다. 메인 홈페이지에서 로그인을 먼저 진행해주세요.');
        window.close();
        return;
    }

    const nameEl = document.getElementById('agentNameDisplay');
    if (nameEl) nameEl.innerText = `${currentAgent} 팀장님`;

    loadAssignedDBs();

    // DB 관리 및 녹취 청취 중 메인 창 자동 로그아웃 방지
    const syncRionActivity = () => {
        if (localStorage.getItem('rion_logged_user')) {
            localStorage.setItem('rion_last_activity', Date.now().toString());
        }
    };
    syncRionActivity();
    ['mousedown', 'keypress', 'scroll', 'touchstart'].forEach(evt => {
        document.addEventListener(evt, syncRionActivity, { passive: true });
    });
    setInterval(syncRionActivity, 3 * 60 * 1000);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDbAssignApp);
} else {
    initDbAssignApp();
}

// ==========================================
// 🌐 [데이터 로드 및 리스트 렌더링]
// ==========================================
async function loadAssignedDBs() {
    modifiedRows.clear();
    try {
        const response = await fetch(`${GAS_WEBAPP_URL}?agent=${encodeURIComponent(currentAgent)}`);
        const data = await response.json();
        renderDBList(data);
    } catch (error) {
        const container = document.getElementById('dbContainer');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-20 text-rose-500 font-bold">데이터 서버 오류<br><span class="text-xs mt-2 block">${error.message}</span></div>`;
        }
    }
}

function toggleOver30DaysTab() {
    const panel = document.getElementById('over30DaysSection');
    const arrow = document.getElementById('over30DaysArrow');
    if (!panel) return;
    isArchiveTabOpen = panel.classList.contains('hidden');
    panel.classList.toggle('hidden', !isArchiveTabOpen);
    if (arrow) arrow.innerText = isArchiveTabOpen ? '▲ 접기' : '▼ 펼쳐보기';
}

function buildSingleDBItemHtml(db, index, displayNo) {
    const valTa1 = db.ta1 || '';
    const valTa2 = db.ta2 || '';
    const valTa3 = db.ta3 || '';
    const valTa4 = db.ta4 || '';
    const valStatus = db.status || '';

    const valCount = db.contractCount ? db.contractCount + '건' : '';
    const valPremium = db.contractPremium ? Number(db.contractPremium).toLocaleString() + '원' : '';
    const valNote = db.note || '';
    const valSchedule = db.schedule || '';

    const desktopRow = `
        <tr class="bg-slate-50 font-medium border-b border-slate-200 hover:bg-slate-100 transition">
            <td class="p-2 border-r border-slate-200 font-bold text-slate-500">${displayNo}</td>
            <td class="p-2 border-r border-slate-200">${db.assignDate || '-'}</td>
            <td class="p-2 border-r border-slate-200 font-bold text-blue-600">${db.phone || '-'}</td>
            <td class="p-2 border-r border-slate-200"><span class="bg-blue-100 text-blue-800 text-[10px] font-bold px-1.5 py-0.5 rounded">${db.region || '-'}</span></td>
            <td class="p-2 border-r border-slate-200 font-bold text-sm text-slate-900">${db.customerName || '-'}</td>
            <td class="p-2 border-r border-slate-200">${db.sido || '-'}</td>
            <td class="p-2 border-r border-slate-200">${db.gugun || '-'}</td>
            <td class="p-2 border-r border-slate-200">${db.dong || '-'}</td>
            <td class="p-2 border-r border-slate-200">${db.birth || '-'}</td>
            <td class="p-2 border-r border-slate-200">${db.gender || '-'}</td>
            <td class="p-2 border-r border-slate-200 text-left whitespace-normal break-keep text-[11px] leading-snug">${db.memo || '-'}</td>
            <td class="p-2 border-r border-slate-200 font-bold">${currentAgent}</td>
            <td class="p-2 border-r border-slate-200 font-bold text-emerald-600">${valStatus || '-'}</td>
            <td class="p-2 border-r border-slate-200 text-[10px]">${db.assignDateTime || '-'}</td>
            <td class="p-2"><span class="text-rose-600 font-black text-[11px]">${db.timeLimit || '-'}</span></td>
        </tr>
        <tr class="border-b-4 border-slate-400">
            <td colspan="15" class="p-0 bg-white">
                <input type="hidden" id="custName_${index}" value="${db.customerName}">
                <div id="edit_area_${index}" class="flex items-center w-full bg-amber-50 p-2 gap-2 transition-all">
                    <div class="w-[20%] shrink-0 flex items-center pl-1">
                        <span class="text-[11px] font-bold text-slate-700 whitespace-nowrap shrink-0 tracking-tight mr-1.5">🎧 녹취</span>
                        <div class="flex-grow w-full relative overflow-hidden h-10 rounded border border-slate-300 shadow-sm bg-[#141414]">
                            ${db.audioUrl ? `<iframe src="${db.audioUrl.replace('uc?export=download&id=', 'file/d/')}/preview" style="position: absolute; top: -20px; left: 0; width: 100%; height: 150px; border: none;" allow="autoplay"></iframe><div class="absolute top-0 right-0 w-[45px] h-full bg-[#141414] z-10"></div>` : `<div class="w-full h-full flex items-center justify-center bg-slate-100 text-[10px] text-slate-400 font-bold">녹취 없음</div>`}
                        </div>
                    </div>

                    <div class="w-[5%] shrink-0">${generateTaSelect(`ta1_${index}`, '1차 TA', valTa1, index, '')}</div>
                    <div class="w-[5%] shrink-0">${generateTaSelect(`ta2_${index}`, '2차 TA', valTa2, index, '')}</div>
                    <div class="w-[5%] shrink-0">${generateTaSelect(`ta3_${index}`, '3차 TA', valTa3, index, '')}</div>
                    <div class="w-[5%] shrink-0">${generateTaSelect(`ta4_${index}`, '4차 이상', valTa4, index, '')}</div>
                    
                    <div class="w-[12%] shrink-0">
                        <input type="text" id="schedule_${index}" value="${valSchedule}" readonly onclick="openScheduleModal(${index}, '')" placeholder="일정입력 (클릭)" class="w-full px-2 py-1.5 border border-slate-300 rounded focus:border-blue-500 focus:outline-none text-xs cursor-pointer hover:bg-blue-50 transition font-bold text-blue-700 bg-white">
                    </div>
                    
                    <div class="w-[6%] shrink-0">
                        <select id="status_${index}" onchange="handleStatusChange(${index}, '')" class="w-full p-1.5 border border-slate-300 rounded focus:border-blue-500 focus:outline-none text-xs font-bold text-slate-700 bg-white">
                            <option value="" ${valStatus === '' ? 'selected' : ''}>- 진행현황 -</option>
                            <option value="상담 중" ${valStatus === '상담 중' ? 'selected' : ''}>상담 중</option>
                            <option value="상담완료" ${valStatus === '상담완료' ? 'selected' : ''}>상담완료</option>
                            <option value="계약" ${valStatus === '계약' ? 'selected' : ''}>계약</option>
                            <option value="장기배양(심사)" ${valStatus === '장기배양(심사)' ? 'selected' : ''}>장기배양(심사)</option>
                            <option value="거절" ${valStatus === '거절' ? 'selected' : ''}>거절</option>
                        </select>
                    </div>
                    
                    <div class="w-[3%] shrink-0">
                        <input type="text" id="cnt_${index}" value="${valCount}" readonly placeholder="건수" onclick="if(document.getElementById('status_${index}').value==='계약') openContractModal(${index}, '')" class="w-full px-1.5 py-1.5 border border-emerald-300 rounded bg-emerald-50 text-xs font-black text-emerald-700 text-center focus:outline-none cursor-pointer placeholder-emerald-300 transition hover:bg-emerald-100">
                    </div>
                    <div class="w-[8%] shrink-0">
                        <input type="text" id="prm_${index}" value="${valPremium}" readonly placeholder="보험료" onclick="if(document.getElementById('status_${index}').value==='계약') openContractModal(${index}, '')" class="w-full px-2 py-1.5 border border-emerald-300 rounded bg-emerald-50 text-xs font-black text-emerald-700 text-right focus:outline-none cursor-pointer placeholder-emerald-300 transition hover:bg-emerald-100">
                    </div>

                    <div class="w-[26%] shrink-0">
                        <input type="text" id="note_${index}" value="${valNote}" onchange="markModified(${index})" placeholder="비고 입력" class="w-full px-2 py-1.5 border border-slate-300 rounded focus:border-blue-500 focus:outline-none text-xs">
                    </div>
                </div>
            </td>
        </tr>
    `;

    const mobileCard = `
        <div id="m_edit_area_${index}" class="bg-white rounded-xl shadow-md border border-slate-200 p-4 transition-all">
            <input type="hidden" id="m_custName_${index}" value="${db.customerName}">
            
            <div class="flex justify-between items-center mb-3 border-b border-slate-100 pb-3">
                <div class="flex items-center gap-2">
                    <span class="bg-slate-800 text-white text-[10px] px-2 py-0.5 rounded font-bold">No.${displayNo}</span>
                    <span class="font-black text-base text-slate-900">${db.customerName || '-'}</span>
                </div>
                <span class="text-rose-600 font-black text-xs bg-rose-50 px-2 py-1 rounded border border-rose-100">${db.timeLimit || '-'}</span>
            </div>

            <div class="mb-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                <div class="grid grid-cols-2 gap-y-2 gap-x-4">
                    <div class="flex flex-col gap-0.5">
                        <span class="text-[10px] text-slate-400 font-bold">📞 연락처</span>
                        <a href="tel:${db.phone}" class="font-bold text-blue-600 text-[13px] hover:underline">${db.phone || '-'}</a>
                    </div>
                    <div class="flex flex-col gap-0.5">
                        <span class="text-[10px] text-slate-400 font-bold">👤 인적사항</span>
                        <span class="font-bold text-slate-700 text-[13px]">${db
