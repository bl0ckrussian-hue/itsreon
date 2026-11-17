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

function closeDoneModal() {
  const m = document.getElementById('done-modal');
  if (m) m.style.display = 'none';
}

const selectedIds = JSON.parse(sessionStorage.getItem('rion_selected_insurers') || '[]');
if (selectedIds.length === 0) {
  alert('선택된 보험사가 없습니다. 보험사 선택 화면으로 이동합니다.');
  window.location.replace('./claim.html');
}

const allInsurers = [...INSURER_DB.life, ...INSURER_DB.nonLife];
const selectedObjects = allInsurers.filter(ins => selectedIds.includes(ins.id));

let attachedMedicalFiles = [];
let generatedPdfFiles = []; // 모바일팩스 Web Share 공유용 메모리 객체
let sigCanvas, sigCtx, isDrawing = false, hasSigned = false;

// 메인 관리자 판별 (김성철 지사장님 계정 또는 메인 관리자 권한 허용)
const MAIN_ADMIN_ROLES = ['메인관리자', '최고관리자', '대표관리자', 'master', 'superadmin', 'admin', '관리자'];
const MAIN_ADMIN_ONLY_USERS = ['김성철'];

function isMainAdmin() {
  const getVal = (k) => (localStorage.getItem(k) || sessionStorage.getItem(k) || '').trim();
  let role = getVal('rion_logged_role') || getVal('userRole') || getVal('role');
  let user = getVal('rion_logged_user') || getVal('rion_logged_id') || getVal('userId');
  if (user === '김성철') return true;
  const r = role.toLowerCase();
  if (!r || r.includes('부관리') || r.includes('sub')) return false;
  if (MAIN_ADMIN_ONLY_USERS.length > 0 && !MAIN_ADMIN_ONLY_USERS.includes(user)) return false;
  return MAIN_ADMIN_ROLES.includes(r);
}

function initPage() {
  const mapperBtn = document.getElementById('admin-mapper-btn');
  if (mapperBtn && isMainAdmin()) {
    mapperBtn.style.display = 'inline-block';
  }

  document.getElementById('selected-fax-list').innerHTML = selectedObjects.map(ins => `
    <div class="fax-item">
      <div>
        <strong>${ins.name}</strong>
        <div style="font-size:11px; color:#6b7280; margin-top:2px;">콜센터: ${ins.call}</div>
      </div>
      <div style="display:flex; align-items:center;">
        ${ins.faxType === 'virtual'
          ? `<span class="badge-virtual">가상팩스</span>
             <input type="tel" id="virtual-fax-${ins.id}" placeholder="발급받은 번호 입력" style="margin-left:6px; padding:4px 8px; border:1px solid #cbd5e1; border-radius:6px; font-size:12px; width:135px;">`
          : `<strong style="color:#1e3a8a;">${ins.fax}</strong>
             <button type="button" class="copy-fax-btn" onclick="copyFaxNumber('${ins.fax}', '${ins.name}')">번호복사</button>`
        }
      </div>
    </div>
  `).join('');

  document.getElementById('accidentDate').value = new Date().toISOString().split('T')[0];
}

function copyFaxNumber(fax, name) {
  navigator.clipboard.writeText(fax).then(() => {
    alert(`[${name}] 팩스번호(${fax})가 클립보드에 복사되었습니다.`);
  });
}

// 모바일팩스 앱 실행 또는 미설치 시 스토어 이동
function installMobileFaxStore() {
  const ua = navigator.userAgent;
  if (/Android/i.test(ua)) {
    window.location.href = "intent://send#Intent;scheme=mobilefax;package=com.dho.mobilefax;end";
  } else if (/iPhone|iPad|iPod/i.test(ua)) {
    window.open("https://apps.apple.com/kr/app/id958704925", "_blank");
  } else {
    window.open("https://play.google.com/store/apps/details?id=com.dho.mobilefax", "_blank");
  }
}

// 스마트폰에서 생성된 PDF 파일을 모바일팩스 앱으로 즉시 공유 (원래 있던 함수)
async function sharePdfToMobileFax(idx, faxNum, insName) {
  if (faxNum && !faxNum.includes('가상팩스')) {
    try { await navigator.clipboard.writeText(faxNum); } catch (e) {}
  }
  const fileObj = generatedPdfFiles[idx];
  if (fileObj && navigator.canShare && navigator.canShare({ files: [fileObj] })) {
    try {
      await navigator.share({
        title: `${insName} 보험금청구서`,
        text: `팩스번호(${faxNum})가 복사되었습니다. 공유 목록에서 [모바일팩스]를 선택하세요.`,
        files: [fileObj]
      });
      return;
    } catch (err) {
      console.log('공유 취소 또는 실패:', err);
    }
  }
  alert(`팩스번호(${faxNum})가 복사되었습니다.\n모바일팩스 앱을 열어 다운로드된 PDF 파일을 첨부해주세요.`);
  installMobileFaxStore();
}

// ▼▼▼ [4-① 시작] 여기서부터 새로 추가되는 코드입니다 ▼▼▼
function isMobileEnv() {
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

// [PC 전용] 윈도우 표준 '다른 이름으로 저장' 창 호출 (바탕화면·다운로드 폴더 제한 없음)
async function saveSinglePdfWithPicker(idx, btnEl) {
  const fileObj = generatedPdfFiles[idx];
  if (!fileObj) return;
  if (window.showSaveFilePicker) {
    try {
      const handle = await window.showSaveFilePicker({
        id: 'rion_claim_pdf',     // 직전에 선택한 저장 폴더를 다음 파일 저장 시에도 자동 기억
        startIn: 'downloads',
        suggestedName: fileObj.name,
        types: [{ description: 'PDF 문서', accept: { 'application/pdf': ['.pdf'] } }]
      });
      const writable = await handle.createWritable();
      await writable.write(fileObj);
      await writable.close();
      if (btnEl) {
        btnEl.textContent = '✅ 저장 완료 (재저장)';
        btnEl.style.background = '#059669';
      }
      return;
    } catch (err) {
      if (err.name === 'AbortError') return; // 창 닫기/취소 시 조용히 종료
    }
  }
  triggerBrowserDownload(fileObj);
}

// [PC 전용] 모달 하단 버튼 (1개일 땐 폴더 지정 창, 여러 개일 땐 오류 없는 일괄 자동 다운로드)
async function saveAllPdfsAction() {
  if (generatedPdfFiles.length === 0) return;
  if (generatedPdfFiles.length === 1 && window.showSaveFilePicker) {
    await saveSinglePdfWithPicker(0);
    return;
  }
  generatedPdfFiles.forEach((f, i) => {
    setTimeout(() => triggerBrowserDownload(f), i * 250);
  });
}

function triggerBrowserDownload(fileObj) {
  const url = URL.createObjectURL(fileObj);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileObj.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
// ▲▲▲ [4-① 끝] 바로 아래에 원래 있던 autoHyphenPhone 함수가 이어집니다 ▲▲▲

function autoHyphenPhone(el) {
  el.value = el.value.replace(/[^0-9]/g, '').replace(/^(\d{2,3})(\d{3,4})(\d{4})$/, `$1-$2-$3`);
}

// 다중 서명 패드 상태 저장소
let sigPadsMap = {};
let sigStepReady = false;

function resetSignatureStep() {
  if (!sigStepReady) return;
  sigStepReady = false;
  document.getElementById('dynamic-sig-section').style.display = 'none';
  document.getElementById('start-sig-btn').style.display = 'block';
  document.getElementById('generate-btn').style.display = 'none';
}

function setInputLock(ids, locked) {
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.readOnly = locked;
    el.classList.toggle('readonly-locked', locked);
  });
}

