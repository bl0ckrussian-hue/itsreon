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

function triggerPdfUpload() {
    const el = document.getElementById('pdfUpload');
    if (el) el.click();
}

let processedContracts = []; 
let rawCloudDataForExport = null; 
let sumData = {};            
let currentPage = 1;
let totalPages = 1;
const itemsPerPage = 5;

// ★ 수기 입력 완벽 저장소 (수기 수정이 실제로 발생한 페이지만 기록) ★
let pageEdits = {};

// 🚨 실시간 양방향 데이터 바인딩 🚨
document.querySelectorAll('.editable-cell').forEach(cell => {
    cell.setAttribute('contenteditable', 'true');
    cell.addEventListener('input', function(e) {
        const isSummaryPage = (totalPages > 1 && currentPage === totalPages);

        if (!isSummaryPage && e.target.id) {
            const match = e.target.id.match(/^(.+?)(\d)$/);
            if (match) {
                const key = match[1];
                const colIdx = parseInt(match[2]) - 1;
                const contractIdx = (currentPage - 1) * itemsPerPage + colIdx;

                if (!processedContracts[contractIdx]) {
                    processedContracts[contractIdx] = {
                        comp: "", prod: "", date: "", payCycle: "", payTerm: "", maturity: "", premium: "", paidTotal: "",
                        hasRenewableRider: false, isPaidUp: false, silbiGen: "", coverages: {}
                    };
                }

                const val = e.target.innerText.trim();
                if (key === 'comp') processedContracts[contractIdx].comp = val;
                else if (key === 'prod') processedContracts[contractIdx].prod = val;
                else if (key === 'date') processedContracts[contractIdx].date = val;
                else if (key === 'term') {
                    const parts = val.split('/');
                    if (parts.length >= 2) {
                        processedContracts[contractIdx].payTerm = parts[0].trim();
                        processedContracts[contractIdx].maturity = parts.slice(1).join('/').trim();
                        processedContracts[contractIdx].hasRenewableRider = parts[0].includes('갱신');
                    }
                }
                else if (key === 'prem') {
                    processedContracts[contractIdx].premium = val;
                    processedContracts[contractIdx].isPaidUp = val.includes('완료');
                }
                else if (key === 'silbi') processedContracts[contractIdx].silbiGen = val;
                else if (key === 'tot_prem_paid_') processedContracts[contractIdx].paidTotal = val;
                else {
                    if (!processedContracts[contractIdx].coverages) processedContracts[contractIdx].coverages = {};
                    processedContracts[contractIdx].coverages[key] = val;
                    if (key === 'd_careD_') { delete processedContracts[contractIdx].coverages.d_careD_sum; delete processedContracts[contractIdx].coverages.d_careD_text; }
                    if (key === 'd_careS_') { delete processedContracts[contractIdx].coverages.d_careS_sum; delete processedContracts[contractIdx].coverages.d_careS_text; }
                }
            }
        }

        calculateRowSums();
        calculateTotalPremium();
        if (!isSummaryPage) saveCurrentPageEdits();
    });

    cell.addEventListener('paste', function(e) {
        e.preventDefault();
        var text = (e.originalEvent || e).clipboardData.getData('text/plain');
        document.execCommand('insertText', false, text);
    });
});

// 방향키 및 Enter 키보드 셀 이동 지원
document.addEventListener('keydown', function(e) {
    if (!e.target.classList.contains('editable-cell')) return;
    const cell = e.target;
    const row = cell.parentElement;
    const tbody = row.parentElement;
    const cells = Array.from(row.querySelectorAll('.editable-cell'));
    const cellIndex = cells.indexOf(cell);
    const rows = Array.from(tbody.querySelectorAll('tr'));
    const rowIndex = rows.indexOf(row);

    if (e.key === 'Enter') {
        e.preventDefault();
        for (let i = rowIndex + 1; i < rows.length; i++) {
            const targetCells = Array.from(rows[i].querySelectorAll('.editable-cell'));
            if (targetCells[cellIndex]) { targetCells[cellIndex].focus(); break; }
        }
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        for (let i = rowIndex - 1; i >= 0; i--) {
            const targetCells = Array.from(rows[i].querySelectorAll('.editable-cell'));
            if (targetCells[cellIndex]) { targetCells[cellIndex].focus(); break; }
        }
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        for (let i = rowIndex + 1; i < rows.length; i++) {
            const targetCells = Array.from(rows[i].querySelectorAll('.editable-cell'));
            if (targetCells[cellIndex]) { targetCells[cellIndex].focus(); break; }
        }
    } else if (e.key === 'ArrowRight') {
        const sel = window.getSelection();
        if (cell.innerText.trim() === "" || cell.innerText.trim() === "-" || sel.focusNode === cell || (sel.focusNode && sel.focusOffset >= sel.focusNode.textContent.length)) {
            if (cellIndex < cells.length - 1) { e.preventDefault(); cells[cellIndex + 1].focus(); }
        }
    } else if (e.key === 'ArrowLeft') {
        const sel = window.getSelection();
        if (cell.innerText.trim() === "" || cell.innerText.trim() === "-" || sel.focusNode === cell || (sel.focusNode && sel.focusOffset === 0)) {
            if (cellIndex > 0) { e.preventDefault(); cells[cellIndex - 1].focus(); }
        }
    }
});

// 🚨 서버 추출 통신 (오류 상세 진단 및 원문 다운로드 버튼 보장) 🚨
document.getElementById('pdfUpload').addEventListener('change', async function(e) {
    const file = e.target.files[0];
    if(!file) return;

    const loadingOverlay = document.getElementById('loadingOverlay');
    try {
        loadingOverlay.style.display = 'flex';
        document.getElementById('progressTitle').innerText = "클라우드 엑셀 추출 및 정밀 매핑 중...";
        document.getElementById('progressDesc').innerText = "KB손해보험 보장분석표의 계약 및 담보 연관성을 정밀 분석하여 반영합니다.";

        const base64data = await getBase64(file);
        const CLOUD_PARSER_URL = "https://insuranceanalysis-225817792244.asia-northeast3.run.app"; 

        const cloudRes = await fetch(CLOUD_PARSER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ file_data: base64data })
        });

        let cloudData = null;
        const resText = await cloudRes.text();
        try {
            cloudData = JSON.parse(resText);
        } catch (jsonErr) {
            throw new Error(`클라우드 서버 응답 오류 (HTTP ${cloudRes.status}): 서버 배포 상태를 확인해주세요.`); }  if(!cloudRes.ok \vert{}\vert{} !cloudData \vert{}\vert{} !cloudData.success) { throw new Error("PDF 파싱 에러: " + ((cloudData && cloudData.error) ? cloudData.error : `HTTP ${cloudRes.status}`));
        }

        rawCloudDataForExport = cloudData.rawExcelData; 
        if(!rawCloudDataForExport) throw new Error("데이터를 추출할 수 없습니다. 보장분석 PDF인지 확인해주세요.");

        // 추출 성공 시 즉시 원문 다운로드 버튼 활성화
        const btnRaw = document.getElementById('btnDownloadRaw');
        if (btnRaw) btnRaw.classList.remove('hidden');

        setTimeout(() => {
            try {
                extractDataDirectly(rawCloudDataForExport);
            } catch (mapErr) {
                console.error(mapErr);
                alert("❌ 담보 매핑 중 오류 발생 (추출 원문 다운로드는 가능):\n" + mapErr.message);
            } finally {
                loadingOverlay.style.display = 'none';
            }
        }, 50);

    } catch (err) {
        alert("❌ 처리 중 오류 발생:\n" + err.message);
        loadingOverlay.style.display = 'none';
    }
    e.target.value = '';
});

function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
    });
}

