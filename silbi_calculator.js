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

const REALISTIC_RATES = {
    young:  { gen1: 3.0,  gen2: 2.0,  gen3: 0.0,  gen4: -1.0 },
    thirty: { gen1: 8.0,  gen2: 6.0,  gen3: 2.0,  gen4: 1.0 },
    forty:  { gen1: 13.0, gen2: 11.0, gen3: 6.0,  gen4: 3.0 },
    fifty:  { gen1: 18.0, gen2: 15.0, gen3: 9.0,  gen4: 6.0 },
    senior: { gen1: 22.0, gen2: 18.0, gen3: 13.0, gen4: 9.0 }
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
    if (dateNum <= 20130331) return { code: 'gen2_early', name: '2세대 (표준화 이전)', cycle: 3 };
    if (dateNum <= 20170331) return { code: 'gen2', name: '2세대 (표준화)', cycle: 1 };
    if (dateNum <= 20210630) return { code: 'gen3', name: '3세대 (착한 실손)', cycle: 1 };
    return { code: 'gen4', name: '4세대 (현재)', cycle: 1 };
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
}

function initSilbiMasterDefaults() {
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const startInput = document.getElementById('smStartDate');
    const endInput = document.getElementById('smEndDate');
    if (startInput && !startInput.value) startInput.value = todayStr;
    if (endInput && !endInput.value) endInput.value = todayStr;
}

function setSilbiGen(gen) {
    smGen = gen;
    ['gen1', 'gen2', 'gen3', 'gen4', 'gen5'].forEach(g => {
        const btn = document.getElementById(`smGenBtn_${g}`);
        if(btn) {
            if (g === gen) btn.className = "py-2 px-1 rounded-lg font-bold text-xs bg-slate-800 text-white shadow-sm transition";
            else btn.className = "py-2 px-1 rounded-lg font-bold text-xs bg-slate-100 text-slate-600 shadow-sm transition";
        }
    });

    const gen1Box = document.getElementById('smGen1SubOptions');
    const gen5Box = document.getElementById('smGen5SubOptions');
    const visitBox = document.getElementById('smVisitCountBox');
    const visitLabel = document.getElementById('smVisitCountLabel');
    const specialBox = document.getElementById('smSpecialNonCoveredBox');
    const gen4Note = document.getElementById('smGen4DocNote');

    gen1Box.classList.add('hidden');
    if(gen5Box) gen5Box.classList.add('hidden');
    visitBox.classList.add('hidden');
    specialBox.classList.add('hidden');
    if(gen4Note) gen4Note.classList.add('hidden');

    if (gen === 'gen1') {
        gen1Box.classList.remove('hidden');
        if (smTreatType === 'outpatient') visitBox.classList.remove('hidden');
        visitLabel.innerText = "⚠️ 통원 횟수 확인 (동일 질병당 30회)";
    } else if (gen === 'gen2') {
        if (smTreatType === 'outpatient') visitBox.classList.remove('hidden');
        visitLabel.innerText = "⚠️ 통원 횟수 확인 (연간 180회)";
    } else if (gen === 'gen3' || gen === 'gen4') {
        specialBox.classList.remove('hidden');
        if (gen === 'gen4' && gen4Note) gen4Note.classList.remove('hidden');
    } else if (gen === 'gen5') {
        if(gen5Box) gen5Box.classList.remove('hidden');
        specialBox.classList.remove('hidden');
        if (gen4Note) {
            gen4Note.innerText = "* 4·5세대 도수치료는 10회마다 개선 확인서가 필요합니다.";
            gen4Note.classList.remove('hidden');
        }
    }
}

