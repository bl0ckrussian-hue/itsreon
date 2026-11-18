function closeSilbiWindow() {
    window.close();
}

let smGen = 'gen2';
let smGen2Sub = 'late'; // 'early'(09.10~15.08 90%형) | 'late'(15.09~17.03 선택형II)
let smTreatType = 'outpatient';
let smGen1Type = 'nonLife';
let smGen1Limit = '30m';
let smGen1Pharm = 'combined';
let smHospital = 'clinic'; // 'clinic' | 'smallHosp' | 'hospital' | 'tertiary'
let lastSilbiResult = null;
let smGen5Severity = 'nonSevere';
let premGenInfo = null;

// 1. 세대별 기본요율(위험손해율+의료수가) 연평균 인상 곡선 (%)
// - short(1~4년차): 2025~2026 손보·생보협회 실측 손해율 조정 추세 반영
// - mid(5~10년차): 요율 현실화 이후 안정화 구간 (1세대는 폐쇄집단 고령화 압력 반영)
// - long(11년차~): 장기 의료물가·수가 상승률 수렴 구간
const GEN_LOSS_CURVE = {
    gen1: { short: [3.5, 4.0, 4.5, 5.0], mid: 5.5, long: 5.8 },
    gen2: { short: [5.5, 5.5, 5.2, 5.0], mid: 4.8, long: 4.5 },
    gen3: { short: [15.5, 13.0, 10.5, 8.5], mid: 6.0, long: 4.5 },
    gen4: { short: [18.0, 14.5, 11.0, 8.5], mid: 5.5, long: 4.0 },
    gen5: { short: [2.0, 2.2, 2.5, 2.8], mid: 3.0, long: 3.2 }
};

// 2. 연령대별 1세당 자연위험률 증가분 (%) - 보험개발원 연령별 의료비 위험률 곡선 반영
const AGE_NATURAL_RATES = {
    under30: 0.8,  // 20대 이하
    age30s:  1.8,  // 30~39세
    age40s:  3.2,  // 40~49세 (만성질환 시작 구간)
    age50s:  4.8,  // 50~59세 (의료이용 급증 구간)
    age60s:  6.0,  // 60~69세 (입원·수술 피크 구간)
    age70s:  5.0,  // 70~79세 (위험률 고점 안착으로 증가율 자체는 완만화)
    age80s:  3.5   // 80~89세
};

/**
 * 특정 나이(age)와 경과연수(yearsPassed) 시점의 연간 복합 인상률 산출
 * 반환값: { total: 합산인상률, lossRate: 손해율분, ageRate: 연령증가분 }
 */
function getDetailedAnnualRate(age, genCode, yearsPassed) {
    let cleanGen = (genCode === 'gen2_early') ? 'gen2' : (genCode || 'gen2');
    const curve = GEN_LOSS_CURVE[cleanGen] || GEN_LOSS_CURVE.gen2;

    // 경과연수별 기본 손해율 인상분 추출
    let lossRate = curve.long;
    if (yearsPassed >= 1 && yearsPassed <= 4) {
        lossRate = curve.short[yearsPassed - 1];
    } else if (yearsPassed <= 10) {
        lossRate = curve.mid;
    }

    // 연령대별 자연증가분 추출
    let ageRate = AGE_NATURAL_RATES.under30;
    if (age >= 80) ageRate = AGE_NATURAL_RATES.age80s;
    else if (age >= 70) ageRate = AGE_NATURAL_RATES.age70s;
    else if (age >= 60) ageRate = AGE_NATURAL_RATES.age60s;
    else if (age >= 50) ageRate = AGE_NATURAL_RATES.age50s;
    else if (age >= 40) ageRate = AGE_NATURAL_RATES.age40s;
    else if (age >= 30) ageRate = AGE_NATURAL_RATES.age30s;

    // 연간 최대 요율 조정 상한(25.0%) 적용
    const total = Math.min(25.0, lossRate + ageRate);
    return { total, lossRate, ageRate };
}

// 세대별 핵심 면책사항 데이터 (하단 체크박스에 실시간 반영)
const GEN_EXCLUSION_DATA = {
    gen1: {
        title: "🚫 1세대(구 실손) 주요 면책 및 한도 체크",
        items: [
            "<strong>면책 질환:</strong> 정신과 질환 전면 면책, 치과(손보 질병)·한방 비급여·치질(항문)·비만·미용 면책",
            "<strong>통원·입원 제한:</strong> 동일 질병 통원 연 30회 한도 / 입원 180일(또는 365일) 한도 후 180일 면책기간",
            "<strong>관리급여·횟수 제한:</strong> 도수(연 15~24회)·체외충격파(동일부위 6회/연 12회) 초과분 보상 제외"
        ]
    },
    gen2: {
        title: "🚫 2세대(표준화 실손) 주요 면책 및 한도 체크",
        items: [
            "<strong>비급여 면책:</strong> 치과·한방·항문질환은 '급여'만 보장(비급여 면책), 백내장 다초점렌즈(16.01~)·미용·영양제 면책",
            "<strong>통원 제한:</strong> 연간 통원 합산 180회 한도 (외래 회당 25만 / 약제 처방당 5만 한도)",
            "<strong>관리급여·횟수 제한:</strong> 도수(연 15~24회)·체외충격파(동일부위 6회/연 12회) 초과분 보상 제외"
        ]
    },
    gen3: {
        title: "🚫 3세대(착한 실손) 주요 면책 및 한도 체크",
        items: [
            "<strong>비급여 면책:</strong> 치과·한방·항문 비급여 면책, 치료 목적 외 영양·비타민주사 및 다초점렌즈 면책",
            "<strong>3대 특약 한도:</strong> 특약 미가입 시 도수·체외·증식·비급여주사·MRI 면책 (특약 각각 연 50회/금액 한도)",
            "<strong>관리급여·횟수 제한:</strong> 도수 관리급여(연 15~24회)·체외충격파(동일부위 6회/연 12회) 초과분 보상 제외"
        ]
    },
    gen4: {
        title: "🚫 4세대(비급여 차등형) 주요 면책 및 한도 체크",
        items: [
            "<strong>비급여 면책:</strong> 약제 허가사항 외 영양·비타민주사 전면 면책, 치과·한방 비급여·다초점렌즈·미용 면책",
            "<strong>횟수·서류 제한:</strong> 비급여 통원 연간 합산 100회 한도 / 도수치료 10회마다 병변 개선 확인서 필수",
            "<strong>관리급여·횟수 제한:</strong> 도수 관리급여(연 15~24회)·체외충격파(동일부위 6회/연 12회) 초과분 보상 제외"
        ]
    },
    gen5: {
        title: "🚫 5세대(중증 집중형) 주요 면책 약관 체크",
        items: [
            "<strong>특약2(비중증) 전면 면책:</strong> 도수·체외충격파·증식치료 등 근골격계 비급여 및 영양·미용 등 비급여 주사제 일체 면책",
            "<strong>외래 관리급여 95% 연동:</strong> 외래 관리급여(도수 등)는 건보 본인부담률(95%)이 그대로 실손 자기부담률로 적용",
            "<strong>공통 면책 및 한도:</strong> 다초점렌즈·치과/한방 비급여 면책 / 100병상 미만 병·의원 비중증 입원 회당 300만원 한도"
        ]
    }
};

function switchSilbiTab(tabIdx) {
    [0, 1, 2].forEach(i => {
        const btn = document.getElementById(`smTabBtn${i}`);
        const content = document.getElementById(`silbiTabContent${i}`);
        if (i === tabIdx) {
            btn.className = "flex-1 py-3 text-center font-bold text-sm text-blue-600 border-b-[3px] border-blue-600 transition";
            content.classList.remove('hidden');
        } else {
            btn.className = "flex-1 py-3 text-center font-bold text-sm text-slate-400 hover:text-slate-600 border-b-[3px] border-transparent transition";
            content.classList.add('hidden');
        }
    });
}

function getAnnualRate(age, genCode) {
    let rateGroup = 'young';
    if (age >= 60) rateGroup = 'senior';
    else if (age >= 50) rateGroup = 'fifty';
    else if (age >= 40) rateGroup = 'forty';
    else if (age >= 30) rateGroup = 'thirty';
    let cleanGen = genCode === 'gen2_early' ? 'gen2' : genCode;
    return REALISTIC_RATES[rateGroup][cleanGen] !== undefined ? REALISTIC_RATES[rateGroup][cleanGen] : 5.0;
}

function parseNum(text) {
    if (!text) return 0;
    const cleanText = text.toString().replace(/,/g, '').replace(/ /g, '');
    const num = Number(cleanText);
    return isNaN(num) ? 0 : num;
}

function formatMoneyInput(el) {
    const val = el.value.replace(/[^0-9]/g, '');
    el.value = val === '' ? '' : Number(val).toLocaleString();
}

function getGenerationInfo(dateStr) {
    if (!dateStr || dateStr.length !== 8) return null;
    const dateNum = Number(dateStr);
    if (dateNum < 19900101 || dateNum > 21001231) return null;
    if (dateNum <= 20090930) return { code: 'gen1', name: '1세대 (구 실손)', cycle: 5 };
    if (dateNum <= 20130331) return { code: 'gen2_early', name: '2세대 (표준화 초기 90%형)', cycle: 3, sub: 'early' };
    if (dateNum <= 20150831) return { code: 'gen2', name: '2세대 (표준화 90%형)', cycle: 1, sub: 'early' };
    if (dateNum <= 20170331) return { code: 'gen2', name: '2세대 (선택형II 급90·비80)', cycle: 1, sub: 'late' };
    if (dateNum <= 20210630) return { code: 'gen3', name: '3세대 (착한 실손)', cycle: 1 };
    if (dateNum <= 20260505) return { code: 'gen4', name: '4세대 (비급여 차등)', cycle: 1 };
    return { code: 'gen5', name: '5세대 (중증 집중형)', cycle: 1 };
}