function updateMinorGuardianUI() {
  const rrn1 = document.getElementById('insuredRrn1').value.trim();
  const rrn2 = document.getElementById('insuredRrn2').value.trim();
  const box = document.getElementById('minor-guardian-box');
  if (!box) return;

  const hasRrn = (rrn1.length === 6 && rrn2.length >= 1);
  const age = hasRrn ? calcKoreanAge(rrn1, rrn2) : 30;
  const isMinor = hasRrn && age < 19;

  box.style.display = isMinor ? 'block' : 'none';
  if (isMinor) {
    document.getElementById('minor-age-badge').textContent =
      `👪 만 ${age}세 미성년자 청구 — 친권자(법정대리인) 정보 확인`;
    syncGuardianFromHolder();
  }
}

function syncGuardianFromHolder() {
  const sameChk = document.getElementById('guardianSameAsHolder');
  const gNameEl = document.getElementById('guardianInputName');
  const gRelEl = document.getElementById('guardianRel');
  if (!sameChk || !gNameEl) return;

  const bSameIns = document.getElementById('beneficiarySameAsInsured').checked;
  const hSameIns = document.getElementById('holderSameAsInsured').checked;
  const bName = document.getElementById('beneficiaryName').value.trim();
  const hName = document.getElementById('holderName').value.trim();
  const bRel = document.getElementById('relToInsured')?.value.trim() || '';

  if (sameChk.checked) {
    if (!bSameIns) {
      gNameEl.value = bName;
      if (bRel && bRel !== '본인' && gRelEl) gRelEl.value = bRel;
      setInputLock(['guardianInputName'], true);
    } else if (!hSameIns) {
      gNameEl.value = hName;
      setInputLock(['guardianInputName'], true);
    } else {
      setInputLock(['guardianInputName'], false);
    }
  } else {
    setInputLock(['guardianInputName'], false);
  }
  resetSignatureStep();
}

function syncGuardianRelToBeneficiary() {
  const gRel = document.getElementById('guardianRel')?.value.trim() || '';
  const bSameIns = document.getElementById('beneficiarySameAsInsured').checked;
  const bSameHold = document.getElementById('beneficiarySameAsHolder').checked;
  const gSameHold = document.getElementById('guardianSameAsHolder')?.checked;
  if (!bSameIns && bSameHold && gSameHold && gRel) {
    document.getElementById('relToInsured').value = gRel;
  }
}

function toggleRelationFields() {
  const hSame = document.getElementById('holderSameAsInsured').checked;
  const bSame = document.getElementById('beneficiarySameAsInsured').checked;

  document.getElementById('holder-extra-box').style.display = hSame ? 'none' : 'block';
  setInputLock(['holderName', 'holderRrn1', 'holderRrn2'], hSame);

  document.getElementById('beneficiary-extra-box').style.display = bSame ? 'none' : 'block';
  document.getElementById('ben-same-holder-wrap').style.display = (!bSame && !hSame) ? 'flex' : 'none';

  if (bSame) {
    document.getElementById('beneficiarySameAsHolder').checked = false;
    document.getElementById('relToInsured').value = '본인';
    document.getElementById('isBeneficiaryDesignated').value = 'yes';
    setInputLock(['beneficiaryName'], true);
  } else {
    const bSameH = document.getElementById('beneficiarySameAsHolder').checked;
    setInputLock(['beneficiaryName', 'beneficiaryRrn1', 'beneficiaryRrn2', 'beneficiaryPhone', 'beneficiaryJob', 'beneficiaryAddress'], bSameH);
  }

  syncSamePerson();
  updateMinorGuardianUI();
  resetSignatureStep();
}

