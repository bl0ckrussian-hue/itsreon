function closeSilbiWindow() {
    window.close();
}

let smGen = 'gen2';
let smTreatType = 'outpatient'; 
let smGen1Type = 'nonLife';
let smGen1Limit = '30m';
let smGen1Pharm = 'combined';
let smHospital = 'clinic';
let lastSilbiResult = null;
let smGen5Severity = 'nonSevere'; 
let premGenInfo = null;

// 1세대 ~ 5세대 연령대별 현실적 연평균 인상률 테이블
const REALISTIC_RATES = {
    young:  { gen1: 3.0,  gen2: 2.0,  gen3: 0.5,  gen4: 0.0, gen5: 0.0 },
    thirty: { gen1: 8.0,  gen2: 6.0,  gen3: 2.5,  gen4: 1.5, gen5: 1.0 },
    forty:  { gen1: 13.0, gen2: 11.0, gen3: 6.0,  gen4: 3.5, gen5: 2.5 },
    fifty:  { gen1: 18.0, gen2: 15.0, gen3: 9.0,  gen4: 6.0, gen5: 4.5 },
    senior: { gen1: 22.0, gen2: 18.0, gen3: 13.0, gen4: 9.0, gen5: 7.0 }
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
    if (dateNum <= 20090930) return { code: 'gen1', name: '1세대 (구 실손)', cycle: 5 };
    if (dateNum <= 20130331) return { code: 'gen2_early', name: '2세대 (표준화 초기)', cycle: 3 };
    if (dateNum <= 20170331) return { code: 'gen2', name: '2세대 (표준화)', cycle: 1 };
    if (dateNum <= 20210630) return { code: 'gen3', name: '3세대 (착한 실손)', cycle: 1 };
    if (dateNum <= 20260505) return { code: 'gen4', name: '4세대 (비급여 차등)', cycle: 1 };
    return { code: 'gen5', name: '5세대 (중증 집중형)', cycle: 1 };
}

function updateMedicineLabel() {
    const isOut = (smTreatType === 'outpatient');
    const titleEl = document.getElementById('smCostSectionTitle');
    const covLabel = document.getElementById('smCovLabel');
    const nonCovLabel = document.getElementById('smNonCovLabel');
    const medLabel = document.getElementById('smMedicineLabel');

    const leftCols = ['smCovColLeft', 'smNonCovColLeft', 'smMedColLeft'].map(id => document.getElementById(id));
    const rightCols = document.querySelectorAll('.smOutCountCol');

    if (isOut) {
        if (titleEl) titleEl.innerHTML = `<span>💰</span> <span>병원비 입력 (통원 1회당 금액 × 횟수)</span>`;
        if (covLabel) covLabel.innerText = "1회 통원당 급여 (본인부담금)";
        if (nonCovLabel) nonCovLabel.innerText = "통원당 일반 비급여 (3세대~ 3대분리)";
        if (medLabel) {
            medLabel.innerHTML = (smGen === 'gen4' || smGen === 'gen5')
                ? `<span>💊</span> <span>1회당 급여 약값 (외래 급여와 일별 합산)</span>`
                : `<span>💊</span> <span>1회 처방당 약값 (약제비)</span>`;
        }
        leftCols.forEach(el => { if (el) { el.classList.remove('col-span-3'); el.classList.add('col-span-2'); } });
        rightCols.forEach(el => el.classList.remove('hidden'));
    } else {
        if (titleEl) titleEl.innerHTML = `<span>💰</span> <span>병원비 입력 (1회 입원 총 합산 금액)</span>`;
        if (covLabel) covLabel.innerText = "입원 급여 합산 (본인부담금)";
        if (nonCovLabel) nonCovLabel.innerText = "입원 일반 비급여 합산 (3세대~ 3대분리)";
        if (medLabel) medLabel.innerHTML = `<span>💊</span> <span>퇴원/입원 약제비 (입원 급여에 합산)</span>`;
        leftCols.forEach(el => { if (el) { el.classList.remove('col-span-2'); el.classList.add('col-span-3'); } });
        rightCols.forEach(el => el.classList.add('hidden'));
    }
}