// 문자열 정규화 유틸리티
function toHalfWidth(str) {
    if (!str) return "";
    return String(str)
        .replace(/[！-～]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0))
        .replace(/\u3000/g, ' ')
        .replace(/\|\|/g, 'II')
        .replace(/[Ⅰ]/g, 'I')
        .replace(/[Ⅱ]/g, 'II')
        .replace(/[Ⅲ]/g, 'III')
        .replace(/[Ⅳ]/g, 'IV')
        .replace(/[Ⅴ]/g, 'V');
}

function normalizeCompany(comp) {
    let s = toHalfWidth(comp).replace(/\s+/g, '').trim();
    if (s.includes("메리츠")) return "메리츠화재";
    if (s.includes("KB손") || s === "KB") return "KB손보";
    if (s.includes("DB손")) return "DB손보";
    if (s.includes("삼성화")) return "삼성화재";
    if (s.includes("현대해")) return "현대해상";
    if (s.includes("한화손")) return "한화손보";
    if (s.includes("롯데손")) return "롯데손보";
    if (s.includes("흥국화")) return "흥국화재";
    if (s.includes("하나손")) return "하나손보";
    if (s.includes("예별손") || s.includes("MG손")) return "예별손보(구MG손보)";
    if (s.includes("처브라이프") || s.includes("처브")) return "처브라이프생명";
    if (s.includes("신한라이프")) return "신한라이프생명";
    if (s.includes("교보생")) return "교보생명";
    if (s.includes("삼성생")) return "삼성생명";
    if (s.includes("동양생")) return "동양생명";
    if (s.includes("흥국생")) return "흥국생명";
    if (s.includes("한화생")) return "한화생명";
    if (s.includes("NH농협생")) return "NH농협생명";
    if (s.includes("AIA")) return "AIA생명";
    return s;
}

function normalizeProductKey(prod) {
    return toHalfWidth(prod)
        .replace(/\(\d+\/\d+\)/g, '')
        .replace(/무배당|\(무\)|무\)/g, '')
        .replace(/[^가-힣a-zA-Z0-9]/g, '')
        .toLowerCase();
}

function findMatchingContract(contracts, comp, prod, joinDate) {
    const normComp = normalizeCompany(comp);
    const normProd = normalizeProductKey(prod);

    let candidates = contracts.filter(c => normalizeCompany(c.comp) === normComp);
    if (candidates.length === 0) {
        candidates = contracts.filter(c => normComp.includes(normalizeCompany(c.comp)) || normalizeCompany(c.comp).includes(normComp));
    }
    if (candidates.length === 0) return null;
    if (candidates.length === 1) return candidates[0];

    if (joinDate) {
        const dateMatched = candidates.filter(c => c.date === joinDate);
        if (dateMatched.length === 1) return dateMatched[0];
        if (dateMatched.length > 1) candidates = dateMatched;
    }

    let exact = candidates.find(c => normalizeProductKey(c.prod) === normProd && !String(c.premium).includes("미제공"));
    if (exact) return exact;
    exact = candidates.find(c => normalizeProductKey(c.prod) === normProd);
    if (exact) return exact;

    let bestMatch = null;
    let bestScore = -1;
    for (const c of candidates) {
        const cKey = normalizeProductKey(c.prod);
        if (!cKey || !normProd) continue;
        let score = 0;
        if (cKey.includes(normProd) || normProd.includes(cKey)) {
            score += 100;
        }
        const minLen = Math.min(cKey.length, normProd.length);
        let prefix = 0;
        for (let i = 0; i < minLen; i++) {
            if (cKey[i] === normProd[i]) prefix++;
            else break;
        }
        score += prefix * 3;
        const prodNums = normProd.match(/\d{3,4}/g) || [];
        const cNums = cKey.match(/\d{3,4}/g) || [];
        prodNums.forEach(n => { if (cNums.includes(n)) score += 30; });

        if (score > bestScore) {
            bestScore = score;
            bestMatch = c;
        }
    }
    return bestScore > 10 ? bestMatch : candidates[0];
}

function parseAmt(amtStr) {
    if (!amtStr) return 0;
    let str = toHalfWidth(String(amtStr)).replace(/,/g, '').replace(/\s+/g, '');
    if (str.includes("지원") && !/\d/.test(str)) return 0;
    let uk = 0, man = 0, cheon = 0;
    if (str.includes("억")) {
        let parts = str.split("억");
        let ukVal = parseFloat(parts[0].replace(/[^0-9.]/g, '')) || 0;
        uk = Math.round(ukVal * 10000);
        let rest = parts[1] || "";
        if (rest.includes("천")) {
            let cParts = rest.split("천");
            cheon = (parseFloat(cParts[0].replace(/[^0-9.]/g, '')) || 0) * 1000;
            man = parseFloat((cParts[1] || "").replace(/[^0-9.]/g, '')) || 0;
        } else {
            man = parseFloat(rest.replace(/[^0-9.]/g, '')) || 0;
        }
        return Math.round(uk + cheon + man);
    }
    if (str.includes("천만")) {
        let val = parseFloat(str.replace(/[^0-9.]/g, '')) || 0;
        return Math.round(val * 1000);
    }
    if (str.includes("만")) {
        let val = parseFloat(str.split("만")[0].replace(/[^0-9.]/g, '')) || 0;
        return Math.round(val);
    }
    if (str.includes("원")) {
        let won = parseFloat(str.replace(/[^0-9.]/g, '')) || 0;
        return Math.round(won / 10000);
    }
    return parseInt(str.replace(/[^0-9]/g, ''), 10) || 0;
}

function formatAmt(num) {
    if (!num || num === 0) return "-";
    num = Math.round(num);
    if (num >= 10000) {
        let uk = Math.floor(num / 10000);
        let man = num % 10000;
        return man > 0 ? `${uk}억 ${man.toLocaleString()}만` : `${uk}억`; } return num.toLocaleString() + "만"; }  function parsePremium(premStr) { if (!premStr \vert{}\vert{} premStr === "-" \vert{}\vert{} String(premStr).includes("미제공") \vert{}\vert{} String(premStr).includes("완료") \vert{}\vert{} String(premStr).includes("납입완료")) return 0; return parseInt(String(premStr).replace(/[^0-9]/g, ''), 10) \vert{}\vert{} 0; }  function formatPremium(num) { return num === 0 ? "-" : num.toLocaleString() + "원"; }  function determineSilbiGeneration(dateStr, silbiDetails) { if (!dateStr \vert{}\vert{} dateStr === "-") return "실손보유"; const m = String(dateStr).match(/(\d{4})[-.](\d{2})[-.](\d{2})/); if (!m) return "실손보유"; const ymd = parseInt(m[1] + m[2] + m[3], 10);  let hospAmt = 0; let outAmt = 0; (silbiDetails \vert{}\vert{} []).forEach(item => { if (item.name.includes("입원")) hospAmt = Math.max(hospAmt, item.amt); if (item.name.includes("통원") \vert{}\vert{} item.name.includes("외래") \vert{}\vert{} item.name.includes("처방")) outAmt += item.amt; });  if (ymd < 20091001) { if (hospAmt >= 10000) return "1세대 1억"; if (hospAmt > 0 && outAmt > 0) return `1세대 ${hospAmt}/${outAmt}`; if (hospAmt > 0) return `1세대 (${hospAmt}만)`;
        return "1세대 실손";
    } else if (ymd < 20170401) {
        return "2세대 표준화";
    } else if (ymd < 20210701) {
        return "3세대 착한실손";
    } else if (ymd < 20260701) {
        return "4세대 실손";
    } else {
        return "5세대 실손";
    }
}