function onHolderSameInsuredChange() {
  if (!document.getElementById('holderSameAsInsured').checked) {
    ['holderName', 'holderRrn1', 'holderRrn2', 'holderPhone', 'holderJob', 'holderAddress'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
  }
  toggleRelationFields();
}

function onBeneficiarySameInsuredChange() {
  if (!document.getElementById('beneficiarySameAsInsured').checked) {
    ['beneficiaryName', 'beneficiaryRrn1', 'beneficiaryRrn2', 'beneficiaryPhone', 'beneficiaryJob', 'beneficiaryAddress'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    document.getElementById('relToInsured').value = document.getElementById('guardianRel')?.value.trim() || '';
  }
  toggleRelationFields();
}

function onBeneficiarySameHolderChange() {
  toggleRelationFields();
  syncHolderToBeneficiary();
  syncGuardianRelToBeneficiary();
}

function syncHolderToBeneficiary() {
  syncGuardianFromHolder();
  if (document.getElementById('beneficiarySameAsInsured').checked) return;
  if (!document.getElementById('beneficiarySameAsHolder').checked) return;
  document.getElementById('beneficiaryName').value = document.getElementById('holderName').value;
  document.getElementById('beneficiaryRrn1').value = document.getElementById('holderRrn1').value;
  document.getElementById('beneficiaryRrn2').value = document.getElementById('holderRrn2').value;
  document.getElementById('beneficiaryPhone').value = document.getElementById('holderPhone').value;
  document.getElementById('beneficiaryJob').value = document.getElementById('holderJob').value;
  document.getElementById('beneficiaryAddress').value = document.getElementById('holderAddress').value;
  resetSignatureStep();
}

function syncSamePerson() {
  resetSignatureStep();
  const iName = document.getElementById('insuredName').value;
  const iRrn1 = document.getElementById('insuredRrn1').value;
  const iRrn2 = document.getElementById('insuredRrn2').value;
  const iPhone = document.getElementById('insuredPhone').value;
  const iJob = document.getElementById('insuredJob').value;
  const iAddr = document.getElementById('insuredAddress').value;

  if (document.getElementById('holderSameAsInsured').checked) {
    document.getElementById('holderName').value = iName;
    document.getElementById('holderRrn1').value = iRrn1;
    document.getElementById('holderRrn2').value = iRrn2;
    document.getElementById('holderPhone').value = iPhone;
    document.getElementById('holderJob').value = iJob;
    document.getElementById('holderAddress').value = iAddr;
  }

  if (document.getElementById('beneficiarySameAsInsured').checked) {
    document.getElementById('beneficiaryName').value = iName;
    document.getElementById('beneficiaryRrn1').value = iRrn1;
    document.getElementById('beneficiaryRrn2').value = iRrn2;
    document.getElementById('beneficiaryPhone').value = iPhone;
    document.getElementById('beneficiaryJob').value = iJob;
    document.getElementById('beneficiaryAddress').value = iAddr;
  }

  updateMinorGuardianUI();
}

// 복구된 UI 제어 및 파일 첨부 함수 5종
function toggleAutoTransferAccount() {
  const isAuto = document.getElementById('useAutoTransfer').checked;
  document.getElementById('req-bank').style.display = isAuto ? 'none' : 'inline';
  document.getElementById('req-acc').style.display = isAuto ? 'none' : 'inline';
  document.getElementById('accountNumber').placeholder = isAuto ? '자동이체 계좌 수령 (입력 생략 가능)' : '- 없이 숫자만 입력';
}

function handleFileSelect(e) {
  const files = e.target && e.target.files ? Array.from(e.target.files) : [];
  if (files.length === 0) return;
  attachedMedicalFiles = [...attachedMedicalFiles, ...files];
  renderAttachedFiles();
  e.target.value = ''; // 동일 파일 재첨부 허용
}

function handleMedicalDrop(e) {
  e.preventDefault();
  e.currentTarget.style.borderColor = '#94a3b8';
  e.currentTarget.style.background = '#f8fafc';
  const files = e.dataTransfer && e.dataTransfer.files ? Array.from(e.dataTransfer.files) : [];
  if (files.length === 0) return;
  attachedMedicalFiles = [...attachedMedicalFiles, ...files];
  renderAttachedFiles();
}

function removeAttachedFile(idx) {
  attachedMedicalFiles.splice(idx, 1);
  renderAttachedFiles();
}

function renderAttachedFiles() {
  document.getElementById('attached-file-list').innerHTML = attachedMedicalFiles.map((file, idx) => `
    <div class="file-item">
      <span>📄 ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)</span>
      <button type="button" onclick="removeAttachedFile(${idx})" style="border:none; background:none; color:#e11d48; font-weight:800; cursor:pointer;">✕ 삭제</button>
    </div>
  `).join('');
}

// 주민등록번호 앞6자리 + 뒷첫자리로 만 나이 정확 계산
function calcKoreanAge(rrn1, rrn2) {
  if (!rrn1 || rrn1.length !== 6 || !rrn2) return 30;
  const g = rrn2.charAt(0);
  const century = (g === '3' || g === '4' || g === '7' || g === '8') ? 2000 : 1900;
  const birthY = century + parseInt(rrn1.slice(0, 2), 10);
  const birthM = parseInt(rrn1.slice(2, 4), 10);
  const birthD = parseInt(rrn1.slice(4, 6), 10);
  const now = new Date();
  let age = now.getFullYear() - birthY;
  const mDiff = (now.getMonth() + 1) - birthM;
  if (mDiff < 0 || (mDiff === 0 && now.getDate() < birthD)) age--;
  return age;
}

// [청구 시작하기] 클릭 시 관계 및 만 14세 여부를 판별하여 필요한 서명란 자동 생성
function prepareSignatureStep() {
  const baseData = validateBasicInputs();
  if (!baseData) return;

  const age = calcKoreanAge(baseData.insuredRrn1, baseData.insuredRrn2);
  const isUnder14 = age < 14;
  const isUnder19 = age < 19;
  const isNoBeneficiary = document.getElementById('isBeneficiaryDesignated').value === 'no';
  const guardian = baseData.guardianInputName
    || ((baseData.holderName && baseData.holderName !== baseData.insuredName) ? baseData.holderName : baseData.beneficiaryName);

  const requiredSigners = [];
  const addSigner = (roleKey, roleTitle, personName) => {
    if (!personName) return;
    const existing = requiredSigners.find(s => s.name === personName);
    if (existing) {
      if (!existing.roles.includes(roleKey)) existing.roles.push(roleKey);
      if (!existing.titles.includes(roleTitle)) existing.titles.push(roleTitle);
    } else {
      requiredSigners.push({ id: `sig_${requiredSigners.length}`, name: personName, roles: [roleKey], titles: [roleTitle] });
    }
  };

  if (isUnder14) {
    const benSigner = (baseData.beneficiaryName && baseData.beneficiaryName !== baseData.insuredName)
      ? baseData.beneficiaryName
      : guardian;
    addSigner('guardian', '친권자/법정대리인', benSigner);
    addSigner('insured', '피보험자 본인 대리서명', benSigner);
    addSigner('holder', '친권자/청구권자', benSigner);
    addSigner('beneficiary', '수익자(청구권자)', benSigner);
  } else if (isUnder19) {
    // 만 14~18세: 동의서는 피보험자 본인 서명 + 청구서 법정대리인란은 친권자 서명
    addSigner('insured', '피보험자(본인)', baseData.insuredName);
    addSigner('guardian', '친권자/법정대리인', guardian);
    addSigner('holder', '친권자/법정대리인', guardian);
    const benSigner = (baseData.beneficiaryName === baseData.insuredName) ? guardian : baseData.beneficiaryName;
    addSigner('beneficiary', '수익자(청구권자)', benSigner);
  } else {
    // 만 19세 이상 성인
    addSigner('insured', '피보험자(본인)', baseData.insuredName);
    addSigner('beneficiary', baseData.beneficiaryName === baseData.insuredName ? '수익자(본인)' : '보험금 수익자(예금주)', baseData.beneficiaryName);
    if ((isNoBeneficiary || baseData.beneficiaryName !== baseData.insuredName) && baseData.holderName !== baseData.insuredName) {
      addSigner('holder', '보험계약자', baseData.holderName);
    }
  }

  document.getElementById('sig-rule-desc').textContent = isUnder14
    ? `만 ${age}세(14세 미만) 미성년자 청구건으로 친권자(법정대리인) 서명란이 생성되었습니다.`
    : (isUnder19
        ? `만 ${age}세(만 14세 이상 미성년자) 청구건으로 피보험자 본인(동의서용) 및 친권자(청구서용) 서명란이 생성되었습니다.`
        : (requiredSigners.length === 1
            ? `계약자·피보험자·수익자가 동일하여 [${requiredSigners[0].name}]님 1회 서명으로 모든 칸에 자동 날인됩니다.`
            : `계약 관계에 따라 총 ${requiredSigners.length}분의 자필 서명이 필요합니다. 각 칸의 흐릿한 성명을 확인 후 서명해주세요.`));

  const container = document.getElementById('signature-pads-list');
  container.innerHTML = requiredSigners.map(s => `
    <div style="border:1px solid #cbd5e1; border-radius:12px; padding:12px; background:#f8fafc;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <span style="font-size:13.5px; font-weight:800; color:#0f172a;">
          ✍️ ${s.name}님 서명 <span style="font-size:12px; color:#2563eb;">(${s.titles.join(' 겸 ')})</span>
        </span>
        <button type="button" onclick="clearSingleSig('${s.id}')" class="close-btn" style="padding:4px 10px; font-size:12px;">🔄 다시 그리기</button>
      </div>
      <div class="signature-container">
        <div class="sig-watermark" id="wm-${s.id}">
          <div class="sig-watermark-name">${s.name}</div>
          <div class="sig-watermark-sub">이곳에 [${s.name}]님의 자필 서명을 그려주세요</div>
        </div>
        <canvas id="canvas-${s.id}" class="sig-pad-canvas"></canvas>
      </div>
    </div>
  `).join('');

  document.getElementById('dynamic-sig-section').style.display = 'block';
  document.getElementById('start-sig-btn').style.display = 'none';
  document.getElementById('generate-btn').style.display = 'block';
  sigStepReady = true;

  sigPadsMap = {};
  setTimeout(() => {
    requiredSigners.forEach(s => initSingleSignaturePad(s));
    document.getElementById('dynamic-sig-section').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 60);
}

function initSingleSignaturePad(signer) {
  const canvas = document.getElementById(`canvas-${signer.id}`);
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.lineWidth = 6.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#000000';

  const state = { canvas, ctx, hasSigned: false, isDrawing: false, signer };
  sigPadsMap[signer.id] = state;

  const getPos = (e) => {
    const r = canvas.getBoundingClientRect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: cx - r.left, y: cy - r.top };
  };
  const start = (e) => {
    e.preventDefault();
    state.isDrawing = true;
    state.hasSigned = true;
    const sub = document.querySelector(`#wm-${signer.id} .sig-watermark-sub`);
    if (sub) sub.style.display = 'none';
    const p = getPos(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  };
  const move = (e) => {
    if (!state.isDrawing) return;
    e.preventDefault();
    const p = getPos(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  };
  const end = () => { state.isDrawing = false; };

  canvas.onmousedown = start;
  canvas.onmousemove = move;
  window.addEventListener('mouseup', end);
  canvas.ontouchstart = start;
  canvas.ontouchmove = move;
  canvas.ontouchend = end;
}

function clearSingleSig(padId) {
  const st = sigPadsMap[padId];
  if (!st) return;
  st.ctx.clearRect(0, 0, st.canvas.width, st.canvas.height);
  st.hasSigned = false;
  const sub = document.querySelector(`#wm-${padId} .sig-watermark-sub`);
  if (sub) sub.style.display = 'block';
}

function cropBoldCanvas(canvas, ctx) {
  const w = canvas.width, h = canvas.height;
  const imgData = ctx.getImageData(0, 0, w, h).data;
  let minX = w, minY = h, maxX = 0, maxY = 0, found = false;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (imgData[(y * w + x) * 4 + 3] > 15) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        found = true;
      }
    }
  }
  if (!found) return canvas.toDataURL('image/png');
  const pad = 12;
  const cropX = Math.max(0, minX - pad), cropY = Math.max(0, minY - pad);
  const cropW = Math.min(w - cropX, (maxX - minX) + pad * 2);
  const cropH = Math.min(h - cropY, (maxY - minY) + pad * 2);
  const out = document.createElement('canvas');
  out.width = cropW; out.height = cropH;
  const oCtx = out.getContext('2d');
  oCtx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
  oCtx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
  return out.toDataURL('image/png');
}

function validateBasicInputs() {
  syncSamePerson();
  syncHolderToBeneficiary();
  const useAutoTransfer = document.getElementById('useAutoTransfer').checked;
  const data = {
    holderSameAsInsured: document.getElementById('holderSameAsInsured').checked,
    beneficiarySameAsInsured: document.getElementById('beneficiarySameAsInsured').checked,
    beneficiarySameAsHolder: document.getElementById('beneficiarySameAsHolder').checked,
    isBeneficiaryDesignated: document.getElementById('isBeneficiaryDesignated').value,
    insuredName: document.getElementById('insuredName').value.trim(),
    insuredRrn1: document.getElementById('insuredRrn1').value.trim(),
    insuredRrn2: document.getElementById('insuredRrn2').value.trim(),
    insuredPhone: document.getElementById('insuredPhone').value.trim(),
    insuredJob: document.getElementById('insuredJob').value.trim(),
    insuredAddress: document.getElementById('insuredAddress').value.trim(),

    holderName: document.getElementById('holderName').value.trim(),
    holderRrn1: document.getElementById('holderRrn1').value.trim(),
    holderRrn2: document.getElementById('holderRrn2').value.trim(),
    holderPhone: document.getElementById('holderPhone')?.value.trim() || document.getElementById('insuredPhone').value.trim(),
    holderJob: document.getElementById('holderJob')?.value.trim() || document.getElementById('insuredJob').value.trim(),
    holderAddress: document.getElementById('holderAddress')?.value.trim() || document.getElementById('insuredAddress').value.trim(),

    useAutoTransfer,
    bankName: document.getElementById('bankName').value,
    accountNumber: document.getElementById('accountNumber').value.trim(),
    beneficiaryName: document.getElementById('beneficiaryName').value.trim(),
    beneficiaryRrn1: document.getElementById('beneficiaryRrn1').value.trim(),
    beneficiaryRrn2: document.getElementById('beneficiaryRrn2').value.trim(),
    beneficiaryPhone: document.getElementById('beneficiaryPhone')?.value.trim() || document.getElementById('insuredPhone').value.trim(),
    beneficiaryJob: document.getElementById('beneficiaryJob')?.value.trim() || document.getElementById('insuredJob').value.trim(),
    beneficiaryAddress: document.getElementById('beneficiaryAddress')?.value.trim() || document.getElementById('insuredAddress').value.trim(),
    relToInsured: document.getElementById('relToInsured')?.value.trim() || document.getElementById('guardianRel')?.value.trim() || '본인',
    guardianSameAsHolder: document.getElementById('guardianSameAsHolder')?.checked ?? true,
    guardianInputName: document.getElementById('guardianInputName')?.value.trim() || '',
    guardianRel: document.getElementById('guardianRel')?.value.trim() || document.getElementById('relToInsured')?.value.trim() || '',

    accidentType: document.querySelector('input[name="accidentType"]:checked')?.value || '질병',
    claimCategory: document.querySelector('input[name="claimCategory"]:checked')?.value || '신규',
    accidentDate: document.getElementById('accidentDate').value,
    diagnosisName: document.getElementById('diagnosisName').value.trim(),
    hospitalName: document.getElementById('hospitalName').value.trim(),
    accidentDesc: document.getElementById('accidentDesc').value.trim(),
    accidentPlace: document.getElementById('accidentPlace').value.trim(),
    coverages: Array.from(document.querySelectorAll('input[name="claimCoverages"]:checked')).map(el => el.value),
    notifyCustomer: document.getElementById('notifyCustomer').checked,
    notifyPlanner: document.getElementById('notifyPlanner').checked
  };

  if (!data.insuredName || data.insuredRrn1.length !== 6 || data.insuredRrn2.length !== 7) {
    alert('피보험자 성명과 주민등록번호 13자리를 정확히 입력해주세요.'); return null;
  }
  if (!data.insuredPhone || !data.insuredJob) {
    alert('피보험자 휴대폰 번호와 직장/직무를 입력해주세요.'); return null;
  }
  if (!data.holderName || data.holderRrn1.length !== 6 || data.holderRrn2.length !== 7) {
    alert('보험계약자 성명과 주민등록번호 13자리를 정확히 입력해주세요.'); return null;
  }
  if (!data.useAutoTransfer && (!data.bankName || !data.accountNumber)) {
    alert('은행명과 계좌번호를 입력하거나 [자동이체 계좌로 수령 요청]에 체크해주세요.'); return null;
  }
  if (!data.beneficiaryName || data.beneficiaryRrn1.length !== 6 || data.beneficiaryRrn2.length !== 7) {
    alert('예금주(수익자) 성명과 주민등록번호 13자리를 입력해주세요.'); return null;
  }
  if (calcKoreanAge(data.insuredRrn1, data.insuredRrn2) < 19) {
    if (!data.guardianInputName || data.guardianInputName === data.insuredName) {
      alert('미성년자 청구건입니다. 1번 항목 하단의 [법정대리인(친권자) 성명]에 부모/후견인 성명을 입력해주세요.'); return null;
    }
    if (!data.guardianRel || data.guardianRel === '본인') {
      alert('1번 항목 하단의 [법정대리인의 피보험자와의 관계](예: 부, 모)를 입력해주세요.'); return null;
    }
  }
  if (!data.diagnosisName || !data.accidentDesc) {
    alert('진단명(병명)과 사고(내원) 경위를 입력해주세요.'); return null;
  }
  return data;
}

function collectFormData() {
  const data = validateBasicInputs();
  if (!data) return null;

  const padStates = Object.values(sigPadsMap);
  if (padStates.length === 0) {
    prepareSignatureStep();
    return null;
  }
  for (const st of padStates) {
    if (!st.hasSigned) {
      alert(`[${st.signer.name}]님의 자필 서명을 그려주세요.`);
      return null;
    }
  }

  const roleSignatures = {};
  padStates.forEach(st => {
    const dataUrl = cropBoldCanvas(st.canvas, st.ctx);
    st.signer.roles.forEach(r => { roleSignatures[r] = dataUrl; });
  });

  const primarySig = roleSignatures.insured || roleSignatures.guardian || roleSignatures.beneficiary || Object.values(roleSignatures)[0];
  return {
    ...data,
    isUnder14: calcKoreanAge(data.insuredRrn1, data.insuredRrn2) < 14,
    roleSignatures,
    signatureDataUrl: primarySig
  };
}

async function drawKoreanText(pdfDoc, page, text, x, y, fontSize = 9.5, isBold = false, color = '#000000', spacing = 0) {
  if (text === undefined || text === null || String(text).trim() === '') return;
  const str = String(text);

  if (spacing > 0) {
    const chars = str.split('');
    for (let i = 0; i < chars.length; i++) {
      await drawKoreanText(pdfDoc, page, chars[i], x + (i * spacing), y, fontSize, isBold, color, 0);
    }
    return;
  }

  const scale = 3;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const fontSpec = `${isBold ? '800' : '600'} ${fontSize * scale}px Pretendard, sans-serif`;
  ctx.font = fontSpec;
  const metrics = ctx.measureText(str);
  const textWidth = Math.ceil(metrics.width) + 8;
  const textHeight = Math.ceil(fontSize * scale * 1.35);
  canvas.width = textWidth;
  canvas.height = textHeight;
  ctx.font = fontSpec;
  ctx.fillStyle = color;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, 2, textHeight / 2);
  const pngImage = await pdfDoc.embedPng(canvas.toDataURL('image/png'));
  page.drawImage(pngImage, { x, y: y - 2, width: textWidth / scale, height: textHeight / scale });
}