/**
 * 5세대 선택 여부에 따라 병원 종류 버튼 라벨 및 하단 300만원 한도 안내문 동적 업데이트
 */
function updateHospitalUI() {
    const btnClinic = document.getElementById('smHospBtn_clinic');
    const btnHosp = document.getElementById('smHospBtn_hospital');
    const btnTert = document.getElementById('smHospBtn_tertiary');
    const hospNote = document.getElementById('smGen5HospNote');

    if (smGen === 'gen5') {
        if (btnClinic) btnClinic.innerText = "병원·의원(100병상↓)";
        if (btnHosp) btnHosp.innerText = "종합병원(100병상↑)";
        if (btnTert) btnTert.innerText = "상급종합병원";
        if (hospNote) hospNote.classList.remove('hidden');
    } else {
        if (btnClinic) btnClinic.innerText = "병원·의원";
        if (btnHosp) btnHosp.innerText = "종합병원";
        if (btnTert) btnTert.innerText = "상급종합병원";
        if (hospNote) hospNote.classList.add('hidden');
    }
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
        if (smGen === 'gen1' || smGen === 'gen2') visitBox.classList.remove('hidden');
    } else {
        inBtn.className = "flex-1 bg-slate-800 text-white py-2.5 rounded-lg text-xs font-bold shadow-md transition flex items-center justify-center gap-1.5";
        outBtn.className = "flex-1 bg-transparent text-slate-500 py-2.5 rounded-lg text-xs font-bold hover:bg-slate-100 transition flex items-center justify-center gap-1.5";
        visitBox.classList.add('hidden');
    }
    updateMedicineLabel();
}

function initSilbiMasterDefaults() {
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const startInput = document.getElementById('smStartDate');
    const endInput = document.getElementById('smEndDate');
    if (startInput && !startInput.value) startInput.value = todayStr;
    if (endInput && !endInput.value) endInput.value = todayStr;
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
    const gen5Box = document.getElementById('smGen5SubOptions');
    const visitBox = document.getElementById('smVisitCountBox');
    const visitLabel = document.getElementById('smVisitCountLabel');
    const specialBox = document.getElementById('smSpecialNonCoveredBox');
    const gen4Note = document.getElementById('smGen4DocNote');

    gen1Box.classList.add('hidden');
    if (gen5Box) gen5Box.classList.add('hidden');
    visitBox.classList.add('hidden');
    const gen5ExclBox = document.getElementById('smGen5ExclusionNotice');
    if (gen5ExclBox) gen5ExclBox.classList.add('hidden');
    if (gen4Note) gen4Note.classList.add('hidden');

    if (gen === 'gen1') {
        gen1Box.classList.remove('hidden');
        if (smTreatType === 'outpatient') visitBox.classList.remove('hidden');
        visitLabel.innerText = "⚠️ 통원 횟수 확인 (동일 질병당 30회 한도)";
    } else if (gen === 'gen2') {
        if (smTreatType === 'outpatient') visitBox.classList.remove('hidden');
        visitLabel.innerText = "⚠️ 통원 횟수 확인 (연간 180회 한도)";
    } else if (gen === 'gen4') {
        if (gen4Note) {
            gen4Note.innerText = "* 비급여 청구 시 도수치료는 10회마다 병변 개선 확인서가 필요합니다.";
            gen4Note.classList.remove('hidden');
        }
    } else if (gen === 'gen5') {
        if (gen5Box) gen5Box.classList.remove('hidden');
        if (gen5ExclBox) gen5ExclBox.classList.remove('hidden');
    }
    updateMedicineLabel();
    updateHospitalUI();
}