function parseContractRow(r) {
    const cleanCells = r.map(v => toHalfWidth(v || "").trim());
    const no = cleanCells[0];

    let dateIdx = -1;
    for (let i = 1; i < cleanCells.length; i++) {
        if (/^\d{4}[-.]\d{2}[-.]\d{2}$/.test(cleanCells[i])) {
            dateIdx = i;
            break;
        }
    }

    let comp = cleanCells[1] || "";
    let prod = cleanCells[2] || "";
    let date = dateIdx !== -1 ? cleanCells[dateIdx] : (cleanCells[3] || "");

    if (dateIdx === 2) {
        const parts = comp.split(/\s+/);
        comp = parts[0] || "";
        prod = parts.slice(1).join(" ");
    } else if (dateIdx > 3) {
        prod = cleanCells.slice(2, dateIdx).filter(Boolean).join(" ");
    }
    comp = normalizeCompany(comp);

    let payCycle = "", payTerm = "", maturity = "", premium = "", paidTotal = "";
    const rightCells = dateIdx !== -1 ? cleanCells.slice(dateIdx + 1) : cleanCells.slice(4);

    const moneyCells = [];
    rightCells.forEach(token => {
        if (!token) return;
        const subTokens = token.split(/\s+/);
        subTokens.forEach(st => {
            if (!st) return;
            if (/^(월납|연납|일시납|분기납|반년납)$/.test(st) && !payCycle) {
                payCycle = st;
            } else if (/^(\d+년(?:납)?|전기납)$/.test(st) && !payTerm) {
                payTerm = st.replace(/납$/, '');
            } else if (/^(\d+세(?:만기)?|종신)$/.test(st) && !maturity) {
                maturity = st === "9999세" || st === "9999세만기" ? "종신" : st.replace(/만기$/, '');
            } else if (st.includes("미제공") || st.includes("납입완료") || /[\d,]+원/.test(st) || st === "-") {
                moneyCells.push(st);
            }
        });
    });

    if (payCycle === "일시납" && (!payTerm || payTerm === "0년")) {
        payTerm = "일시납";
    }
    if (moneyCells.length > 0) premium = moneyCells[0];
    if (moneyCells.length > 1 && moneyCells[1] !== "0원") paidTotal = moneyCells[1];

    return {
        no, comp, prod, date, payCycle, payTerm, maturity, premium, paidTotal,
        hasRenewableRider: prod.includes("갱신형"),
        isPaidUp: premium.includes("납입완료") || (payCycle === "일시납" && paidTotal === ""),
        hasSilbi: false,
        silbiDetails: [],
        silbiGen: "",
        covNums: {},
        covTexts: {},
        coverages: {}
    };
}