// ============================================================================
// [핵심 UI] 다회 통원 시 총금액 + 횟수 입력 ➔ 회차별 개별 병원비 입력창 자동 오픈
// ============================================================================
const COST_META = {
    cov:    { costId: 'smCoveredCost',    cntId: 'smCoveredCount',    wrapId: 'smCovBreakdownWrap',    listId: 'smCovBreakdownList',    itemCls: 'cov-day-input' },
    nonCov: { costId: 'smNonCoveredCost', cntId: 'smNonCoveredCount', wrapId: 'smNonCovBreakdownWrap', listId: 'smNonCovBreakdownList', itemCls: 'noncov-day-input' },
    med:    { costId: 'smMedicineCost',   cntId: 'smMedicineCount',   wrapId: 'smMedBreakdownWrap',    listId: 'smMedBreakdownList',    itemCls: 'med-day-input' }
};

function onMainCostOrCountChange(kind, isCostInput) {
    const meta = COST_META[kind];
    const costEl = document.getElementById(meta.costId);
    const cntEl = document.getElementById(meta.cntId);
    if (isCostInput && costEl) formatMoneyInput(costEl);

    if (smTreatType !== 'outpatient') {
        document.getElementById(meta.wrapId)?.classList.add('hidden');
        return;
    }

    let count = parseInt(cntEl?.value, 10) || 1;
    if (count > 180) {
        count = 180;
        cntEl.value = 180;
    }
    const total = parseNum(costEl?.value);
    renderDailyBreakdown(kind, total, count, !isCostInput);
}

function renderDailyBreakdown(kind, total, count, preserveExistingIfCountChangedOnly) {
    const meta = COST_META[kind];
    const wrap = document.getElementById(meta.wrapId);
    const list = document.getElementById(meta.listId);
    if (!wrap || !list) return;

    // 통원 횟수가 2회 이상일 때만 회차별 입력창 오픈 (1회일 때는 총금액 = 1회 통원비)
    if (smTreatType !== 'outpatient' || count <= 1) {
        wrap.classList.add('hidden');
        list.innerHTML = '';
        return;
    }

    wrap.classList.remove('hidden');
    const existingInputs = Array.from(list.querySelectorAll('input'));
    const baseAmt = Math.floor(total / count);
    const remainder = total - (baseAmt * count);

    // 칸 개수가 바뀌었으면 재구성하되, 총금액이 있으면 자동 1/N 균등 배분 세팅
    if (existingInputs.length !== count) {
        let html = '';
        for (let i = 0; i < count; i++) {
            const val = total > 0 ? (i === 0 ? baseAmt + remainder : baseAmt) : 0;
            const formatted = val > 0 ? val.toLocaleString() : '';
            html += `
                <div class="flex items-center bg-white border border-slate-300 rounded-md px-2 py-1 shadow-sm">
                    <span class="text-[10px] font-bold text-slate-500 mr-1.5 whitespace-nowrap">${i + 1}회차</span>
                    <input type="text" data-day="${i + 1}" value="${formatted}" placeholder="0"
                        oninput="onBreakdownItemInput('${kind}', this)"
                        class="${meta.itemCls} w-full text-xs text-right font-bold text-slate-800 focus:outline-none">
                </div>`;
        }
        list.innerHTML = html;
    } else if (!preserveExistingIfCountChangedOnly) {
        // 상단 총금액을 새로 수정한 경우 각 회차에 균등 재분배
        existingInputs.forEach((inp, i) => {
            const val = total > 0 ? (i === 0 ? baseAmt + remainder : baseAmt) : 0;
            inp.value = val > 0 ? val.toLocaleString() : '';
        });
    }
}

function distributeEvenly(kind) {
    const meta = COST_META[kind];
    const total = parseNum(document.getElementById(meta.costId)?.value);
    const count = parseInt(document.getElementById(meta.cntId)?.value, 10) || 1;
    const list = document.getElementById(meta.listId);
    if (!list || count <= 1) return;
    const inputs = Array.from(list.querySelectorAll('input'));
    const baseAmt = Math.floor(total / count);
    const remainder = total - (baseAmt * count);
    inputs.forEach((inp, i) => {
        const val = total > 0 ? (i === 0 ? baseAmt + remainder : baseAmt) : 0;
        inp.value = val > 0 ? val.toLocaleString() : '';
    });
}

// 회차별 개별 칸 금액을 직접 수정하면 상단 총금액도 실시간 자동 합산
function onBreakdownItemInput(kind, inputEl) {
    formatMoneyInput(inputEl);
    const meta = COST_META[kind];
    const list = document.getElementById(meta.listId);
    const costEl = document.getElementById(meta.costId);
    if (!list || !costEl) return;
    const sum = Array.from(list.querySelectorAll('input')).reduce((acc, el) => acc + parseNum(el.value), 0);
    costEl.value = sum > 0 ? sum.toLocaleString() : '';
}

// 계산 시점에 각 항목의 회차별 금액 배열 추출
function getDailyAmountsArray(kind) {
    const meta = COST_META[kind];
    const total = parseNum(document.getElementById(meta.costId)?.value);
    if (smTreatType !== 'outpatient') {
        return total > 0 ? [total] : [];
    }
    const count = parseInt(document.getElementById(meta.cntId)?.value, 10) || (total > 0 ? 1 : 0);
    if (count <= 0) return [];
    if (count === 1) return total > 0 ? [total] : [];

    const list = document.getElementById(meta.listId);
    const inputs = list ? Array.from(list.querySelectorAll('input')) : [];
    if (inputs.length === count) {
        return inputs.map(el => parseNum(el.value));
    }
    const baseAmt = Math.floor(total / count);
    const remainder = total - (baseAmt * count);
    return Array.from({ length: count }, (_, i) => (i === 0 ? baseAmt + remainder : baseAmt));
}

function updateCostInputUI() {
    const isOut = (smTreatType === 'outpatient');
    const titleEl = document.getElementById('smCostSectionTitle');
    const covLabel = document.getElementById('smCovLabel');
    const nonCovLabel = document.getElementById('smNonCovLabel');
    const medLabel = document.getElementById('smMedicineLabel');

    const leftCols = ['smCovColLeft', 'smNonCovColLeft', 'smMedColLeft'].map(id => document.getElementById(id));
    const rightCols = document.querySelectorAll('.smOutCountCol');

    if (isOut) {
        if (titleEl) titleEl.innerHTML = `<span>💰</span> <span>병원비 입력 (총액·통원횟수 입력 시 회차별 입력창 오픈)</span>`;
        if (covLabel) covLabel.innerText = "급여 총금액 (환자 본인부담금)";
        if (nonCovLabel) nonCovLabel.innerText = "일반 비급여 총금액 (3세대~ 3대분리)";
        if (medLabel) {
            medLabel.innerHTML = (smGen === 'gen4' || smGen === 'gen5')
                ? `<span>💊</span> <span>급여 약값 총액 (4·5세대 외래 급여와 회차별 합산)</span>`
                : `<span>💊</span> <span>약값 총금액 (처방조제 약제비)</span>`;
        }
        leftCols.forEach(el => { if (el) { el.classList.remove('col-span-3'); el.classList.add('col-span-2'); } });
        rightCols.forEach(el => el.classList.remove('hidden'));
        ['cov', 'nonCov', 'med'].forEach(k => onMainCostOrCountChange(k, false));
    } else {
        if (titleEl) titleEl.innerHTML = `<span>💰</span> <span>병원비 입력 (1회 입원 총 합산 금액)</span>`;
        if (covLabel) covLabel.innerText = "입원 급여 합산 (본인부담금)";
        if (nonCovLabel) nonCovLabel.innerText = "입원 일반 비급여 합산 (3세대~ 3대분리)";
        if (medLabel) medLabel.innerHTML = `<span>💊</span> <span>퇴원/입원 약제비 (입원 급여에 합산)</span>`;
        leftCols.forEach(el => { if (el) { el.classList.remove('col-span-2'); el.classList.add('col-span-3'); } });
        rightCols.forEach(el => el.classList.add('hidden'));
        ['cov', 'nonCov', 'med'].forEach(k => document.getElementById(COST_META[k].wrapId)?.classList.add('hidden'));
    }
}

function updateHospitalUI() {
    const hospNote = document.getElementById('smGen5HospNote');
    if (hospNote) {
        if (smGen === 'gen5') hospNote.classList.remove('hidden');
        else hospNote.classList.add('hidden');
    }
}

function updateExclusionNoticeUI() {
    const titleEl = document.getElementById('smGenExclTitle');
    const listEl = document.getElementById('smGenExclList');
    const info = GEN_EXCLUSION_DATA[smGen];
    if (!titleEl || !listEl || !info) return;
    titleEl.innerText = info.title;
    listEl.innerHTML = info.items.map(item => `<li>${item}</li>`).join('');
}

function toggleManagedCareUI() {
    const chk = document.getElementById('smManagedCareChk');
    const subBox = document.getElementById('smManagedCareSubBox');
    if (chk && subBox) {
        if (chk.checked) subBox.classList.remove('hidden');
        else subBox.classList.add('hidden');
    }
}