async function drawCheckmark(pdfDoc, page, x, y, size = 11.5) {
  await drawKoreanText(pdfDoc, page, '✔', x, y, size, true, '#000000');
}

async function drawSignatureImg(pdfDoc, page, sigImage, x, y, w = 50, h = 22) {
  if (!sigImage || !page) return;
  const dims = sigImage.scaleToFit(w, h);
  page.drawImage(sigImage, {
    x: x + (w - dims.width) / 2,
    y: (y - 4) + (h - dims.height) / 2,
    width: dims.width,
    height: dims.height
  });
}

async function appendMedicalFilesToPdf(targetPdfDoc) {
  for (const file of attachedMedicalFiles) {
    const arrayBuffer = await file.arrayBuffer();
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      const donorPdf = await PDFLib.PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const copiedPages = await targetPdfDoc.copyPages(donorPdf, donorPdf.getPageIndices());
      copiedPages.forEach((p) => targetPdfDoc.addPage(p));
    } else if (file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|bmp|gif)$/i.test(file.name)) {
      let embeddedImg;
      if (file.type === 'image/png' || file.name.toLowerCase().endsWith('.png')) {
        embeddedImg = await targetPdfDoc.embedPng(arrayBuffer);
      } else if (file.type === 'image/jpeg' || /\.(jpg|jpeg)$/i.test(file.name)) {
        embeddedImg = await targetPdfDoc.embedJpg(arrayBuffer);
      } else {
        // WebP 등 기타 휴대폰 이미지 포맷을 PNG로 자동 변환 후 병합
        const pngBytes = await new Promise((resolve, reject) => {
          const img = new Image();
          const url = URL.createObjectURL(file);
          img.onload = () => {
            const c = document.createElement('canvas');
            c.width = img.naturalWidth; c.height = img.naturalHeight;
            c.getContext('2d').drawImage(img, 0, 0);
            URL.revokeObjectURL(url);
            c.toBlob(async b => resolve(await b.arrayBuffer()), 'image/png');
          };
          img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('이미지 변환 실패')); };
          img.src = url;
        });
        embeddedImg = await targetPdfDoc.embedPng(pngBytes);
      }
      const page = targetPdfDoc.addPage([595.28, 841.89]);
      const imgDims = embeddedImg.scaleToFit(535, 760);
      page.drawImage(embeddedImg, {
        x: (595.28 - imgDims.width) / 2,
        y: (841.89 - imgDims.height) / 2,
        width: imgDims.width,
        height: imgDims.height
      });
    }
  }
}