// ==========================================
// 🚨 다이렉트 자바스크립트 정밀 매핑 엔진
// ==========================================
function extractDataDirectly(rawExcelData) {
    let rawContracts = [];

    const contractSheet = rawExcelData["전체계약리스트"] || [];
    if (contractSheet.length > 0 && contractSheet[0][0]) {
        let rawTitle = toHalfWidth(contractSheet[0][0]);
        let match = rawTitle.match(/([가-힣a-zA-Z]+)\s*(?:\([^\)]+\))?\s*님의/);
        if (match) {
            document.getElementById('main-header-title').innerText = match[1] + "님의 보장분석표";
        }
    }

    const cRows = contractSheet.filter(r => Array.isArray(r) && r.length >= 6 && /^\d+$/.test(String(r[0] || "").trim()));
    cRows.forEach(r => {
        rawContracts.push(parseContractRow(r));
    });

    const addCov = (contract, key, amt) => {
        if (!key || !amt || amt <= 0) return;
        contract.covNums[key] = (contract.covNums[key] || 0) + amt;
    };

    const maxCov = (contract, key, amt) => {
        if (!key || !amt || amt <= 0) return;
        contract.covNums[key] = Math.max(contract.covNums[key] || 0, amt);
    };

    const detailSheet = rawExcelData["가입담보상세"] || [];
    let activeJoinDate = "";

    detailSheet.forEach(r => {
        if (!Array.isArray(r) || r.length < 4) return;

        let rowFirst = String(r[0] || "").trim();
        let comp = toHalfWidth(r[1] || "").trim();
        let prod = toHalfWidth(r[2] || "").trim();
        let gubun = toHalfWidth(r[3] || "").trim();
        let cDambo = toHalfWidth(r[4] || "").trim();
        let sDambo = toHalfWidth(r[5] || "").trim();
        let amtStr = toHalfWidth(r[6] || "").trim();

        const joinedStr = r.join(" ");
        const dateMatch = joinedStr.match(/가입일자\s*:\s*(\d{4}[-.]\d{2}[-.]\d{2})/);
        if (dateMatch) activeJoinDate = dateMatch[1];

        if (rowFirst === "MARKER" && gubun === "납입완료") {
            let c = findMatchingContract(rawContracts, comp, prod, activeJoinDate);
            if (c) { c.isPaidUp = true; c.premium = "납입완료"; }
            return;
        }

        if (!/^\d+$/.test(rowFirst)) return;

        if (!amtStr && sDambo && /([\d,]+만|[\d,]+억|[\d,]+원)/.test(sDambo)) {
            amtStr = sDambo;
            sDambo = "";
        }

        let c = findMatchingContract(rawContracts, comp, prod, activeJoinDate);
        if (!c) return;

        const cLower = cDambo.replace(/\s+/g, '');
        const sLower = sDambo.replace(/\s+/g, '');
        const combined = cLower + " " + sLower;

        if (cLower.includes("보험료납입면제") || cLower.includes("보험료납입지원")) return;

        if (cDambo.includes("갱신형") || cDambo.includes("(갱신)") || cDambo.includes("[갱신") || prod.includes("갱신형")) {
            c.hasRenewableRider = true;
        }

        let amtNum = parseAmt(amtStr);

        // 1. 실손의료비 및 비용손해 실손 처리
        if (gubun === "실손") {
            if (combined.includes("입원의료비") || combined.includes("외래의료비") || combined.includes("통원의료비") || combined.includes("처방조제") || combined.includes("실손의료비") || combined.includes("3대비급여")) {
                c.hasSilbi = true;
                c.silbiDetails.push({ name: combined, amt: amtNum });
                return;
            }
            if (combined.includes("배상책임")) {
                addCov(c, "d_liab_", amtNum);
                return;
            }
            if (combined.includes("화재벌금") || combined.includes("화재배상") || combined.includes("누수") || combined.includes("급배수")) {
                addCov(c, "d_fire_", amtNum);
                return;
            }
            if (combined.includes("교통사고처리지원금") || combined.includes("변호사선임") || combined.includes("벌금") || combined.includes("방어비용")) {
                addCov(c, "d_driver_", amtNum);
                return;
            }
            return;
        }

        if (combined.includes("181일이상")) return;

        const isLifeOrWhole = c.prod.includes("종신") || c.prod.includes("정기") || c.comp.includes("생명") || c.comp.includes("라이프");
        const isDisease = cLower.includes("질병") || sLower.includes("질병") || (!cLower.includes("상해") && !cLower.includes("재해") && !sLower.includes("상해") && !sLower.includes("재해") && sLower.includes("질병"));
        const isInjury = cLower.includes("상해") || cLower.includes("재해") || sLower.includes("상해") || sLower.includes("재해");

        // 2. 사망
        if (sLower === "질병사망" || sLower === "상해사망" || sLower === "상해사망(유병자)" || sLower === "질병사망(유병자)" ||
            ((cLower.includes("일반사망") || cLower.includes("질병사망") || cLower.includes("상해사망") || cLower.includes("재해사망")) && !sLower.includes("후유장해") && !sLower.includes("특정질병사망") && !cLower.includes("여행중") && !cLower.includes("교통상해") && !cLower.includes("중대재해"))) {
            const deathIsDisease = sLower.includes("질병사망") || cLower.includes("질병사망") || cLower.includes("일반사망");
            if (isLifeOrWhole) {
                if (deathIsDisease) c.tempDieD = (c.tempDieD || 0) + amtNum;
                else c.tempDieS = (c.tempDieS || 0) + amtNum;
            } else {
                addCov(c, deathIsDisease ? "d_dieD_" : "d_dieS_", amtNum);
            }
            return;
        }

        // 3. 후유장해 (3% 이상)
        if (sLower.includes("후유장해") || cLower.includes("후유장해") || cLower.includes("후유장애")) {
            if (combined.includes("80%") || combined.includes("50%") || combined.includes("20%") || sLower.includes("특정상해후유장해")) {
                return;
            }
            if (cLower.includes("3%") || cLower.includes("3~100") || cLower.includes("3-100") || sLower === "상해후유장해" || sLower === "질병후유장해") {
                addCov(c, isDisease && !isInjury ? "d_disD_" : "d_disS_", amtNum);
            }
            return;
        }

        // 4. 간병인 / 간호간병통합서비스
        if (combined.includes("간호간병") || combined.includes("간호·간병")) {
            if (cLower.includes("지원금") || cLower.includes("지원비")) return;
            addCov(c, isInjury && !sLower.includes("질병") ? "d_careNS_" : "d_careN_", amtNum);
            return;
        }
        if (combined.includes("간병인")) {
            if (cLower.includes("지원금") || cLower.includes("연간")) return;
            const prefix = (isInjury && !sLower.includes("질병")) ? "d_careS_" : "d_careD_";
            if (cLower.includes("직접지원") || (cLower.includes("지원") && !cLower.includes("일당"))) {
                c.covTexts[prefix] = "지원";
            } else {
                addCov(c, prefix, amtNum);
            }
            return;
        }

        // 5. 입원일당
        if (sLower.includes("입원일당") || cLower.includes("입원일당") || cLower.includes("입원비") || cLower.includes("신입원특약") || cLower.includes("임시생활비")) {
            if (sLower.includes("암입원") || sLower.includes("특정질병입원") || sLower.includes("여성/부인과") || sLower.includes("교통상해입원") || cLower.includes("치매입원") || cLower.includes("자동차사고입원")) {
                return;
            }
            const pfx = (isInjury && !sLower.includes("질병")) ? "S_" : "D_";
            if (combined.includes("중환자실")) {
                addCov(c, "d_icu" + pfx, amtNum);
            } else if (combined.includes("수술입원")) {
                addCov(c, "d_opHosp" + pfx, amtNum);
            } else if (combined.includes("1인실")) {
                if (combined.includes("상급")) addCov(c, "d_1in" + pfx, amtNum);
                else if (!c.covNums["d_1in" + pfx]) addCov(c, "d_1in" + pfx, amtNum);
            } else if (cLower.includes("2-3인실") || cLower.includes("2~3인실") || cLower.includes("4-5인실")) {
                return;
            } else {
                addCov(c, "d_hosp" + pfx, amtNum);
            }
            return;
        }

        // 6. 산정특례
        if (combined.includes("산정특례")) {
            if (combined.includes("화상")) {
                addCov(c, "d_burn_sanjeong_", amtNum);
            } else if (combined.includes("뇌혈관") || combined.includes("심장") || combined.includes("중증") || combined.includes("희귀")) {
                addCov(c, "d_sanjeong_", amtNum);
            }
            return;
        }

        // 7. 암 관련 담보
        if (combined.includes("항암") || combined.includes("표적항암") || combined.includes("면역항암") || combined.includes("중입자") || combined.includes("양성자")) {
            if (cLower.includes("방사선") && cLower.includes("약물")) {
                addCov(c, "d_anti_rad_", amtNum);
                addCov(c, "d_anti_drug_", amtNum);
            } else if (cLower.includes("방사선") || cLower.includes("양성자") || cLower.includes("중입자") || cLower.includes("세기조절")) {
                maxCov(c, "d_anti_rad_", amtNum);
            } else {
                maxCov(c, "d_anti_drug_", amtNum);
            }
            return;
        }

        if ((cLower.includes("암") || sLower.includes("고액항암")) && (cLower.includes("주요치료") || cLower.includes("특정치료") || cLower.includes("통합치료"))) {
            if (sLower === "암수술") {
                addCov(c, "d_cancer_op_", amtNum);
            } else if (sLower === "특정암수술") {
                addCov(c, "d_similar_op_", amtNum);
            } else if (!cLower.includes("유사암") && !cLower.includes("기타피부암") && !cLower.includes("갑상선암")) {
                addCov(c, "d_cancer_main_", amtNum);
            }
            return;
        }

        if (sLower.includes("유사암") || sLower.includes("소액암") || cLower.includes("유사암") || (cLower.includes("갑상선암") && !cLower.includes("제외"))) {
            if (combined.includes("수술")) {
                addCov(c, "d_similar_op_", amtNum);
            } else if (combined.includes("진단") || sLower.includes("소액암")) {
                addCov(c, "d_similar_", amtNum);
            }
            return;
        }

        if (sLower === "암수술" || (cLower.includes("암") && cLower.includes("수술") && !cLower.includes("유사암제외수술외"))) {
            if (cLower.includes("갑상선암및전립선암)") && !cLower.includes("제외")) {
                addCov(c, "d_similar_op_", amtNum);
            } else {
                addCov(c, "d_cancer_op_", amtNum);
            }
            return;
        }

        if (sLower === "암진단" || (cLower.includes("일반암") && cLower.includes("진단")) || (cLower.includes("암진단") && !cLower.includes("특정암") && !cLower.includes("전이암"))) {
            addCov(c, "d_cancer_", amtNum);
            return;
        }

        // 8. 뇌 / 심장 (순환계)
        if (cLower.includes("순환계") || ((cLower.includes("뇌혈관") || cLower.includes("뇌졸중") || cLower.includes("허혈") || cLower.includes("심장질환")) && (cLower.includes("주요치료") || cLower.includes("특정치료") || cLower.includes("통합치료"))) || cLower.includes("혈전용해") || cLower.includes("혈전제거")) {
            maxCov(c, "d_circ_tot_", amtNum);
            return;
        }

        if (sLower === "뇌혈관질환진단" || (cLower.includes("뇌혈관") && cLower.includes("진단") && !cLower.includes("수술"))) {
            addCov(c, "d_brain_", amtNum);
            return;
        }
        if (sLower === "허혈성심장질환진단" || (cLower.includes("허혈성") && cLower.includes("진단") && !cLower.includes("수술"))) {
            addCov(c, "d_heart_", amtNum);
            return;
        }
        if (sLower === "뇌졸중진단" || sLower === "뇌출혈진단" || ((cLower.includes("뇌졸중") || cLower.includes("뇌출혈") || cLower.includes("뇌경색")) && (cLower.includes("진단") || sLower.includes("진단")))) {
            maxCov(c, "d_infarct_", amtNum);
            return;
        }
        if (sLower === "급성심근경색진단" || (cLower.includes("심근경색") && (cLower.includes("진단") || sLower.includes("진단")))) {
            addCov(c, "d_ami_", amtNum);
            return;
        }

        // 9. 골절 / 깁스 / 화상 / 장기요양 / 말기질환 / 법률·운전자
        if (sLower === "골절진단" || (cLower.includes("골절") && cLower.includes("진단") && !cLower.includes("5대골절") && !cLower.includes("중대골절") && !cLower.includes("척추골절") && !sLower.includes("중대골절"))) {
            addCov(c, "d_fracture_", amtNum);
            return;
        }
        if (sLower === "골절수술" || (cLower.includes("골절수술") && !cLower.includes("5대골절") && !cLower.includes("철심제거"))) {
            addCov(c, "d_fracture_op_", amtNum);
            return;
        }
        if (sLower === "깁스치료" || cLower.includes("깁스")) {
            addCov(c, "d_cast_", amtNum);
            return;
        }
        if (sLower === "화상진단" || sLower === "중대화상진단" || (cLower.includes("화상") && cLower.includes("진단"))) {
            if (sLower === "화상진단") addCov(c, "d_burn_", amtNum);
            else if (!c.covNums["d_burn_"]) addCov(c, "d_burn_", amtNum);
            return;
        }
        if (combined.includes("복지용구") || combined.includes("복지용품") || combined.includes("주야간보호") || combined.includes("주·야간보호")) {
            addCov(c, "d_dementia_welfare_", amtNum);
            return;
        }
        if (combined.includes("재가급여") || combined.includes("시설급여") || combined.includes("방문요양") || sLower.includes("장기간병요양진단")) {
            addCov(c, "d_dementia_home_", amtNum);
            return;
        }
        if (combined.includes("표적치매") || combined.includes("레켐비")) {
            maxCov(c, "d_dementia_target_", amtNum);
            return;
        }
        if (combined.includes("말기신부전")) {
            addCov(c, "d_kidney_", amtNum);
            return;
        }
        if (sLower.includes("자동차사고부상") || cLower === "자동차부상치료비II" || cLower === "자동차사고부상치료비") {
            addCov(c, "d_driver_", amtNum);
            return;
        }
        if (combined.includes("일상생활배상") || combined.includes("가족생활배상") || combined.includes("자녀배상")) {
            addCov(c, "d_liab_", amtNum);
            return;
        }
        if (combined.includes("화재벌금") || combined.includes("급배수") || combined.includes("누수")) {
            addCov(c, "d_fire_", amtNum);
            return;
        }

        // 10. 일반 치료비 - 수술비 / 통합치료비
        if ((cLower.includes("질병통합치료") || cLower.includes("상해통합치료")) && !cLower.includes("암") && !cLower.includes("간·폐")) {
            addCov(c, isInjury ? "d_totS_" : "d_totD_", amtNum);
            return;
        }

        if (sLower === "질병종수술" || sLower === "상해종수술" || /\d+~?\d*종\s*수술/.test(cDambo) || /\d+-\d+종\s*수술/.test(cDambo)) {
            const pfx = (sLower === "상해종수술" || (isInjury && !isDisease)) ? "S_" : "D_";

            let specificJong = cDambo.match(/_\s*(\d)\s*종/) || cDambo.match(/\(\s*(\d)\s*종\s*[,)]/);
            if (specificJong) {
                const jNum = parseInt(specificJong[1], 10);
                if (jNum >= 1 && jNum <= 8) maxCov(c, `d_op${jNum}${pfx}`, amtNum);
                return;
            }
            const allJongs = cDambo.match(/(\d)\s*종/g);
            if (allJongs) {
                const maxJ = Math.max(...allJongs.map(m => parseInt(m, 10)));
                if (maxJ >= 1 && maxJ <= 8) maxCov(c, `d_op${maxJ}${pfx}`, amtNum);
                return;
            }
            maxCov(c, `d_op5${pfx}`, amtNum); return; }  if (sLower === "질병수술" \vert{}\vert{} sLower === "질병수술(유병자)" \vert{}\vert{} sLower === "상해수술" \vert{}\vert{} sLower === "상해수술(유병자)" \vert{}\vert{} ((cLower.includes("질병수술") \vert{}\vert{} cLower.includes("상해수술") \vert{}\vert{} cLower.includes("입원수술") \vert{}\vert{} cLower.includes("통원수술")) && !cLower.includes("특정") && !cLower.includes("111대") && !cLower.includes("119대") && !cLower.includes("인공관절") && !cLower.includes("창상") && !cLower.includes("흉터"))) { const pfx = (sLower.includes("상해수술") \vert{}\vert{} (isInjury && !isDisease)) ? "S_" : "D_"; if (cLower.includes("상급종합병원") \vert{}\vert{} cLower.includes("상급병원")) { maxCov(c, "d_opHigh" + pfx, amtNum); } else if (cLower.includes("종합병원")) { maxCov(c, "d_opGen" + pfx, amtNum); } else { if (cLower.includes("통원수술") && c.covNums["d_opNorm" + pfx]) { maxCov(c, "d_opNorm" + pfx, amtNum); } else { addCov(c, "d_opNorm" + pfx, amtNum); } } return; } });  rawContracts.forEach(c => { Object.entries(c.covNums).forEach(([k, val]) => { if (val > 0) c.coverages[k] = formatAmt(val); }); Object.entries(c.covTexts).forEach(([k, txt]) => { if (!c.covNums[k]) c.coverages[k] = txt; });  if (c.tempDieD > 0 \vert{}\vert{} c.tempDieS > 0) { let d = c.tempDieD \vert{}\vert{} 0; let s = c.tempDieS \vert{}\vert{} 0; const isTermLife = c.prod.includes("정기"); const lifeKey = isTermLife ? "d_lifeT_" : "d_life_";  if (d > 0 && s > 0) { let common = Math.min(d, s); c.coverages[lifeKey] = formatAmt(common); if (d > s) c.coverages.d_dieD_ = formatAmt(d - s); if (s > d) c.coverages.d_dieS_ = formatAmt(s - d); } else if (d > 0) { if (c.comp.includes("생명") \vert{}\vert{} c.comp.includes("라이프")) { c.coverages[lifeKey] = formatAmt(d); } else { c.coverages.d_dieD_ = formatAmt(d); } } else if (s > 0) { c.coverages.d_dieS_ = formatAmt(s); } }  if (c.hasSilbi \vert{}\vert{} c.prod.includes("실손")) { c.silbiGen = determineSilbiGeneration(c.date, c.silbiDetails); } });  if (rawContracts.length === 0) { alert("추출된 계약 정보가 없습니다. [추출 원문 다운로드] 버튼을 눌러 원문 구조를 확인해주세요."); return; }  processMappedData(rawContracts); }  // ========================================== // 페이징, 합산 및 실손 분리계약 병합 // ========================================== function processMappedData(rawContracts) { pageEdits = {}; processedContracts = [];  rawContracts.forEach(curr => { const currCompNorm = normalizeCompany(curr.comp); const currProdNorm = normalizeProductKey(curr.prod); const isCurrSilbiSplit = String(curr.premium).includes("미제공") \vert{}\vert{} curr.premium === "-";  let duplicate = processedContracts.find(p => normalizeCompany(p.comp) === currCompNorm && normalizeProductKey(p.prod) === currProdNorm && p.date === curr.date && (isCurrSilbiSplit \vert{}\vert{} String(p.premium).includes("미제공") \vert{}\vert{} p.premium === "-") );  if (duplicate) { if (!isCurrSilbiSplit) { duplicate.premium = curr.premium; duplicate.payCycle = curr.payCycle \vert{}\vert{} duplicate.payCycle; duplicate.payTerm = curr.payTerm \vert{}\vert{} duplicate.payTerm; duplicate.maturity = curr.maturity \vert{}\vert{} duplicate.maturity; duplicate.paidTotal = curr.paidTotal \vert{}\vert{} duplicate.paidTotal; duplicate.isPaidUp = curr.isPaidUp; } if (curr.silbiGen) duplicate.silbiGen = curr.silbiGen; else if (!duplicate.silbiGen) duplicate.silbiGen = determineSilbiGeneration(duplicate.date, curr.silbiDetails);  Object.entries(curr.coverages \vert{}\vert{} {}).forEach(([k, v]) => { if (!duplicate.coverages[k] \vert{}\vert{} duplicate.coverages[k] === "-") { duplicate.coverages[k] = v; } else if (!String(v).includes("지원") && !String(duplicate.coverages[k]).includes("지원")) { duplicate.coverages[k] = formatAmt(parseAmt(duplicate.coverages[k]) + parseAmt(v)); } }); } else { processedContracts.push({ ...curr }); } });  const regularPagesCount = Math.ceil(processedContracts.length / itemsPerPage); totalPages = regularPagesCount > 1 ? regularPagesCount + 1 : regularPagesCount; currentPage = 1;  if(totalPages > 1) document.getElementById('pagination-container').classList.remove('hidden'); else document.getElementById('pagination-container').classList.add('hidden');  renderPage(); }  function renderPage() { document.getElementById('page-indicator').innerText = `${currentPage} / ${totalPages}`;  for(let i=1; i<=5; i++) { if(document.getElementById(`comp${i}`)) document.getElementById(`comp${i}`).innerText = ""; if(document.getElementById(`prod${i}`)) document.getElementById(`prod${i}`).innerText = ""; if(document.getElementById(`date${i}`)) document.getElementById(`date${i}`).innerText = ""; if(document.getElementById(`term${i}`)) document.getElementById(`term${i}`).innerText = ""; if(document.getElementById(`prem${i}`)) document.getElementById(`prem${i}`).innerText = "-"; if(document.getElementById(`silbi${i}`)) document.getElementById(`silbi${i}`).innerText = ""; if(document.getElementById(`tot_prem_paid_${i}`)) document.getElementById(`tot_prem_paid_${i}`).innerText = ""; document.querySelectorAll(`td[id$="_${i}"]`).forEach(td => td.innerText = ""); } document.getElementById('totalPremiumCell').innerText = "-";  const isSummaryPage = (totalPages > 1 && currentPage === totalPages);  if (isSummaryPage) { document.getElementById('header-page-label').innerText = "총 합계"; let grandTotalPremium = 0; const maxSummaryCols = Math.min(totalPages - 1, 5);  for(let i=1; i<=maxSummaryCols; i++) { const compEl = document.getElementById(`comp${i}`);
            if(compEl) {
                compEl.innerText = `${i}페이지`; compEl.style.color = "#d32f2f"; } if(document.getElementById(`prod${i}`)) document.getElementById(`prod${i}`).innerText = "-";  const pStart = (i - 1) * itemsPerPage; let pagePremiumSum = 0; let pageCoveragesSum = {};  if (pageEdits[i]) { const mappingKeys = [ 'd_life_', 'd_lifeT_', 'd_dieD_', 'd_dieS_', 'd_disD_', 'd_disS_', 'd_hospD_', 'd_hospS_', 'd_1inD_', 'd_1inS_', 'd_opHospD_', 'd_opHospS_', 'd_icuD_', 'd_icuS_', 'd_careD_', 'd_careS_', 'd_careN_', 'd_careNS_', 'd_op1D_', 'd_op1S_', 'd_op2D_', 'd_op2S_', 'd_op3D_', 'd_op3S_', 'd_op4D_', 'd_op4S_', 'd_op5D_', 'd_op5S_', 'd_op6D_', 'd_op6S_', 'd_op7D_', 'd_op7S_', 'd_op8D_', 'd_op8S_', 'd_opNormD_', 'd_opNormS_', 'd_opGenD_', 'd_opGenS_', 'd_opHighD_', 'd_opHighS_', 'd_totD_', 'd_totS_', 'd_cancer_', 'd_cancer_op_', 'd_similar_', 'd_similar_op_', 'd_anti_rad_', 'd_anti_drug_', 'd_cancer_main_', 'd_brain_', 'd_heart_', 'd_infarct_', 'd_ami_', 'd_sanjeong_', 'd_circ_tot_', 'd_dementia_welfare_', 'd_dementia_home_', 'd_dementia_target_', 'd_kidney_', 'd_fracture_', 'd_fracture_op_', 'd_cast_', 'd_burn_', 'd_burn_sanjeong_', 'd_driver_', 'd_liab_', 'd_fire_' ];  for(let col = 1; col <= 5; col++) { const contractIdx = (i - 1) * itemsPerPage + (col - 1); if (processedContracts[contractIdx]) { let premVal = pageEdits[i][`prem${col}`] || "";
                        if (!premVal.includes("완료") && !premVal.includes("납입완료")) {
                            pagePremiumSum += parsePremium(premVal);
                        }
                        mappingKeys.forEach(k => {
                            let cVal = pageEdits[i][`${k}${col}`] || "";
                            if(cVal && !cVal.includes("지원")) {
                                pageCoveragesSum[k] = (pageCoveragesSum[k] || 0) + parseAmt(cVal);
                            }
                        });
                    }
                }
            } else {
                const pData = processedContracts.slice(pStart, pStart + itemsPerPage);
                pData.forEach(c => {
                    if(!c.isPaidUp) pagePremiumSum += parsePremium(c.premium);
                    if(c.coverages) {
                        for (let key in c.coverages) {
                            let val = c.coverages[key];
                            if(String(val).includes("지원")) continue; 
                            let num = parseAmt(val);
                            pageCoveragesSum[key] = (pageCoveragesSum[key] || 0) + num;
                        }
                    }
                });
            }

            if(document.getElementById(`prem${i}`)) { document.getElementById(`prem${i}`).innerText = formatPremium(pagePremiumSum);
                document.getElementById(`prem${i}`).style.color = "#1d4ed8"; } grandTotalPremium += pagePremiumSum;  const sumCells = document.querySelectorAll(`td[id$="_${i}"].sum-target`); sumCells.forEach(cell => { let dataKey = cell.getAttribute('data-key'); let sumVal = pageCoveragesSum[dataKey] \vert{}\vert{} pageCoveragesSum[dataKey+"sum"] \vert{}\vert{} 0; if(sumVal > 0) cell.innerText = formatAmt(sumVal); }); } document.getElementById('totalPremiumCell').innerText = formatPremium(grandTotalPremium);  } else { document.getElementById('header-page-label').innerText = "페이지 합계";  if (pageEdits[currentPage]) { const edits = pageEdits[currentPage]; document.querySelectorAll('.editable-cell').forEach(cell => { if (cell.id && edits[cell.id] !== undefined) { cell.innerText = edits[cell.id]; } }); } else { const startIndex = (currentPage - 1) * itemsPerPage; const pageData = processedContracts.slice(startIndex, startIndex + itemsPerPage);  let currentPageSum = 0;  pageData.forEach((contract, index) => { const idNum = index + 1;  if(document.getElementById(`comp${idNum}`)) {
                    document.getElementById(`comp${idNum}`).innerText = contract.comp; document.getElementById(`comp${idNum}`).style.color = "#1d4ed8";
                }
                if(document.getElementById(`prod${idNum}`)) document.getElementById(`prod${idNum}`).innerText = contract.prod;
                if(document.getElementById(`date${idNum}`)) document.getElementById(`date${idNum}`).innerText = contract.date;

                let termStr = `${contract.payTerm}/${contract.maturity}`;
                if (contract.hasRenewableRider) termStr = `갱신형/${contract.maturity}`; if(document.getElementById(`term${idNum}`)) document.getElementById(`term${idNum}`).innerText = termStr;  const premEl = document.getElementById(`prem${idNum}`);
                if(premEl) {
                    if (contract.isPaidUp || String(contract.premium).includes("완료") || String(contract.premium).includes("납입완료")) {
                        premEl.innerText = "납입완료";
                        premEl.style.color = "#d32f2f";
                        premEl.style.fontWeight = "900";
                    } else {
                        premEl.innerText = contract.premium || "-";
                        premEl.style.color = "#1d4ed8";
                        premEl.style.fontWeight = "bold";
                        currentPageSum += parsePremium(contract.premium);
                    }
                }

                if (contract.paidTotal && document.getElementById(`tot_prem_paid_${idNum}`)) { document.getElementById(`tot_prem_paid_${idNum}`).innerText = contract.paidTotal;
                }

                if (contract.silbiGen && document.getElementById(`silbi${idNum}`)) { document.getElementById(`silbi${idNum}`).innerText = contract.silbiGen;
                }

                if (contract.coverages) {
                    const cov = contract.coverages;

                    if (cov.d_careD_ !== undefined) document.getElementById(`d_careD_${idNum}`).innerText = cov.d_careD_; else if (cov.d_careD_sum) document.getElementById(`d_careD_${idNum}`).innerText = formatAmt(cov.d_careD_sum);
                    else if (cov.d_careD_text) document.getElementById(`d_careD_${idNum}`).innerText = cov.d_careD_text;  if (cov.d_careS_ !== undefined) document.getElementById(`d_careS_${idNum}`).innerText = cov.d_careS_;
                    else if (cov.d_careS_sum) document.getElementById(`d_careS_${idNum}`).innerText = formatAmt(cov.d_careS_sum); else if (cov.d_careS_text) document.getElementById(`d_careS_${idNum}`).innerText = cov.d_careS_text;

                    const mappings = [
                        'd_life_', 'd_lifeT_', 'd_dieD_', 'd_dieS_', 'd_disD_', 'd_disS_', 'd_hospD_', 'd_hospS_', 'd_1inD_', 'd_1inS_',
                        'd_opHospD_', 'd_opHospS_', 'd_icuD_', 'd_icuS_', 'd_careN_', 'd_careNS_',
                        'd_op1D_', 'd_op1S_', 'd_op2D_', 'd_op2S_',
                        'd_op3D_', 'd_op3S_', 'd_op4D_', 'd_op4S_', 'd_op5D_', 'd_op5S_', 'd_op6D_', 'd_op6S_',
                        'd_op7D_', 'd_op7S_', 'd_op8D_', 'd_op8S_', 'd_opNormD_', 'd_opNormS_', 'd_opGenD_', 'd_opGenS_',
                        'd_opHighD_', 'd_opHighS_', 'd_totD_', 'd_totS_', 'd_cancer_', 'd_cancer_op_', 'd_similar_', 'd_similar_op_',
                        'd_anti_rad_', 'd_anti_drug_', 'd_cancer_main_',
                        'd_brain_', 'd_heart_', 'd_infarct_', 'd_ami_', 'd_sanjeong_', 'd_circ_tot_',
                        'd_dementia_welfare_', 'd_dementia_home_', 'd_dementia_target_', 'd_kidney_',
                        'd_fracture_', 'd_fracture_op_', 'd_cast_', 'd_burn_', 'd_burn_sanjeong_',
                        'd_driver_', 'd_liab_', 'd_fire_', 'tot_prem_paid_'
                    ];

                    mappings.forEach(key => {
                        if(cov[key] && document.getElementById(`${key}${idNum}`)) {
                            document.getElementById(`${key}${idNum}`).innerText = cov[key];
                        }
                    });
                }
            });
            document.getElementById('totalPremiumCell').innerText = formatPremium(currentPageSum);
        }
    }

    calculateRowSums();
    if(!isSummaryPage) calculateTotalPremium(); 
}