function setSilbiTreatType(type) {
    smTreatType = type;
    const outBtn = document.getElementById('smTreatBtn_outpatient');
    const inBtn = document.getElementById('smTreatBtn_inpatient');
    const visitBox = document.getElementById('smVisitCountBox');

    if (type === 'outpatient') {
        outBtn.className = "flex-1 bg-slate-800 text-white py-2.5 rounded-lg text-xs font-bold shadow-md transition flex items-center justify-center gap-1.5";
        inBtn.className = "flex-1 bg-transparent text-slate-500 py-2.5 rounded-lg text-xs font-bold hover:bg-slate-100 transition flex items-center justify-center gap-1.5";
        if (smGen !== 'gen5') visitBox.classList.remove('hidden');
    } else {
        inBtn.className = "flex-1 bg-slate-800 text-white py-2.5 rounded-lg text-xs font-bold shadow-md transition flex items-center justify-center gap-1.5";
        outBtn.className = "flex-1 bg-transparent text-slate-500 py-2.5 rounded-lg text-xs font-bold hover:bg-slate-100 transition flex items-center justify-center gap-1.5";
        visitBox.classList.add('hidden');
    }
    updateCostInputUI();
}

function setSilbiGen2Sub(sub) {
    smGen2Sub = sub;
    const bEarly = document.getElementById('smGen2Sub_early');
    const bLate = document.getElementById('smGen2Sub_late');
    if (bEarly && bLate) {
        bEarly.className = sub === 'early' ? 'py-2 rounded-lg font-bold text-xs bg-slate-800 text-white shadow-sm' : 'py-2 rounded-lg font-bold text-xs bg-slate-100 text-slate-600 shadow-sm';
        bLate.className = sub === 'late' ? 'py-2 rounded-lg font-bold text-xs bg-slate-800 text-white shadow-sm' : 'py-2 rounded-lg font-bold text-xs bg-slate-100 text-slate-600 shadow-sm';
    }
}

function initSilbiMasterDefaults() {
    updateMedicineLabel();
    updateHospitalUI();
}

function setSilbiGen(gen) {
    smGen = gen;
    ['gen1', 'gen2', 'gen3', 'gen4', 'gen5'].forEach(g => {
        const btn = document.getElementById(`smGenBtn_${g}`);
        if (btn) {
            if (g === gen) {
                btn.className = "py-2 px-1 rounded-lg font-bold text-xs bg-slate-800 text-white shadow-sm transition";
            } else if (g === 'gen5') {
                btn.className = "py-2 px-1 rounded-lg font-bold text-xs bg-slate-100 text-blue-600 border border-blue-200 shadow-sm transition";
            } else {
                btn.className = "py-2 px-1 rounded-lg font-bold text-xs bg-slate-100 text-slate-600 shadow-sm transition";
            }
        }
    });

    const gen1Box = document.getElementById('smGen1SubOptions');
    const gen2Box = document.getElementById('smGen2SubOptions');
    const gen5Box = document.getElementById('smGen5SubOptions');
    const visitBox = document.getElementById('smVisitCountBox');
    const visitLabel = document.getElementById('smVisitCountLabel');
    const gen4Note = document.getElementById('smGen4DocNote');

    gen1Box?.classList.add('hidden');
    gen2Box?.classList.add('hidden');
    gen5Box?.classList.add('hidden');
    visitBox?.classList.add('hidden');
    gen4Note?.classList.add('hidden');

    if (gen === 'gen1') {
        gen1Box?.classList.remove('hidden');
        if (smTreatType === 'outpatient') visitBox?.classList.remove('hidden');
        if (visitLabel) visitLabel.innerText = "⚠️ 이전 누적 통원 횟수 (동일 질병당 연 30회 한도)";
    } else if (gen === 'gen2') {
        gen2Box?.classList.remove('hidden');
        if (smTreatType === 'outpatient') visitBox?.classList.remove('hidden');
        if (visitLabel) visitLabel.innerText = "⚠️ 이전 누적 통원 횟수 (연간 180회 한도)";
    } else if (gen === 'gen3') {
        if (smTreatType === 'outpatient') visitBox?.classList.remove('hidden');
        if (visitLabel) visitLabel.innerText = "⚠️ 이전 누적 통원 횟수 (기본외래 연간 180회 한도)";
    } else if (gen === 'gen4') {
        if (smTreatType === 'outpatient') visitBox?.classList.remove('hidden');
        if (visitLabel) visitLabel.innerText = "⚠️ 이전 비급여 통원 누적 횟수 (4세대 비급여 연 100회 한도)";
        if (gen4Note) {
            gen4Note.innerText = "* 4세대 도수치료는 10회마다 병변 개선 확인서가 필요하며, 비급여 통원은 연 100회 한도입니다.";
            gen4Note.classList.remove('hidden');
        }
    } else if (gen === 'gen5') {
        gen5Box?.classList.remove('hidden');
    }

    updateCostInputUI();
    updateHospitalUI();
    updateExclusionNoticeUI();
}

function setSilbiGen5Severity(severity) {
    smGen5Severity = severity;
    const btnSevere = document.getElementById('smGen5Sev_severe');
    const btnNonSevere = document.getElementById('smGen5Sev_nonSevere');
    const desc = document.getElementById('smGen5SevDesc');

    if (severity === 'severe') {
        btnSevere.className = "py-2 rounded-lg font-bold text-xs bg-blue-600 text-white shadow-sm transition";
        btnNonSevere.className = "py-2 rounded-lg font-bold text-xs bg-white text-slate-600 border border-slate-300 shadow-sm transition";
        if (desc) desc.innerText = "* 중증(특약1): 비급여 30% 공제 / 종합·상급병원 입원 시 연간 자기부담 500만원 상한 적용!";
    } else {
        btnNonSevere.className = "py-2 rounded-lg font-bold text-xs bg-blue-600 text-white shadow-sm transition";
        btnSevere.className = "py-2 rounded-lg font-bold text-xs bg-white text-slate-600 border border-slate-300 shadow-sm transition";
        if (desc) desc.innerText = "* 비중증(특약2): 비급여 50% 공제(통원 최소 5만) / 도수·체외·주사 면책 / 병·의원 입원 300만 한도";
    }
}

function setSilbiGen1Type(type) {
    smGen1Type = type;
    document.getElementById('smGen1Type_nonLife').className = type === 'nonLife' ? 'py-2 rounded-lg font-bold text-xs bg-slate-800 text-white shadow-sm' : 'py-2 rounded-lg font-bold text-xs bg-slate-100 text-slate-600 shadow-sm';
    document.getElementById('smGen1Type_life').className = type === 'life' ? 'py-2 rounded-lg font-bold text-xs bg-slate-800 text-white shadow-sm' : 'py-2 rounded-lg font-bold text-xs bg-slate-100 text-slate-600 shadow-sm';

    const nonLifeBox = document.getElementById('smGen1NonLifeBox');
    const lifeNote = document.getElementById('smGen1LifeNote');
    if (type === 'nonLife') {
        nonLifeBox.classList.remove('hidden');
        lifeNote.classList.add('hidden');
    } else {
        nonLifeBox.classList.add('hidden');
        lifeNote.classList.remove('hidden');
    }
}

function setSilbiGen1Pharm(pharm) {
    smGen1Pharm = pharm;
    document.getElementById('smGen1Pharm_combined').className = pharm === 'combined' ? 'py-2 rounded-lg font-bold text-xs bg-slate-800 text-white shadow-sm' : 'py-2 rounded-lg font-bold text-xs bg-slate-100 text-slate-600 shadow-sm';
    document.getElementById('smGen1Pharm_separate50k').className = pharm === 'separate50k' ? 'py-2 rounded-lg font-bold text-xs bg-slate-800 text-white shadow-sm' : 'py-2 rounded-lg font-bold text-xs bg-slate-100 text-slate-600 shadow-sm';
    const limitBox = document.getElementById('smGen1LimitBox');
    if (pharm === 'combined') limitBox.classList.remove('hidden');
    else limitBox.classList.add('hidden');
}

function setSilbiGen1Limit(limit) {
    smGen1Limit = limit;
    document.getElementById('smGen1Limit_30m').className = limit === '30m' ? 'py-2 rounded-lg font-bold text-xs bg-slate-800 text-white shadow-sm' : 'py-2 rounded-lg font-bold text-xs bg-slate-100 text-slate-600 shadow-sm';
    document.getElementById('smGen1Limit_100m').className = limit === '100m' ? 'py-2 rounded-lg font-bold text-xs bg-slate-800 text-white shadow-sm' : 'py-2 rounded-lg font-bold text-xs bg-slate-100 text-slate-600 shadow-sm';
}

function setSilbiHospital(hosp) {
    smHospital = hosp;
    ['clinic', 'smallHosp', 'hospital', 'tertiary'].forEach(h => {
        const b = document.getElementById(`smHospBtn_${h}`);
        if (!b) return;
        if (h === hosp) b.className = "py-2.5 px-1 rounded-lg font-bold text-[11px] bg-slate-800 text-white shadow-sm leading-tight";
        else b.className = "py-2.5 px-1 rounded-lg font-bold text-[11px] bg-slate-100 text-slate-600 shadow-sm leading-tight";
    });
}

function findSilbiGeneration() {
    const joinDate = document.getElementById('smJoinDate').value.trim();
    const info = getGenerationInfo(joinDate);
    if (!info) {
        alert("가입일자를 유효한 8자리 숫자(예: 20260510)로 입력해주세요.");
        return;
    }
    setSilbiGen(info.code === 'gen2_early' ? 'gen2' : info.code);
    if (info.sub) setSilbiGen2Sub(info.sub);
    alert(`✅ ${info.name}으로 자동 설정되었습니다.`);
}