async function createStandardClaimPdf(insurer, data) {
  const pdfDoc = await PDFLib.PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]);
  const { rgb } = PDFLib;

  page.drawRectangle({ x: 40, y: 765, width: 515, height: 42, color: rgb(0.12, 0.23, 0.54) });
  await drawKoreanText(pdfDoc, page, `${insurer.name} 보험금 청구서 (통합양식)`, 55, 780, 15, true, '#ffffff');

  const drawRow = async (y, label1, val1, label2, val2) => {
    page.drawRectangle({ x: 40, y: y - 10, width: 515, height: 28, borderColor: rgb(0.8, 0.82, 0.85), borderWidth: 1 });
    page.drawRectangle({ x: 40, y: y - 10, width: 95, height: 28, color: rgb(0.95, 0.96, 0.98) });
    await drawKoreanText(pdfDoc, page, label1, 48, y, 9.5, true);
    await drawKoreanText(pdfDoc, page, val1, 145, y, 10, false);
    if (label2) {
      page.drawRectangle({ x: 300, y: y - 10, width: 95, height: 28, color: rgb(0.95, 0.96, 0.98) });
      await drawKoreanText(pdfDoc, page, label2, 308, y, 9.5, true);
      await drawKoreanText(pdfDoc, page, val2, 405, y, 10, false);
    }
  };

  await drawKoreanText(pdfDoc, page, '1. 인적사항 및 보상 안내', 42, 740, 11.5, true);
  await drawRow(712, '피보험자 성명', data.insuredName, '주민등록번호', data.insuredRrnFull);
  await drawRow(684, '휴대폰 번호', data.insuredPhone, '직장 / 직무', data.insuredJob);
  await drawRow(656, '보험계약자', data.holderName, '계약자 주민번호', data.holderRrnFull);
  await drawRow(628, '거주지 주소', data.insuredAddress || '-', '', '');

  await drawKoreanText(pdfDoc, page, '2. 사고 및 진료 내역', 42, 592, 11.5, true);
  await drawRow(564, '사고/청구유형', `${data.accidentType} (${data.claimCategory}접수)`, '사고(발병)일', data.accidentDate);
  await drawRow(536, '진단명(병명)', data.diagnosisName, '병원명/진료과', data.hospitalName || '-');
  await drawRow(508, '사고(내원)경위', data.accidentDesc, '청구 담보', data.coverages.join(', '));

  await drawKoreanText(pdfDoc, page, '3. 보험금 수령 계좌', 42, 472, 11.5, true);
  const accText = data.useAutoTransfer && !data.accountNumber ? '[자동이체 계좌 수령 요청]' : data.accountNumber;
  await drawRow(444, '금융기관(은행)', data.bankName || '자동이체은행', '계좌번호', accText);
  await drawRow(416, '예금주(수익자)', data.beneficiaryName, '자동이체요청', data.useAutoTransfer ? '✔ 요청함' : '해당없음');

  page.drawRectangle({ x: 40, y: 240, width: 515, height: 145, color: rgb(0.97, 0.98, 0.99), borderColor: rgb(0.8, 0.82, 0.85), borderWidth: 1 });
  await drawKoreanText(pdfDoc, page, '[필수] 보험금 청구를 위한 개인(신용)정보 수집·이용·조회·제공 동의', 52, 360, 10.5, true);
  await drawKoreanText(pdfDoc, page, '✔ 고유식별정보 동의함    ✔ 민감정보 동의함    ✔ 개인(신용)정보 동의함', 52, 315, 10, true);
  await drawKoreanText(pdfDoc, page, `작성일자 : ${data.todayDateFull}`, 52, 260, 10, true);
  await drawKoreanText(pdfDoc, page, `청구권자(피보험자/수익자) : ${data.beneficiaryName}   (서명)`, 290, 260, 10, true);

  if (data.signatureDataUrl) {
    const sigImg = await pdfDoc.embedPng(data.signatureDataUrl);
    page.drawImage(sigImg, { x: 465, y: 250, width: 70, height: 32 });
  }
  return pdfDoc;
}