function setSilbiGen5Severity(severity) {
    smGen5Severity = severity;
    const btnSevere = document.getElementById('smGen5Sev_severe');
    const btnNonSevere = document.getElementById('smGen5Sev_nonSevere');
    const desc = document.getElementById('smGen5SevDesc');

    if (severity === 'severe') {
        btnSevere.className = "py-2 rounded-lg font-bold text-xs bg-blue-600 text-white shadow-sm transition";
        btnNonSevere.className = "py-2 rounded-lg font-bold text-xs bg-white text-slate-600 border border-slate-300 shadow-sm transition";
        if (desc) desc.innerText = "* 중증: 비급여 30% 공제 / 종합·상급병원 입원 시 연간 본인부담 500만원 상한 적용!";
    } else {
        btnNonSevere.className = "py-2 rounded-lg font-bold text-xs bg-blue-600 text-white shadow-sm transition";
        btnSevere.className = "py-2 rounded-lg font-bold text-xs bg-white text-slate-600 border border-slate-300 shadow-sm transition";
        if (desc) desc.innerText = "* 비중증: 비급여 50% 공제(통원 최소 5만) / 도수·비급여주사 제외 / 병·의원 입원 300만 한도";
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
    ['clinic', 'hospital', 'tertiary'].forEach(h => {
        const b = document.getElementById(`smHospBtn_${h}`);
        if (h === hosp) b.className = "py-2.5 px-1 rounded-lg font-bold text-xs bg-slate-800 text-white shadow-sm leading-tight";
        else b.className = "py-2.5 px-1 rounded-lg font-bold text-xs bg-slate-100 text-slate-600 shadow-sm leading-tight";
    });
}

function findSilbiGeneration() {
    const joinDate = document.getElementById('smJoinDate').value.trim();
    if (joinDate.length !== 8) {
        alert("가입일자를 8자리 숫자(예: 20260510)로 정확히 입력해주세요.");
        return;
    }
    const info = getGenerationInfo(joinDate);
    if (info) {
        setSilbiGen(info.code === 'gen2_early' ? 'gen2' : info.code);
        alert(`✅ ${info.name}으로 세대가 자동 설정되었습니다.`);
    }
}

function resetSilbiAll() {
    document.getElementById('smJoinDate').value = '';
    document.getElementById('smCoveredCost').value = '';
    document.getElementById('smNonCoveredCost').value = '';
    document.getElementById('smMedicineCost').value = '';
    if (document.getElementById('smCoveredCount')) document.getElementById('smCoveredCount').value = '';
    if (document.getElementById('smNonCoveredCount')) document.getElementById('smNonCoveredCount').value = '';
    if (document.getElementById('smMedicineCount')) document.getElementById('smMedicineCount').value = '';
    document.getElementById('smTotalVisitCount').value = '';
    document.getElementById('smManualUnit').value = '';
    document.getElementById('smManualCount').value = '';
    document.getElementById('smInjectionUnit').value = '';
    document.getElementById('smInjectionCount').value = '';
    document.getElementById('smMriUnit').value = '';
    document.getElementById('smMriCount').value = '';
    document.getElementById('smResultBox').classList.add('hidden');
    setSilbiGen('gen2');
    setSilbiTreatType('outpatient');
    setSilbiHospital('clinic');
}

/**
 * 3대 비급여 특약 정밀 계산 함수 (1회당 단가 기준 공제 적용)
 */
function calculateSpecialItem(unitPrice, count, maxCount, minDedPerVisit, ratio, annualLimit, name, logs, generation, perVisitCap = 0) {
    if (unitPrice <= 0 || count <= 0) return 0;

    let validCount = count;
    if (maxCount > 0 && count > maxCount) {
        validCount = maxCount;
        logs.push(`[${name}] ⚠️ 연간 횟수(${maxCount}회) 한도 초과! (${count - maxCount}회분 제외)`);
    }

    if ((generation === 'gen4' || generation === 'gen5') && name.includes('도수') && validCount > 10) {
        logs.push(`💡 [참고] 도수치료 10회 초과 시 병변 개선 확인서 제출 필수`);
    }

    const dedPerVisit = Math.max(minDedPerVisit, unitPrice * ratio);
    let payPerVisit = Math.max(0, unitPrice - dedPerVisit);

    if (payPerVisit <= 0) {
        logs.push(`[${name}] ⚠️ 1회 단가(${unitPrice.toLocaleString()}원)가 회당 공제금(${Math.floor(dedPerVisit).toLocaleString()}원) 이하로 미지급`);
        return 0;
    }

    let cappedNotice = "";
    if (perVisitCap > 0 && payPerVisit > perVisitCap) {
        payPerVisit = perVisitCap;
        cappedNotice = ` [1회 통원한도 ${(perVisitCap / 10000)}만원 적용]`;
    }

    let totalPay = payPerVisit * validCount;
    if (totalPay > annualLimit) {
        logs.push(`[${name}] ⚠️ 연간 보상한도(${(annualLimit / 10000).toLocaleString()}만원) 초과로 한도액까지만 지급`);
        totalPay = annualLimit;
    } else {
        logs.push(`[${name}] ${validCount}회 (회당 ${unitPrice.toLocaleString()}원 ➔ 회당 지급 ${Math.floor(payPerVisit).toLocaleString()}원)${cappedNotice} ➔ 소계 ${Math.floor(totalPay).toLocaleString()}원`);
    }
    return totalPay;
}

function resolveManagedManualPlan(uManual, cManual, generation, severity, details, isOutpatient) {
    if (uManual <= 0 || cManual <= 0) return { mode: 'none', unit: 0, validCnt: 0, directPay: 0 };

    const isManaged = document.getElementById('smManagedCareChk')?.checked;
    const maxManagedCnt = parseInt(document.getElementById('smManagedLimitType')?.value || '6', 10);

    if (isManaged) {
        let validCnt = cManual;
        if (cManual > maxManagedCnt) {
            validCnt = maxManagedCnt;
            details.push(`🛑 [관리급여 횟수 제한] 연 ${maxManagedCnt}회 한도 초과! 초과분 ${cManual - maxManagedCnt}회(${((cManual - maxManagedCnt) * uManual).toLocaleString()}원) 전 세대 보상 제외`);
        }
        if (generation === 'gen5' && severity === 'nonSevere') {
            details.push(`🚫 [5세대 면책 약관] 관리급여 지정 항목(본인부담 90~95%)은 5세대 비중증 실손에서 면책(보장 제외)됩니다! (0원)`);
            return { mode: 'excluded', unit: 0, validCnt: 0, directPay: 0 };
        }
        details.push(`✅ [관리급여 적용] 인정 ${validCnt}회(회당 ${uManual.toLocaleString()}원) ➔ ${isOutpatient ? '각 통원 회차별 급여 본인부담금으로 개별 반영' : '입원 급여에 합산 반영'}`);
        return { mode: 'covered', unit: uManual, validCnt: validCnt, directPay: 0 };
    }

    if (generation === 'gen1' || generation === 'gen2') {
        return { mode: 'nonCovered', unit: uManual, validCnt: cManual, directPay: 0 };
    } else if (generation === 'gen3') {
        const pay = calculateSpecialItem(uManual, cManual, 50, 20000, 0.3, 3500000, "도수·체외·증식(특약)", details, 'gen3', 0);
        return { mode: 'rider', unit: 0, validCnt: 0, directPay: pay };
    } else if (generation === 'gen4') {
        const cap = isOutpatient ? 200000 : 0;
        const pay = calculateSpecialItem(uManual, cManual, 50, 30000, 0.3, 3500000, "도수·체외·증식(3대특약)", details, 'gen4', cap);
        return { mode: 'rider', unit: 0, validCnt: 0, directPay: pay };
    } else {
        if (severity === 'nonSevere') {
            details.push(`🚫 [5세대 면책 약관] 비중증 도수·체외충격파·증식치료는 실손 보장에서 제외됩니다! (청구 ${(uManual * cManual).toLocaleString()}원 ➔ 0원)`);
            return { mode: 'excluded', unit: 0, validCnt: 0, directPay: 0 };
        }
        const cap = isOutpatient ? 200000 : 0;
        const pay = calculateSpecialItem(uManual, cManual, 50, 30000, 0.3, 3500000, "중증 재활·도수", details, 'gen5', cap);
        return { mode: 'rider', unit: 0, validCnt: 0, directPay: pay };
    }
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

function calculateSilbiPayout() {
    const isOutpatient = (smTreatType === 'outpatient');

    const uCov = parseNum(document.getElementById('smCoveredCost').value);
    const cCov = isOutpatient ? (uCov > 0 ? (parseNum(document.getElementById('smCoveredCount')?.value) || 1) : 0) : (uCov > 0 ? 1 : 0);

    const uNonCov = parseNum(document.getElementById('smNonCoveredCost').value);
    const cNonCov = isOutpatient ? (uNonCov > 0 ? (parseNum(document.getElementById('smNonCoveredCount')?.value) || 1) : 0) : (uNonCov > 0 ? 1 : 0);

    const uMed = parseNum(document.getElementById('smMedicineCost').value);
    const cMed = isOutpatient ? (uMed > 0 ? (parseNum(document.getElementById('smMedicineCount')?.value) || 1) : 0) : (uMed > 0 ? 1 : 0);

    const prevVisitCnt = parseNum(document.getElementById('smTotalVisitCount').value);

    const uManual = parseNum(document.getElementById('smManualUnit').value);
    const cManual = uManual > 0 ? (parseNum(document.getElementById('smManualCount').value) || 1) : 0;

    const uInj = parseNum(document.getElementById('smInjectionUnit').value);
    const cInj = uInj > 0 ? (parseNum(document.getElementById('smInjectionCount').value) || 1) : 0;

    const uMri = parseNum(document.getElementById('smMriUnit').value);
    const cMri = uMri > 0 ? (parseNum(document.getElementById('smMriCount').value) || 1) : 0;

    if ((uCov + uNonCov + uMed + uManual + uInj + uMri) === 0) {
        alert("병원비 또는 약제비를 입력해주세요!");
        return;
    }

    let totalPayout = 0;
    let details = [];

    let baseDed = 10000;
    if (smHospital === 'hospital') baseDed = 15000;
    else if (smHospital === 'tertiary') baseDed = 20000;

    const joinDateStr = document.getElementById('smJoinDate').value.trim();
    const isEarlyGen2 = (joinDateStr.length === 8 && Number(joinDateStr) >= 20091001 && Number(joinDateStr) <= 20150831);

    const manualPlan = resolveManagedManualPlan(uManual, cManual, smGen, smGen5Severity, details, isOutpatient);

    // ==================== [A] 통원 (회차별 개별 계산) ====================
    if (isOutpatient) {
        const incInjInDaily = (smGen === 'gen1' || smGen === 'gen2');
        const incMriInDaily = (smGen === 'gen1' || smGen === 'gen2' || (smGen === 'gen5' && smGen5Severity === 'nonSevere'));

        const maxDays = Math.max(
            cCov,
            cNonCov,
            cMed,
            (manualPlan.mode === 'covered' || manualPlan.mode === 'nonCovered') ? manualPlan.validCnt : 0,
            incInjInDaily ? cInj : 0,
            incMriInDaily ? cMri : 0
        );

        if (smGen === 'gen1') {
            details.push(`📝 1세대 통원 회차별 계산 (동일 질병 30회 한도)`);
            let hospDays = [], pharmDays = [], combinedDays = [];

            for (let d = 1; d <= maxDays; d++) {
                if (prevVisitCnt + d > 30) {
                    details.push(`🛑 [1세대 통원 횟수 초과] 누적 ${prevVisitCnt + d}회차부터 동일 질병 30회 한도 초과로 제외 (${maxDays - d + 1}회분 제외)`);
                    break;
                }
                const dayCov = (d <= cCov ? uCov : 0) + (manualPlan.mode === 'covered' && d <= manualPlan.validCnt ? manualPlan.unit : 0);
                const dayNonCov = (d <= cNonCov ? uNonCov : 0)
                    + (manualPlan.mode === 'nonCovered' && d <= manualPlan.validCnt ? manualPlan.unit : 0)
                    + (d <= cInj ? uInj : 0) + (d <= cMri ? uMri : 0);
                const dayHosp = dayCov + dayNonCov;
                const dayMed = (d <= cMed ? uMed : 0);

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

        else if (smGen === 'gen2') {
            const labelType = isEarlyGen2 ? "표준화 초기(90%형)" : "선택형II(급여90%·비급여80%)";
            details.push(`📝 2세대 통원 [${labelType}] 회차별 계산 (회당 외래 25만 / 약제 5만 한도)`);
            let hospDays = [], pharmDays = [];

            for (let d = 1; d <= maxDays; d++) {
                if (prevVisitCnt + d > 180) {
                    details.push(`🛑 [2세대 통원 횟수 초과] 누적 ${prevVisitCnt + d}회차부터 연간 180회 한도 초과로 제외`);
                    break;
                }
                const dayCov = (d <= cCov ? uCov : 0) + (manualPlan.mode === 'covered' && d <= manualPlan.validCnt ? manualPlan.unit : 0);
                const dayNonCov = (d <= cNonCov ? uNonCov : 0)
                    + (manualPlan.mode === 'nonCovered' && d <= manualPlan.validCnt ? manualPlan.unit : 0)
                    + (d <= cInj ? uInj : 0) + (d <= cMri ? uMri : 0);
                const dayHosp = dayCov + dayNonCov;
                const dayMed = (d <= cMed ? uMed : 0);

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

        else if (smGen === 'gen3') {
            details.push(`📝 3세대 통원 기본형 회차별 계산 (회당 외래 25만 / 약제 5만 한도)`);
            let hospDays = [], pharmDays = [];

            for (let d = 1; d <= maxDays; d++) {
                const dayCov = (d <= cCov ? uCov : 0) + (manualPlan.mode === 'covered' && d <= manualPlan.validCnt ? manualPlan.unit : 0);
                const dayNonCov = (d <= cNonCov ? uNonCov : 0);
                const dayHosp = dayCov + dayNonCov;
                const dayMed = (d <= cMed ? uMed : 0);

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

            const p1 = manualPlan.directPay;
            const p2 = calculateSpecialItem(uInj, cInj, 50, 20000, 0.3, 2500000, "비급여주사(특약)", details, 'gen3', 0);
            const p3 = calculateSpecialItem(uMri, cMri, 0, 20000, 0.3, 3000000, "비급여MRI(특약)", details, 'gen3', 0);
            totalPayout += (p1 + p2 + p3);
        }

        else if (smGen === 'gen4') {
            details.push(`📝 4세대 통원 회차별 계산 (급여·비급여 각각 회당 20만원 한도)`);
            let covDays = [], nonCovDays = [];

            for (let d = 1; d <= maxDays; d++) {
                const dayCov = (d <= cCov ? uCov : 0) + (d <= cMed ? uMed : 0) + (manualPlan.mode === 'covered' && d <= manualPlan.validCnt ? manualPlan.unit : 0);
                const dayNonCov = (d <= cNonCov ? uNonCov : 0);

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
            pushGroupedVisitLogs(covDays, "급여통원", details);
            pushGroupedVisitLogs(nonCovDays, "일반비급여", details);

            const p1 = manualPlan.directPay;
            const p2 = calculateSpecialItem(uInj, cInj, 50, 30000, 0.3, 2500000, "비급여주사(3대특약)", details, 'gen4', 200000);
            const p3 = calculateSpecialItem(uMri, cMri, 0, 30000, 0.3, 3000000, "비급여MRI(3대특약)", details, 'gen4', 200000);
            totalPayout += (p1 + p2 + p3);
        }

        else if (smGen === 'gen5') {
            let covDays = [], nonCovDays = [];

            if (smGen5Severity === 'severe') {
                details.push(`📝 5세대 [중증 질환] 통원 회차별 계산 (회당 20만원 한도)`);
                for (let d = 1; d <= maxDays; d++) {
                    const dayCov = (d <= cCov ? uCov : 0) + (d <= cMed ? uMed : 0) + (manualPlan.mode === 'covered' && d <= manualPlan.validCnt ? manualPlan.unit : 0);
                    const dayNonCov = (d <= cNonCov ? uNonCov : 0);

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

                const p1 = manualPlan.directPay;
                const p2 = calculateSpecialItem(uInj, cInj, 50, 30000, 0.3, 2500000, "중증 비급여주사(항암·면역 등)", details, 'gen5', 200000);
                const p3 = calculateSpecialItem(uMri, cMri, 0, 30000, 0.3, 3000000, "중증 비급여MRI", details, 'gen5', 200000);
                totalPayout += (p1 + p2 + p3);
            } else {
                details.push(`📝 5세대 [비중증 일반질환] 통원 회차별 계산`);
                if (uInj > 0 && cInj > 0) {
                    details.push(`🚫 [5세대 면책 약관] 비중증 비급여 주사제는 실손 보장에서 제외됩니다! (청구 ${(uInj * cInj).toLocaleString()}원 ➔ 0원)`);
                }
                let nonCovRunningSum = 0;

                for (let d = 1; d <= maxDays; d++) {
                    const dayCov = (d <= cCov ? uCov : 0) + (d <= cMed ? uMed : 0);
                    const dayNonCov = (d <= cNonCov ? uNonCov : 0) + (d <= cMri ? uMri : 0);

                    if (dayCov > 0) {
                        const covRatio = (smHospital === 'tertiary') ? 0.4 : 0.3;
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
        let inCov = uCov + uMed + (manualPlan.mode === 'covered' ? (manualPlan.unit * manualPlan.validCnt) : 0);
        let inNonCov = uNonCov + (manualPlan.mode === 'nonCovered' ? (manualPlan.unit * manualPlan.validCnt) : 0);
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
            const p1 = manualPlan.directPay;
            const p2 = calculateSpecialItem(uInj, cInj, 50, 20000, 0.3, 2500000, "비급여주사(특약)", details, 'gen3', 0);
            const p3 = calculateSpecialItem(uMri, cMri, 0, 20000, 0.3, 3000000, "비급여MRI(특약)", details, 'gen3', 0);
            totalPayout = basicPay + p1 + p2 + p3;
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
            const p1 = manualPlan.directPay;
            const p2 = calculateSpecialItem(uInj, cInj, 50, 30000, 0.3, 2500000, "비급여주사(3대특약)", details, 'gen4', 0);
            const p3 = calculateSpecialItem(uMri, cMri, 0, 30000, 0.3, 3000000, "비급여MRI(3대특약)", details, 'gen4', 0);
            totalPayout = covPay + nonCovPay + p1 + p2 + p3;
        } else if (smGen === 'gen5') {
            let covPay = 0, nonCovPay = 0, specialPay = 0;
            if (inCov > 0) {
                const finalDed = Math.min(2000000, inCov * 0.2);
                covPay = Math.min(50000000, Math.max(0, inCov - finalDed));
                details.push(`[급여 입원] 청구: ${inCov.toLocaleString()}원 (공제 -${Math.floor(finalDed).toLocaleString()}원 / 지급 ${Math.floor(covPay).toLocaleString()}원)`);
            }

            if (smGen5Severity === 'severe') {
                details.push(`📝 5세대 [중증 질환 (특약1)] 입원 기준 적용`);
                if (inNonCov > 0) {
                    let ded = inNonCov * 0.3;
                    if ((smHospital === 'hospital' || smHospital === 'tertiary') && ded > 5000000) {
                        ded = 5000000;
                        details.push(`✨ [5세대 중증 혜택] 종합·상급병원 중증 입원 비급여 연간 본인부담 상한(500만원) 적용!`);
                    }
                    nonCovPay = Math.min(50000000, Math.max(0, inNonCov - ded));
                    details.push(`[비급여 중증(입원)] 청구: ${inNonCov.toLocaleString()}원 (공제 -${Math.floor(ded).toLocaleString()}원 / 지급 ${Math.floor(nonCovPay).toLocaleString()}원)`);
                }
                const p1 = manualPlan.directPay;
                const p2 = calculateSpecialItem(uInj, cInj, 50, 30000, 0.3, 2500000, "중증 비급여주사(항암·면역 등)", details, 'gen5', 0);
                const p3 = calculateSpecialItem(uMri, cMri, 0, 30000, 0.3, 3000000, "중증 비급여MRI", details, 'gen5', 0);
                specialPay = p1 + p2 + p3;
            } else {
                details.push(`📝 5세대 [비중증 일반질환 (특약2)] 입원 기준 적용`);
                if (totalInj > 0) {
                    details.push(`🚫 [5세대 면책 약관] 비중증 비급여 주사제는 실손 보장에서 제외됩니다! (청구 ${totalInj.toLocaleString()}원 ➔ 0원)`);
                }
                const inNonCovTotal = inNonCov + totalMri;
                if (inNonCovTotal > 0) {
                    const ded = inNonCovTotal * 0.5;
                    const rawPay = Math.max(0, inNonCovTotal - ded);
                    const isSmallHosp = (smHospital === 'clinic');
                    const capAmount = isSmallHosp ? 3000000 : 10000000;

                    if (rawPay > capAmount) {
                        nonCovPay = capAmount;
                        if (isSmallHosp) {
                            details.push(`[비급여 비중증(입원)] 청구: ${inNonCovTotal.toLocaleString()}원 (50% 공제 후 ${Math.floor(rawPay).toLocaleString()}원)`);
                            details.push(`🛑 [병·의원 한도 제한] 100병상 미만 병·의원·준종합병원 입원 회당 한도(300만원) 초과! ➔ 3,000,000원만 지급`);
                        } else {
                            details.push(`[비급여 비중증(입원)] ⚠️ 5세대 비중증 연간 한도(1,000만원) 초과! ➔ 10,000,000원만 지급`);
                        }
                    } else {
                        nonCovPay = rawPay;
                        const hospLabel = isSmallHosp ? "병·의원(300만 한도 내)" : "종합·상급(1천만 한도 내)";
                        details.push(`[비급여 비중증(입원-${hospLabel})] 청구: ${inNonCovTotal.toLocaleString()}원 (50% 공제 -${Math.floor(ded).toLocaleString()}원 / 지급 ${Math.floor(nonCovPay).toLocaleString()}원)`);
                    }
                }
            }
            totalPayout = covPay + nonCovPay + specialPay;
        }
    }

    const startD = document.getElementById('smStartDate').value || '시작일';
    const endD = document.getElementById('smEndDate').value || '종료일';
    lastSilbiResult = {
        money: Math.floor(totalPayout),
        logs: details,
        period: `${startD} ~ ${endD}`
    };

    document.getElementById('smResultPeriod').innerText = lastSilbiResult.period;
    document.getElementById('smResultMoney').innerText = `${lastSilbiResult.money.toLocaleString()}원`;
    const logsContainer = document.getElementById('smResultLogs');
    logsContainer.innerHTML = details.map(l => `<div class="mb-1">${l}</div>`).join('');
    document.getElementById('smResultBox').classList.remove('hidden');
}

function copySilbiResult() {
    if (!lastSilbiResult) return;
    const text = `[보험 청구 예상]\n기간: ${lastSilbiResult.period}\n예상 지급액: ${lastSilbiResult.money.toLocaleString()}원\n\n${lastSilbiResult.logs.join('\n')}`;
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
        document.getElementById('premCurrentAge').value = age;
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
        alert("가입시기를 8자리 숫자(예: 20090101)로 입력해주세요.");
    }
}

function calculateRenewalPremium() {
    const nowPrem = parseNum(document.getElementById('premCurrentPremium').value);
    const ageInput = document.getElementById('premCurrentAge').value.trim();
    const cycleInput = parseInt(document.getElementById('premCycle').value) || 1;
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
    let sumTotal = 0;
    let monthlyPrem = nowPrem;
    let shortLogs = [];
    let longLogs = [];
    let renewalCount = 0;
    const longTermTargets = [10, 20, 30, 40].map(gap => startAge + gap);
    let checkedTargets = [];

    for (let age = startAge; age < 90; age++) {
        const yearsPassed = age - startAge;

        if (yearsPassed > 0 && yearsPassed % cycleInput === 0) {
            renewalCount++;
            let annualRate = 0;
            if (manualRate !== '') {
                annualRate = parseFloat(manualRate);
            } else if (premGenInfo) {
                annualRate = getAnnualRate(age, premGenInfo.code);
            } else {
                annualRate = 5.0;
            }

            if (monthlyPrem > 300000) annualRate *= 0.8;
            if (monthlyPrem > 500000) annualRate *= 0.7;
            if (monthlyPrem > 800000) annualRate *= 0.5;

            const compoundFactor = Math.pow((1 + annualRate / 100), cycleInput);
            monthlyPrem = Math.floor(monthlyPrem * compoundFactor);

            if (renewalCount <= 3) {
                shortLogs.push({
                    count: renewalCount,
                    futureAge: age,
                    amount: monthlyPrem,
                    rate: annualRate.toFixed(1)
                });
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
                <span class="text-[10px] text-rose-500 block">(연 ${item.rate}% 인상 반영)</span>
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