function resetSilbiAll() {
    const idsToClear = [
        'smJoinDate', 'smCoveredCost', 'smNonCoveredCost', 'smMedicineCost',
        'smCoveredCount', 'smNonCoveredCount', 'smMedicineCount', 'smTotalVisitCount',
        'smManualUnit', 'smManualCount', 'smManualPrevCount',
        'smEswtUnit', 'smEswtCount', 'smEswtPrevCount',
        'smInjectionUnit', 'smInjectionCount', 'smInjectionPrevCount',
        'smMriUnit', 'smMriCount'
    ];
    idsToClear.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    ['cov', 'nonCov', 'med'].forEach(k => {
        document.getElementById(COST_META[k].wrapId)?.classList.add('hidden');
        const list = document.getElementById(COST_META[k].listId);
        if (list) list.innerHTML = '';
    });
    document.getElementById('smResultBox').classList.add('hidden');
    setSilbiGen('gen2');
    setSilbiGen2Sub('late');
    setSilbiTreatType('outpatient');
    setSilbiHospital('clinic');
}

// ============================================================================
// [정밀 연산 헬퍼] 특약 계산 · 관리급여(도수) · 동일부위 횟수제한(체외충격파·증식)
// ============================================================================
function calculateSpecialRider(unitPrice, count, prevCount, maxAnnualCount, minDedPerVisit, ratio, annualLimit, name, logs, perVisitCap = 0) {
    if (unitPrice <= 0 || count <= 0) return { pay: 0, usedVisits: 0 };

    let validCount = count;
    if (maxAnnualCount > 0) {
        const remain = Math.max(0, maxAnnualCount - prevCount);
        if (count > remain) {
            validCount = remain;
            logs.push(`🛑 [${name}] 연간 한도(${maxAnnualCount}회, 기사용 ${prevCount}회) 초과! ${count - remain}회분 보상 제외`);
        }
    }
    if (validCount <= 0) return { pay: 0, usedVisits: 0 };

    const dedPerVisit = Math.max(minDedPerVisit, unitPrice * ratio);
    let payPerVisit = Math.max(0, unitPrice - dedPerVisit);

    if (payPerVisit <= 0) {
        logs.push(`[${name}] ⚠️ 1회 단가(${unitPrice.toLocaleString()}원)가 회당 공제금(${Math.floor(dedPerVisit).toLocaleString()}원) 이하로 미지급`);
        return { pay: 0, usedVisits: 0 };
    }

    let capNote = "";
    if (perVisitCap > 0 && payPerVisit > perVisitCap) {
        payPerVisit = perVisitCap;
        capNote = ` [1회 통원한도 ${(perVisitCap / 10000)}만 적용]`;
    }

    let totalPay = payPerVisit * validCount;
    if (totalPay > annualLimit) {
        logs.push(`[${name}] ⚠️ 연간 보상한도(${(annualLimit / 10000).toLocaleString()}만원) 초과로 한도액까지만 지급`);
        totalPay = annualLimit;
    } else {
        logs.push(`[${name}] 인정 ${validCount}회 (회당 ${unitPrice.toLocaleString()}원 ➔ 회당지급 ${Math.floor(payPerVisit).toLocaleString()}원)${capNote} ➔ 소계 ${Math.floor(totalPay).toLocaleString()}원`);
    }
    return { pay: totalPay, usedVisits: validCount };
}

/**
 * 도수치료(관리급여) + 체외충격파·증식치료(동일 질병·부위당 6회 / 전체 12회) 통합 플랜
 */
function buildPhysicalTherapyPlans(params, details) {
    const { uManual, cManual, prevManual, uEswt, cEswt, prevEswt, generation, severity, isOutpatient } = params;
    const isManaged = document.getElementById('smManagedCareChk')?.checked;
    const dosuMax = parseInt(document.getElementById('smDosuLimitType')?.value || '15', 10);
    const eswtMax = parseInt(document.getElementById('smEswtLimitType')?.value || '6', 10);

    let dosuPlan = { mode: 'none', unit: 0, validCnt: 0, directPay: 0 };
    let eswtPlan = { mode: 'none', unit: 0, validCnt: 0, directPay: 0 };

    // 1) 도수치료 처리
    if (uManual > 0 && cManual > 0) {
        if (isManaged) {
            const remain = Math.max(0, dosuMax - prevManual);
            const validCnt = Math.min(cManual, remain);
            if (cManual > remain) {
                details.push(`🛑 [도수치료 관리급여 제한] 기준 한도(${dosuMax}회, 기사용 ${prevManual}회) 초과! 초과분 ${cManual - remain}회(${((cManual - remain) * uManual).toLocaleString()}원) 전 세대 면책`);
            }
            if (validCnt > 0) {
                if (generation === 'gen5') {
                    if (isOutpatient) {
                        // 5세대 외래 관리급여: 건보 본인부담률(95%) 연동 자기부담 구조
                        if (severity === 'nonSevere') {
                            details.push(`🚫 [5세대 면책/95%연동] 비중증 도수치료(외래 관리급여 본인부담 95% 연동)는 실손 지급 대상에서 제외됩니다! (0원)`);
                            dosuPlan = { mode: 'excluded', unit: 0, validCnt: 0, directPay: 0 };
                        } else {
                            // 중증 외래 관리급여도 외래 시 95% 본인부담 연동 (5%만 보전하되 최소공제 차감)
                            const payPer = Math.max(0, uManual * 0.05);
                            const tot = Math.floor(payPer * validCnt);
                            details.push(`⚠️ [5세대 외래 관리급여] 건보 본인부담률(95%) 자기부담 연동 적용 (${validCnt}회 소계 ${tot.toLocaleString()}원)`);
                            dosuPlan = { mode: 'rider', unit: 0, validCnt: 0, directPay: tot };
                        }
                    } else {
                        // 5세대 입원 중 관리급여는 본인부담 20% 적용 (단, 비중증 근골격계 면책 주의)
                        if (severity === 'nonSevere') {
                            details.push(`🚫 [5세대 특약2 면책] 비중증 근골격계 도수치료는 실손 면책 대상입니다! (0원)`);
                        } else {
                            details.push(`✅ [5세대 중증 입원 관리급여] 인정 ${validCnt}회분 입원 급여(20% 공제)에 합산 반영`);
                            dosuPlan = { mode: 'covered', unit: uManual, validCnt, directPay: 0 };
                        }
                    }
                } else {
                    // 1~4세대: 관리급여 인정 횟수분은 건보 '급여 본인부담금'으로 각 회차별 급여에 편입!
                    details.push(`✅ [도수 관리급여 적용] 인정 ${validCnt}회(회당 ${uManual.toLocaleString()}원) ➔ 1~4세대 건강보험 '급여 본인부담금'으로 회차별 반영`);
                    dosuPlan = { mode: 'covered', unit: uManual, validCnt, directPay: 0 };
                }
            }
        } else {
            // 관리급여 미적용(기존 비급여 약관 시뮬레이션)
            if (generation === 'gen1' || generation === 'gen2') {
                dosuPlan = { mode: 'nonCovered', unit: uManual, validCnt: cManual, directPay: 0 };
            } else if (generation === 'gen3' || generation === 'gen4') {
                const minDed = generation === 'gen3' ? 20000 : 30000;
                const cap = (generation === 'gen4' && isOutpatient) ? 200000 : 0;
                if (generation === 'gen4' && (prevManual + cManual) > 10) {
                    details.push(`💡 [4세대 필수서류] 도수치료 누적 10회 초과 시 병변 개선 확인서 제출 필수`);
                }
                const r = calculateSpecialRider(uManual, cManual, prevManual, 50, minDed, 0.3, 3500000, "도수치료(특약)", details, cap);
                dosuPlan = { mode: 'rider', unit: 0, validCnt: r.usedVisits, directPay: r.pay };
            } else {
                if (severity === 'nonSevere') {
                    details.push(`🚫 [5세대 면책 약관] 비중증 도수치료는 보장 제외(면책)입니다! (0원)`);
                } else {
                    const r = calculateSpecialRider(uManual, cManual, prevManual, 50, 30000, 0.3, 3500000, "중증 도수치료", details, isOutpatient ? 200000 : 0);
                    dosuPlan = { mode: 'rider', unit: 0, validCnt: r.usedVisits, directPay: r.pay };
                }
            }
        }
    }

    // 2) 체외충격파·증식치료 처리 (동일 질병·부위당 연 6회 / 전체 연 12회 제한 완벽 반영)
    if (uEswt > 0 && cEswt > 0) {
        const effectiveMax = isManaged ? eswtMax : 50;
        const limitLabel = eswtMax === 6 ? "동일 질병·부위당 연 6회" : "전체 부위 합산 연 12회";

        if (generation === 'gen5' && severity === 'nonSevere') {
            details.push(`🚫 [5세대 면책 약관] 비중증 체외충격파·증식치료는 실손 보장에서 제외됩니다! (청구 ${(uEswt * cEswt).toLocaleString()}원 ➔ 0원)`);
        } else {
            let validEswt = cEswt;
            if (isManaged) {
                const remain = Math.max(0, effectiveMax - prevEswt);
                if (cEswt > remain) {
                    validEswt = remain;
                    details.push(`🛑 [체외충격파·증식 횟수제한] ${limitLabel}(기사용 ${prevEswt}회) 초과! 초과분 ${cEswt - remain}회(${((cEswt - remain) * uEswt).toLocaleString()}원) 전 세대 면책`);
                }
            }

            if (validEswt > 0) {
                if (generation === 'gen1' || generation === 'gen2') {
                    details.push(`✅ [체외충격파·증식] 기준 내 인정 ${validEswt}회(회당 ${uEswt.toLocaleString()}원) ➔ ${isOutpatient ? '회차별 일반 비급여에 반영' : '입원 비급여에 합산'}`);
                    eswtPlan = { mode: 'nonCovered', unit: uEswt, validCnt: validEswt, directPay: 0 };
                } else {
                    // 3·4세대 및 5세대(중증): 3대 비급여 특약 공제 적용 (도수와 연간 50회/350만원 한도 공유 고려)
                    const minDed = generation === 'gen3' ? 20000 : 30000;
                    const cap = ((generation === 'gen4' || generation === 'gen5') && isOutpatient) ? 200000 : 0;
                    const r = calculateSpecialRider(uEswt, validEswt, 0, 50, minDed, 0.3, 3500000, "체외충격파·증식(특약)", details, cap);
                    eswtPlan = { mode: 'rider', unit: 0, validCnt: r.usedVisits, directPay: r.pay };
                }
            }
        }
    }

    return { dosuPlan, eswtPlan };
}