async function handleGeneratePDF() {
  const rawData = collectFormData();
  if (!rawData) return;

  const btn = document.getElementById('generate-btn');
  const origText = btn.textContent;
  btn.disabled = true;
  btn.textContent = '⏳ 청구서 작성 및 병원서류 병합 중...';
  generatedPdfFiles = [];

  try {
    const [accY, accM, accD] = (rawData.accidentDate || '2026-01-01').split('-');
    const now = new Date();
    const todayY = String(now.getFullYear());
    const todayM = String(now.getMonth() + 1).padStart(2, '0');
    const todayD = String(now.getDate()).padStart(2, '0');

    const splitPhone = (ph) => {
      const p = (ph || '').split('-');
      return { raw: (ph || '').replace(/[^0-9]/g, ''), p1: p[0] || '', p2: p[1] || '', p3: p[2] || '' };
    };
    const iPh = splitPhone(rawData.insuredPhone);
    const hPh = splitPhone(rawData.holderPhone);
    const bPh = splitPhone(rawData.beneficiaryPhone);


    const ageNum = calcKoreanAge(rawData.insuredRrn1, rawData.insuredRrn2);
    const isSameInsBen = (rawData.insuredName === rawData.beneficiaryName);
    const isBenHolder = (rawData.beneficiaryName === rawData.holderName);
    const guardianPerson = (!isSameInsBen && rawData.beneficiaryName)
      ? rawData.beneficiaryName
      : (rawData.guardianInputName || ((rawData.holderName && rawData.holderName !== rawData.insuredName) ? rawData.holderName : rawData.beneficiaryName));
    const guardianRelVal = (!isSameInsBen && rawData.relToInsured && rawData.relToInsured !== '본인')
      ? rawData.relToInsured
      : ((rawData.guardianRel && rawData.guardianRel !== '본인') ? rawData.guardianRel : '');

    const enrichedData = {
      ...rawData,
      age: ageNum,
      isUnder14: ageNum < 14,
      isUnder19: ageNum < 19,
      isSameInsBen,
      isBenHolder,

      // 미성년 청구 시 청구권자 성명(수익자가 자녀 본인 통장이면 친권자 성명, 부모 통장이면 해당 청구 부모 성명)
      claimantName: (ageNum < 19 && isSameInsBen) ? guardianPerson : rawData.beneficiaryName,

      relSelf: isSameInsBen ? '본인' : (rawData.relToInsured || guardianRelVal || '본인'),
      relToInsured: isSameInsBen ? '본인' : (rawData.relToInsured || guardianRelVal || ''),
      relIfDiff: !isSameInsBen ? (rawData.relToInsured || guardianRelVal || '') : (ageNum < 19 ? guardianRelVal : ''),

      // 보상안내 받으실 분이 피보험자·계약자 외 제3자일 때 또는 기타란 표기용
      otherNotifyName: (!isSameInsBen && !isBenHolder) ? rawData.beneficiaryName : '',
      otherNotifyRel: (!isSameInsBen && !isBenHolder) ? (rawData.relToInsured || '') : '',
      diffNotifyName: !isSameInsBen ? rawData.beneficiaryName : '',
      diffNotifyRel: !isSameInsBen ? (rawData.relToInsured || '') : '',

      // 연령 기준 법정대리인 성명 자동 분기 (14세 미만 동의서용 / 19세 미만 청구서용)
      guardianName: ageNum < 14 ? guardianPerson : '',
      guardianName19: ageNum < 19 ? guardianPerson : '',

      guardianFatherName: (ageNum < 19 && guardianRelVal !== '모') ? guardianPerson : '',
      guardianMotherName: (ageNum < 19 && guardianRelVal === '모') ? guardianPerson : '',
      beneficiaryBirth: rawData.beneficiaryRrn1,
      beneficiaryGender: ['1','3','5','7'].includes((rawData.beneficiaryRrn2 || '').charAt(0)) ? 'M' : 'F',
      nationalityKor: '대한민국',

      insuredPhoneRaw: iPh.raw, insuredPhone1: iPh.p1, insuredPhone2: iPh.p2, insuredPhone3: iPh.p3,
      holderPhoneRaw: hPh.raw, holderPhone1: hPh.p1, holderPhone2: hPh.p2, holderPhone3: hPh.p3,
      beneficiaryPhoneRaw: bPh.raw, beneficiaryPhone1: bPh.p1, beneficiaryPhone2: bPh.p2, beneficiaryPhone3: bPh.p3,

      insuredRrnFull: `${rawData.insuredRrn1}-${rawData.insuredRrn2}`,
      holderRrnFull: `${rawData.holderRrn1}-${rawData.holderRrn2}`,
      beneficiaryRrnFull: `${rawData.beneficiaryRrn1}-${rawData.beneficiaryRrn2}`,

      accYear: accY, accYearShort: accY.slice(2), accMonth: accM, accDay: accD,
      todayYear: todayY, todayYearShort: todayY.slice(2), todayMonth: todayM, todayDay: todayD,
      todayDateFull: `${todayY}년 ${todayM}월 ${todayD}일`,
      todayDateSlash: `${todayY}/${todayM}/${todayD}`,
      descWithDiag: rawData.diagnosisName ? `${rawData.accidentDesc} (${rawData.diagnosisName})` : rawData.accidentDesc,
      hospitalWithDiag: `${rawData.hospitalName} (${rawData.diagnosisName})`,
      bankName: rawData.useAutoTransfer && !rawData.bankName ? '' : rawData.bankName,
      accountNumber: rawData.useAutoTransfer && !rawData.accountNumber ? '' : rawData.accountNumber
    };

    const doneActionsHtml = [];

    for (let i = 0; i < selectedObjects.length; i++) {
      const ins = selectedObjects[i];
      let pdfDoc;

      if (ins.pdfFile && PDF_COORD_MAP[ins.id]) {
        try {
          const isLifeIns = INSURER_DB.life.some(l => l.id === ins.id);
          const folderName = isLifeIns ? 'forms2' : 'forms';
          const res = await fetch(encodeURI(`./${folderName}/${ins.pdfFile}`));
          if (!res.ok) throw new Error('PDF 로드 실패');
          const existingBytes = await res.arrayBuffer();
          pdfDoc = await PDFLib.PDFDocument.load(existingBytes, { ignoreEncryption: true });
          const pages = pdfDoc.getPages();

          const embeddedSigs = {};
          for (const [rKey, dUrl] of Object.entries(enrichedData.roleSignatures || {})) {
            if (dUrl) embeddedSigs[rKey] = await pdfDoc.embedPng(dUrl);
          }
          const defaultSigImg = embeddedSigs.insured || embeddedSigs.guardian || embeddedSigs.beneficiary || Object.values(embeddedSigs)[0];
          const mapCfg = PDF_COORD_MAP[ins.id];

          for (const f of mapCfg.fields) {
            if (!pages[f.page]) continue;
            if (f.cond && !f.cond(enrichedData)) continue;
            await drawKoreanText(pdfDoc, pages[f.page], enrichedData[f.key], f.x, f.y, f.size || 9.5, f.bold || false, '#000000', f.spacing || 0);
          }
          if (mapCfg.checks) {
            for (const c of mapCfg.checks) {
              if (pages[c.page] && c.cond(enrichedData)) await drawCheckmark(pdfDoc, pages[c.page], c.x, c.y, c.size || 11.5);
            }
          }
          if (mapCfg.signatures) {
            for (const s of mapCfg.signatures) {
              if (!pages[s.page]) continue;
              if (s.cond && !s.cond(enrichedData)) continue;
              // 별도 cond가 없을 때의 기본 연령 방어 로직
              if (!s.cond && s.role === 'guardian' && !enrichedData.isUnder14) continue;
              let targetSig = s.role ? (embeddedSigs[s.role] || defaultSigImg) : defaultSigImg;
              if (!s.cond && s.role === 'insured' && enrichedData.isUnder14) targetSig = embeddedSigs.guardian || defaultSigImg;
              if (targetSig) await drawSignatureImg(pdfDoc, pages[s.page], targetSig, s.x, s.y, s.w, s.h);
            }
          }
        } catch (e) {
          pdfDoc = await createStandardClaimPdf(ins, enrichedData);
        }
      } else {
        pdfDoc = await createStandardClaimPdf(ins, enrichedData);
      }

      await appendMedicalFilesToPdf(pdfDoc);
      pdfDoc.setSubject(encodeClaimMeta(rawData));
      const finalBytes = await pdfDoc.save();
      const fileName = `[잇츠리온_보험금청구서]_${ins.name}_${enrichedData.insuredName}.pdf`;
      const blob = new Blob([finalBytes], { type: 'application/pdf' });
      const fileObj = new File([blob], fileName, { type: 'application/pdf' });
      generatedPdfFiles.push(fileObj);

      // 모바일 환경에서만 기존처럼 즉시 기기 다운로드 수행 (PC는 폴더 선택 창으로 저장)
      if (isMobileEnv()) {
        triggerBrowserDownload(fileObj);
      }

      const vFaxInput = document.getElementById(`virtual-fax-${ins.id}`);
      const targetFax = (vFaxInput && vFaxInput.value.trim()) ? vFaxInput.value.trim() : ins.fax;

      if (isMobileEnv()) {
        // 스마트폰: 기존 모바일팩스 바로 보내기 유지
        doneActionsHtml.push(`
          <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 12px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px;">
            <div>
              <div style="font-weight:800; font-size:13.5px;">${ins.name}</div>
              <div style="font-size:11.5px; color:#1e3a8a; font-weight:700;">FAX: ${targetFax}</div>
            </div>
            <button type="button" onclick="sharePdfToMobileFax(${i}, '${targetFax}', '${ins.name}')" style="background:#2563eb; color:#fff; border:none; padding:8px 12px; border-radius:8px; font-size:12px; font-weight:800; cursor:pointer;">
              📠 모바일팩스로 바로 보내기
            </button>
          </div>
        `);
      } else {
        // PC 인터넷 환경: 모바일팩스 버튼 제거 + 팩스번호 복사 및 개별 경로 지정 다운로드 버튼 제공
        doneActionsHtml.push(`
          <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 12px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; gap:8px;">
            <div>
              <div style="font-weight:800; font-size:13.5px;">${ins.name}</div>
              <div style="font-size:11.5px; color:#1e3a8a; font-weight:700;">FAX: ${targetFax}</div>
            </div>
            <div style="display:flex; gap:6px;">
              ${!targetFax.includes('가상팩스') ? `<button type="button" onclick="copyFaxNumber('${targetFax}', '${ins.name}')" style="background:#eff6ff; color:#1e3a8a; border:1px solid #bfdbfe; padding:7px 10px; border-radius:8px; font-size:12px; font-weight:700; cursor:pointer;">번호복사</button>` : ''}
              <button type="button" onclick="saveSinglePdfWithPicker(${i}, this)" style="background:#0f172a; color:#fff; border:none; padding:7px 12px; border-radius:8px; font-size:12px; font-weight:800; cursor:pointer;">
                💾 저장 위치 선택 다운로드
              </button>
            </div>
          </div>
        `);
      }
    } 

    // 모달 하단 버튼 및 안내 문구를 PC / 모바일에 맞춰 설정
    const descEl = document.getElementById('done-modal-desc');
    const subBtn = document.getElementById('done-sub-action-btn');
    if (isMobileEnv()) {
      descEl.innerHTML = '기기에 PDF 다운로드가 완료되었습니다. 아래 <b>[모바일팩스로 바로 보내기]</b>를 누르면 앱에 파일이 즉시 등록됩니다.';
      subBtn.textContent = '📲 모바일팩스 미설치 시 설치';
      subBtn.onclick = installMobileFaxStore;
    } else {
      descEl.innerHTML = '청구서 생성이 완료되었습니다. 각 보험사의 <b>[💾 저장 위치 선택 다운로드]</b>를 누르면 바탕화면·다운로드 등 원하는 폴더에 바로 저장됩니다.';
      subBtn.textContent = generatedPdfFiles.length > 1 ? '⬇️ 전체 일괄 자동 다운로드' : '📁 저장할 폴더/위치 선택하기';
      subBtn.style.background = '#eff6ff';
      subBtn.style.color = '#1e3a8a';
      subBtn.style.borderColor = '#93c5fd';
      subBtn.onclick = saveAllPdfsAction;
    }

    document.getElementById('done-insurer-actions').innerHTML = doneActionsHtml.join('');
    document.getElementById('done-modal').style.display = 'flex';
  } catch (err) {
    alert('PDF 생성 중 오류가 발생했습니다: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = origText;
  }
}
// 청구 데이터 초경량 인코딩/디코딩 (팩스 인쇄면에는 전혀 보이지 않는 PDF 내부 속성용)
function encodeClaimMeta(rawData) {
  const { roleSignatures, signatureDataUrl, ...cleanMeta } = rawData;
  const bytes = new TextEncoder().encode(JSON.stringify(cleanMeta));
  let bin = '';
  bytes.forEach(b => { bin += String.fromCharCode(b); });
  return 'RION_V1:' + btoa(bin);
}

function decodeClaimMeta(subjectStr) {
  if (!subjectStr || !subjectStr.startsWith('RION_V1:')) return null;
  const bin = atob(subjectStr.slice(8));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return JSON.parse(new TextDecoder().decode(bytes));
}

function handlePrevPdfDrop(e) {
  e.preventDefault();
  document.getElementById('quick-import-dropzone').classList.remove('dragover');
  const file = e.dataTransfer?.files?.[0];
  if (file) handlePrevPdfUpload(file);
}

// 업로드된 과거 청구서 PDF에서 메모리 즉시 해독 후 폼 자동 채우기 (무저장)
async function handlePrevPdfUpload(inputOrFile) {
  const isInputEl = inputOrFile && inputOrFile.files;
  const file = isInputEl ? inputOrFile.files[0] : inputOrFile;
  if (!file) return;
  const t0 = performance.now();
  const statusEl = document.getElementById('import-status-msg');

  try {
    const arrayBuffer = await file.arrayBuffer();
    if (isInputEl) inputOrFile.value = ''; // 파일을 다 읽은 뒤에 안전하게 초기화
    const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer, {
      ignoreEncryption: true,
      updateMetadata: false
    });
    const meta = decodeClaimMeta(pdfDoc.getSubject());

    // 이전 버전(메타데이터 도입 전)에서 만든 PDF일 경우 파일명에서 성명 우선 추출
    if (!meta) {
      const nameMatch = file.name.match(/\[잇츠리온_보험금청구서\]_.*?_(.+?)\.pdf$/i);
      if (nameMatch && nameMatch[1]) {
        document.getElementById('insuredName').value = nameMatch[1];
        syncSamePerson();
      }
      statusEl.style.color = '#b45309';
      statusEl.textContent = '⚠️ 업데이트 이전에 생성된 PDF입니다. 지금부터 새로 생성·다운로드하는 청구서부터 전 항목이 자동 입력됩니다.';
      return;
    }

    // 1) 피보험자 정보 복원
    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val ?? ''; };
    setVal('insuredName', meta.insuredName);
    setVal('insuredRrn1', meta.insuredRrn1);
    setVal('insuredRrn2', meta.insuredRrn2);
    setVal('insuredPhone', meta.insuredPhone);
    setVal('insuredJob', meta.insuredJob);
    setVal('insuredAddress', meta.insuredAddress);

    // 2) 관계 체크박스 및 계약자·수익자 개별 정보 복원
    document.getElementById('holderSameAsInsured').checked = meta.holderSameAsInsured !== false;
    document.getElementById('beneficiarySameAsInsured').checked = meta.beneficiarySameAsInsured !== false;
    document.getElementById('beneficiarySameAsHolder').checked = !!meta.beneficiarySameAsHolder;

    setVal('holderName', meta.holderName);
    setVal('holderRrn1', meta.holderRrn1);
    setVal('holderRrn2', meta.holderRrn2);
    setVal('holderPhone', meta.holderPhone);
    setVal('holderJob', meta.holderJob);
    setVal('holderAddress', meta.holderAddress);

    document.getElementById('guardianSameAsHolder').checked = meta.guardianSameAsHolder !== false;
    setVal('guardianInputName', meta.guardianInputName || '');
    setVal('guardianRel', meta.guardianRel || '');
    setVal('relToInsured', meta.relToInsured || '본인');
    setVal('isBeneficiaryDesignated', meta.isBeneficiaryDesignated || 'yes');
    setVal('beneficiaryName', meta.beneficiaryName);
    setVal('beneficiaryRrn1', meta.beneficiaryRrn1);
    setVal('beneficiaryRrn2', meta.beneficiaryRrn2);
    setVal('beneficiaryPhone', meta.beneficiaryPhone);
    setVal('beneficiaryJob', meta.beneficiaryJob);
    setVal('beneficiaryAddress', meta.beneficiaryAddress);

    toggleRelationFields();
    if (!meta.beneficiarySameAsInsured && meta.beneficiarySameAsHolder) {
      syncHolderToBeneficiary();
    }

    // 3) 수령 계좌 정보 복원
    document.getElementById('useAutoTransfer').checked = !!meta.useAutoTransfer;
    setVal('bankName', meta.bankName);
    setVal('accountNumber', meta.accountNumber);
    toggleAutoTransferAccount();

    // 4) 사고 및 진료사항 복원
    if (meta.accidentType) {
      const r = document.querySelector(`input[name="accidentType"][value="${meta.accidentType}"]`);
      if (r) r.checked = true;
    }
    if (meta.claimCategory) {
      const r = document.querySelector(`input[name="claimCategory"][value="${meta.claimCategory}"]`);
      if (r) r.checked = true;
    }
    setVal('accidentDate', meta.accidentDate);
    setVal('diagnosisName', meta.diagnosisName);
    setVal('hospitalName', meta.hospitalName);
    setVal('accidentDesc', meta.accidentDesc);
    setVal('accidentPlace', meta.accidentPlace);

    if (Array.isArray(meta.coverages)) {
      document.querySelectorAll('input[name="claimCoverages"]').forEach(chk => {
        chk.checked = meta.coverages.includes(chk.value);
      });
    }

    // 5) 알림 설정 복원
    document.getElementById('notifyCustomer').checked = !!meta.notifyCustomer;
    document.getElementById('notifyPlanner').checked = !!meta.notifyPlanner;

    resetSignatureStep();

    const elapsedSec = ((performance.now() - t0) / 1000).toFixed(2);
    statusEl.style.color = '#065f46';
    statusEl.innerHTML = `✅ <b>[${meta.insuredName}]</b>님의 청구정보가 <b>${elapsedSec}초</b> 만에 자동 입력되었습니다! (파일 즉시 메모리 해제 완료)`;
    document.getElementById('clear-acc-only-btn').style.display = 'inline-block';
  } catch (err) {
    statusEl.style.color = '#e11d48';
    statusEl.textContent = '❌ PDF 파일을 읽을 수 없습니다. 정상적인 청구서 PDF 파일인지 확인해주세요.';
  }
}

