// 1. 보안 접근 점검 (비로그인 접근 즉시 차단)
(function checkRionAuth() {
    const user = localStorage.getItem('rion_logged_user');
    const session = localStorage.getItem('rion_session_id');
    if (!user || !session) {
        alert('보안 접근입니다. 메인 홈페이지에서 로그인 후 이용해 주세요.');
        window.close();
        location.replace('./index.html');
    }
})();

// 2. 상태 관리 전역 변수
let processedContracts = [];
let rawCloudDataForExport = null;
let sumData = {};
let currentPage = 1;
let totalPages = 1;
const itemsPerPage = 5;
let pageEdits = {};

// 3. 상단 버튼 전역 함수 명시적 바인딩 (HTML onclick 먹통 원천 차단)
window.triggerPdfUpload = function() {
    const el = document.getElementById('pdfUpload');
    if (el) {
        el.value = '';
        el.click();
    }
};

window.changePage = changePage;
window.exportRawToExcel = exportRawToExcel;
window.exportToExcel = exportToExcel;
window.printAllPages = printAllPages;
window.runAIVerification = runAIVerification;

// 4. DOM 초기화 및 이벤트 안전 연결
function initRionEngine() {
    const pdfInput = document.getElementById('pdfUpload');
    if (pdfInput) {
        pdfInput.addEventListener('change', handlePdfUpload);
    }

    document.querySelectorAll('.editable-cell').forEach(cell => {
        cell.setAttribute('contenteditable', 'true');
        cell.addEventListener('input', function(e) {
            const isSummaryPage = (totalPages > 1 && currentPage === totalPages);

            if (!isSummaryPage && e.target.id) {
                const match = e.target.id.match(/^(.+?)(\d)$/);
                if (match) {
                    const key = match[1];
                    const colIdx = parseInt(match[2], 10) - 1;
                    const contractIdx = (currentPage - 1) * itemsPerPage + colIdx;

                    if (!processedContracts[contractIdx]) {
                        processedContracts[contractIdx] = {
                            comp: "", prod: "", date: "", payCycle: "", payTerm: "", maturity: "",
                            premium: "", paidTotal: "", hasRenewableRider: false, isPaidUp: false,
                            silbiGen: "", coverages: {}
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
                    } else if (key === 'prem') {
                        processedContracts[contractIdx].premium = val;
                        processedContracts[contractIdx].isPaidUp = val.includes('완료');
                    } else if (key === 'silbi') {
                        processedContracts[contractIdx].silbiGen = val;
                    } else if (key === 'tot_prem_paid_') {
                        processedContracts[contractIdx].paidTotal = val;
                    } else {
                        if (!processedContracts[contractIdx].coverages) processedContracts[contractIdx].coverages = {};
                        processedContracts[contractIdx].coverages[key] = val;
                        if (key === 'd_careD_') {
                            delete processedContracts[contractIdx].coverages.d_careD_sum;
                            delete processedContracts[contractIdx].coverages.d_careD_text;
                        }
                        if (key === 'd_careS_') {
                            delete processedContracts[contractIdx].coverages.d_careS_sum;
                            delete processedContracts[contractIdx].coverages.d_careS_text;
                        }
                    }
                }
            }

            calculateRowSums();
            calculateTotalPremium();
            if (!isSummaryPage) saveCurrentPageEdits();
        });

        cell.addEventListener('paste', function(e) {
            e.preventDefault();
            const text = (e.originalEvent || e).clipboardData.getData('text/plain');
            document.execCommand('insertText', false, text);
        });
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRionEngine);
} else {
    initRionEngine();
}

// 5. 엑셀급 물리 그리드(Rowspan/Colspan 완벽 계산) 상하좌우/엔터 이동 제어
function buildVisualTableGrid(table) {
    const grid = [];
    const cellPos = new Map();
    const allRows = Array.from(table.querySelectorAll('thead tr, tbody tr'));

    allRows.forEach((tr, rIdx) => {
        if (!grid[rIdx]) grid[rIdx] = [];
        let cIdx = 0;
        Array.from(tr.children).forEach(cell => {
            while (grid[rIdx][cIdx]) cIdx++;
            const rs = cell.rowSpan || 1;
            const cs = cell.colSpan || 1;
            cellPos.set(cell, { r: rIdx, c: cIdx, rs, cs });
            for (let dr = 0; dr < rs; dr++) {
                if (!grid[rIdx + dr]) grid[rIdx + dr] = [];
                for (let dc = 0; dc < cs; dc++) {
                    grid[rIdx + dr][cIdx + dc] = cell;
                }
            }
            cIdx += cs;
        });
    });
    return { grid, cellPos, rowCount: grid.length, colCount: grid[0] ? grid[0].length : 16 };
}

function focusEditableCell(target) {
    if (!target) return;
    target.focus();
    const sel = window.getSelection();
    if (sel && target.childNodes.length > 0) {
        const range = document.createRange();
        range.selectNodeContents(target);
        range.collapse(false); // 커서를 텍스트 끝으로 자연스럽게 배치
        sel.removeAllRanges();
        sel.addRange(range);
    }
}

document.addEventListener('keydown', function(e) {
    if (e.key === 'F12') { e.preventDefault(); return; }
    if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i')) { e.preventDefault(); return; }
    if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) { e.preventDefault(); return; }
    if (e.ctrlKey && (e.key === 'C' || e.key === 'c')) {
        if (!(['INPUT', 'TEXTAREA'].includes(e.target.tagName) || e.target.isContentEditable)) {
            e.preventDefault();
            return;
        }
    }

    const cell = e.target.closest ? e.target.closest('.editable-cell') : null;
    if (!cell) return;

    const table = document.getElementById('analysisTable');
    if (!table) return;

    if (!['Enter', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;

    // 좌우 방향키는 텍스트 편집 중 커서가 양 끝에 있을 때만 셀 이동 허용
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        const sel = window.getSelection();
        const txtLen = (cell.innerText || "").length;
        if (txtLen > 0 && cell.innerText.trim() !== "-" && sel && sel.rangeCount > 0) {
            const range = sel.getRangeAt(0);
            if (!range.collapsed) return;
            const preRange = range.cloneRange();
            preRange.selectNodeContents(cell);
            preRange.setEnd(range.endContainer, range.endOffset);
            const offset = preRange.toString().length;
            if (e.key === 'ArrowLeft' && offset > 0) return;
            if (e.key === 'ArrowRight' && offset < txtLen) return;
        }
    }

    e.preventDefault();
    const { grid, cellPos, rowCount, colCount } = buildVisualTableGrid(table);
    const pos = cellPos.get(cell);
    if (!pos) return;

    // 마지막 기억 열(anchorCol)을 유지하여 병합 셀을 지나가도 원래 열(질병/상해)로 복귀
    let targetCol = (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'Enter')
        ? (typeof window._lastNavCol === 'number' && window._lastNavCol >= pos.c && window._lastNavCol < pos.c + pos.cs ? window._lastNavCol : pos.c)
        : pos.c;

    if (e.key === 'ArrowDown' || e.key === 'Enter') {
        for (let r = pos.r + pos.rs; r < rowCount; r++) {
            const next = grid[r] && grid[r][targetCol];
            if (next && next !== cell && next.classList.contains('editable-cell')) {
                window._lastNavCol = targetCol;
                focusEditableCell(next);
                break;
            }
        }
    } else if (e.key === 'ArrowUp') {
        for (let r = pos.r - 1; r >= 0; r--) {
            const next = grid[r] && grid[r][targetCol];
            if (next && next !== cell && next.classList.contains('editable-cell')) {
                window._lastNavCol = targetCol;
                focusEditableCell(next);
                break;
            }
        }
    } else if (e.key === 'ArrowRight') {
        for (let c = pos.c + pos.cs; c < colCount; c++) {
            const next = grid[pos.r] && grid[pos.r][c];
            if (next && next !== cell && next.classList.contains('editable-cell')) {
                window._lastNavCol = c;
                focusEditableCell(next);
                break;
            }
        }
    } else if (e.key === 'ArrowLeft') {
        for (let c = pos.c - 1; c >= 0; c--) {
            const next = grid[pos.r] && grid[pos.r][c];
            if (next && next !== cell && next.classList.contains('editable-cell')) {
                window._lastNavCol = c;
                focusEditableCell(next);
                break;
            }
        }
    }
});

// 6. PDF 업로드 및 클라우드 서버 통신
async function handlePdfUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

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

        if (!cloudRes.ok) throw new Error("클라우드 서버 통신에 실패했습니다.");

        const cloudData = await cloudRes.json();
        if (!cloudData.success) throw new Error("PDF 파싱 에러: " + (cloudData.error || "알 수 없는 오류"));

        rawCloudDataForExport = cloudData.rawExcelData;
        if (!rawCloudDataForExport) throw new Error("데이터를 추출할 수 없습니다. 보장분석 PDF인지 확인해주세요.");

        const btnRaw = document.getElementById('btnDownloadRaw');
        if (btnRaw) btnRaw.classList.remove('hidden');

        setTimeout(() => {
            extractDataDirectly(rawCloudDataForExport);
        }, 50);
    } catch (err) {
        alert("❌ 처리 중 오류 발생:\n" + err.message);
        loadingOverlay.style.display = 'none';
    }
    e.target.value = '';
}