function pushGroupedVisitLogs(dayResults, labelPrefix, details) {
    if (dayResults.length === 0) return;
    let groups = [];
    dayResults.forEach((r, idx) => {
        const dayNum = idx + 1;
        const prev = groups[groups.length - 1];
        if (prev && prev.claim === r.claim && prev.ded === r.ded && prev.pay === r.pay && prev.note === r.note) {
            prev.endDay = dayNum;
            prev.count++;
        } else {
            groups.push({ startDay: dayNum, endDay: dayNum, count: 1, ...r });
        }
    });

    groups.forEach(g => {
        const rangeTxt = g.count === 1 ? `${g.startDay}회차` : `${g.startDay}~${g.endDay}회차(${g.count}회)`;
        if (g.pay <= 0) {
            details.push(`[${labelPrefix} ${rangeTxt}] ⚠️ 회당 청구 ${Math.floor(g.claim).toLocaleString()}원 ➔ ${g.note || `공제금(${Math.floor(g.ded).toLocaleString()}원) 이하 미지급`}`);
        } else {
            const subTotal = Math.floor(g.pay * g.count);
            const noteStr = g.note ? ` ${g.note}` : '';
            details.push(`[${labelPrefix} ${rangeTxt}] 회당 ${Math.floor(g.claim).toLocaleString()}원 (공제 -${Math.floor(g.ded).toLocaleString()}원 / 회당지급 ${Math.floor(g.pay).toLocaleString()}원)${noteStr} ➔ 소계 ${subTotal.toLocaleString()}원`);
        }
    });
}