function saveCurrentPageEdits() {
    if (processedContracts.length === 0) return;
    if (totalPages > 1 && currentPage === totalPages) return; 

    let currentEdits = {};
    document.querySelectorAll('.editable-cell').forEach(cell => {
        if (cell.id) {
            currentEdits[cell.id] = cell.innerText;
        }
    });
    pageEdits[currentPage] = currentEdits;
}

function calculateRowSums() {
    const uniqueKeys = new Set();
    document.querySelectorAll('.sum-target').forEach(cell => uniqueKeys.add(cell.getAttribute('data-key')));

    uniqueKeys.forEach(key => {
        let rowSum = 0;
        let hasText = false;

        for(let i=1; i<=5; i++) {
            const cell = document.getElementById(`${key}${i}`);
            if(cell && cell.innerText.trim() !== "" && cell.innerText.trim() !== "-") {
                let textVal = cell.innerText.trim();
                if(textVal.includes("지원")) hasText = true; 
                else rowSum += parseAmt(textVal);
            }
        }

        const resCell = document.getElementById(`res_${key}`); if(resCell) { if(hasText && rowSum === 0) resCell.innerText = "지원"; else resCell.innerText = formatAmt(rowSum); } }); }  function calculateTotalPremium() { let pagePremiumSum = 0; for(let i=1; i<=5; i++) { const cell = document.getElementById(`prem${i}`);
        if (cell && cell.innerText) {
            pagePremiumSum += parsePremium(cell.innerText);
        }
    }
    const totalCell = document.getElementById('totalPremiumCell');
    if(totalCell) {
        totalCell.innerText = formatPremium(pagePremiumSum);
    }
}

