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

        // ★ 수기 입력 완벽 저장소 ★
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
                                comp: "", prod: "", date: "", payCycle: "", payTerm: "", maturity: "", premium: "",
                                hasRenewableRider: false, isPaidUp: false, silbiGen: "", coverages: {}
                            };
                        }

                        const val = e.target.innerText.trim();
                        if (key === 'comp') processedContracts[contractIdx].comp = val;
                        else if (key === 'prod') processedContracts[contractIdx].prod = val;
                        else if (key === 'date') processedContracts[contractIdx].date = val;
                        else if (key === 'term') { /* ignore */ }
                        else if (key === 'prem') {
                            processedContracts[contractIdx].premium = val;
                            processedContracts[contractIdx].isPaidUp = val.includes('완료');
                        }
                        else if (key === 'silbi') processedContracts[contractIdx].silbiGen = val;
                        else {
                            if (!processedContracts[contractIdx].coverages) processedContracts[contractIdx].coverages = {};
                            processedContracts[contractIdx].coverages[key] = val;
                        }
                    }
                }

                calculateRowSums();
                calculateTotalPremium();
            });

            cell.addEventListener('paste', function(e) {
                e.preventDefault();
                var text = (e.originalEvent || e).clipboardData.getData('text/plain');
                document.execCommand('insertText', false, text);
            });
        });

        // 🚨 서버 추출 통신 🚨
        document.getElementById('pdfUpload').addEventListener('change', async function(e) {
            const file = e.target.files[0];
            if(!file) return;

            const loadingOverlay = document.getElementById('loadingOverlay');
            try {
                loadingOverlay.style.display = 'flex';
                document.getElementById('progressTitle').innerText = "클라우드 엑셀 추출 및 연산 중...";
                document.getElementById('progressDesc').innerText = "서버에서 정렬된 원문을 바탕으로 화면에 즉시 렌더링합니다.";

                const base64data = await getBase64(file);
                const CLOUD_PARSER_URL = "https://insuranceanalysis-225817792244.asia-northeast3.run.app"; 

                const cloudRes = await fetch(CLOUD_PARSER_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ file_data: base64data })
                });

                if(!cloudRes.ok) throw new Error("클라우드 서버 통신에 실패했습니다.");

                const cloudData = await cloudRes.json();
                if(!cloudData.success) throw new Error("PDF 파싱 에러: " + (cloudData.error || "알 수 없는 오류"));

                rawCloudDataForExport = cloudData.rawExcelData; 
                if(!rawCloudDataForExport) throw new Error("데이터를 추출할 수 없습니다. 보장분석 PDF인지 확인해주세요.");

                document.getElementById('btnDownloadRaw').classList.remove('hidden');

                setTimeout(() => {
                    extractDataDirectly(rawCloudDataForExport);
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

        function parseAmt(amtStr) {
            if (!amtStr) return 0;
            if (String(amtStr).includes("지원")) return 0;
            let str = String(amtStr).replace(/,/g, '');
            let uk = 0, man = 0;
            if (str.includes("억")) {
                let parts = str.split("억");
                uk = parseInt(parts[0].replace(/[^0-9]/g, '')) || 0;
                man = parseInt(parts[1] ? parts[1].replace(/[^0-9]/g, '') : '0') || 0;
            } else {
                man = parseInt(str.replace(/[^0-9]/g, '')) || 0;
            }
            return (uk * 10000) + man;
        }

        function formatAmt(num) {
            if (num === 0) return "-";
            if (num >= 10000) {
                let uk = Math.floor(num / 10000);
                let man = num % 10000;
                return man > 0 ? `${uk}억 ${man.toLocaleString()}만` : `${uk}억`;
            }
            return num.toLocaleString() + "만";
        }

        function parsePremium(premStr) {
            if (!premStr || premStr === "-" || String(premStr).includes("미제공") || String(premStr).includes("완료") || String(premStr).includes("납입완료")) return 0;
            return parseInt(String(premStr).replace(/[^0-9]/g, ''), 10) || 0;
        }

        function formatPremium(num) {
            return num === 0 ? "-" : num.toLocaleString() + "원";
        }

        // ==========================================
        // 🚨 다이렉트 자바스크립트 맵핑 엔진
        // ==========================================
        function extractDataDirectly(rawExcelData) {
            let rawContracts = [];

            const contractSheet = rawExcelData["전체계약리스트"] || [];
            if (contractSheet.length > 0 && contractSheet[0][0]) {
                let rawTitle = contractSheet[0][0];
                let match = rawTitle.match(/([가-힣a-zA-Z]+)(?:\([^\)]+\))?님의/);
                if (match) {
                    document.getElementById('main-header-title').innerText = match[1] + "님의 보장분석표";
                }
            }

            const cRows = contractSheet.filter(r => r.length >= 6 && !isNaN(parseInt(r[0])));
            cRows.forEach(r => {
                rawContracts.push({
                    no: r[0], comp: r[1], prod: r[2], date: r[3], payCycle: r[4], payTerm: r[5], maturity: r[6], premium: r[7] || "",
                    hasRenewableRider: false, isPaidUp: false, silbiGen: "", coverages: {}
                });
            });

            const detailSheet = rawExcelData["가입담보상세"] || [];
            detailSheet.forEach(r => {
                if(r.length < 7) return;

                let comp = r[1] || "", prod = r[2] || "", gubun = r[3] || "", cDambo = r[4] || "", sDambo = r[5] || "", amtStr = r[6] || "";

                if (r[0] === "MARKER" && gubun === "납입완료") {
                    let c = rawContracts.find(c => c.comp === comp && c.prod === prod);
                    if (c) { c.isPaidUp = true; c.premium = "납입완료"; }
                    return;
                }

                if (!isNaN(parseInt(r[0]))) {
                    let c = rawContracts.find(c => c.comp === comp && c.prod === prod);
                    if (!c) return;

                    if(cDambo.includes("갱신형") || sDambo.includes("갱신형") || prod.includes("갱신형")) {
                        c.hasRenewableRider = true;
                    }

                    let dambo = cDambo.trim();
                    if(dambo === "기본계약" || dambo.includes("기본계약")) {
                        dambo = dambo + " " + sDambo; 
                    } else {
                        dambo = cDambo + " " + sDambo;
                    }

                    if (dambo.includes("181일이상")) return;

                    let amtNum = parseAmt(amtStr);
                    let targetKey = "";

                    if(dambo.includes("질병사망") || dambo.includes("상해사망") || dambo.includes("재해사망") || dambo.includes("사망보험금") || dambo.includes("사망_주계약")) {
                        if(prod.includes("종신") || comp.includes("생명") || comp.includes("라이프")) {
                            if(dambo.includes("질병") || dambo.includes("일반") || dambo.includes("주계약")) c.tempDieD = (c.tempDieD || 0) + amtNum;
                            else c.tempDieS = (c.tempDieS || 0) + amtNum;
                        } else {
                            targetKey = (dambo.includes("질병") || dambo.includes("일반사망")) ? "d_dieD_" : "d_dieS_";
                        }
                    }
                    else if(dambo.includes("후유장애") || dambo.includes("후유장해")) {
                        if(dambo.includes("3%")) targetKey = dambo.includes("질병") ? "d_disD_" : "d_disS_";
                    }
                    else if((dambo.includes("입원일당") || dambo.includes("입원비") || dambo.includes("입원통원") || dambo.includes("임시생활비")) && !dambo.includes("간병인")) {
                        let prefix = dambo.includes("질병") ? "d" : "s";
                        if(dambo.includes("수술")) targetKey = prefix === "d" ? "d_opHospD_" : "d_opHospS_";
                        else if(dambo.includes("상급1인실")) targetKey = prefix === "d" ? "d_1inD_" : "d_1inS_";
                        else if(dambo.includes("중환자실")) targetKey = prefix === "d" ? "d_icuD_" : "d_icuS_";
                        else targetKey = prefix === "d" ? "d_hospD_" : "d_hospS_";
                    }
                    else if(dambo.includes("간병인") || dambo.includes("간호간병")) {
                        let isSupport = dambo.includes("직접") || dambo.includes("직접지원") || dambo.includes("지원비");
                        let prefix = dambo.includes("질병") ? "d_careD_" : "d_careS_";
                        if(isSupport) c.coverages[prefix + "text"] = "지원";
                        else c.coverages[prefix + "sum"] = (c.coverages[prefix + "sum"] || 0) + amtNum;
                    }
                    else if(dambo.includes("수술비") && !dambo.includes("입원")) {
                        let prefix = dambo.includes("질병") ? "D_" : "S_";
                        let jongMatch = dambo.match(/(\d+)종/g);
                        if(jongMatch) {
                            let maxJong = Math.max(...jongMatch.map(m => parseInt(m)));
                            targetKey = `d_op${maxJong}${prefix}`;
                        } else if(dambo.includes("상급")) targetKey = "d_opHigh" + prefix;
                        else if(dambo.includes("종합")) targetKey = "d_opGen" + prefix;
                        else if (!dambo.includes("암") && !dambo.includes("뇌") && !dambo.includes("심장")) targetKey = "d_opNorm" + prefix;
                    }
                    else if(dambo.includes("통합치료비")) targetKey = dambo.includes("질병") ? "d_totD_" : "d_totS_";
                    else if(dambo.includes("산정특례")) {
                        if(dambo.includes("화상")) targetKey = "d_burn_sanjeong_";
                        else targetKey = "d_sanjeong_";
                    }
                    else if(dambo.includes("뇌/심") || dambo.includes("순환계")) targetKey = "d_circ_tot_";
                    else if(dambo.includes("항암방사선")) targetKey = "d_anti_rad_";
                    else if(dambo.includes("항암약물")) targetKey = "d_anti_drug_";
                    else if(dambo.includes("암주요치료비")) targetKey = "d_cancer_main_";
                    else if(dambo.includes("유사암") || dambo.includes("기타피부암")) {
                        targetKey = dambo.includes("수술") ? "d_similar_op_" : "d_similar_";
                    }
                    else if(dambo.includes("암") && dambo.includes("수술")) targetKey = "d_cancer_op_";
                    else if(dambo.includes("암") && dambo.includes("진단")) targetKey = "d_cancer_";
                    else if(dambo.includes("뇌혈관") && !dambo.includes("수술")) targetKey = "d_brain_";
                    else if(dambo.includes("허혈성") && !dambo.includes("수술")) targetKey = "d_heart_";
                    else if(dambo.includes("뇌경색") && !dambo.includes("수술")) targetKey = "d_infarct_";
                    else if(dambo.includes("심근경색") && !dambo.includes("수술")) targetKey = "d_ami_";
                    else if(dambo.includes("복지용품") || dambo.includes("주야간")) targetKey = "d_dementia_welfare_";
                    else if(dambo.includes("방문") || dambo.includes("재가") || dambo.includes("생활비")) targetKey = "d_dementia_home_";
                    else if(dambo.includes("표적치료제") && dambo.includes("치매")) targetKey = "d_dementia_target_";
                    else if(dambo.includes("말기신부전증")) targetKey = "d_kidney_";
                    else if(dambo.includes("골절") && dambo.includes("수술")) targetKey = "d_fracture_op_";
                    else if(dambo.includes("골절진단") || dambo.includes("골절")) targetKey = "d_fracture_";
                    else if(dambo.includes("깁스")) targetKey = "d_cast_";
                    else if(dambo.includes("화상") && dambo.includes("진단")) targetKey = "d_burn_";
                    else if(dambo.includes("배상")) targetKey = "d_liab_";
                    else if(dambo.includes("운전자") || dambo.includes("교통") || dambo.includes("변호사")) targetKey = "d_driver_";
                    else if(dambo.includes("화재") || dambo.includes("누수")) targetKey = "d_fire_";

                    if (targetKey) c.coverages[targetKey] = formatAmt(amtNum);
                }
            });

            rawContracts.forEach(c => {
                if(c.tempDieD > 0 || c.tempDieS > 0) {
                    let d = c.tempDieD || 0; let s = c.tempDieS || 0;
                    let minVal = Math.min(d, s);
                    if(d > 0 && s === 0) minVal = d;
                    if(s > 0 && d === 0) minVal = s;
                    c.coverages.d_lifeT_ = formatAmt(minVal);
                    if(d > s && s > 0) c.coverages.d_dieD_ = formatAmt(d - s);
                    if(s > d && d > 0) c.coverages.d_dieS_ = formatAmt(s - d);
                }
            });

            if (rawContracts.length === 0) {
                alert("추출된 계약 정보가 없습니다. 엑셀 원문을 다운받아 구조를 확인하세요.");
                document.getElementById('loadingOverlay').style.display = 'none';
                return;
            }

            processMappedData(rawContracts);
            document.getElementById('loadingOverlay').style.display = 'none';
        }

        // ==========================================
        // 페이징, 합산 및 실손 병합
        // ==========================================
        function processMappedData(rawContracts) {
            pageEdits = {}; 
            processedContracts = [];
            rawContracts.forEach(curr => {
                processedContracts.push({ ...curr, silbiGen: "" });
            });

            const regularPagesCount = Math.ceil(processedContracts.length / itemsPerPage);
            totalPages = regularPagesCount > 1 ? regularPagesCount + 1 : regularPagesCount;
            currentPage = 1;

            if(totalPages > 1) document.getElementById('pagination-container').classList.remove('hidden');
            else document.getElementById('pagination-container').classList.add('hidden');

            renderPage();
        }

        function renderPage() {
            document.getElementById('page-indicator').innerText = `${currentPage} / ${totalPages}`;

            for(let i=1; i<=5; i++) {
                if(document.getElementById(`comp${i}`)) document.getElementById(`comp${i}`).innerText = "";
                if(document.getElementById(`prod${i}`)) document.getElementById(`prod${i}`).innerText = "";
                if(document.getElementById(`date${i}`)) document.getElementById(`date${i}`).innerText = "";
                if(document.getElementById(`term${i}`)) document.getElementById(`term${i}`).innerText = "";
                if(document.getElementById(`prem${i}`)) document.getElementById(`prem${i}`).innerText = "-";
                if(document.getElementById(`silbi${i}`)) document.getElementById(`silbi${i}`).innerText = "";
                document.querySelectorAll(`td[id$="_${i}"]`).forEach(td => td.innerText = "");
            }
            document.getElementById('totalPremiumCell').innerText = "-";

            const isSummaryPage = (totalPages > 1 && currentPage === totalPages);

            if (isSummaryPage) {
                document.getElementById('header-page-label').innerText = "총 합계";
                let grandTotalPremium = 0;
                const maxSummaryCols = Math.min(totalPages - 1, 5); 

                for(let i=1; i<=maxSummaryCols; i++) {
                    const compEl = document.getElementById(`comp${i}`);
                    if(compEl) {
                        compEl.innerText = `${i}페이지`;
                        compEl.style.color = "#d32f2f";
                    }
                    if(document.getElementById(`prod${i}`)) document.getElementById(`prod${i}`).innerText = "-";

                    const pStart = (i - 1) * itemsPerPage;
                    let pageDataToSum = [];
                    if (pageEdits[i]) {
                        pageDataToSum = pageEdits[i];
                    } else {
                        const pData = processedContracts.slice(pStart, pStart + itemsPerPage);
                        pData.forEach(c => pageDataToSum.push(c));
                    }

                    let pagePremiumSum = 0;
                    let pageCoveragesSum = {};

                    if (pageEdits[i]) {
                        const mappingKeys = [
                            'd_life_', 'd_lifeT_', 'd_dieD_', 'd_dieS_', 'd_disD_', 'd_disS_', 'd_hospD_', 'd_hospS_', 'd_1inD_', 'd_1inS_',
                            'd_opHospD_', 'd_opHospS_', 'd_icuD_', 'd_icuS_', 'd_careD_', 'd_careS_', 'd_careN_', 'd_careNS_',
                            'd_op1D_', 'd_op1S_', 'd_op2D_', 'd_op2S_',
                            'd_op3D_', 'd_op3S_', 'd_op4D_', 'd_op4S_', 'd_op5D_', 'd_op5S_', 'd_op6D_', 'd_op6S_',
                            'd_op7D_', 'd_op7S_', 'd_op8D_', 'd_op8S_', 'd_opNormD_', 'd_opNormS_', 'd_opGenD_', 'd_opGenS_',
                            'd_opHighD_', 'd_opHighS_', 'd_totD_', 'd_totS_', 'd_cancer_', 'd_cancer_op_', 'd_similar_', 'd_similar_op_',
                            'd_anti_rad_', 'd_anti_drug_', 'd_cancer_main_',
                            'd_brain_', 'd_heart_', 'd_infarct_', 'd_ami_', 'd_sanjeong_', 'd_circ_tot_',
                            'd_dementia_welfare_', 'd_dementia_home_', 'd_dementia_target_', 'd_kidney_',
                            'd_fracture_', 'd_fracture_op_', 'd_cast_', 'd_burn_', 'd_burn_sanjeong_',
                            'd_driver_', 'd_liab_', 'd_fire_'
                        ];

                        for(let col = 1; col <= 5; col++) {
                            const contractIdx = (i - 1) * itemsPerPage + (col - 1);
                            if (processedContracts[contractIdx]) {
                                let premVal = pageEdits[i][`prem${col}`] || "";
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

                    if(document.getElementById(`prem${i}`)) {
                        document.getElementById(`prem${i}`).innerText = formatPremium(pagePremiumSum);
                        document.getElementById(`prem${i}`).style.color = "#1d4ed8";
                    }
                    grandTotalPremium += pagePremiumSum;

                    const sumCells = document.querySelectorAll(`td[id$="_${i}"].sum-target`);
                    sumCells.forEach(cell => {
                        let dataKey = cell.getAttribute('data-key');
                        let sumVal = pageCoveragesSum[dataKey] || pageCoveragesSum[dataKey+"sum"] || 0;
                        if(sumVal > 0) cell.innerText = formatAmt(sumVal);
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

                        if(document.getElementById(`comp${idNum}`)) {
                            document.getElementById(`comp${idNum}`).innerText = contract.comp;
                            document.getElementById(`comp${idNum}`).style.color = "#1d4ed8";
                        }
                        if(document.getElementById(`prod${idNum}`)) document.getElementById(`prod${idNum}`).innerText = contract.prod;
                        if(document.getElementById(`date${idNum}`)) document.getElementById(`date${idNum}`).innerText = contract.date;

                        let termStr = `${contract.payTerm}/${contract.maturity}`;
                        if (contract.hasRenewableRider) termStr = `갱신형/${contract.maturity}`;
                        if(document.getElementById(`term${idNum}`)) document.getElementById(`term${idNum}`).innerText = termStr;

                        const premEl = document.getElementById(`prem${idNum}`);
                        if(premEl) {
                            if (contract.isPaidUp || contract.premium.includes("완료") || contract.premium.includes("납입완료")) {
                                premEl.innerText = "납입완료";
                                premEl.style.color = "#d32f2f";
                                premEl.style.fontWeight = "900";
                            } else {
                                premEl.innerText = contract.premium; 
                                premEl.style.color = "#1d4ed8";
                                premEl.style.fontWeight = "bold";
                                currentPageSum += parsePremium(contract.premium);
                            }
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
                                'd_opHospD_', 'd_opHospS_', 'd_icuD_', 'd_icuS_', 'd_op1D_', 'd_op1S_', 'd_op2D_', 'd_op2S_',
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

        // 🚨 페이지 이동 전 수기 입력 저장 로직 🚨
        function saveCurrentPageEdits() {
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

                const resCell = document.getElementById(`res_${key}`);
                if(resCell) {
                    if(hasText && rowSum === 0) resCell.innerText = "지원";
                    else resCell.innerText = formatAmt(rowSum);
                }
            });
        }

        function calculateTotalPremium() {
            let pagePremiumSum = 0;
            for(let i=1; i<=5; i++) {
                const cell = document.getElementById(`prem${i}`);
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
        // 🚨 전체 페이지 다중 인쇄 엔진 (원본 양식 유지) 🚨
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
                    .no-print { display: none !important; }
                    #print-area { display: block !important; width: 100%; }
                    .page-break { page-break-after: always; margin-bottom: 30px; }
                    * { -webkit-print-color-adjust: exact !important; color-adjust: exact !important; print-color-adjust: exact !important; }
                    table.excel-table { width: 100% !important; min-width: 0 !important; font-size: 7.5pt !important; }
                    .excel-table th, .excel-table td { padding: 2.5px 1px !important; line-height: 1.1 !important; word-break: normal !important; border: 1px solid #000 !important; }
                }
            `;
            document.head.appendChild(style);

            for(let p = 1; p <= totalPages; p++) {
                currentPage = p;
                renderPage();
                await new Promise(r => setTimeout(r, 100)); 

                const tableClone = document.getElementById('analysisTable').cloneNode(true);
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
        // 🚨 엑셀 통합 다운로드 엔진 (100% 균일한 테두리 및 서식 유지) 🚨
        // ==========================================
        function exportRawToExcel() {
            if(!rawCloudDataForExport) {
                alert("아직 추출된 데이터가 없습니다. PDF를 먼저 업로드 해주세요.");
                return;
            }
            const wb = XLSX.utils.book_new();
            for (const [sheetName, dataRows] of Object.entries(rawCloudDataForExport)) {
                if(dataRows.length > 0) {
                    const ws = XLSX.utils.aoa_to_sheet(dataRows);
                    XLSX.utils.book_append_sheet(wb, ws, sheetName);
                }
            }
            XLSX.writeFile(wb, `잇츠리온_원문데이터정렬본.xlsx`);
        }

        async function exportToExcel() {
            if (processedContracts.length === 0) return alert("데이터가 없습니다.");
            saveCurrentPageEdits(); 

            const wb = XLSX.utils.book_new();
            const originalPage = currentPage;

            for(let p = 1; p <= totalPages; p++) {
                currentPage = p;
                renderPage(); 

                await new Promise(r => setTimeout(r, 100)); 

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

                        // 모든 셀 테두리 강제 부여
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

                ws['!cols'] = [{wch: 6}, {wch: 6}, {wch: 8}, {wch: 11}, {wch: 11}, {wch: 11}, {wch: 11}, {wch: 11}, {wch: 8}, {wch: 8}, {wch: 15}];

                let sheetName = (p === totalPages && totalPages > 1) ? "총합계" : `보장분석_${p}P`;
                XLSX.utils.book_append_sheet(wb, ws, sheetName);
            }

            currentPage = originalPage;
            renderPage();

            const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            XLSX.writeFile(wb, `잇츠리온_보장분석표_${dateStr}_전체통합본.xlsx`);
        }

        // ==========================================
        // AI: 오직 실손 세대 파악 및 누락 검수만 진행
        // ==========================================
        async function runAIVerification() {
            if (processedContracts.length === 0) return alert("먼저 PDF 원본 데이터를 업로드하세요.");
            const AI_PROXY_URL = "https://script.google.com/macros/s/AKfycbwz9QL6wb6GUlgygtnMOwsvXzbA2eZuhx-JIXQc-1TZCiAWZdV0IUxaqg7GbcMoO72P/exec";
            document.getElementById('progressTitle').innerText = "AI 실손/오류 정밀 검수 중...";
            document.getElementById('loadingOverlay').style.display = 'flex';

            const prompt = `
당신은 최고 수준의 보험 보장분석 검수 AI입니다.
아래 1차로 맵핑된 데이터(JSON)를 검토하세요.
[요청사항]
1. 각 계약의 가입일자를 확인하고, '실손' 관련 내용이 있다면 "silbiGen" 속성에 실비 세대(1세대~4세대 등)를 기입하세요.
2. 금액이나 담보 맵핑에 명백한 누락이나 오류가 있다면 수정하세요.
3. 결과를 반드시 JSON 포맷으로만 반환하세요. 마크다운(\`\`\`)은 금지합니다.

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
                renderPage();
                alert("AI 검수 및 실손 세대 맵핑이 완료되었습니다.");
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