// ============================================================================
// [메인 계산 엔진] 1~5세대 입원·통원(회차별 개별 금액 정밀 계산)
// ============================================================================
function calculateSilbiPayout() {
    const isOutpatient = (smTreatType === 'outpatient');

    const covArr = getDailyAmountsArray('cov');
    const nonCovArr = getDailyAmountsArray('nonCov');
    const medArr = getDailyAmountsArray('med');

    const prevVisitCnt = parseNum(document.getElementById('smTotalVisitCount').value);

    const uManual = parseNum(document.getElementById('smManualUnit').value);
    const cManual = uManual > 0 ? (parseNum(document.getElementById('smManualCount').value) || 1) : 0;
    const prevManual = parseNum(document.getElementById('smManualPrevCount')?.value);

    const uEswt = parseNum(document.getElementById('smEswtUnit')?.value);
    const cEswt = uEswt > 0 ? (parseNum(document.getElementById('smEswtCount')?.value) || 1) : 0;
    const prevEswt = parseNum(document.getElementById('smEswtPrevCount')?.value);

    const uInj = parseNum(document.getElementById('smInjectionUnit').value);
    const cInj = uInj > 0 ? (parseNum(document.getElementById('smInjectionCount').value) || 1) : 0;
    const prevInj = parseNum(document.getElementById('smInjectionPrevCount')?.value);

    const uMri = parseNum(document.getElementById('smMriUnit').value);
    const cMri = uMri > 0 ? (parseNum(document.getElementById('smMriCount').value) || 1) : 0;

    const sumArr = arr => arr.reduce((a, b) => a + b, 0);
    if ((sumArr(covArr) + sumArr(nonCovArr) + sumArr(medArr) + uManual + uEswt + uInj + uMri) === 0) {
        alert("병원비 또는 약제비를 입력해주세요!");
        return;
    }

    let totalPayout = 0;
    let details = [];

    // 병원 종류 4단계별 표준 통원 최소 공제금 (의원 1만 / 일반·준종합병원 1.5만 / 종합병원 1.5만 / 상급종합 2만)
    let baseDed = 10000;
    if (smHospital === 'smallHosp' || smHospital === 'hospital') baseDed = 15000;
    else if (smHospital === 'tertiary') baseDed = 20000;

    // 5세대 100병상 미만 병·의원 여부 (의원 + 30~99병상 일반·준종합병원 모두 해당!)
    const isUnder100Beds = (smHospital === 'clinic' || smHospital === 'smallHosp');
    const isEarlyGen2 = (smGen2Sub === 'early');

    const { dosuPlan, eswtPlan } = buildPhysicalTherapyPlans({
        uManual, cManual, prevManual, uEswt, cEswt, prevEswt,
        generation: smGen, severity: smGen5Severity, isOutpatient
    }, details);

    // ==================== [A] 통원 (회차별 개별 금액 정밀 계산) ====================
    if (isOutpatient) {
        const incInjInDaily = (smGen === 'gen1' || smGen === 'gen2');
        const incMriInDaily = (smGen === 'gen1' || smGen === 'gen2' || (smGen === 'gen5' && smGen5Severity === 'nonSevere'));

        const maxDays = Math.max(
            covArr.length,
            nonCovArr.length,
            medArr.length,
            (dosuPlan.mode === 'covered' || dosuPlan.mode === 'nonCovered') ? dosuPlan.validCnt : 0,
            (eswtPlan.mode === 'covered' || eswtPlan.mode === 'nonCovered') ? eswtPlan.validCnt : 0,
            incInjInDaily ? cInj : 0,
            incMriInDaily ? cMri : 0
        );

        // --- 1세대 통원 ---
        if (smGen === 'gen1') {
            details.push(`📝 1세대 통원 회차별 계산 (동일 질병 연 30회 한도)`);
            let hospDays = [], pharmDays = [], combinedDays = [];

            for (let d = 1; d <= maxDays; d++) {
                if (prevVisitCnt + d > 30) {
                    details.push(`🛑 [1세대 통원 한도 초과] 누적 ${prevVisitCnt + d}회차부터 동일 질병 30회 한도 초과로 제외 (${maxDays - d + 1}회분 면책, 이후 180일 면책기간 주의)`);
                    break;
                }
                const dayCov = (covArr[d - 1] || 0) + (dosuPlan.mode === 'covered' && d <= dosuPlan.validCnt ? dosuPlan.unit : 0);
                const dayNonCov = (nonCovArr[d - 1] || 0)
                    + (dosuPlan.mode === 'nonCovered' && d <= dosuPlan.validCnt ? dosuPlan.unit : 0)
                    + (eswtPlan.mode === 'nonCovered' && d <= eswtPlan.validCnt ? eswtPlan.unit : 0)
                    + (d <= cInj ? uInj : 0) + (d <= cMri ? uMri : 0);
                const dayHosp = dayCov + dayNonCov;
                const dayMed = (medArr[d - 1] || 0);

                if (smGen1Type === 'life') {
                    if (dayHosp > 0) {
                        const raw = Math.max(0, dayHosp - 10000);
                        const pay = Math.min(200000, raw);
                        hospDays.push({ claim: dayHosp, ded: 10000, pay, note: raw > 200000 ? '[1일 한도 20만 적용]' : '' });
                        totalPayout += pay;
                    }
                    if (dayMed > 0) {
                        const raw = Math.max(0, dayMed - 5000);
                        const pay = Math.min(100000, raw);
                        pharmDays.push({ claim: dayMed, ded: 5000, pay, note: raw > 100000 ? '[1일 한도 10만 적용]' : '' });
                        totalPayout += pay;
                    }
                } else if (smGen1Pharm === 'separate50k') {
                    if (dayHosp > 0) {
                        const raw = Math.max(0, dayHosp - 5000);
                        const pay = Math.min(250000, raw);
                        hospDays.push({ claim: dayHosp, ded: 5000, pay, note: raw > 250000 ? '[1일 한도 25만 적용]' : '' });
                        totalPayout += pay;
                    }
                    if (dayMed > 0) {
                        const raw = Math.max(0, dayMed - 5000);
                        const pay = Math.min(50000, raw);
                        pharmDays.push({ claim: dayMed, ded: 5000, pay, note: raw > 50000 ? '[1일 한도 5만 적용]' : '' });
                        totalPayout += pay;
                    }
                } else {
                    const limitAmt = (smGen1Limit === '30m') ? 100000 : 300000;
                    const daySum = dayHosp + dayMed;
                    if (daySum > 0) {
                        const raw = Math.max(0, daySum - 5000);
                        const pay = Math.min(limitAmt, raw);
                        combinedDays.push({ claim: daySum, ded: 5000, pay, note: raw > limitAmt ? `[1일 한도 ${limitAmt / 10000}만 적용]` : '' });
                        totalPayout += pay;
                    }
                }
            }
            pushGroupedVisitLogs(hospDays, "외래", details);
            pushGroupedVisitLogs(pharmDays, "약제", details);
            pushGroupedVisitLogs(combinedDays, "통원합산", details);
        }

        // --- 2세대 통원 ---
        else if (smGen === 'gen2') {
            const labelType = isEarlyGen2 ? "표준화 초기(90%형)" : "선택형II(급여90%·비급여80%)";
            details.push(`📝 2세대 통원 [${labelType}] 회차별 계산 (외래 25만 / 약제 5만 한도)`);
            let hospDays = [], pharmDays = [];

            for (let d = 1; d <= maxDays; d++) {
                if (prevVisitCnt + d > 180) {
                    details.push(`🛑 [2세대 통원 한도 초과] 누적 ${prevVisitCnt + d}회차부터 연간 180회 한도 초과로 제외`);
                    break;
                }
                const dayCov = (covArr[d - 1] || 0) + (dosuPlan.mode === 'covered' && d <= dosuPlan.validCnt ? dosuPlan.unit : 0);
                const dayNonCov = (nonCovArr[d - 1] || 0)
                    + (dosuPlan.mode === 'nonCovered' && d <= dosuPlan.validCnt ? dosuPlan.unit : 0)
                    + (eswtPlan.mode === 'nonCovered' && d <= eswtPlan.validCnt ? eswtPlan.unit : 0)
                    + (d <= cInj ? uInj : 0) + (d <= cMri ? uMri : 0);
                const dayHosp = dayCov + dayNonCov;
                const dayMed = (medArr[d - 1] || 0);

                if (dayHosp > 0) {
                    const ratioDed = isEarlyGen2 ? (dayHosp * 0.1) : ((dayCov * 0.1) + (dayNonCov * 0.2));
                    const finalDed = Math.max(baseDed, ratioDed);
                    const raw = Math.max(0, dayHosp - finalDed);
                    const pay = Math.min(250000, raw);
                    hospDays.push({ claim: dayHosp, ded: finalDed, pay, note: raw > 250000 ? '[1일 한도 25만 적용]' : '' });
                    totalPayout += pay;
                }
                if (dayMed > 0) {
                    const pharmDed = isEarlyGen2 ? 8000 : Math.max(8000, dayMed * 0.1);
                    const raw = Math.max(0, dayMed - pharmDed);
                    const pay = Math.min(50000, raw);
                    pharmDays.push({ claim: dayMed, ded: pharmDed, pay, note: raw > 50000 ? '[처방한도 5만 적용]' : '' });
                    totalPayout += pay;
                }
            }
            pushGroupedVisitLogs(hospDays, "외래", details);
            pushGroupedVisitLogs(pharmDays, "약제", details);
        }

        // --- 3세대 통원 ---
        else if (smGen === 'gen3') {
            details.push(`📝 3세대 통원 기본형 회차별 계산 (외래 25만 / 약제 5만 한도)`);
            let hospDays = [], pharmDays = [];

            for (let d = 1; d <= maxDays; d++) {
                if (prevVisitCnt + d > 180) {
                    details.push(`🛑 [3세대 통원 한도 초과] 누적 ${prevVisitCnt + d}회차부터 기본외래 연간 180회 한도 초과 제외`);
                    break;
                }
                const dayCov = (covArr[d - 1] || 0) + (dosuPlan.mode === 'covered' && d <= dosuPlan.validCnt ? dosuPlan.unit : 0);
                const dayNonCov = (nonCovArr[d - 1] || 0);
                const dayHosp = dayCov + dayNonCov;
                const dayMed = (medArr[d - 1] || 0);

                if (dayHosp > 0) {
                    const ratioDed = (dayCov * 0.1) + (dayNonCov * 0.2);
                    const finalDed = Math.max(baseDed, ratioDed);
                    const raw = Math.max(0, dayHosp - finalDed);
                    const pay = Math.min(250000, raw);
                    hospDays.push({ claim: dayHosp, ded: finalDed, pay, note: raw > 250000 ? '[1일 한도 25만 적용]' : '' });
                    totalPayout += pay;
                }
                if (dayMed > 0) {
                    const pharmDed = Math.max(8000, dayMed * 0.1);
                    const raw = Math.max(0, dayMed - pharmDed);
                    const pay = Math.min(50000, raw);
                    pharmDays.push({ claim: dayMed, ded: pharmDed, pay, note: raw > 50000 ? '[처방한도 5만 적용]' : '' });
                    totalPayout += pay;
                }
            }
            pushGroupedVisitLogs(hospDays, "기본외래", details);
            pushGroupedVisitLogs(pharmDays, "약제", details);

            const rInj = calculateSpecialRider(uInj, cInj, prevInj, 50, 20000, 0.3, 2500000, "비급여주사(특약)", details, 0);
            const rMri = calculateSpecialRider(uMri, cMri, 0, 0, 20000, 0.3, 3000000, "비급여MRI(특약)", details, 0);
            const combinedPhysPay = Math.min(3500000, dosuPlan.directPay + eswtPlan.directPay);
            totalPayout += (combinedPhysPay + rInj.pay + rMri.pay);
        }

        // --- 4세대 통원 ---
        else if (smGen === 'gen4') {
            details.push(`📝 4세대 통원 회차별 계산 (급여·비급여 각각 회당 20만원 한도)`);
            let covDays = [], nonCovDays = [];
            let nonCovVisitUsed = prevVisitCnt;

            for (let d = 1; d <= maxDays; d++) {
                const dayCov = (covArr[d - 1] || 0) + (medArr[d - 1] || 0)
                    + (dosuPlan.mode === 'covered' && d <= dosuPlan.validCnt ? dosuPlan.unit : 0);
                const dayNonCov = (nonCovArr[d - 1] || 0);

                if (dayCov > 0) {
                    const minCovDed = (smHospital === 'tertiary') ? 20000 : 10000;
                    const finalDed = Math.max(minCovDed, dayCov * 0.2);
                    const raw = Math.max(0, dayCov - finalDed);
                    const pay = Math.min(200000, raw);
                    covDays.push({ claim: dayCov, ded: finalDed, pay, note: raw > 200000 ? '[회당 한도 20만 적용]' : '' });
                    totalPayout += pay;
                }
                if (dayNonCov > 0) {
                    nonCovVisitUsed++;
                    if (nonCovVisitUsed > 100) {
                        nonCovDays.push({ claim: dayNonCov, ded: 0, pay: 0, note: '4세대 비급여 통원 연 100회 한도 초과 제외' });
                    } else {
                        const ded = Math.max(30000, dayNonCov * 0.3);
                        const raw = Math.max(0, dayNonCov - ded);
                        const pay = Math.min(200000, raw);
                        nonCovDays.push({ claim: dayNonCov, ded, pay, note: raw > 200000 ? '[회당 한도 20만 적용]' : '' });
                        totalPayout += pay;
                    }
                }
            }
            pushGroupedVisitLogs(covDays, "급여통원", details);
            pushGroupedVisitLogs(nonCovDays, "일반비급여", details);

            const rInj = calculateSpecialRider(uInj, cInj, prevInj, 50, 30000, 0.3, 2500000, "비급여주사(3대특약)", details, 200000);
            const rMri = calculateSpecialRider(uMri, cMri, 0, 0, 30000, 0.3, 3000000, "비급여MRI(3대특약)", details, 200000);
            const combinedPhysPay = Math.min(3500000, dosuPlan.directPay + eswtPlan.directPay);
            totalPayout += (combinedPhysPay + rInj.pay + rMri.pay);
        }

        // --- 5세대 통원 ---
        else if (smGen === 'gen5') {
            let covDays = [], nonCovDays = [];

            if (smGen5Severity === 'severe') {
                details.push(`📝 5세대 [특약1·중증질환] 통원 회차별 계산 (회당 20만원 한도)`);
                for (let d = 1; d <= maxDays; d++) {
                    const dayCov = (covArr[d - 1] || 0) + (medArr[d - 1] || 0);
                    const dayNonCov = (nonCovArr[d - 1] || 0);

                    if (dayCov > 0) {
                        const minCovDed = (smHospital === 'tertiary') ? 20000 : 10000;
                        const finalDed = Math.max(minCovDed, dayCov * 0.2);
                        const raw = Math.max(0, dayCov - finalDed);
                        const pay = Math.min(200000, raw);
                        covDays.push({ claim: dayCov, ded: finalDed, pay, note: raw > 200000 ? '[회당 한도 20만 적용]' : '' });
                        totalPayout += pay;
                    }
                    if (dayNonCov > 0) {
                        const ded = Math.max(30000, dayNonCov * 0.3);
                        const raw = Math.max(0, dayNonCov - ded);
                        const pay = Math.min(200000, raw);
                        nonCovDays.push({ claim: dayNonCov, ded, pay, note: raw > 200000 ? '[회당 한도 20만 적용]' : '' });
                        totalPayout += pay;
                    }
                }
                pushGroupedVisitLogs(covDays, "급여중증", details);
                pushGroupedVisitLogs(nonCovDays, "비급여중증", details);

                const rInj = calculateSpecialRider(uInj, cInj, prevInj, 50, 30000, 0.3, 2500000, "중증 비급여주사(항암·면역 등)", details, 200000);
                const rMri = calculateSpecialRider(uMri, cMri, 0, 0, 30000, 0.3, 3000000, "중증 비급여MRI", details, 200000);
                totalPayout += (dosuPlan.directPay + eswtPlan.directPay + rInj.pay + rMri.pay);
            } else {
                details.push(`📝 5세대 [특약2·비중증 일반질환] 통원 회차별 계산`);
                if (uInj > 0 && cInj > 0) {
                    details.push(`🚫 [5세대 면책 약관] 비중증 비급여 주사제는 실손 보장에서 제외됩니다! (청구 ${(uInj * cInj).toLocaleString()}원 ➔ 0원)`);
                }
                let nonCovRunningSum = 0;

                for (let d = 1; d <= maxDays; d++) {
                    const dayCov = (covArr[d - 1] || 0) + (medArr[d - 1] || 0);
                    const dayNonCov = (nonCovArr[d - 1] || 0) + (d <= cMri ? uMri : 0);

                    if (dayCov > 0) {
                        const covRatio = (smHospital === 'tertiary') ? 0.4 : (smHospital === 'hospital' ? 0.35 : 0.3);
                        const minCovDed = (smHospital === 'tertiary') ? 30000 : 20000;
                        const finalDed = Math.max(minCovDed, dayCov * covRatio);
                        const raw = Math.max(0, dayCov - finalDed);
                        const pay = Math.min(200000, raw);
                        covDays.push({ claim: dayCov, ded: finalDed, pay, note: raw > 200000 ? '[회당 한도 20만 적용]' : '' });
                        totalPayout += pay;
                    }
                    if (dayNonCov > 0) {
                        const ded = Math.max(50000, dayNonCov * 0.5);
                        const raw = Math.max(0, dayNonCov - ded);
                        let pay = Math.min(200000, raw);
                        let note = raw > 200000 ? '[통원 일당 20만 한도]' : '';
                        if (nonCovRunningSum + pay > 10000000) {
                            pay = Math.max(0, 10000000 - nonCovRunningSum);
                            note = '[연간 1천만 한도 도달]';
                        }
                        nonCovRunningSum += pay;
                        nonCovDays.push({ claim: dayNonCov, ded, pay, note });
                        totalPayout += pay;
                    }
                }
                pushGroupedVisitLogs(covDays, "급여비중증", details);
                pushGroupedVisitLogs(nonCovDays, "비급여비중증(50%공제)", details);
            }
        }
    }

    // ==================== [B] 입원 (1회 입원 합산 계산) ====================
    else {
        let inCov = sumArr(covArr) + sumArr(medArr) + (dosuPlan.mode === 'covered' ? (dosuPlan.unit * dosuPlan.validCnt) : 0);
        let inNonCov = sumArr(nonCovArr)
            + (dosuPlan.mode === 'nonCovered' ? (dosuPlan.unit * dosuPlan.validCnt) : 0)
            + (eswtPlan.mode === 'nonCovered' ? (eswtPlan.unit * eswtPlan.validCnt) : 0);
        const totalInj = uInj * cInj;
        const totalMri = uMri * cMri;

        if (smGen === 'gen1' || smGen === 'gen2') {
            inNonCov += (totalInj + totalMri);
        }

        if (smGen === 'gen1') {
            const maxInpatientLimit = (smGen1Type === 'nonLife' && smGen1Limit === '30m') ? 30000000 : 100000000;
            const rawTotal = inCov + inNonCov;
            totalPayout = Math.min(rawTotal, maxInpatientLimit);
            details.push(`📝 1세대 입원 (본인부담 0원, 100% 보장)`);
            details.push(`[입원비] 청구: ${rawTotal.toLocaleString()}원 ➔ 지급: ${totalPayout.toLocaleString()}원`);
            if (rawTotal > maxInpatientLimit) details.push(`⚠️ 입원 한도(${(maxInpatientLimit / 10000).toLocaleString()}만원) 초과분 제외`);
        } else if (smGen === 'gen2') {
            const totalBill = inCov + inNonCov;
            let covDed = Math.min(2000000, inCov * 0.1);
            const nonCovDed = isEarlyGen2 ? (inNonCov * 0.1) : (inNonCov * 0.2);
            let finalDed = covDed + nonCovDed;
            if (isEarlyGen2 && finalDed > 2000000) finalDed = 2000000;

            totalPayout = Math.min(50000000, Math.max(0, totalBill - finalDed));
            details.push(`📝 2세대 입원 (연간 5,000만원 한도)`);
            details.push(`[입원비] 청구: ${totalBill.toLocaleString()}원 (공제 -${Math.floor(finalDed).toLocaleString()}원 / 지급 ${Math.floor(totalPayout).toLocaleString()}원)`);
        } else if (smGen === 'gen3') {
            const basicBill = inCov + inNonCov;
            let basicPay = 0;
            if (basicBill > 0) {
                const covDed = Math.min(2000000, inCov * 0.1);
                const nonCovDed = inNonCov * 0.2;
                const finalDed = covDed + nonCovDed;
                basicPay = Math.min(50000000, Math.max(0, basicBill - finalDed));
                details.push(`📝 3세대 입원 기본형 (급여 10%, 비급여 20% 공제)`);
                details.push(`[기본 입원] 청구: ${basicBill.toLocaleString()}원 (공제 -${Math.floor(finalDed).toLocaleString()}원 / 지급 ${Math.floor(basicPay).toLocaleString()}원)`);
            }
            const rInj = calculateSpecialRider(uInj, cInj, prevInj, 50, 20000, 0.3, 2500000, "비급여주사(특약)", details, 0);
            const rMri = calculateSpecialRider(uMri, cMri, 0, 0, 20000, 0.3, 3000000, "비급여MRI(특약)", details, 0);
            const combinedPhysPay = Math.min(3500000, dosuPlan.directPay + eswtPlan.directPay);
            totalPayout = basicPay + combinedPhysPay + rInj.pay + rMri.pay;
        } else if (smGen === 'gen4') {
            let covPay = 0, nonCovPay = 0;
            if (inCov > 0) {
                const finalDed = Math.min(2000000, inCov * 0.2);
                covPay = Math.min(50000000, Math.max(0, inCov - finalDed));
                details.push(`[급여 입원] 청구: ${inCov.toLocaleString()}원 (공제 -${Math.floor(finalDed).toLocaleString()}원 / 지급 ${Math.floor(covPay).toLocaleString()}원)`);
            }
            if (inNonCov > 0) {
                const ded = inNonCov * 0.3;
                nonCovPay = Math.min(50000000, Math.max(0, inNonCov - ded));
                details.push(`[비급여 입원] 청구: ${inNonCov.toLocaleString()}원 (공제 -${Math.floor(ded).toLocaleString()}원 / 지급 ${Math.floor(nonCovPay).toLocaleString()}원)`);
            }
            const rInj = calculateSpecialRider(uInj, cInj, prevInj, 50, 30000, 0.3, 2500000, "비급여주사(3대특약)", details, 0);
            const rMri = calculateSpecialRider(uMri, cMri, 0, 0, 30000, 0.3, 3000000, "비급여MRI(3대특약)", details, 0);
            const combinedPhysPay = Math.min(3500000, dosuPlan.directPay + eswtPlan.directPay);
            totalPayout = covPay + nonCovPay + combinedPhysPay + rInj.pay + rMri.pay;
        } else if (smGen === 'gen5') {
            let covPay = 0, nonCovPay = 0, specialPay = 0;
            if (inCov > 0) {
                const finalDed = Math.min(2000000, inCov * 0.2);
                covPay = Math.min(50000000, Math.max(0, inCov - finalDed));
                details.push(`[급여 입원] 청구: ${inCov.toLocaleString()}원 (공제 -${Math.floor(finalDed).toLocaleString()}원 / 지급 ${Math.floor(covPay).toLocaleString()}원)`);
            }

            if (smGen5Severity === 'severe') {
                details.push(`📝 5세대 [특약1·중증질환] 입원 기준 적용`);
                if (inNonCov > 0) {
                    let ded = inNonCov * 0.3;
                    if (!isUnder100Beds && ded > 5000000) {
                        ded = 5000000;
                        details.push(`✨ [5세대 중증 혜택] 종합·상급병원 중증 입원 비급여 연간 자기부담 상한(500만원) 적용!`);
                    }
                    nonCovPay = Math.min(50000000, Math.max(0, inNonCov - ded));
                    details.push(`[비급여 중증(입원)] 청구: ${inNonCov.toLocaleString()}원 (공제 -${Math.floor(ded).toLocaleString()}원 / 지급 ${Math.floor(nonCovPay).toLocaleString()}원)`);
                }
                const rInj = calculateSpecialRider(uInj, cInj, prevInj, 50, 30000, 0.3, 2500000, "중증 비급여주사(항암·면역 등)", details, 0);
                const rMri = calculateSpecialRider(uMri, cMri, 0, 0, 30000, 0.3, 3000000, "중증 비급여MRI", details, 0);
                specialPay = dosuPlan.directPay + eswtPlan.directPay + rInj.pay + rMri.pay;
            } else {
                details.push(`📝 5세대 [특약2·비중증 일반질환] 입원 기준 적용`);
                if (totalInj > 0) {
                    details.push(`🚫 [5세대 면책 약관] 비중증 비급여 주사제는 실손 보장에서 제외됩니다! (청구 ${totalInj.toLocaleString()}원 ➔ 0원)`);
                }
                const inNonCovTotal = inNonCov + totalMri;
                if (inNonCovTotal > 0) {
                    const ded = inNonCovTotal * 0.5;
                    const rawPay = Math.max(0, inNonCovTotal - ded);
                    const capAmount = isUnder100Beds ? 3000000 : 10000000;

                    if (rawPay > capAmount) {
                        nonCovPay = capAmount;
                        if (isUnder100Beds) {
                            details.push(`[비급여 비중증(입원)] 청구: ${inNonCovTotal.toLocaleString()}원 (50% 공제 후 ${Math.floor(rawPay).toLocaleString()}원)`);
                            details.push(`🛑 [병·의원 한도 제한] 100병상 미만 의원·병원·준종합병원 입원 회당 한도(300만원) 적용! ➔ 3,000,000원 지급`);
                        } else {
                            details.push(`[비급여 비중증(입원)] ⚠️ 5세대 비중증 연간 한도(1,000만원) 적용! ➔ 10,000,000원 지급`);
                        }
                    } else {
                        nonCovPay = rawPay;
                        const hospLabel = isUnder100Beds ? "병·의원(300만 한도 내)" : "종합·상급(1천만 한도 내)";
                        details.push(`[비급여 비중증(입원-${hospLabel})] 청구: ${inNonCovTotal.toLocaleString()}원 (50% 공제 -${Math.floor(ded).toLocaleString()}원 / 지급 ${Math.floor(nonCovPay).toLocaleString()}원)`);
                    }
                }
            }
            totalPayout = covPay + nonCovPay + specialPay;
        }
    }

    lastSilbiResult = {
        money: Math.floor(totalPayout),
        logs: details
    };

    document.getElementById('smResultMoney').innerText = `${lastSilbiResult.money.toLocaleString()}원`;
    const logsContainer = document.getElementById('smResultLogs');
    logsContainer.innerHTML = details.map(l => `<div class="mb-1">${l}</div>`).join('');
    document.getElementById('smResultBox').classList.remove('hidden');
}