function changePage(step) {
    saveCurrentPageEdits(); 
    let newPage = currentPage + step;
    if(newPage < 1) newPage = 1;
    if(newPage > totalPages) newPage = totalPages;
    if(newPage !== currentPage) {
        currentPage = newPage;
        renderPage();
    }
}

// ==========================================
// 🚨 전체 페이지 다중 인쇄 엔진 🚨
// ==========================================
async function printAllPages() {
    if (processedContracts.length === 0) {
        window.print();
        return;
    }

    saveCurrentPageEdits();
    const originalPage = currentPage;

    const printArea = document.createElement('div');
    printArea.id = 'print-area';

    const engineContainer = document.querySelector('.engine-container');
    engineContainer.classList.add('no-print');

    document.body.appendChild(printArea);

    const style = document.createElement('style');
    style.innerHTML = `
        @media print {
            @page { size: auto; margin: 8mm; }
            .no-print { display: none !important; }
            #print-area { display: block !important; width: 100%; }
            .page-break { page-break-after: always; margin-bottom: 20px; }
            * { -webkit-print-color-adjust: exact !important; color-adjust: exact !important; print-color-adjust: exact !important; }
            table.excel-table { width: 100% !important; min-width: 0 !important; font-size: 7.5pt !important; border-collapse: collapse !important; }
            .excel-table th, .excel-table td { padding: 2.5px 1px !important; line-height: 1.1 !important; word-break: normal !important; border: 1px solid #000 !important; }
        }
    `;
    document.head.appendChild(style);

    for(let p = 1; p <= totalPages; p++) {
        currentPage = p;
        renderPage();
        await new Promise(r => setTimeout(r, 80)); 

        const tableClone = document.getElementById('analysisTable').cloneNode(true);
        tableClone.removeAttribute('id');
        tableClone.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));

        const pageDiv = document.createElement('div');
        if (p < totalPages) pageDiv.classList.add('page-break');
        pageDiv.appendChild(tableClone);

        printArea.appendChild(pageDiv);
    }

    window.print();

    document.body.removeChild(printArea);
    document.head.removeChild(style);
    engineContainer.classList.remove('no-print');

    currentPage = originalPage;
    renderPage();
}