function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
    });
}

// 7. 텍스트 정규화 및 퍼지 매칭 유틸리티
function toHalfWidth(str) {
    if (!str) return "";
    return String(str)
        .replace(/[\uFF01-\uFF5E]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0))
        .replace(/\u3000/g, ' ')
        .replace(/\|\|/g, 'II')
        .replace(/\u2160/g, 'I')
        .replace(/\u2161/g, 'II')
        .replace(/\u2162/g, 'III')
        .replace(/\u2163/g, 'IV')
        .replace(/\u2164/g, 'V');
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
        if (cKey.includes(normProd) || normProd.includes(cKey)) score += 100;
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

function parseSingleAmt(partStr) {
    if (!partStr) return 0;
    let str = toHalfWidth(String(partStr)).replace(/,/g, '').replace(/\s+/g, '');
    if (!str || str === "-" || (str.includes("지원") && !/\d/.test(str))) return 0;
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
    if (str.includes("천만")) return Math.round((parseFloat(str.replace(/[^0-9.]/g, '')) || 0) * 1000);
    if (str.includes("만")) return Math.round(parseFloat(str.split("만")[0].replace(/[^0-9.]/g, '')) || 0);
    if (str.includes("원")) return Math.round((parseFloat(str.replace(/[^0-9.]/g, '')) || 0) / 10000);
    return parseInt(str.replace(/[^0-9]/g, ''), 10) || 0;
}

function parseAmt(amtStr) {
    if (!amtStr) return 0;
    const s = String(amtStr);
    // "2,000만/1,500만" 또는 "2000/2000" 처럼 슬래시 병기 시 숫자 뭉침 버그 차단 (최대값 반환)
    if (s.includes('/')) {
        const parts = s.split('/').map(p => parseSingleAmt(p));
        return Math.max(0, ...parts);
    }
    return parseSingleAmt(s);
}

function formatSanjeongPair(brainAmt, heartAmt) {
    if (brainAmt <= 0 && heartAmt <= 0) return "";
    if (brainAmt > 0 && heartAmt > 0) {
        return brainAmt === heartAmt ? formatAmt(brainAmt) : `${formatAmt(brainAmt)}/${formatAmt(heartAmt)}`;
    }
    // 한쪽만 가입된 경우 뇌/심 위치가 명확히 보이도록 "2,000만/-" 또는 "-/2,000만" 표기
    return `${brainAmt > 0 ? formatAmt(brainAmt) : "-"}/${heartAmt > 0 ? formatAmt(heartAmt) : "-"}`;
}

function determineSilbiGeneration(dateStr, silbiDetails) {
    if (!dateStr || dateStr === "-") return "실손보유";
    const m = String(dateStr).match(/(\d{4})[-.](\d{2})[-.](\d{2})/);
    if (!m) return "실손보유";
    const ymd = parseInt(m[1] + m[2] + m[3], 10);

    let hospAmt = 0;
    let outAmt = 0;
    (silbiDetails || []).forEach(item => {
        if (item.name.includes("입원")) hospAmt = Math.max(hospAmt, item.amt);
        if (item.name.includes("통원") || item.name.includes("외래") || item.name.includes("처방")) outAmt += item.amt;
    });

    if (ymd < 20091001) {
        if (hospAmt >= 10000) return "1세대(1억)";
        if (hospAmt > 0 && outAmt > 0) return `1세대(${hospAmt}/${outAmt})`;
        return "1세대";
    } else if (ymd < 20170401) {
        return "2세대";
    } else if (ymd < 20210701) {
        return "3세대";
    } else if (ymd < 20260701) {
        return "4세대";
    } else {
        return "5세대";
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
                maturity = (st === "9999세" || st === "9999세만기") ? "종신" : st.replace(/만기$/, '');
            } else if (st.includes("미제공") || st.includes("납입완료") || /[\d,]+원/.test(st) || st === "-") {
                moneyCells.push(st);
            }
        });
    });

    if (payCycle === "일시납" && (!payTerm || payTerm === "0년")) payTerm = "일시납";
    if (moneyCells.length > 0) premium = moneyCells[0];
    if (moneyCells.length > 1 && moneyCells[1] !== "0원") paidTotal = moneyCells[1];

    return {
        no, comp, prod, date, payCycle, payTerm, maturity, premium, paidTotal,
        hasRenewableRider: prod.includes("갱신형"),
        isPaidUp: premium.includes("납입완료") || (payCycle === "일시납" && paidTotal === ""),
        hasSilbi: false, silbiDetails: [], silbiGen: "",
        covNums: {}, covTexts: {}, coverages: {}
    };
}