function setSilbiGen5Severity(severity) {
    smGen5Severity = severity;
    const btnSevere = document.getElementById('smGen5Sev_severe');
    const btnNonSevere = document.getElementById('smGen5Sev_nonSevere');

    if (severity === 'severe') {
        btnSevere.className = "py-2 rounded-lg font-bold text-xs bg-blue-600 text-white shadow-sm transition";
        btnNonSevere.className = "py-2 rounded-lg font-bold text-xs bg-white text-slate-600 border border-slate-300 shadow-sm transition";
    } else {
        btnNonSevere.className = "py-2 rounded-lg font-bold text-xs bg-blue-600 text-white shadow-sm transition";
        btnSevere.className = "py-2 rounded-lg font-bold text-xs bg-white text-slate-600 border border-slate-300 shadow-sm transition";
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
        if (h === hosp) b.className = "py-2.5 rounded-lg font-bold text-xs bg-slate-800 text-white shadow-sm";
        else b.className = "py-2.5 rounded-lg font-bold text-xs bg-slate-100 text-slate-600 shadow-sm";
    });
}

function findSilbiGeneration() {
    const joinDate = document.getElementById('smJoinDate').value.trim();
    if (joinDate.length !== 8) {
        alert("가입일자를 8자리 숫자(예: 20150101)로 정확히 입력해주세요.");
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
}

function calculateItem(totalAmount, count, maxCount, minDed, ratio, limit, name, logs, generation) {
    if (totalAmount <= 0) return 0;
    let validAmount = totalAmount;
    if (maxCount > 0 && count > maxCount) {
        const unitPrice = totalAmount / count;
        validAmount = unitPrice * maxCount;
        logs.push(`[${name}] ⚠️ 연간 횟수(${maxCount}회) 초과! (${count - maxCount}회 제외됨)`);
    }
    if ((generation === 'gen4' || generation === 'gen5') && name.includes('도수') && count > 10) {
        logs.push(`💡 [참고] 도수치료 10회 초과: 병변 개선 확인서 필요`);
    }
    const ded = Math.max(minDed, validAmount * ratio);
    const pay = validAmount - ded;
    if (pay <= 0) {
        logs.push(`[${name}] ⚠️ 금액(${Math.floor(validAmount).toLocaleString()}원)이 공제금(${Math.floor(ded).toLocaleString()}원) 이하로 미지급`);
        return 0;
    }
    if (pay > limit) {
        logs.push(`[${name}] ⚠️ 연간 한도 초과! (${(limit / 10000).toLocaleString()}만원 한도까지만 지급)`);
        return limit;
    }
    logs.push(`[${name}] 청구: ${Math.floor(validAmount).toLocaleString()}원 (공제 -${Math.floor(ded).toLocaleString()}원 / 지급 ${Math.floor(pay).toLocaleString()}원)`);
    return pay;
}

function calculateSilbiPayout() {
    const isOutpatient = (smTreatType === 'outpatient');
    const cov = parseNum(document.getElementById('smCoveredCost').value);
    const nonCov = parseNum(document.getElementById('smNonCoveredCost').value);
    const med = parseNum(document.getElementById('smMedicineCost').value);
    const visitCnt = parseNum(document.getElementById('smTotalVisitCount').value);

    const uManual = parseNum(document.getElementById('smManualUnit').value);
    const cManual = parseNum(document.getElementById('smManualCount').value);
    const totalManual = uManual * cManual;

    const uInj = parseNum(document.getElementById('smInjectionUnit').value);
    const cInj = parseNum(document.getElementById('smInjectionCount').value);
    const totalInj = uInj * cInj;

    const uMri = parseNum(document.getElementById('smMriUnit').value);
    const cMri = parseNum(document.getElementById('smMriCount').value);
    const totalMri = uMri * cMri;

    const totalHospital = cov + nonCov + totalManual + totalInj + totalMri;
    const totalInput = totalHospital + med;

    if (totalInput === 0) {
        alert("병원비 또는 약제비를 입력해주세요!");
        return;
    }

    let totalPayout = 0;
    let details = [];

    let baseDed = 10000;
    if (smHospital === 'hospital') baseDed = (smGen === 'gen4') ? 10000 : 15000;
    else if (smHospital === 'tertiary') baseDed = 20000;

    if (smGen === 'gen1') {
        if (!isOutpatient) {
            details.push(`📝 1세대 입원 (100% 보장)`);
            details.push(`[입원비] 청구: ${totalInput.toLocaleString()}원 (공제 없음)`);
            totalPayout = totalInput;
        } else {
            if (smGen1Type === 'life') {
                details.push(`📝 1세대 생명보험 통원 (외래20만 / 약제10만)`);
                let medPay = Math.max(0, totalHospital - 5000);
                if (medPay > 200000) {
                    details.push(`[외래] ⚠️ 한도(20만) 초과! (20만 지급)`);
                    medPay = 200000;
                } else {
                    details.push(`[외래] 청구: ${totalHospital.toLocaleString()}원 (공제 -5,000원 / 지급 ${medPay.toLocaleString()}원)`);
                }
                let pharmPay = 0;
                if (med > 0) {
                    pharmPay = med;
                    if (pharmPay > 100000) {
                        details.push(`[약제] ⚠️ 한도(10만) 초과! (10만 지급)`);
                        pharmPay = 100000;
                    } else {
                        details.push(`[약제] 청구: ${med.toLocaleString()}원 (한도 내 100% 지급)`);
                    }
                }
                totalPayout = medPay + pharmPay;
            } else {
                if (smGen1Pharm === 'separate50k') {
                    details.push(`📝 1세대 손해보험 통원 (외래25만 / 약제5만 분리)`);
                    let medPay = Math.max(0, totalHospital - 5000);
                    if (medPay > 250000) {
                        details.push(`[외래] ⚠️ 한도(25만) 초과! (25만 지급)`);
                        medPay = 250000;
                    } else {
                        details.push(`[외래] 청구: ${totalHospital.toLocaleString()}원 (공제 -5,000원 / 지급 ${medPay.toLocaleString()}원)`);
                    }
                    let pharmPay = med;
                    if (med > 0) {
                        if (pharmPay > 50000) {
                            details.push(`[약제] ⚠️ 한도(5만) 초과! (5만 지급)`);
                            pharmPay = 50000;
                        } else {
                            details.push(`[약제] 청구: ${med.toLocaleString()}원 (한도 내 100% 지급)`);
                        }
                    }
                    totalPayout = medPay + pharmPay;
                } else {
                    const limitAmount = (smGen1Limit === '30m') ? 100000 : 250000;
                    details.push(`📝 1세대 손해보험 통원 (합산 한도)`);
                    const payout = totalInput - 5000;
                    if (payout <= 0) {
                        details.push(`⚠️ 공제금(5,000원) 미달로 0원`);
                        totalPayout = 0;
                    } else {
                        const finalPay = Math.min(payout, limitAmount);
                        totalPayout = finalPay;
                        details.push(`합산청구: ${totalInput.toLocaleString()}원 (공제 -5,000원 / 지급 ${finalPay.toLocaleString()}원)`);
                        if (payout > limitAmount) details.push(`⚠️ 통원 한도(${limitAmount.toLocaleString()}원) 초과분 절사`);
                    }
                }
            }
        }
        if (visitCnt > 30) details.push(`⚠️ [경고] 동일 질병 통원 30회 초과 주의!`);
    } else {
        let pharmacyPay = 0;
        if (isOutpatient && med > 0) {
            const pay = Math.max(0, med - 8000);
            if (pay <= 0) details.push(`[약값 외래] ⚠️ 공제금(8,000원) 미달로 미지급`);
            else {
                pharmacyPay = pay;
                details.push(`[약값 외래] 청구: ${med.toLocaleString()}원 (공제 -8,000원 / 지급 ${pay.toLocaleString()}원)`);
            }
        } else if (!isOutpatient && med > 0) {
            details.push(`💡 입원 시 약제비는 입원 의료비 급여/비급여에 포함되어 합산 공제됩니다.`);
        }

        let hospitalPayout = 0;
        const targetHospitalFee = isOutpatient ? totalHospital : (totalHospital + med);

        if (smGen === 'gen2') {
            if (isOutpatient) {
                details.push(`📝 2세대 통원 (의원/병원/상급 공제)`);
                const selfPay = targetHospitalFee * 0.1;
                const finalDed = Math.max(baseDed, selfPay);
                const payout = Math.max(0, targetHospitalFee - finalDed);
                if (visitCnt > 180) details.push(`⚠️ [경고] 연간 통원 180회 초과 주의!`);
                if (payout <= 0) details.push(`[병원비] ⚠️ 공제금(${Math.floor(finalDed).toLocaleString()}원) 미달`);
                else {
                    hospitalPayout = payout;
                    details.push(`[병원비] 청구: ${targetHospitalFee.toLocaleString()}원 (공제 -${Math.floor(finalDed).toLocaleString()}원 / 지급 ${Math.floor(payout).toLocaleString()}원)`);
                }
            } else {
                details.push(`📝 2세대 입원 (10% 공제)`);
                let finalDed = targetHospitalFee * 0.1;
                if (finalDed > 2000000) {
                    details.push(`💡 입원 자기부담금 연간 최대한도(200만원) 도달`);
                    finalDed = 2000000;
                }
                const payout = Math.max(0, targetHospitalFee - finalDed);
                hospitalPayout = payout;
                details.push(`[입원비] 청구: ${targetHospitalFee.toLocaleString()}원 (공제 -${Math.floor(finalDed).toLocaleString()}원 / 지급 ${Math.floor(payout).toLocaleString()}원)`);
            }
        } else if (smGen === 'gen3') {
            let curCov = cov;
            let curNonCov = nonCov;
            if (!isOutpatient && med > 0) curCov += med; 

            const curBasicBill = curCov + curNonCov;
            let basicPay = 0;
            if (curBasicBill > 0) {
                if (isOutpatient) {
                    details.push(`📝 3세대 통원 기본형`);
                    const ratioDed = (curCov * 0.1) + (curNonCov * 0.2);
                    const finalDed = Math.max(baseDed, ratioDed);
                    const pay = Math.max(0, curBasicBill - finalDed);
                    if (pay <= 0) details.push(`[기본형 외래] ⚠️ 공제금(${Math.floor(finalDed).toLocaleString()}원) 미달`);
                    else {
                        basicPay = pay;
                        details.push(`[기본형 외래] 청구: ${curBasicBill.toLocaleString()}원 (공제 -${Math.floor(finalDed).toLocaleString()}원 / 지급 ${Math.floor(pay).toLocaleString()}원)`);
                    }
                } else {
                    details.push(`📝 3세대 입원 기본형 (급여 10%, 비급여 20% 공제)`);
                    let covDed = curCov * 0.1;
                    if (covDed > 2000000) {
                        details.push(`💡 급여 자기부담금 연간 최대한도(200만원) 도달`);
                        covDed = 2000000;
                    }
                    const nonCovDed = curNonCov * 0.2;
                    const finalDed = covDed + nonCovDed;
                    basicPay = Math.max(0, curBasicBill - finalDed);
                    details.push(`[기본형 입원] 청구: ${curBasicBill.toLocaleString()}원 (공제 -${Math.floor(finalDed).toLocaleString()}원 / 지급 ${Math.floor(basicPay).toLocaleString()}원)`);
                }
            }
            const p1 = calculateItem(totalManual, cManual, 50, 20000, 0.3, 3500000, "도수치료(특약)", details, 'gen3');
            const p2 = calculateItem(totalInj, cInj, 50, 20000, 0.3, 2500000, "주사료(특약)", details, 'gen3');
            const p3 = calculateItem(totalMri, 0, 0, 20000, 0.3, 3000000, "MRI(특약)", details, 'gen3');
            hospitalPayout = basicPay + p1 + p2 + p3;
        } else if (smGen === 'gen4') {
            let curCov = cov;
            let curNonCov = nonCov;
            if (!isOutpatient && med > 0) curCov += med;

            let covPay = 0;
            if (curCov > 0) {
                if (isOutpatient) {
                    details.push(`📝 4세대 급여 통원`);
                    const minCovDed = (smHospital === 'tertiary') ? 20000 : 10000;
                    const finalDed = Math.max(minCovDed, curCov * 0.2);
                    const pay = Math.max(0, curCov - finalDed);
                    if (pay <= 0) details.push(`[급여 외래] ⚠️ 공제금(${Math.floor(finalDed).toLocaleString()}원) 미달`);
                    else {
                        covPay = pay;
                        details.push(`[급여 외래] 청구: ${curCov.toLocaleString()}원 (공제 -${Math.floor(finalDed).toLocaleString()}원 / 지급 ${Math.floor(pay).toLocaleString()}원)`);
                    }
                } else {
                    details.push(`📝 4세대 급여 입원 (20% 공제)`);
                    let finalDed = curCov * 0.2;
                    if (finalDed > 2000000) {
                        details.push(`💡 급여 자기부담금 연간 최대한도(200만원) 도달`);
                        finalDed = 2000000;
                    }
                    covPay = Math.max(0, curCov - finalDed);
                    details.push(`[급여 입원] 청구: ${curCov.toLocaleString()}원 (공제 -${Math.floor(finalDed).toLocaleString()}원 / 지급 ${Math.floor(covPay).toLocaleString()}원)`);
                }
            }
            let nonCovPay = 0;
            if (curNonCov > 0) {
                if (isOutpatient) {
                    details.push(`📝 4세대 비급여 통원`);
                    const ded = Math.max(30000, curNonCov * 0.3);
                    const pay = Math.max(0, curNonCov - ded);
                    if (pay <= 0) details.push(`[비급여 외래] ⚠️ 공제금(${Math.floor(ded).toLocaleString()}원) 미달`);
                    else {
                        nonCovPay = pay;
                        details.push(`[비급여 외래] 청구: ${curNonCov.toLocaleString()}원 (공제 -${Math.floor(ded).toLocaleString()}원 / 지급 ${Math.floor(pay).toLocaleString()}원)`);
                    }
                } else {
                    details.push(`📝 4세대 비급여 입원 (30% 공제)`);
                    const ded = curNonCov * 0.3;
                    nonCovPay = Math.max(0, curNonCov - ded);
                    details.push(`[비급여 입원] 청구: ${curNonCov.toLocaleString()}원 (공제 -${Math.floor(ded).toLocaleString()}원 / 지급 ${Math.floor(nonCovPay).toLocaleString()}원)`);
                }
            }
            const p1 = calculateItem(totalManual, cManual, 50, 30000, 0.3, 3500000, "도수치료(특약)", details, 'gen4');
            const p2 = calculateItem(totalInj, cInj, 50, 30000, 0.3, 2500000, "주사료(특약)", details, 'gen4');
            const p3 = calculateItem(totalMri, 0, 0, 30000, 0.3, 3000000, "MRI(특약)", details, 'gen4');
            hospitalPayout = covPay + nonCovPay + p1 + p2 + p3;
        } else if (smGen === 'gen5') {
            let curCov = cov;
            let curNonCov = nonCov;
            if (!isOutpatient && med > 0) curCov += med; 

            let covPay = 0;
            let nonCovPay = 0;

            if (smGen5Severity === 'severe') {
                details.push(`📝 5세대 [중증 질환] 적용`);
                if (curCov > 0) {
                    if (isOutpatient) {
                        const minCovDed = (smHospital === 'tertiary') ? 20000 : 10000;
                        const finalDed = Math.max(minCovDed, curCov * 0.2);
                        covPay = Math.max(0, curCov - finalDed);
                        if (covPay <= 0) details.push(`[급여 중증(외래)] ⚠️ 공제금(${Math.floor(finalDed).toLocaleString()}원) 미달`);
                        else details.push(`[급여 중증(외래)] 청구: ${curCov.toLocaleString()}원 (공제 -${Math.floor(finalDed).toLocaleString()}원 / 지급 ${Math.floor(covPay).toLocaleString()}원)`);
                    } else {
                        const finalDed = Math.min(2000000, curCov * 0.2);
                        covPay = Math.max(0, curCov - finalDed);
                        details.push(`[급여 중증(입원)] 청구: ${curCov.toLocaleString()}원 (공제 -${Math.floor(finalDed).toLocaleString()}원 / 지급 ${Math.floor(covPay).toLocaleString()}원)`);
                    }
                }
                if (curNonCov > 0) {
                    if (isOutpatient) {
                        const ded = Math.max(30000, curNonCov * 0.2); 
                        nonCovPay = Math.max(0, curNonCov - ded);
                        if (nonCovPay <= 0) details.push(`[비급여 중증(외래)] ⚠️ 공제금(${Math.floor(ded).toLocaleString()}원) 미달`);
                        else details.push(`[비급여 중증(외래)] 청구: ${curNonCov.toLocaleString()}원 (공제 -${Math.floor(ded).toLocaleString()}원 / 지급 ${Math.floor(nonCovPay).toLocaleString()}원)`);
                    } else {
                        const ded = curNonCov * 0.2;
                        nonCovPay = Math.max(0, curNonCov - ded);
                        details.push(`[비급여 중증(입원)] 청구: ${curNonCov.toLocaleString()}원 (공제 -${Math.floor(ded).toLocaleString()}원 / 지급 ${Math.floor(nonCovPay).toLocaleString()}원)`);
                    }
                }
            } else {
                details.push(`📝 5세대 [비중증/일반질환] 적용 (페널티 공제)`);
                if (curCov > 0) {
                    if (isOutpatient) {
                        const minCovDed = (smHospital === 'tertiary') ? 30000 : 20000;
                        const finalDed = Math.max(minCovDed, curCov * 0.3); 
                        covPay = Math.max(0, curCov - finalDed);
                        if (covPay <= 0) details.push(`[급여 비중증(외래)] ⚠️ 공제금(${Math.floor(finalDed).toLocaleString()}원) 미달`);
                        else details.push(`[급여 비중증(외래)] 청구: ${curCov.toLocaleString()}원 (공제 -${Math.floor(finalDed).toLocaleString()}원 / 지급 ${Math.floor(covPay).toLocaleString()}원)`);
                    } else {
                        const finalDed = Math.min(2000000, curCov * 0.3);
                        covPay = Math.max(0, curCov - finalDed);
                        details.push(`[급여 비중증(입원)] 청구: ${curCov.toLocaleString()}원 (공제 -${Math.floor(finalDed).toLocaleString()}원 / 지급 ${Math.floor(covPay).toLocaleString()}원)`);
                    }
                }
                if (curNonCov > 0) {
                    if (isOutpatient) {
                        const ded = Math.max(50000, curNonCov * 0.4); 
                        nonCovPay = Math.max(0, curNonCov - ded);
                        if (nonCovPay <= 0) details.push(`[비급여 비중증(외래)] ⚠️ 공제금(${Math.floor(ded).toLocaleString()}원) 미달`);
                        else details.push(`[비급여 비중증(외래)] 청구: ${curNonCov.toLocaleString()}원 (공제 -${Math.floor(ded).toLocaleString()}원 / 지급 ${Math.floor(nonCovPay).toLocaleString()}원)`);
                    } else {
                        const ded = curNonCov * 0.4;
                        nonCovPay = Math.max(0, curNonCov - ded);
                        details.push(`[비급여 비중증(입원)] 청구: ${curNonCov.toLocaleString()}원 (공제 -${Math.floor(ded).toLocaleString()}원 / 지급 ${Math.floor(nonCovPay).toLocaleString()}원)`);
                    }
                }
            }
            const p1 = calculateItem(totalManual, cManual, 50, 30000, 0.3, 3500000, "도수치료(특약)", details, 'gen5');
            const p2 = calculateItem(totalInj, cInj, 50, 30000, 0.3, 2500000, "주사료(특약)", details, 'gen5');
            const p3 = calculateItem(totalMri, 0, 0, 30000, 0.3, 3000000, "MRI(특약)", details, 'gen5');
            hospitalPayout = covPay + nonCovPay + p1 + p2 + p3;
        }

        totalPayout = hospitalPayout + pharmacyPay;
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
// 초기 시작 시 기본 오늘 날짜 세팅
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
