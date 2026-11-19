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
                        <span class="font-bold text-slate-700 text-[13px]">${db.birth || '-'} / ${db.gender || '-'}</span>
                    </div>
                </div>
                <div class="mt-2 pt-2 border-t border-slate-200 flex flex-col gap-0.5">
                    <span class="text-[10px] text-slate-400 font-bold">📍 지역</span>
                    <span class="font-bold text-slate-700 text-[13px]">
                        <span class="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded mr-1 text-[10px]">${db.region || '-'}</span>
                        ${db.sido || ''} ${db.gugun || ''} ${db.dong || ''}
                    </span>
                </div>
            </div>

            <div class="text-xs text-slate-600 mb-3 bg-slate-50 p-2 rounded border border-slate-100 leading-snug">
                <span class="font-bold text-slate-500 block mb-1">📝 메모</span>${db.memo || '-'}
            </div>

            <div class="space-y-2 bg-amber-50/50 p-3 rounded-lg border border-amber-100">
                <div class="w-full mb-1">
                    ${buildMobileAudioHtml(db.audioUrl, index)}
                </div>

                <div class="grid grid-cols-2 gap-2">
                    ${generateTaSelect(`m_ta1_${index}`, '1차 TA(1일)', valTa1, index, 'm_')}
                    ${generateTaSelect(`m_ta2_${index}`, '2차 TA(2일)', valTa2, index, 'm_')}
                    ${generateTaSelect(`m_ta3_${index}`, '3차 TA(3일)', valTa3, index, 'm_')}
                    ${generateTaSelect(`m_ta4_${index}`, '4차 이상 TA', valTa4, index, 'm_')}
                </div>

                <div class="flex gap-2 pt-1">
                    <div class="w-[50%] flex gap-1">
                        <input type="text" id="m_schedule_${index}" value="${valSchedule}" readonly onclick="openScheduleModal(${index}, 'm_')" placeholder="일정입력(터치)" class="w-full px-2 py-1.5 border border-slate-300 rounded focus:border-blue-500 focus:outline-none text-xs cursor-pointer hover:bg-blue-50 transition font-bold text-blue-700 bg-white">
                    </div>
                    <div class="w-[50%]">
                        <select id="m_status_${index}" onchange="handleStatusChange(${index}, 'm_')" class="w-full p-1.5 border border-slate-300 rounded focus:border-blue-500 focus:outline-none text-xs font-bold text-slate-700 bg-white">
                            <option value="" ${valStatus === '' ? 'selected' : ''}>- 현황 -</option>
                            <option value="상담 중" ${valStatus === '상담 중' ? 'selected' : ''}>상담 중</option>
                            <option value="상담완료" ${valStatus === '상담완료' ? 'selected' : ''}>상담완료</option>
                            <option value="계약" ${valStatus === '계약' ? 'selected' : ''}>계약</option>
                            <option value="장기배양(심사)" ${valStatus === '장기배양(심사)' ? 'selected' : ''}>장기배양(심사)</option>
                            <option value="거절" ${valStatus === '거절' ? 'selected' : ''}>거절</option>
                        </select>
                    </div>
                </div>

                <div class="flex gap-2 pt-1">
                    <input type="text" id="m_cnt_${index}" value="${valCount}" readonly placeholder="건수" onclick="if(document.getElementById('m_status_${index}').value==='계약') openContractModal(${index}, 'm_')" class="w-[30%] px-2 py-2 border border-emerald-300 rounded bg-emerald-50 text-xs font-black text-emerald-700 focus:outline-none cursor-pointer text-center">
                    <input type="text" id="m_prm_${index}" value="${valPremium}" readonly placeholder="보험료 입력 (터치)" onclick="if(document.getElementById('m_status_${index}').value==='계약') openContractModal(${index}, 'm_')" class="w-[70%] px-2 py-2 border border-emerald-300 rounded bg-emerald-50 text-xs font-black text-emerald-700 focus:outline-none cursor-pointer text-right">
                </div>

                <div class="pt-1">
                    <input type="text" id="m_note_${index}" value="${valNote}" onchange="markModified(${index})" placeholder="비고(특이사항) 입력" class="w-full px-2 py-1.5 border border-slate-300 rounded focus:border-blue-500 focus:outline-none text-xs">
                </div>
            </div>
        </div>
    `;

    return { desktopRow, mobileCard };
}

function buildTableWrapHtml(desktopRowsHtml, mobileCardsHtml, emptyText) {
    if (!desktopRowsHtml) {
        return `<div class='text-center py-14 bg-white rounded-xl border border-slate-200 text-slate-400 font-bold text-sm'>${emptyText}</div>`;
    }
    return `
        <div class="hidden md:block bg-white rounded-xl shadow-md border border-slate-200 overflow-x-auto min-w-[1400px]">
            <table class="w-full text-xs text-center border-collapse whitespace-nowrap">
                <thead class="bg-slate-800 text-white">
                    <tr>
                        <th class="p-2 border-r border-slate-700 font-medium w-10">No.</th>
                        <th class="p-2 border-r border-slate-700 font-medium">배분날짜</th>
                        <th class="p-2 border-r border-slate-700 font-medium">전화번호</th>
                        <th class="p-2 border-r border-slate-700 font-medium">지역</th>
                        <th class="p-2 border-r border-slate-700 font-medium text-amber-300">고객명</th>
                        <th class="p-2 border-r border-slate-700 font-medium">시도</th>
                        <th class="p-2 border-r border-slate-700 font-medium">구군</th>
                        <th class="p-2 border-r border-slate-700 font-medium">읍면동</th>
                        <th class="p-2 border-r border-slate-700 font-medium">생년월일</th>
                        <th class="p-2 border-r border-slate-700 font-medium">성별</th>
                        <th class="p-2 border-r border-slate-700 font-medium whitespace-normal w-40">메모</th>
                        <th class="p-2 border-r border-slate-700 font-medium">담당설계사</th>
                        <th class="p-2 border-r border-slate-700 font-medium text-emerald-300">진행상태</th>
                        <th class="p-2 border-r border-slate-700 font-medium">배정일시</th>
                        <th class="p-2 font-medium text-rose-300">유효기간</th>
                    </tr>
                </thead>
                <tbody class="text-slate-700">
                    ${desktopRowsHtml}
                </tbody>
            </table>
        </div>
        <div class="block md:hidden flex flex-col gap-4">
            ${mobileCardsHtml}
        </div>
    `;
}

function renderDBList(dbs) {
    const container = document.getElementById('dbContainer');
    if (!container) return;

    if (!dbs || dbs.length === 0) {
        container.innerHTML = "<div class='text-center py-20 text-slate-500 font-bold'>현재 배정된 대기 DB가 없습니다.</div>";
        return;
    }

    let recentDesktopHtml = '';
    let recentMobileHtml = '';
    let recentCount = 0;

    let over30DesktopHtml = '';
    let over30MobileHtml = '';
    let over30Count = 0;

    dbs.forEach((db, index) => {
        if (db.isOver30Days) {
            over30Count++;
            const built = buildSingleDBItemHtml(db, index, over30Count);
            over30DesktopHtml += built.desktopRow;
            over30MobileHtml += built.mobileCard;
        } else {
            recentCount++;
            const built = buildSingleDBItemHtml(db, index, recentCount);
            recentDesktopHtml += built.desktopRow;
            recentMobileHtml += built.mobileCard;
        }
    });

    container.innerHTML = `
        <!-- 1. 상단 기본 리스트: 배정 30일 이내 DB -->
        <div>
            ${buildTableWrapHtml(recentDesktopHtml, recentMobileHtml, '최근 30일 이내 배정된 DB가 없습니다. (아래 30일 경과 탭을 확인해 주세요)')}
        </div>

        <!-- 2. 하단 탭: 배정받고 30일이 지난 장기관리 DB (1년까지 보관) -->
        <div class="mt-8 pt-6 border-t-2 border-slate-200 md:min-w-[1400px]">
            <button type="button" onclick="toggleOver30DaysTab()" class="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white font-bold px-5 py-3 rounded-xl shadow-md transition flex items-center justify-between sm:justify-start gap-3 text-xs sm:text-sm">
                <span>📂 배정 30일 경과 장기관리 DB 보기</span>
                <span class="bg-amber-400 text-slate-950 font-black px-2.5 py-0.5 rounded-full text-xs">${over30Count}건</span>
                <span id="over30DaysArrow" class="text-slate-300 text-xs ml-1">${isArchiveTabOpen ? '▲ 접기' : '▼ 펼쳐보기'}</span>
            </button>

            <div id="over30DaysSection" class="${isArchiveTabOpen ? '' : 'hidden'} mt-4">
                ${buildTableWrapHtml(over30DesktopHtml, over30MobileHtml, '배정 후 30일이 경과한 장기관리 DB가 없습니다.')}
            </div>
        </div>
    `;
}

// ==========================================
// 📅 [스케줄 모달 제어]
// ==========================================
function openScheduleModal(index, prefix) {
    currentSchIndex = index;
    currentSchPrefix = prefix;

    const schInput = document.getElementById(`${prefix}schedule_${index}`);
    const existVal = schInput.value;

    document.getElementById('schType').value = schInput.getAttribute('data-sch-type') || "";
    document.getElementById('schDateTime').value = schInput.getAttribute('data-raw-time') || "";

    if (schInput.getAttribute('data-sch-loc')) {
        document.getElementById('schLocation').value = schInput.getAttribute('data-sch-loc');
    } else {
        document.getElementById('schLocation').value = existVal.includes(' / ') ? '' : existVal;
    }

    document.getElementById('scheduleInputModal').classList.remove('hidden');
}

function closeScheduleModal() {
    document.getElementById('scheduleInputModal').classList.add('hidden');
}

function clearScheduleInput() {
    if (confirm('입력된 스케줄을 초기화하시겠습니까?')) {
        const schInput = document.getElementById(`${currentSchPrefix}schedule_${currentSchIndex}`);
        schInput.value = "";
        schInput.removeAttribute('data-raw-time');
        schInput.removeAttribute('data-sch-type');
        schInput.removeAttribute('data-sch-loc');
        schInput.removeAttribute('data-sync-calendar');
        markModified(currentSchIndex);
        closeScheduleModal();
    }
}

function confirmScheduleModal() {
    const sType = document.getElementById('schType').value;
    const sTimeRaw = document.getElementById('schDateTime').value;
    const sLoc = document.getElementById('schLocation').value.trim();

    let resultText = "";
    let formattedTime = "";

    if (sType || sTimeRaw || sLoc) {
        if (sTimeRaw) {
            const dt = new Date(sTimeRaw);
            const mm = String(dt.getMonth() + 1).padStart(2, '0');
            const dd = String(dt.getDate()).padStart(2, '0');
            const hh = String(dt.getHours()).padStart(2, '0');
            const mns = String(dt.getMinutes()).padStart(2, '0');
            formattedTime = `${mm}/${dd} ${hh}:${mns}`;
        }

        const parts = [];
        if (sType) parts.push(sType);
        if (formattedTime) parts.push(formattedTime);
        if (sLoc) parts.push(sLoc);

        resultText = parts.join(" / ");
    }

    const schInput = document.getElementById(`${currentSchPrefix}schedule_${currentSchIndex}`);
    schInput.value = resultText;

    schInput.setAttribute('data-raw-time', sTimeRaw);
    schInput.setAttribute('data-sch-type', sType);
    schInput.setAttribute('data-sch-loc', sLoc);
    schInput.setAttribute('data-sync-calendar', 'true');

    markModified(currentSchIndex);
    closeScheduleModal();
}

// ==========================================
// 📝 [TA 선택 및 계약 모달 제어]
// ==========================================
function generateTaSelect(id, label, selectedValue, index, prefix) {
    const val = selectedValue || '';
    const colorClass = val === '' ? 'text-slate-500' : 'text-slate-800';
    return `
    <select id="${id}" onchange="markModified(${index})" class="w-full p-1.5 border border-slate-300 rounded focus:border-blue-500 focus:outline-none text-xs font-bold ${colorClass} bg-white">
        <option value="" ${val === '' ? 'selected' : ''}>- ${label} -</option>
        <option value="부재" ${val === '부재' ? 'selected' : ''}>부재</option>
        <option value="다시" ${val === '다시' ? 'selected' : ''}>다시</option>
        <option value="거절" ${val === '거절' ? 'selected' : ''}>거절</option>
        <option value="예정" ${val === '예정' ? 'selected' : ''}>예정</option>
        <option value="본인설계사" ${val === '본인설계사' ? 'selected' : ''}>본인설계사</option>
    </select>
    `;
}

function handleStatusChange(index, prefix) {
    markModified(index);
    const statusVal = document.getElementById(`${prefix}status_${index}`).value;

    if (statusVal === '계약') {
        openContractModal(index, prefix);
    } else {
        document.getElementById(`${prefix}cnt_${index}`).value = "";
        document.getElementById(`${prefix}prm_${index}`).value = "";
    }
}

function openContractModal(index, prefix) {
    currentModalIndex = index;
    currentModalPrefix = prefix;
    const container = document.getElementById('contractRowsContainer');
    container.innerHTML = "";
    addContractRow();
    addContractRow();
    addContractRow();
    document.getElementById('contractModal').classList.remove('hidden');
}

function closeContractModal() {
    document.getElementById('contractModal').classList.add('hidden');
}

function formatPremiumInput(input) {
    let val = input.value.replace(/[^0-9]/g, '');
    if (val === '') {
        input.value = '';
    } else {
        input.value = Number(val).toLocaleString();
    }
}

function addContractRow() {
    const container = document.getElementById('contractRowsContainer');
    const rowDiv = document.createElement('div');
    rowDiv.className = "flex gap-2 mb-2 contract-item";
    rowDiv.innerHTML = `
        <select class="w-[45%] p-2 border border-slate-300 rounded font-bold text-sm text-slate-700 bg-white focus:outline-none focus:border-blue-500">
            <option value="">- 상품 분류 -</option>
            <option value="운전자">운전자</option>
            <option value="장기(건강)">장기(건강)</option>
            <option value="연금">연금</option>
            <option value="종신(단기납)">종신(단기납포함)</option>
            <option value="일반">일반</option>
        </select>
        <div class="w-[55%] relative">
            <input type="text" placeholder="보험료 입력" oninput="formatPremiumInput(this)" class="contract-premium w-full p-2 border border-slate-300 rounded font-bold text-sm text-slate-700 text-right pr-6 focus:outline-none focus:border-blue-500">
            <span class="absolute right-2 top-2.5 text-xs font-bold text-slate-400">원</span>
        </div>
    `;
    container.appendChild(rowDiv);
}

function removeContractRow() {
    const container = document.getElementById('contractRowsContainer');
    if (container.children.length > 1) {
        container.removeChild(container.lastChild);
    } else {
        alert('최소 1개의 입력란은 필요합니다.');
    }
}

function confirmContractModal() {
    const rows = document.querySelectorAll('.contract-item');
    let totalCount = 0;
    let totalPremium = 0;

    rows.forEach(row => {
        const category = row.querySelector('select').value;
        const premiumFormatted = row.querySelector('.contract-premium').value;
        const premiumRaw = premiumFormatted.replace(/,/g, '');

        if (category && premiumRaw && !isNaN(premiumRaw)) {
            totalCount++;
            totalPremium += parseInt(premiumRaw, 10);
        }
    });

    if (totalCount === 0) {
        alert("입력된 상품 정보가 없습니다. 취소하시려면 '취소' 버튼을 눌러주세요.");
        return;
    }

    document.getElementById(`${currentModalPrefix}cnt_${currentModalIndex}`).value = totalCount + "건";
    document.getElementById(`${currentModalPrefix}prm_${currentModalIndex}`).value = totalPremium.toLocaleString() + "원";

    markModified(currentModalIndex);
    closeContractModal();
}

// ==========================================
// 💾 [변경 감지 및 서버 동기화 저장]
// ==========================================
function markModified(index) {
    modifiedRows.add(index);
    const rowDivD = document.getElementById(`edit_area_${index}`);
    if (rowDivD) {
        rowDivD.classList.remove('bg-amber-50');
        rowDivD.classList.add('bg-blue-50', 'ring-2', 'ring-inset', 'ring-blue-400');
    }
    const rowDivM = document.getElementById(`m_edit_area_${index}`);
    if (rowDivM) {
        rowDivM.classList.remove('bg-white');
        rowDivM.classList.add('bg-blue-50', 'ring-2', 'ring-inset', 'ring-blue-400');
    }
}

async function saveAllChanges() {
    if (modifiedRows.size === 0) {
        alert("수정된 항목이 없습니다.");
        return;
    }

    const btn = document.getElementById('globalSaveBtn');
    const textSpan = document.getElementById('globalSaveText');
    btn.disabled = true;
    btn.classList.replace('bg-blue-600', 'bg-slate-500');

    const isMobileView = window.innerWidth < 768;
    const pfx = isMobileView ? 'm_' : '';

    let successCount = 0;
    let failCount = 0;
    const total = modifiedRows.size;
    const indexes = Array.from(modifiedRows);

    for (let i = 0; i < indexes.length; i++) {
        const idx = indexes[i];
        textSpan.innerText = `⏳ 저장 및 동기화 중... (${i + 1}/${total})`;

        const rawCount = document.getElementById(`${pfx}cnt_${idx}`).value.replace(/[^0-9]/g, '');
        const rawPremium = document.getElementById(`${pfx}prm_${idx}`).value.replace(/[^0-9]/g, '');

        const schInput = document.getElementById(`${pfx}schedule_${idx}`);
        const scheduleVal = schInput.value.trim();

        const payload = {
            action: "updateHyunhwang",
            agentName: currentAgent,
            customerName: document.getElementById(`${pfx}custName_${idx}`).value,
            ta1: document.getElementById(`${pfx}ta1_${idx}`).value,
            ta2: document.getElementById(`${pfx}ta2_${idx}`).value,
            ta3: document.getElementById(`${pfx}ta3_${idx}`).value,
            ta4: document.getElementById(`${pfx}ta4_${idx}`).value,
            schedule: scheduleVal,
            rawSchTime: schInput.getAttribute('data-raw-time'),
            schType: schInput.getAttribute('data-sch-type'),
            schLoc: schInput.getAttribute('data-sch-loc'),
            syncCalendar: schInput.getAttribute('data-sync-calendar') === 'true',
            status: document.getElementById(`${pfx}status_${idx}`).value,
            contractCount: rawCount,
            contractPremium: rawPremium,
            note: document.getElementById(`${pfx}note_${idx}`).value
        };

        try {
            const response = await fetch(GAS_WEBAPP_URL, {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            if (result.success) {
                successCount++;
                if (result.calResult && !result.calResult.success) {
                    alert(`🚨 캘린더 연동 실패! (고객명: ${payload.customerName})\n사유: ${result.calResult.error}`);
                }
            }
        } catch (error) {
            failCount++;
        }
    }

    alert(`총 ${total}건 저장 및 동기화 완료!` + (failCount > 0 ? `\n(실패: ${failCount}건)` : ""));
    btn.disabled = false;
    btn.classList.replace('bg-slate-500', 'bg-blue-600');
    textSpan.innerText = "💾 전체 저장";

    loadAssignedDBs();
}

// ==========================================
// 🎧 [모바일 전용 무로그인 다이렉트 녹취 재생 엔진]
// ==========================================
function extractDriveFileId(url) {
    if (!url) return "";
    const match1 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (match1 && match1[1]) return match1[1];
    const match2 = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (match2 && match2[1]) return match2[1];
    return "";
}

function buildMobileAudioHtml(rawUrl, index) {
    const fileId = extractDriveFileId(rawUrl);
    if (!fileId) {
        return `
            <div class="w-full flex items-center gap-2">
                <span class="text-xs font-bold text-slate-700 whitespace-nowrap shrink-0">🎧 녹취</span>
                <div class="flex-grow w-full h-10 rounded border border-slate-300 bg-slate-100 flex items-center justify-center text-[10px] text-slate-400 font-bold">녹취 없음</div>
            </div>
        `;
    }
    return `
        <div id="m_audio_box_${index}" class="w-full bg-white p-2 rounded-lg border border-slate-300 shadow-sm">
            <button type="button" id="m_audio_btn_${index}" onclick="playMobileAudio('${fileId}', ${index})" class="w-full bg-blue-600 active:bg-blue-700 text-white font-bold py-2 px-3 rounded text-xs flex items-center justify-center gap-1.5 shadow-sm transition">
                <span>🎧 터치하여 녹취 바로듣기</span>
            </button>
            <div id="m_audio_player_wrap_${index}" class="hidden mt-1"></div>
        </div>
    `;
}

async function playMobileAudio(fileId, index) {
    const btn = document.getElementById(`m_audio_btn_${index}`);
    const wrap = document.getElementById(`m_audio_player_wrap_${index}`);
    if (!btn || !wrap) return;

    btn.disabled = true;
    btn.innerText = "⏳ 녹취 불러오는 중... (1~2초 소요)";
    btn.className = "w-full bg-slate-500 text-white font-bold py-2 px-3 rounded text-xs flex items-center justify-center gap-1.5";

    try {
        const res = await fetch(`${GAS_WEBAPP_URL}?mode=getAudio&fileId=${encodeURIComponent(fileId)}&agent=${encodeURIComponent(currentAgent)}`);
        const data = await res.json();

        if (data.success && data.base64) {
            const byteChars = atob(data.base64);
            const byteNumbers = new Array(byteChars.length);
            for (let i = 0; i < byteChars.length; i++) {
                byteNumbers[i] = byteChars.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: data.mimeType || 'audio/mp4' });
            const audioBlobUrl = URL.createObjectURL(blob);

            btn.classList.add('hidden');
            wrap.classList.remove('hidden');
            wrap.innerHTML = `
                <audio id="m_audio_el_${index}" controls controlsList="nodownload" autoplay playsinline class="w-full h-10">
                    <source src="${audioBlobUrl}" type="${data.mimeType || 'audio/mp4'}">
                </audio>
            `;
            const audioEl = document.getElementById(`m_audio_el_${index}`);
            if (audioEl) audioEl.play().catch(() => {});
        } else {
            alert("녹취 로드 실패: " + (data.error || "파일을 찾을 수 없습니다."));
            btn.disabled = false;
            btn.innerText = "🎧 다시 시도하기";
        }
    } catch (err) {
        alert("통신 오류가 발생했습니다. 다시 눌러주세요.");
        btn.disabled = false;
        btn.innerText = "🎧 터치하여 녹취 바로듣기";
        btn.className = "w-full bg-blue-600 text-white font-bold py-2 px-3 rounded text-xs flex items-center justify-center gap-1.5";
    }
}