// 다른 질병/상해로 재청구할 때 인적·계좌정보는 남기고 사고·진료내역만 1초 초기화
function clearOnlyAccidentFields() {
  document.getElementById('accidentDate').value = new Date().toISOString().split('T')[0];
  ['diagnosisName', 'hospitalName', 'accidentDesc', 'accidentPlace'].forEach(id => {
    document.getElementById(id).value = '';
  });
  const disRadio = document.querySelector('input[name="accidentType"][value="질병"]');
  if (disRadio) disRadio.checked = true;
  const newRadio = document.querySelector('input[name="claimCategory"][value="신규"]');
  if (newRadio) newRadio.checked = true;
  document.getElementById('diagnosisName').focus();
}

function closeWindow() {
  window.close();
  setTimeout(() => { window.location.href = './index.html'; }, 150);
}

initPage();

// ⭐️ 청구서 입력 및 고객 전자서명 중 메인 창 자동 로그아웃 방지
(function keepRionSessionAlive() {
  const syncRionActivity = () => { if (localStorage.getItem('rion_logged_user')) localStorage.setItem('rion_last_activity', Date.now().toString()); };
  syncRionActivity();
  ['mousedown', 'keypress', 'scroll', 'touchstart'].forEach(evt => document.addEventListener(evt, syncRionActivity, { passive: true }));
  setInterval(syncRionActivity, 3 * 60 * 1000);
})();

// 보안: 우클릭, 드래그, 소스보기(F12/Ctrl+U) 차단 (입력창 및 전자서명 캔버스는 정상 허용)
document.addEventListener('contextmenu', function(e) {
  e.preventDefault();
});

document.addEventListener('selectstart', function(e) {
  if (['INPUT', 'TEXTAREA', 'SELECT', 'CANVAS'].includes(e.target.tagName)) return;
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