// 8. 다이렉트 정밀 매핑 엔진
// 8. 다이렉트 정밀 매핑 엔진 (수기입력본 기준 100% 반영)
function extractDataDirectly(rawExcelData) {
    const loadingOverlay = document.getElementById('loadingOverlay');
    try {
        let rawContracts = [];
        const contractSheet = rawExcelData["전체계약리스트"] || [];

        if (contractSheet.length > 0 && contractSheet[0][0]) {
            let rawTitle = toHalfWidth(contractSheet[0][0]);
            let match = rawTitle.match(/([가-힣a-zA-Z]+)\s*(?:\([^\)]+\))?\s*님의/);
            if (match) {
                document.getElementById('main-header-title').innerText = match[1] + "님의 보장분석표";
            }
        }

        const cRows = contractSheet.filter(r => r.length >= 6 && /^\d+$/.test(String(r[0]).trim()));
        cRows.forEach(r => rawContracts.push(parseContractRow(r)));

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
            if (!r || r.length < 4) return;

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

            // 구버전 추출본 호환 방어: 만약 구분 칸에 "정액상해사망..." 식으로 붙어 들어온 경우 자동 분리
            const gubunMerged = gubun.match(/^(정액|실손)(.+)$/);
            if (gubunMerged && !cDambo) {
                gubun = gubunMerged[1];
                cDambo = gubunMerged[2].trim();
            }
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

            // 주계약 상품명 자체가 갱신형이거나 기본계약 담보가 갱신형일 때만 계약 전체를 갱신형으로 표기
            if (prod.includes("갱신형") || ((cDambo.includes("기본계약") || cDambo.includes("주계약")) && cDambo.includes("갱신형"))) {
                c.hasRenewableRider = true;
            }

            let amtNum = parseAmt(amtStr);

            // 1) 실손 구분 처리 (실손의료비 vs 배상책임/화재벌금/운전자 비용담보)
            if (gubun === "실손") {
                if (combined.includes("입원의료비") || combined.includes("외래의료비") || combined.includes("통원의료비") || combined.includes("처방조제") || combined.includes("실손의료비") || combined.includes("3대비급여")) {
                    c.hasSilbi = true;
                    c.silbiDetails.push({ name: combined, amt: amtNum });
                    return;
                }
                if (combined.includes("배상책임")) {
                    maxCov(c, "d_liab_", amtNum); // 가족/일상배상 중복 피보험자 행은 최고 한도액(1억) 기준
                    return;
                }
                if (combined.includes("화재벌금") || combined.includes("화재배상") || combined.includes("누수") || combined.includes("급배수")) {
                    maxCov(c, "d_fire_", amtNum);
                    return;
                }
                if (combined.includes("교통사고처리지원금") && !cLower.includes("6주미만")) {
                    maxCov(c, "d_driver_", amtNum); // 운전자 대표 한도(교통사고처리지원금 2억 등) 표시
                    return;
                }
                if ((combined.includes("변호사선임") || combined.includes("자동차사고벌금") || combined.includes("교통사고벌금")) && !c.covNums["d_driver_"]) {
                    maxCov(c, "d_driver_", amtNum);
                    return;
                }
                return;
            }

            if (combined.includes("181일이상")) return;

            const isLifeOrWhole = c.prod.includes("종신") || c.prod.includes("정기") || c.comp.includes("생명") || c.comp.includes("라이프");
            const isDisease = cLower.includes("질병") || sLower.includes("질병");
            const isInjury = cLower.includes("상해") || cLower.includes("재해") || sLower.includes("상해") || sLower.includes("재해");

            // 2) 사망
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

            // 3) 후유장해 (3% 이상만 추출)
            if (sLower.includes("후유장해") || cLower.includes("후유장해") || cLower.includes("후유장애")) {
                if (combined.includes("80%") || combined.includes("50%") || combined.includes("20%") || sLower.includes("특정상해후유장해")) return;
                if (cLower.includes("3%") || cLower.includes("3~100") || cLower.includes("3-100") || sLower === "상해후유장해" || sLower === "질병후유장해") {
                    addCov(c, isDisease && !isInjury ? "d_disD_" : "d_disS_", amtNum);
                }
                return;
            }

            // 4) 입원비 > 간병 > 통합간호 & 지원/일당 (일반병원 기준, 연간 비용지원금/요양병원/상급병원 추가일당 제외)
            if (combined.includes("간호간병") || combined.includes("간호·간병")) {
                if (cLower.includes("지원금") || cLower.includes("지원비")) return;
                addCov(c, isInjury && !sLower.includes("질병") ? "d_careNS_" : "d_careN_", amtNum);
                return;
            }
            if (combined.includes("간병인")) {
                if (cLower.includes("지원금") || cLower.includes("입원지원비") || cLower.includes("연간")) return; // 2,914만 오인입 원천 차단
                const prefix = (isInjury && !sLower.includes("질병")) ? "d_careS_" : "d_careD_";
                if (cLower.includes("직접지원") || (cLower.includes("지원") && !cLower.includes("일당"))) {
                    c.covTexts[prefix] = "지원";
                } else if (cLower.includes("요양병원제외") || cLower.includes("요양/정신/한방병원제외") || (!cLower.includes("요양병원") && !cLower.includes("상급종합병원"))) {
                    // 일반병원 기준 간병인 일당만 반영 (비고란 '일반병원기준' 준수)
                    maxCov(c, prefix, amtNum);
                }
                return;
            }

            // 5) 입원비 > 입원 > 일반병원 / 상급1인실 / 수술입원 / 중환자실
            if (sLower.includes("입원일당") || cLower.includes("입원일당") || cLower.includes("입원비") || cLower.includes("신입원특약") || cLower.includes("임시생활비")) {
                if (cLower.includes("지원금") || cLower.includes("지원비") || cLower.includes("간병인")) return;
                if (sLower.includes("암입원") || sLower.includes("특정질병입원") || sLower.includes("여성/부인과") || sLower.includes("교통상해입원") || cLower.includes("치매입원") || cLower.includes("자동차사고")) return;

                const pfx = (isInjury && !sLower.includes("질병")) ? "S_" : "D_";
                if (combined.includes("중환자실")) {
                    addCov(c, "d_icu" + pfx, amtNum);
                } else if (combined.includes("수술입원")) {
                    addCov(c, "d_opHosp" + pfx, amtNum);
                } else if (combined.includes("1인실")) {
                    addCov(c, "d_1in" + pfx, amtNum); // 상급종합 1인실 + 종합병원 1인실
                } else if (cLower.includes("2-3인실") || cLower.includes("2~3인실") || cLower.includes("4-5인실") || cLower.includes("2~4인실")) {
                    return; // 다인실 입원비는 일반병원 입원일당에 섞이지 않도록 제외
                } else {
                    addCov(c, "d_hosp" + pfx, amtNum);
                }
                return;
            }

            // 6) 산정특례: 화상 산정특례 vs 뇌/심 산정특례(뇌/심 분리 집계)
            if (combined.includes("산정특례")) {
                if (combined.includes("화상")) {
                    maxCov(c, "d_burn_sanjeong_", amtNum);
                } else if (combined.includes("뇌혈관") || combined.includes("뇌졸중")) {
                    c.sanjeongBrain = (c.sanjeongBrain || 0) + amtNum;
                } else if (combined.includes("심장") || combined.includes("허혈")) {
                    c.sanjeongHeart = (c.sanjeongHeart || 0) + amtNum;
                }
                // 중증난치, 중증외상, 희귀질환 산정특례는 뇌/심 산정특례 칸에 섞지 않음
                return;
            }

            // 7) 말기질환 > 간/폐/신장 통합치료비 & 말기신부전증 (암/일반 통합치료비보다 먼저 판별)
            if (cLower.includes("간·폐·신장") || cLower.includes("간폐신장") || combined.includes("말기신부전") || combined.includes("말기간경화") || combined.includes("말기폐질환")) {
                maxCov(c, "d_kidney_", amtNum);
                return;
            }

            // 8) 암 진단 / 수술 / 항암방사선·약물 / 암치료비(최고 금액 1개만)
            if ((cLower.includes("암") || sLower.includes("고액항암")) && (cLower.includes("주요치료") || cLower.includes("특정치료") || cLower.includes("통합치료"))) {
                if (sLower === "암수술") {
                    maxCov(c, "d_cancer_op_", amtNum);
                } else if (sLower === "특정암수술") {
                    maxCov(c, "d_similar_op_", amtNum);
                } else if (!cLower.includes("유사암") && !cLower.includes("기타피부암") && !cLower.includes("갑상선암") && !cLower.includes("소액암")) {
                    // 암주요치료비, 비급여암치료비, 하이클래스암주요치료비, 암통합치료비 중 최고 금액 1개만 표시
                    maxCov(c, "d_cancer_main_", amtNum);
                }
                return;
            }

            if (combined.includes("항암") || combined.includes("표적항암") || combined.includes("면역항암")) {
                // 특정 부위 한정(여성생식기암, 유방암, 호르몬제 한정 등) 및 고액 중입자/양성자 단독특약이 기본 항암방사선/약물을 덮어쓰지 않도록 구분
                if (cLower.includes("여성생식기") || cLower.includes("호르몬") || cLower.includes("중입자") || cLower.includes("양성자") || cLower.includes("세기조절") || cLower.includes("하이클래스항암")) {
                    return;
                }
                if (cLower.includes("방사선") && cLower.includes("약물")) {
                    maxCov(c, "d_anti_rad_", amtNum);
                    maxCov(c, "d_anti_drug_", amtNum);
                } else if (cLower.includes("방사선")) {
                    maxCov(c, "d_anti_rad_", amtNum);
                } else if (cLower.includes("약물")) {
                    maxCov(c, "d_anti_drug_", amtNum);
                }
                return;
            }

            if (sLower.includes("유사암") || sLower.includes("소액암") || cLower.includes("유사암") || (cLower.includes("갑상선암") && !cLower.includes("제외"))) {
                if (combined.includes("수술")) maxCov(c, "d_similar_op_", amtNum);
                else if (combined.includes("진단") || sLower.includes("소액암")) addCov(c, "d_similar_", amtNum);
                return;
            }

            if (sLower === "암수술" || (cLower.includes("암") && cLower.includes("수술") && !cLower.includes("양성종양"))) {
                if (cLower.includes("갑상선암및전립선암)") && !cLower.includes("제외")) maxCov(c, "d_similar_op_", amtNum);
                else addCov(c, "d_cancer_op_", amtNum);
                return;
            }

            if (sLower === "암진단" || (cLower.includes("일반암") && cLower.includes("진단")) || (cLower.includes("암진단") && !cLower.includes("특정암") && !cLower.includes("전이암") && !cLower.includes("생식기암"))) {
                addCov(c, "d_cancer_", amtNum);
                return;
            }

            // 9) 뇌/심(순환계) 진단비 및 뇌/심(순환계)치료비
            if (cLower.includes("순환계") || ((cLower.includes("뇌혈관") || cLower.includes("허혈")) && (cLower.includes("주요치료") || cLower.includes("특정치료") || cLower.includes("통합치료")))) {
                maxCov(c, "d_circ_tot_", amtNum);
                return;
            }
            if (sLower === "뇌혈관질환진단" || (cLower.includes("뇌혈관") && cLower.includes("진단") && !cLower.includes("수술"))) { addCov(c, "d_brain_", amtNum); return; }
            if (sLower === "허혈성심장질환진단" || (cLower.includes("허혈성") && cLower.includes("진단") && !cLower.includes("수술"))) { addCov(c, "d_heart_", amtNum); return; }
            if (sLower === "뇌졸중진단" || sLower === "뇌출혈진단" || ((cLower.includes("뇌졸중") || cLower.includes("뇌출혈") || cLower.includes("뇌경색")) && (cLower.includes("진단") || sLower.includes("진단")))) {
                maxCov(c, "d_infarct_", amtNum);
                return;
            }
            if (sLower === "급성심근경색진단" || (cLower.includes("심근경색") && (cLower.includes("진단") || sLower.includes("진단")))) { addCov(c, "d_ami_", amtNum); return; }

            // 10) 골절 / 깁스 / 화상 / 장기요양(치매) / 운전자 / 배상
            if (sLower === "골절진단" || (cLower.includes("골절") && cLower.includes("진단") && !cLower.includes("5대골절") && !cLower.includes("중대골절") && !cLower.includes("척추골절") && !sLower.includes("중대골절"))) { addCov(c, "d_fracture_", amtNum); return; }
            if (sLower === "골절수술" || (cLower.includes("골절수술") && !cLower.includes("5대골절") && !cLower.includes("철심제거"))) { addCov(c, "d_fracture_op_", amtNum); return; }
            if (sLower === "깁스치료" || cLower.includes("깁스")) { addCov(c, "d_cast_", amtNum); return; }
            if (sLower === "화상진단" || sLower === "중대화상진단" || (cLower.includes("화상") && cLower.includes("진단"))) {
                if (sLower === "화상진단") addCov(c, "d_burn_", amtNum);
                else if (!c.covNums["d_burn_"]) addCov(c, "d_burn_", amtNum);
                return;
            }
            if (combined.includes("복지용구") || combined.includes("복지용품") || combined.includes("주야간보호") || combined.includes("주·야간보호")) { addCov(c, "d_dementia_welfare_", amtNum); return; }
            if (combined.includes("재가급여") || combined.includes("시설급여") || combined.includes("방문요양") || sLower.includes("장기간병요양진단")) { addCov(c, "d_dementia_home_", amtNum); return; }
            if (combined.includes("표적치매") || combined.includes("레켐비")) { maxCov(c, "d_dementia_target_", amtNum); return; }
            if (combined.includes("일상생활배상") || combined.includes("가족생활배상") || combined.includes("자녀배상")) { maxCov(c, "d_liab_", amtNum); return; }
            if (combined.includes("화재벌금") || combined.includes("급배수") || combined.includes("누수")) { maxCov(c, "d_fire_", amtNum); return; }

            // 11) 일반 치료비 > 수술비 (1~8종 독립 매핑 + 5종/8종 동시 병기 + 병원/종합/상급/통합)
            if ((cLower.includes("질병통합치료") || cLower.includes("상해통합치료")) && !cLower.includes("암") && !cLower.includes("간·폐")) {
                maxCov(c, isInjury ? "d_totS_" : "d_totD_", amtNum);
                return;
            }

            if (sLower === "질병종수술" || sLower === "상해종수술" || /\d+\s*[~-]\s*\d+\s*종\s*수술/.test(cDambo)) {
                const pfx = (sLower === "상해종수술" || (isInjury && !isDisease)) ? "S_" : "D_";

                // "_1종" ~ "_8종" 또는 "(1종)" ~ "(8종)" 개별 종수가 명시된 경우 해당 종수 칸에 정확히 입력
                let specificJong = cDambo.match(/_\s*(\d)\s*종/) || cDambo.match(/\(\s*(\d)\s*종\s*\)/);
                if (specificJong) {
                    const jNum = parseInt(specificJong[1], 10);
                    if (jNum >= 1 && jNum <= 8) maxCov(c, `d_op${jNum}${pfx}`, amtNum);
                    return;
                }
                // "5~8종 수술비(시술포함)" 또는 "1~5종 수술비(5종)"처럼 범위형인 경우 최대 종수(5종 또는 8종)에 입력 → 5종과 8종이 같이 있으면 5종/8종 각각 입력되고 6,7종은 비워짐!
                const allJongs = cDambo.match(/(\d)\s*종/g);
                if (allJongs) {
                    const maxJ = Math.max(...allJongs.map(m => parseInt(m, 10)));
                    if (maxJ >= 1 && maxJ <= 8) maxCov(c, `d_op${maxJ}${pfx}`, amtNum);
                    return;
                }
                maxCov(c, `d_op5${pfx}`, amtNum);
                return;
            }

            if (sLower === "질병수술" || sLower === "질병수술(유병자)" || sLower === "상해수술" || sLower === "상해수술(유병자)" ||
                ((cLower.includes("질병수술비") || cLower.includes("상해수술비") || cLower.includes("질병상급종합병원수술비") || cLower.includes("상해상급종합병원수술비") || cLower.includes("질병종합병원수술비") || cLower.includes("상해종합병원수술비") || cLower.includes("입원수술비") || cLower.includes("통원수술비")) &&
                 !cLower.includes("특정") && !cLower.includes("111대") && !cLower.includes("119대") && !cLower.includes("인공관절") && !cLower.includes("창상") && !cLower.includes("흉터") && !cLower.includes("관절"))) {
                const pfx = (sLower.includes("상해수술") || (isInjury && !isDisease)) ? "S_" : "D_";
                if (cLower.includes("상급종합병원") || cLower.includes("상급병원")) {
                    maxCov(c, "d_opHigh" + pfx, amtNum);
                } else if (cLower.includes("종합병원")) {
                    maxCov(c, "d_opGen" + pfx, amtNum);
                } else {
                    if (cLower.includes("통원수술") && c.covNums["d_opNorm" + pfx]) maxCov(c, "d_opNorm" + pfx, amtNum);
                    else addCov(c, "d_opNorm" + pfx, amtNum);
                }
            }
        });

        rawContracts.forEach(c => {
            Object.entries(c.covNums).forEach(([k, val]) => {
                if (val > 0) c.coverages[k] = formatAmt(val);
            });
            Object.entries(c.covTexts).forEach(([k, txt]) => {
                if (!c.covNums[k]) c.coverages[k] = txt;
            });

            // 뇌/심 산정특례 포맷 확정 (같으면 2,000만 / 다르면 2,000만/1,000만)
            if (c.sanjeongBrain > 0 || c.sanjeongHeart > 0) {
                c.coverages.d_sanjeong_ = formatSanjeongPair(c.sanjeongBrain || 0, c.sanjeongHeart || 0);
            }

            if (c.tempDieD > 0 || c.tempDieS > 0) {
                let d = c.tempDieD || 0;
                let s = c.tempDieS || 0;
                const isTermLife = c.prod.includes("정기");
                const lifeKey = isTermLife ? "d_lifeT_" : "d_life_";

                if (d > 0 && s > 0) {
                    let common = Math.min(d, s);
                    c.coverages[lifeKey] = formatAmt(common);
                    if (d > s) c.coverages.d_dieD_ = formatAmt(d - s);
                    if (s > d) c.coverages.d_dieS_ = formatAmt(s - d);
                } else if (d > 0) {
                    if (c.comp.includes("생명") || c.comp.includes("라이프")) c.coverages[lifeKey] = formatAmt(d);
                    else c.coverages.d_dieD_ = formatAmt(d);
                } else if (s > 0) {
                    c.coverages.d_dieS_ = formatAmt(s);
                }
            }

            if (c.hasSilbi || c.prod.includes("실손")) {
                c.silbiGen = determineSilbiGeneration(c.date, c.silbiDetails);
            }
        });

        if (rawContracts.length === 0) {
            alert("추출된 계약 정보가 없습니다. 엑셀 원문을 다운받아 구조를 확인하세요.");
            return;
        }

        processMappedData(rawContracts);
    } catch (err) {
        alert("❌ 데이터 매핑 중 오류 발생:\n" + err.message);
    } finally {
        if (loadingOverlay) loadingOverlay.style.display = 'none';
    }
}