// ==========================================
// 🚨 엑셀 다운로드 유틸 (브라우저 팝업/보안 차단 방지용 Blob 호환) 🚨
// ==========================================
function triggerWorkbookDownload(wb, filename) {
    try {
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 200);
    } catch (err) {
        XLSX.writeFile(wb, filename);
    }
}

function exportRawToExcel() {
    if(!rawCloudDataForExport) {
        alert("아직 추출된 데이터가 없습니다. PDF를 먼저 업로드 해주세요.");
        return;
    }
    try {
        const wb = XLSX.utils.book_new();
        let sheetAdded = 0;

        for (const [sheetName, dataRows] of Object.entries(rawCloudDataForExport)) {
            if(Array.isArray(dataRows) && dataRows.length > 0) {
                const safeRows = dataRows.map(row =>
                    Array.isArray(row) ? row.map(cell => (cell === null || cell === undefined) ? "" : String(cell)) : [String(row || "")]
                );
                const ws = XLSX.utils.aoa_to_sheet(safeRows);
                const safeSheetName = String(sheetName).replace(/[\\/?*\[\]:]/g, '_').substring(0, 31) || `Sheet${sheetAdded + 1}`; XLSX.utils.book_append_sheet(wb, ws, safeSheetName); sheetAdded++; } }  if (sheetAdded === 0) { alert("추출된 원문 시트가 비어 있습니다."); return; }  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, ''); triggerWorkbookDownload(wb, `잇츠리온_원문데이터정렬본_${dateStr}.xlsx`);
    } catch (err) {
        alert("원문 엑셀 다운로드 중 오류 발생: " + err.message);
    }
}