function copySilbiResult() {
    if (!lastSilbiResult) return;
    const text = `[보험 청구 예상]\n예상 지급액: ${lastSilbiResult.money.toLocaleString()}원\n\n${lastSilbiResult.logs.join('\n')}`;
    navigator.clipboard.writeText(text).then(() => {
        alert("📋 클립보드에 복사되었습니다.");
    }).catch(() => {
        alert("복사 준비 완료\n\n" + text);
    });
}

function calculateCurrentAge() {
    const birthInput = document.getElementById('prembirthDate').value.trim();
    if (birthInput.length === 8) {
        const birthYear = parseInt(birthInput.substring(0, 4), 10);
        const birthMonth = parseInt(birthInput.substring(4, 6), 10);
        const birthDay = parseInt(birthInput.substring(6, 8), 10);

        const today = new Date();
        let age = today.getFullYear() - birthYear;
        if (today.getMonth() + 1 < birthMonth || (today.getMonth() + 1 === birthMonth && today.getDate() < birthDay)) {
            age--;
        }
        document.getElementById('premCurrentAge').value = Math.max(0, age);
    }
}

function checkPremGeneration() {
    const dateStr = document.getElementById('premJoinDate').value.trim();
    const info = getGenerationInfo(dateStr);
    if (info) {
        premGenInfo = info;
        document.getElementById('premCycle').value = info.cycle;
        const genDisplay = document.getElementById('premGenDisplay');
        genDisplay.innerText = `✅ ${info.name} 확인 (기본 갱신주기: ${info.cycle}년)`;
        genDisplay.classList.remove('hidden');
    } else {
        alert("가입시기를 유효한 8자리 숫자(예: 20090101)로 입력해주세요.");
    }
}