// 9. 페이징, 실손 병합 및 렌더링
function processMappedData(rawContracts) {
    pageEdits = {};
    processedContracts = [];

    rawContracts.forEach(curr => {
        const currCompNorm = normalizeCompany(curr.comp);
        const currProdNorm = normalizeProductKey(curr.prod);
        const isCurrSilbiSplit = String(curr.premium).includes("미제공") || curr.premium === "-";

        let duplicate = processedContracts.find(p =>
            normalizeCompany(p.comp) === currCompNorm &&
            normalizeProductKey(p.prod) === currProdNorm &&
            p.date === curr.date &&
            (isCurrSilbiSplit || String(p.premium).includes("미제공") || p.premium === "-")
        );

        if (duplicate) {
            if (!isCurrSilbiSplit) {
                duplicate.premium = curr.premium;
                duplicate.payCycle = curr.payCycle || duplicate.payCycle;
                duplicate.payTerm = curr.payTerm || duplicate.payTerm;
                duplicate.maturity = curr.maturity || duplicate.maturity;
                duplicate.paidTotal = curr.paidTotal || duplicate.paidTotal;
                duplicate.isPaidUp = curr.isPaidUp;
            }
            if (curr.silbiGen) duplicate.silbiGen = curr.silbiGen;
            else if (!duplicate.silbiGen) duplicate.silbiGen = determineSilbiGeneration(duplicate.date, curr.silbiDetails);

            Object.entries(curr.coverages || {}).forEach(([k, v]) => {
                if (!duplicate.coverages[k] || duplicate.coverages[k] === "-") {
                    duplicate.coverages[k] = v;
                } else if (!String(v).includes("지원") && !String(duplicate.coverages[k]).includes("지원")) {
                    duplicate.coverages[k] = formatAmt(parseAmt(duplicate.coverages[k]) + parseAmt(v));
                }
            });
        } else {
            processedContracts.push({ ...curr });
        }
    });

    const regularPagesCount = Math.ceil(processedContracts.length / itemsPerPage);
    totalPages = regularPagesCount > 1 ? regularPagesCount + 1 : regularPagesCount;
    currentPage = 1;

    const pagEl = document.getElementById('pagination-container');
    if (pagEl) {
        if (totalPages > 1) pagEl.classList.remove('hidden');
        else pagEl.classList.add('hidden');
    }

    renderPage();
}