async function exportToExcel() {
    if (processedContracts.length === 0) return alert("데이터가 없습니다.");
    saveCurrentPageEdits(); 

    const wb = XLSX.utils.book_new();
    const originalPage = currentPage;

    for(let p = 1; p <= totalPages; p++) {
        currentPage = p;
        renderPage(); 

        await new Promise(r => setTimeout(r, 80)); 

        const table = document.getElementById("analysisTable");
        const ws = XLSX.utils.table_to_sheet(table, {raw: true});

        const range = XLSX.utils.decode_range(ws['!ref']);
        for (let R = range.s.r; R <= range.e.r; ++R) {
            for (let C = range.s.c; C <= range.e.c; ++C) {
                const cell_ref = XLSX.utils.encode_cell({c:C, r:R});
                if(!ws[cell_ref]) ws[cell_ref] = {t:'s', v:''};
                let cell = ws[cell_ref];

                if(!cell.s) cell.s = {};
                cell.s.font = { name: "Malgun Gothic", sz: 9 };
                cell.s.alignment = { vertical: "center", horizontal: "center", wrapText: true };

                cell.s.border = {
                    top: { style: "thin", color: { rgb: "000000" } },
                    bottom: { style: "thin", color: { rgb: "000000" } },
                    left: { style: "thin", color: { rgb: "000000" } },
                    right: { style: "thin", color: { rgb: "000000" } }
                };

                const valStr = String(cell.v || "").trim();
                const grayKeywords = ["구분", "보험회사", "상품명", "계약일자", "납입기간/만기", "사망", "종신(생명)", "일반", "정기", "손해", "사망(80세)", "장애", "후유장애", "3%이상", "입원비", "입원", "일반병원", "상급1인실", "수술입원", "중환자실", "간병", "지원/일당", "통합간호", "일반 치료비", "수술비", "수술 1종", "수술 2종", "수술 3종", "수술 4종", "수술 5종", "수술 6종", "수술 7종", "수술 8종", "병원", "종합병원", "상급병원", "통합(입원/수술포함)", "암", "일반암", "진단비", "기타실피", "항암치료", "항암방사선", "항암약물", "암주요치료비", "뇌/심(순환계)", "뇌혈관", "허혈성", "뇌경색", "급성심근경색", "산정특례", "뇌/심(순환계)치료비", "장기요양(치매)", "복지용품+주야간이용", "방문/재가/생활비", "표적치료제(치매비)", "말기질환", "말기신부전증", "골절", "깁스", "화상", "실손의료비", "세대(1~5세대)", "법률비용", "운전자(현황급부)", "일상생활배상책임", "화재보험/누수", "보험료", "보험료(월)", "총 납입보험료", "페이지 합계", "비고", "총보험료", "총 합계"];

                let isGray = false;
                for(let kw of grayKeywords) {
                    if(valStr === kw || valStr.includes("장해지급률80%") || valStr.includes("(갑/기/경/제)") || valStr.includes("(5-인지지원등급)") || valStr.includes("단위 만원")) {
                        isGray = true; break;
                    }
                }

                if (R === 0) {
                    cell.s.fill = { fgColor: { rgb: "2CA02C" } };
                    cell.s.font.color = { rgb: "FFFFFF" };
                    cell.s.font.bold = true;
                    cell.s.font.sz = 11;
                } else if (isGray || C < 3 || C === 15) { 
                    cell.s.fill = { fgColor: { rgb: "F8F9FA" } };
                    cell.s.font.bold = true;
                }

                if (C === 13 || C === 14) {
                    cell.s.font.color = { rgb: "DC2626" };
                    cell.s.font.bold = true;
                }
            }
        }

        ws['!cols'] = [
            {wch: 8}, {wch: 9}, {wch: 11},
            {wch: 7}, {wch: 7}, {wch: 7}, {wch: 7}, {wch: 7}, {wch: 7}, {wch: 7}, {wch: 7}, {wch: 7}, {wch: 7},
            {wch: 9}, {wch: 9}, {wch: 15}
        ];

        let sheetName = (p === totalPages && totalPages > 1) ? "총합계" : `보장분석_${p}P`; XLSX.utils.book_append_sheet(wb, ws, sheetName); }  currentPage = originalPage; renderPage();  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, ''); triggerWorkbookDownload(wb, `잇츠리온_보장분석표_${dateStr}_전체통합본.xlsx`);
}

// ==========================================
// AI: 실손 세대 검증 및 특약 매핑 정밀 보완
// ==========================================
async function runAIVerification() {
    if (processedContracts.length === 0) return alert("먼저 PDF 원본 데이터를 업로드하세요.");
    const AI_PROXY_URL = "https://script.google.com/macros/s/AKfycbwz9QL6wb6GUlgygtnMOwsvXzbA2eZuhx-JIXQc-1TZCiAWZdV0IUxaqg7GbcMoO72P/exec";
    document.getElementById('progressTitle').innerText = "AI 실손/오류 정밀 검수 중...";
    document.getElementById('loadingOverlay').style.display = 'flex';

    const prompt = `
당신은 최고 수준의 보험 보장분석 검수 AI입니다.
아래 1차로 매핑된 보장분석 데이터(JSON)를 검토하세요.
[요청사항]
1. 각 계약의 가입일자(date)와 기존 silbiGen 값을 확인하고, 실손 담보가 있는 계약의 세대 표기(1세대 3000/10, 1세대 1억, 2세대 표준화, 3세대 착한실손, 4세대 실손, 5세대 실손 등)를 정밀하게 다듬으세요. (실손이 없는 계약은 빈 문자열 "" 유지)
2. coverages 객체 내 금액 포맷(예: "1,000만", "1억", "1억 5,000만")을 유지하고 명백한 오매핑만 보정하세요.
3. 결과를 반드시 순수 JSON 배열 포맷으로만 반환하세요. 마크다운(\`\`\`)이나 부연 설명은 절대 금지합니다.

${JSON.stringify(processedContracts)}`;

    try {
        const res = await fetch(AI_PROXY_URL, { method: 'POST', body: JSON.stringify({ prompt: prompt }) });
        const aiData = await res.json();

        let cleanJson = aiData.candidates[0].content.parts[0].text.replace(/```json/g, '').replace(/```/g, '').trim();
        cleanJson = cleanJson.replace(/[\x00-\x1F\x7F-\x9F]/g, " "); 
        let startIndex = cleanJson.indexOf('[');
        let endIndex = cleanJson.lastIndexOf(']');
        if (startIndex !== -1 && endIndex !== -1) cleanJson = cleanJson.substring(startIndex, endIndex + 1);

        let verifiedContracts = JSON.parse(cleanJson);
        processedContracts = verifiedContracts;
        pageEdits = {};
        renderPage();
        alert("AI 검수 및 실손 세대 매핑이 완료되었습니다.");
    } catch(e) {
        alert("AI 검수 오류: " + e.message);
    } finally {
        document.getElementById('loadingOverlay').style.display = 'none';
    }
}

// ⭐️ 보장분석 수기 입력 및 작업 중 메인 창 자동 로그아웃 방지
(function keepRionSessionAlive() {
    const syncRionActivity = () => { if (localStorage.getItem('rion_logged_user')) localStorage.setItem('rion_last_activity', Date.now().toString()); };
    syncRionActivity();
    ['mousedown', 'keypress', 'scroll', 'touchstart'].forEach(evt => document.addEventListener(evt, syncRionActivity, { passive: true }));
    setInterval(syncRionActivity, 3 * 60 * 1000);
})();

// 보안: 우클릭, 드래그, 소스보기(F12/Ctrl+U) 차단 (편집 가능 셀 및 입력창은 정상 허용)
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