function calculateRenewalPremium() {
    const nowPrem = parseNum(document.getElementById('premCurrentPremium').value);
    const ageInput = document.getElementById('premCurrentAge').value.trim();
    const cycleInput = parseInt(document.getElementById('premCycle').value, 10) || 1;
    const manualRate = document.getElementById('premManualRate').value.trim();

    if (!nowPrem || nowPrem === 0) {
        alert("현재 월 보험료 금액을 입력해주세요.");
        return;
    }
    if (!ageInput) {
        alert("생년월일을 8자리로 입력하여 나이를 계산해주세요.");
        return;
    }

    const startAge = parseInt(ageInput, 10);
    if (startAge >= 90) {
        alert("현재 나이가 90세 이상이므로 90세 만기 시뮬레이션 대상이 아닙니다.");
        return;
    }

    let sumTotal = 0;
    let monthlyPrem = nowPrem;
    let shortLogs = [];
    let longLogs = [];
    let renewalCount = 0;
    const longTermTargets = [10, 20, 30, 40].map(gap => startAge + gap);
    let checkedTargets = [];

    // 갱신 주기(예: 3년, 5년) 동안 매년 쌓이는 위험률을 정확히 누적하기 위한 변수
    let cycleCompound = 1.0;
    let cycleLossSum = 0;
    let cycleAgeSum = 0;
    let cycleYears = 0;

    for (let age = startAge; age < 90; age++) {
        const yearsPassed = age - startAge;

        if (yearsPassed > 0) {
            let yearTotal = 0, yearLoss = 0, yearAge = 0;

            if (manualRate !== '') {
                yearTotal = parseFloat(manualRate) || 0;
                yearLoss = yearTotal;
                yearAge = 0;
            } else {
                const targetGen = premGenInfo ? premGenInfo.code : 'gen2';
                const r = getDetailedAnnualRate(age, targetGen, yearsPassed);
                yearTotal = r.total;
                yearLoss = r.lossRate;
                yearAge = r.ageRate;

                // 고액 보험료 구간 감독규정 및 재가입·요율 상한 완충 반영
                if (monthlyPrem > 400000) yearTotal *= 0.85;
                if (monthlyPrem > 700000) yearTotal *= 0.75;
            }

            cycleCompound *= (1 + yearTotal / 100);
            cycleLossSum += yearLoss;
            cycleAgeSum += yearAge;
            cycleYears++;

            // 갱신 주기 도래 시 실제 월 보험료 일괄 갱신 반영
            if (yearsPassed % cycleInput === 0) {
                renewalCount++;
                monthlyPrem = Math.floor(monthlyPrem * cycleCompound);

                const avgAnnual = ((Math.pow(cycleCompound, 1 / cycleYears) - 1) * 100).toFixed(1);
                const avgLoss = (cycleLossSum / cycleYears).toFixed(1);
                const avgAge = (cycleAgeSum / cycleYears).toFixed(1);

                if (renewalCount <= 3) {
                    const detailSub = (manualRate !== '')
                        ? `수동 연 ${avgAnnual}% 반영`
                        : `손해율 ${avgLoss}% + 연령 ${avgAge}% (연평균 ${avgAnnual}%)`;
                    shortLogs.push({
                        count: renewalCount,
                        futureAge: age,
                        amount: monthlyPrem,
                        detail: detailSub
                    });
                }

                // 다음 갱신 주기를 위해 누적치 초기화
                cycleCompound = 1.0;
                cycleLossSum = 0;
                cycleAgeSum = 0;
                cycleYears = 0;
            }

            longTermTargets.forEach((target, idx) => {
                if (!checkedTargets.includes(target) && age >= target) {
                    longLogs.push({
                        label: `${(idx + 1) * 10}년 뒤`,
                        realAge: age,
                        amount: monthlyPrem
                    });
                    checkedTargets.push(target);
                }
            });
        }
        sumTotal += monthlyPrem * 12;
    }

    const shortContainer = document.getElementById('premShortLogs');
    shortContainer.innerHTML = shortLogs.map(item => `
        <div class="flex justify-between items-center bg-white border border-slate-200 p-2.5 rounded-lg shadow-sm text-xs">
            <div class="flex items-center gap-2">
                <span class="bg-slate-700 text-white font-bold px-2 py-0.5 rounded text-[10px]">${item.count}회차</span>
                <span class="text-slate-800 font-bold">${item.futureAge}세 갱신</span>
            </div>
            <div class="text-right">
                <span class="text-blue-600 font-black text-sm">${item.amount.toLocaleString()}원</span>
                <span class="text-[10px] text-rose-500 block">(${item.detail})</span>
            </div>
        </div>
    `).join('');

    const longContainer = document.getElementById('premLongLogs');
    longContainer.innerHTML = longLogs.map(item => `
        <div class="flex justify-between items-center bg-white border border-slate-200 p-2.5 rounded-lg shadow-sm text-xs">
            <div class="flex items-center gap-2">
                <span class="bg-[#c0392b] text-white font-bold px-2 py-0.5 rounded text-[10px]">${item.label}</span>
                <span class="text-slate-800 font-bold">${item.realAge}세 시점</span>
            </div>
            <span class="text-[#c0392b] font-black text-sm">${item.amount.toLocaleString()}원</span>
        </div>
    `).join('');

    document.getElementById('premTotalSum').innerText = `${sumTotal.toLocaleString()}원`;
    document.getElementById('premResultBox').classList.remove('hidden');
}

function toggleInfoAccordion(idx) {
    const body = document.getElementById(`infoBody${idx}`);
    const arrow = document.getElementById(`infoArrow${idx}`);
    if (!body || !arrow) return;
    if (body.classList.contains('hidden')) {
        body.classList.remove('hidden');
        arrow.innerText = '▲';
    } else {
        body.classList.add('hidden');
        arrow.innerText = '▼';
    }
}

window.onload = function() {
    initSilbiMasterDefaults();
};

// 보안: 우클릭, 드래그, 소스보기(F12/Ctrl+U) 차단 (입력창은 정상 허용)
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});

document.addEventListener('selectstart', function(e) {
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
    e.preventDefault();
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'F12') e.preventDefault();
    if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i')) e.preventDefault();
    if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) e.preventDefault();
    if (e.ctrlKey && (e.key === 'C' || e.key === 'c')) {
        if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
        e.preventDefault();
    }
});