function renderPage() {
    const indEl = document.getElementById('page-indicator');
    if (indEl) indEl.innerText = `${currentPage} / ${totalPages}`;

    for (let i = 1; i <= 5; i++) {
        if (document.getElementById(`comp${i}`)) document.getElementById(`comp${i}`).innerText = "";
        if (document.getElementById(`prod${i}`)) document.getElementById(`prod${i}`).innerText = "";
        if (document.getElementById(`date${i}`)) document.getElementById(`date${i}`).innerText = "";
        if (document.getElementById(`term${i}`)) document.getElementById(`term${i}`).innerText = "";
        if (document.getElementById(`prem${i}`)) document.getElementById(`prem${i}`).innerText = "-";
        if (document.getElementById(`silbi${i}`)) document.getElementById(`silbi${i}`).innerText = "";
        if (document.getElementById(`tot_prem_paid_${i}`)) document.getElementById(`tot_prem_paid_${i}`).innerText = "";
        document.querySelectorAll(`td[id$="_${i}"]`).forEach(td => td.innerText = "");
    }
    if (document.getElementById('totalPremiumCell')) document.getElementById('totalPremiumCell').innerText = "-";

    const isSummaryPage = (totalPages > 1 && currentPage === totalPages);

    if (isSummaryPage) {
        document.getElementById('header-page-label').innerText = "총 합계";
        let grandTotalPremium = 0;
        const maxSummaryCols = Math.min(totalPages - 1, 5);

        for (let i = 1; i <= maxSummaryCols; i++) {
            const compEl = document.getElementById(`comp${i}`);
            if (compEl) {
                compEl.innerText = `${i}페이지`;
                compEl.style.color = "#d32f2f";
            }
            if (document.getElementById(`prod${i}`)) document.getElementById(`prod${i}`).innerText = "-";

            const pStart = (i - 1) * itemsPerPage;
            let pagePremiumSum = 0;
            let pageCoveragesSum = {};

            if (pageEdits[i]) {
                const mappingKeys = [
                    'd_life_', 'd_lifeT_', 'd_dieD_', 'd_dieS_', 'd_disD_', 'd_disS_', 'd_hospD_', 'd_hospS_', 'd_1inD_', 'd_1inS_',
                    'd_opHospD_', 'd_opHospS_', 'd_icuD_', 'd_icuS_', 'd_careD_', 'd_careS_', 'd_careN_', 'd_careNS_',
                    'd_op1D_', 'd_op1S_', 'd_op2D_', 'd_op2S_', 'd_op3D_', 'd_op3S_', 'd_op4D_', 'd_op4S_',
                    'd_op5D_', 'd_op5S_', 'd_op6D_', 'd_op6S_', 'd_op7D_', 'd_op7S_', 'd_op8D_', 'd_op8S_',
                    'd_opNormD_', 'd_opNormS_', 'd_opGenD_', 'd_opGenS_', 'd_opHighD_', 'd_opHighS_', 'd_totD_', 'd_totS_',
                    'd_cancer_', 'd_cancer_op_', 'd_similar_', 'd_similar_op_', 'd_anti_rad_', 'd_anti_drug_', 'd_cancer_main_',
                    'd_brain_', 'd_heart_', 'd_infarct_', 'd_ami_', 'd_sanjeong_', 'd_circ_tot_',
                    'd_dementia_welfare_', 'd_dementia_home_', 'd_dementia_target_', 'd_kidney_',
                    'd_fracture_', 'd_fracture_op_', 'd_cast_', 'd_burn_', 'd_burn_sanjeong_',
                    'd_driver_', 'd_liab_', 'd_fire_'
                ];

                for (let col = 1; col <= 5; col++) {
                    const contractIdx = (i - 1) * itemsPerPage + (col - 1);
                    if (processedContracts[contractIdx]) {
                        let premVal = pageEdits[i][`prem${col}`] || "";
                        if (!premVal.includes("완료") && !premVal.includes("납입완료")) {
                            pagePremiumSum += parsePremium(premVal);
                        }
                        mappingKeys.forEach(k => {
                            let cVal = pageEdits[i][`${k}${col}`] || "";
                            if (cVal && !cVal.includes("지원")) {
                                pageCoveragesSum[k] = (pageCoveragesSum[k] || 0) + parseAmt(cVal);
                            }
                        });
                    }
                }
            } else {
                const pData = processedContracts.slice(pStart, pStart + itemsPerPage);
                pData.forEach(c => {
                    if (!c.isPaidUp) pagePremiumSum += parsePremium(c.premium);
                    if (c.coverages) {
                        for (let key in c.coverages) {
                            let val = c.coverages[key];
                            if (String(val).includes("지원")) continue;
                            let num = parseAmt(val);
                            pageCoveragesSum[key] = (pageCoveragesSum[key] || 0) + num;
                        }
                    }
                });
            }

            if (document.getElementById(`prem${i}`)) {
                document.getElementById(`prem${i}`).innerText = formatPremium(pagePremiumSum);
                document.getElementById(`prem${i}`).style.color = "#1d4ed8";
            }
            grandTotalPremium += pagePremiumSum;

            if (document.getElementById(`prem${i}`)) {
                document.getElementById(`prem${i}`).innerText = formatPremium(pagePremiumSum);
                document.getElementById(`prem${i}`).style.color = "#1d4ed8";
            }
            grandTotalPremium += pagePremiumSum;

            // ▼▼▼ ④번 코드가 들어간 자리 시작 ▼▼▼
            let sanjeongBrainPage = 0, sanjeongHeartPage = 0, hasSanjeongPage = false;
            if (pageEdits[i]) {
                for (let col = 1; col <= 5; col++) {
                    const sv = (pageEdits[i][`d_sanjeong_${col}`] || "").trim();
                    if (!sv || sv === "-") continue;
                    hasSanjeongPage = true;
                    if (sv.includes('/')) {
                        const [bp, hp] = sv.split('/');
                        sanjeongBrainPage += parseSingleAmt(bp);
                        sanjeongHeartPage += parseSingleAmt(hp);
                    } else {
                        const v = parseSingleAmt(sv);
                        sanjeongBrainPage += v;
                        sanjeongHeartPage += v;
                    }
                }
            } else {
                const pData = processedContracts.slice(pStart, pStart + itemsPerPage);
                pData.forEach(c => {
                    const sv = (c.coverages && c.coverages.d_sanjeong_ || "").trim();
                    if (!sv || sv === "-") return;
                    hasSanjeongPage = true;
                    if (sv.includes('/')) {
                        const [bp, hp] = sv.split('/');
                        sanjeongBrainPage += parseSingleAmt(bp);
                        sanjeongHeartPage += parseSingleAmt(hp);
                    } else {
                        const v = parseSingleAmt(sv);
                        sanjeongBrainPage += v;
                        sanjeongHeartPage += v;
                    }
                });
            }

            const sumCells = document.querySelectorAll(`td[id$="_${i}"].sum-target`);
            sumCells.forEach(cell => {
                let dataKey = cell.getAttribute('data-key');
                if (dataKey === 'd_sanjeong_') {
                    if (hasSanjeongPage) cell.innerText = formatSanjeongPair(sanjeongBrainPage, sanjeongHeartPage);
                } else {
                    let sumVal = pageCoveragesSum[dataKey] || pageCoveragesSum[dataKey + "sum"] || 0;
                    if (sumVal > 0) cell.innerText = formatAmt(sumVal);
                }
            });
        }
        document.getElementById('totalPremiumCell').innerText = formatPremium(grandTotalPremium);

    } else {
        document.getElementById('header-page-label').innerText = "페이지 합계";

        if (pageEdits[currentPage]) {
            const edits = pageEdits[currentPage];
            document.querySelectorAll('.editable-cell').forEach(cell => {
                if (cell.id && edits[cell.id] !== undefined) {
                    cell.innerText = edits[cell.id];
                }
            });
        } else {
            const startIndex = (currentPage - 1) * itemsPerPage;
            const pageData = processedContracts.slice(startIndex, startIndex + itemsPerPage);
            let currentPageSum = 0;

            pageData.forEach((contract, index) => {
                const idNum = index + 1;

                if (document.getElementById(`comp${idNum}`)) {
                    document.getElementById(`comp${idNum}`).innerText = contract.comp;
                    document.getElementById(`comp${idNum}`).style.color = "#1d4ed8";
                }
                if (document.getElementById(`prod${idNum}`)) document.getElementById(`prod${idNum}`).innerText = contract.prod;
                if (document.getElementById(`date${idNum}`)) document.getElementById(`date${idNum}`).innerText = contract.date;

                let termStr = `${contract.payTerm}/${contract.maturity}`;
                if (contract.hasRenewableRider) termStr = `갱신형/${contract.maturity}`;
                if (document.getElementById(`term${idNum}`)) document.getElementById(`term${idNum}`).innerText = termStr;

                const premEl = document.getElementById(`prem${idNum}`);
                if (premEl) {
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

                if (contract.paidTotal && document.getElementById(`tot_prem_paid_${idNum}`)) {
                    document.getElementById(`tot_prem_paid_${idNum}`).innerText = contract.paidTotal;
                }

                if (contract.silbiGen && document.getElementById(`silbi${idNum}`)) {
                    document.getElementById(`silbi${idNum}`).innerText = contract.silbiGen;
                }

                if (contract.coverages) {
                    const cov = contract.coverages;

                    if (cov.d_careD_ !== undefined) document.getElementById(`d_careD_${idNum}`).innerText = cov.d_careD_;
                    else if (cov.d_careD_sum) document.getElementById(`d_careD_${idNum}`).innerText = formatAmt(cov.d_careD_sum);
                    else if (cov.d_careD_text) document.getElementById(`d_careD_${idNum}`).innerText = cov.d_careD_text;

                    if (cov.d_careS_ !== undefined) document.getElementById(`d_careS_${idNum}`).innerText = cov.d_careS_;
                    else if (cov.d_careS_sum) document.getElementById(`d_careS_${idNum}`).innerText = formatAmt(cov.d_careS_sum);
                    else if (cov.d_careS_text) document.getElementById(`d_careS_${idNum}`).innerText = cov.d_careS_text;

                    const mappings = [
                        'd_life_', 'd_lifeT_', 'd_dieD_', 'd_dieS_', 'd_disD_', 'd_disS_', 'd_hospD_', 'd_hospS_', 'd_1inD_', 'd_1inS_',
                        'd_opHospD_', 'd_opHospS_', 'd_icuD_', 'd_icuS_', 'd_careN_', 'd_careNS_',
                        'd_op1D_', 'd_op1S_', 'd_op2D_', 'd_op2S_', 'd_op3D_', 'd_op3S_', 'd_op4D_', 'd_op4S_',
                        'd_op5D_', 'd_op5S_', 'd_op6D_', 'd_op6S_', 'd_op7D_', 'd_op7S_', 'd_op8D_', 'd_op8S_',
                        'd_opNormD_', 'd_opNormS_', 'd_opGenD_', 'd_opGenS_', 'd_opHighD_', 'd_opHighS_', 'd_totD_', 'd_totS_',
                        'd_cancer_', 'd_cancer_op_', 'd_similar_', 'd_similar_op_', 'd_anti_rad_', 'd_anti_drug_', 'd_cancer_main_',
                        'd_brain_', 'd_heart_', 'd_infarct_', 'd_ami_', 'd_sanjeong_', 'd_circ_tot_',
                        'd_dementia_welfare_', 'd_dementia_home_', 'd_dementia_target_', 'd_kidney_',
                        'd_fracture_', 'd_fracture_op_', 'd_cast_', 'd_burn_', 'd_burn_sanjeong_',
                        'd_driver_', 'd_liab_', 'd_fire_', 'tot_prem_paid_'
                    ];

                    mappings.forEach(key => {
                        if (cov[key] && document.getElementById(`${key}${idNum}`)) {
                            document.getElementById(`${key}${idNum}`).innerText = cov[key];
                        }
                    });
                }
            });
            document.getElementById('totalPremiumCell').innerText = formatPremium(currentPageSum);
        }
    }

    calculateRowSums();
    if (!isSummaryPage) calculateTotalPremium();
}

function saveCurrentPageEdits() {
    if (processedContracts.length === 0) return;
    if (totalPages > 1 && currentPage === totalPages) return;

    let currentEdits = {};
    document.querySelectorAll('.editable-cell').forEach(cell => {
        if (cell.id) currentEdits[cell.id] = cell.innerText;
    });
    pageEdits[currentPage] = currentEdits;
}

function calculateRowSums() {
    const uniqueKeys = new Set();
    document.querySelectorAll('.sum-target').forEach(cell => uniqueKeys.add(cell.getAttribute('data-key')));

    uniqueKeys.forEach(key => {
        const resCell = document.getElementById(`res_${key}`);
        if (!resCell) return;

        // 산정특례(뇌/심) 전용 합산: "2,000만/1,000만" 및 단일값("2,000만"=뇌2000/심2000) 모두 정확히 분리 합산
        if (key === 'd_sanjeong_') {
            let sumB = 0, sumH = 0, hasAny = false;
            for (let i = 1; i <= 5; i++) {
                const cell = document.getElementById(`${key}${i}`);
                if (!cell) continue;
                const txt = cell.innerText.trim();
                if (!txt || txt === "-") continue;
                hasAny = true;
                if (txt.includes('/')) {
                    const [bPart, hPart] = txt.split('/');
                    sumB += parseSingleAmt(bPart);
                    sumH += parseSingleAmt(hPart);
                } else {
                    const v = parseSingleAmt(txt);
                    sumB += v;
                    sumH += v;
                }
            }
            resCell.innerText = hasAny ? formatSanjeongPair(sumB, sumH) : "-";
            return;
        }

        let rowSum = 0;
        let hasText = false;
        for (let i = 1; i <= 5; i++) {
            const cell = document.getElementById(`${key}${i}`);
            if (cell && cell.innerText.trim() !== "" && cell.innerText.trim() !== "-") {
                let textVal = cell.innerText.trim();
                if (textVal.includes("지원")) hasText = true;
                else rowSum += parseAmt(textVal);
            }
        }

        if (hasText && rowSum === 0) resCell.innerText = "지원";
        else resCell.innerText = formatAmt(rowSum);
    });
}

function calculateTotalPremium() {
    let pagePremiumSum = 0;
    for (let i = 1; i <= 5; i++) {
        const cell = document.getElementById(`prem${i}`);
        if (cell && cell.innerText) {
            pagePremiumSum += parsePremium(cell.innerText);
        }
    }
    const totalCell = document.getElementById('totalPremiumCell');
    if (totalCell) totalCell.innerText = formatPremium(pagePremiumSum);
}

function changePage(step) {
    saveCurrentPageEdits();
    let newPage = currentPage + step;
    if (newPage < 1) newPage = 1;
    if (newPage > totalPages) newPage = totalPages;
    if (newPage !== currentPage) {
        currentPage = newPage;
        renderPage();
    }
}

// 10. 전체 페이지 다중 인쇄 엔진
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

    for (let p = 1; p <= totalPages; p++) {
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

// [수정 후] 기존 function exportRawToExcel() { ... } 전체를 아래 코드로 교체
function exportRawToExcel() {
    if (!rawCloudDataForExport) {
        alert("아직 추출된 데이터가 없습니다. PDF를 먼저 업로드 해주세요.");
        return;
    }
    const wb = XLSX.utils.book_new();
    let sheetAdded = false;

    for (const [sheetName, dataRows] of Object.entries(rawCloudDataForExport)) {
        const rows = (Array.isArray(dataRows) && dataRows.length > 0) ? dataRows : [["추출된 데이터 없음"]];
        const ws = XLSX.utils.aoa_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, sheetName.substring(0, 31));
        sheetAdded = true;
    }

    if (!sheetAdded) {
        const ws = XLSX.utils.aoa_to_sheet([["추출된 시트가 없습니다."]]);
        XLSX.utils.book_append_sheet(wb, ws, "확인필요");
    }

    XLSX.writeFile(wb, `잇츠리온_원문데이터정렬본.xlsx`);
}
window.exportRawToExcel = exportRawToExcel;

async function exportToExcel() {
    if (processedContracts.length === 0) return alert("데이터가 없습니다.");
    saveCurrentPageEdits();

    const wb = XLSX.utils.book_new();
    const originalPage = currentPage;

    for (let p = 1; p <= totalPages; p++) {
        currentPage = p;
        renderPage();
        await new Promise(r => setTimeout(r, 80));

        const table = document.getElementById("analysisTable");
        const ws = XLSX.utils.table_to_sheet(table, { raw: true });

        const range = XLSX.utils.decode_range(ws['!ref']);
        const merges = ws['!merges'] || [];

        // 병합된 영역의 시작 셀 정보를 미리 매핑하여 병합 내부/외곽 모두 동일한 배경·테두리 유지
        const mergeMasterMap = {};
        merges.forEach(m => {
            const masterRef = XLSX.utils.encode_cell({ c: m.s.c, r: m.s.r });
            for (let r = m.s.r; r <= m.e.r; r++) {
                for (let c = m.s.c; c <= m.e.c; c++) {
                    mergeMasterMap[XLSX.utils.encode_cell({ c, r })] = { masterRef, s: m.s, e: m.e };
                }
            }
        });

        const grayKeywords = [
            "구분", "구 분", "보험회사", "상품명", "계약일자", "납입기간/만기",
            "사망", "종신(생명)", "일반", "정기", "손해", "사망(80세)", "질병", "상해",
            "장애", "후유장애", "3%이상", "입원비", "입원", "일반병원", "상급1인실", "수술입원", "중환자실",
            "간병", "지원/일당", "통합간호", "일반 치료비", "수술비",
            "수술 1종", "수술 2종", "수술 3종", "수술 4종", "수술 5종", "수술 6종", "수술 7종", "수술 8종",
            "병원", "종합병원", "상급병원", "통합(입원/수술포함)",
            "암", "일반암", "진단비", "기타실피", "항암치료", "항암방사선", "항암약물", "암치료비", "암주요치료비",
            "뇌/심(순환계)", "뇌혈관", "허혈성", "뇌경색", "급성심근경색", "산정특례", "산정특례(뇌/심)", "뇌/심(순환계)치료비",
            "장기요양(치매)", "복지용품+주야간이용", "방문/재가/생활비", "표적치료제(치매비)",
            "말기질환", "말기신부전증", "간/폐/신장 통합치료비",
            "골절", "깁스", "화상", "실손의료비", "세대(1~5세대)",
            "법률비용", "운전자(현황급부)", "운전자(현물급부)", "일상생활배상책임", "화재보험/누수",
            "보험료", "보험료(월)", "총 납입보험료", "페이지 합계", "비고", "총보험료", "총 합계"
        ];

        // 행별 동적 높이 배열 준비 (내용이 잘리지 않도록 여유 높이 확보)
        const rowHeights = [];

        for (let R = range.s.r; R <= range.e.r; ++R) {
            if (R === 0) rowHeights[R] = { hpt: 28 };        // 최상단 녹색 타이틀
            else if (R === 1) rowHeights[R] = { hpt: 22 };   // 보험회사 행
            else if (R === 2) rowHeights[R] = { hpt: 38 };   // 상품명 행 (2~3줄 상품명 잘림 방지)
            else if (R === 3 || R === 4) rowHeights[R] = { hpt: 20 }; // 계약일자 / 납입기간 행
            else if (R >= range.e.r - 1) rowHeights[R] = { hpt: 22 }; // 하단 보험료 / 총납입보험료 행
            else rowHeights[R] = { hpt: 19 };                // 일반 담보 행

            for (let C = range.s.c; C <= range.e.c; ++C) {
                const cell_ref = XLSX.utils.encode_cell({ c: C, r: R });
                const mInfo = mergeMasterMap[cell_ref];
                const isMergedChild = mInfo && mInfo.masterRef !== cell_ref;

                // ★ 핵심 픽스: 빈 문자열("")이면 xlsx-js-style이 테두리를 누락시키므로, 비어있는 단일/마스터 셀에는 공백 1칸(" ") 부여
                if (!ws[cell_ref]) {
                    ws[cell_ref] = { t: 's', v: isMergedChild ? '' : ' ' };
                } else {
                    ws[cell_ref].t = 's';
                    const rawVal = String(ws[cell_ref].v ?? '');
                    ws[cell_ref].v = (!isMergedChild && rawVal === '') ? ' ' : rawVal;
                }

                let cell = ws[cell_ref];
                const masterCell = mInfo ? (ws[mInfo.masterRef] || cell) : cell;
                const checkStr = String(masterCell.v || "").trim();

                // 텍스트 줄 수에 맞춰 행 높이 추가 자동 확장 (단일 행 셀 기준)
                if (!mInfo || mInfo.s.r === mInfo.e.r) {
                    const lineCount = checkStr.split('\n').length;
                    if (lineCount >= 2) {
                        const neededHpt = Math.max(rowHeights[R].hpt, lineCount * 14 + 6);
                        rowHeights[R] = { hpt: neededHpt };
                    }
                }

                let isGray = false;
                for (let kw of grayKeywords) {
                    if (checkStr === kw || checkStr.includes("장해지급률80%") || checkStr.includes("(갑/기/경/제)") || checkStr.includes("(5-인지지원등급)") || checkStr.includes("암치료비") || checkStr.includes("단위 만원")) {
                        isGray = true;
                        break;
                    }
                }

                const effCol = mInfo ? mInfo.s.c : C;
                const isSummaryCol = (effCol === 13 || effCol === 14);
                const isHeaderRow = (R === 0);
                const isSubGrayHeader = (!isHeaderRow && (isGray || effCol < 3 || (effCol === 15 && R <= 4)));

                // 매 셀마다 완전히 독립된 새 스타일 및 4면 실선(thin #000000) 객체 주입
                const cellStyle = {
                    font: {
                        name: "맑은 고딕",
                        sz: isHeaderRow ? 12 : (R === 2 && effCol >= 3 && effCol <= 12 ? 8.5 : 9),
                        bold: isHeaderRow || isSubGrayHeader || isSummaryCol || (R === 1 && effCol >= 3 && effCol <= 12) || R >= range.e.r - 1,
                        color: {
                            rgb: isHeaderRow ? "FFFFFF"
                                : (isSummaryCol && R >= 5 && R < range.e.r - 1) ? "DC2626"
                                : (R === 1 && effCol >= 3 && effCol <= 12) ? "1D4ED8"
                                : (R >= range.e.r - 1 && effCol === 15) ? "1E40AF"
                                : "000000"
                        }
                    },
                    alignment: {
                        vertical: "center",
                        horizontal: "center",
                        wrapText: true
                    },
                    fill: {
                        patternType: "solid",
                        fgColor: {
                            rgb: isHeaderRow ? "2CA02C" : (isSubGrayHeader ? "F2F4F7" : "FFFFFF")
                        }
                    },
                    border: {
                        top: { style: "thin", color: { rgb: "000000" } },
                        bottom: { style: "thin", color: { rgb: "000000" } },
                        left: { style: "thin", color: { rgb: "000000" } },
                        right: { style: "thin", color: { rgb: "000000" } }
                    }
                };

                // "납입완료" 텍스트는 엑셀에서도 붉은색 강조 유지
                if (checkStr.includes("납입완료") && R >= range.e.r - 1) {
                    cellStyle.font.color = { rgb: "DC2626" };
                }

                cell.s = cellStyle;
            }
        }

        // 칸에 맞춰 모든 텍스트(금액, 산정특례 슬래시, 상품명, 총납입보험료)가 한눈에 들어오도록 열 너비 최적화
        ws['!cols'] = [
            { wch: 10 }, { wch: 10 }, { wch: 14 }, // 구분 대/중/소분류 (글자 꺾임 최소화)
            { wch: 9.5 }, { wch: 9.5 },            // 계약 1 (질병 / 상해, 병합 시 19)
            { wch: 9.5 }, { wch: 9.5 },            // 계약 2
            { wch: 9.5 }, { wch: 9.5 },            // 계약 3
            { wch: 9.5 }, { wch: 9.5 },            // 계약 4
            { wch: 9.5 }, { wch: 9.5 },            // 계약 5
            { wch: 11 }, { wch: 11 },              // 페이지 합계 (질병 / 상해)
            { wch: 18 }                            // 비고 / 총보험료
        ];
        ws['!rows'] = rowHeights;

        // 엑셀 인쇄 페이지 설정 (가로 방향 1페이지 폭 맞춤 기본 세팅)
        ws['!pageSetup'] = { orientation: 'landscape', fitToWidth: 1, fitToHeight: 1 };

        let sheetName = (p === totalPages && totalPages > 1) ? "총합계" : `보장분석_${p}P`;
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
    }

    currentPage = originalPage;
    renderPage();

    // [수정 후] 표 1행 제목('OOO님의 보장분석표') 연동 및 한국 시간 기준 날짜 적용
    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const rawHeaderTitle = (document.getElementById('main-header-title')?.innerText || '보장분석표').trim();
    const safeTitle = rawHeaderTitle.replace(/\s+/g, ' ').replace(/[\\/:*?"<>|]/g, '');

    XLSX.writeFile(wb, `잇츠리온-${safeTitle}(${dateStr}).xlsx`);
}

// 12. AI 실손 세대 검증 및 특약 매핑 정밀 보완
async function runAIVerification() {
    if (processedContracts.length === 0) return alert("먼저 PDF 원본 데이터를 업로드하세요.");
    const AI_PROXY_URL = "https://script.google.com/macros/s/AKfycbwz9QL6wb6GUlgygtnMOwsvXzbA2eZuhx-JIXQc-1TZCiAWZdV0IUxaqg7GbcMoO72P/exec";
    document.getElementById('progressTitle').innerText = "AI 실손/오류 정밀 검수 중...";
    document.getElementById('loadingOverlay').style.display = 'flex';

    const prompt = [
        "당신은 최고 수준의 보험 보장분석 검수 AI입니다.",
        "아래 1차로 매핑된 보장분석 데이터(JSON)를 검토하세요.",
        "[요청사항]",
        "1. 각 계약의 가입일자(date)와 기존 silbiGen 값을 확인하고, 실손 담보가 있는 계약의 세대 표기(1세대 3000/10, 1세대 1억, 2세대 표준화, 3세대 착한실손, 4세대 실손, 5세대 실손 등)를 정밀하게 다듬으세요. (실손이 없는 계약은 빈 문자열 유지)",
        "2. coverages 객체 내 금액 포맷(예: 1,000만, 1억, 1억 5,000만)을 유지하고 명백한 오매핑만 보정하세요.",
        "3. 결과를 반드시 순수 JSON 배열 포맷으로만 반환하세요. 마크다운 기호나 설명은 금지합니다.",
        "",
        JSON.stringify(processedContracts)
    ].join("\n");

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
    } catch (e) {
        alert("AI 검수 오류: " + e.message);
    } finally {
        document.getElementById('loadingOverlay').style.display = 'none';
    }
}

// 13. 메인 창 자동 로그아웃 방지 및 우클릭/드래그 차단
(function keepRionSessionAlive() {
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
})();

document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});

document.addEventListener('selectstart', function(e) {
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName) || e.target.isContentEditable) return;
    e.preventDefault();
});
