 // --- 1. 기본 전역 변수 및 UI 제어 함수 ---
 const USER_DB_URL = "https://script.google.com/macros/s/AKfycbza5DquXQvms-rDWJkcfq-iERjXnuMSJPKU-ZOH1Z_FvxFMbL5aVt3IGyzpRFL05qyP/exec";

 let activeSlide = 1;
 let currentUser = { isLoggedIn: false, name: '', status: '' };

 function switchView(viewName, targetSectionId = null) {
     const introView = document.getElementById('viewIntro');
     const workspaceView = document.getElementById('viewWorkspace');
     const expertView = document.getElementById('viewExpert');
     const navIntro = document.getElementById('navIntro');
     const navWorkspace = document.getElementById('navWorkspace');
     const navExpert = document.getElementById('navExpert');

     if (introView) introView.classList.add('hidden');
     if (workspaceView) workspaceView.classList.add('hidden');
     if (expertView) expertView.classList.add('hidden');

     if (navIntro) navIntro.className = "hover:text-white transition text-slate-300 font-semibold";
     if (navWorkspace) navWorkspace.className = "hover:text-white transition text-slate-300 font-semibold";
     if (navExpert) navExpert.className = "hover:text-white transition text-slate-300 font-semibold";

     if (viewName === 'intro') {
         if (introView) introView.classList.remove('hidden');
         if (navIntro) navIntro.className = "hover:text-white transition text-blue-400 font-bold";
     } else if (viewName === 'workspace') {
         if (workspaceView) workspaceView.classList.remove('hidden');
         if (navWorkspace) navWorkspace.className = "hover:text-white transition text-blue-400 font-bold";
     } else if (viewName === 'expert') {
         if (expertView) expertView.classList.remove('hidden');
         if (navExpert) navExpert.className = "hover:text-white transition text-blue-400 font-bold";
     }

     if (targetSectionId) {
         setTimeout(() => {
             const el = document.getElementById(targetSectionId);
             if (el) el.scrollIntoView({ behavior: 'smooth' });
         }, 100);
     } else {
         window.scrollTo({ top: 0, behavior: 'smooth' });
     }
 }

 function switchSlide(slideNum) {
     activeSlide = slideNum;
     const slide1 = document.getElementById('slide1');
     const slide2 = document.getElementById('slide2');
     const dot1 = document.getElementById('dot1');
     const dot2 = document.getElementById('dot2');

     if (slideNum === 1) {
        slide1.classList.remove('opacity-0', 'pointer-events-none');
        slide1.classList.add('opacity-100');
        slide2.classList.remove('opacity-100');
        slide2.classList.add('opacity-0', 'pointer-events-none');
         dot1.className = "w-2.5 h-2.5 rounded-full bg-white shadow-md transition-all duration-300";
         dot2.className = "w-2.5 h-2.5 rounded-full bg-white/40 hover:bg-white/60 transition-all duration-300";
     } else {
        slide2.classList.remove('opacity-0', 'pointer-events-none');
        slide2.classList.add('opacity-100');
        slide1.classList.remove('opacity-100');
        slide1.classList.add('opacity-0', 'pointer-events-none');
         dot2.className = "w-2.5 h-2.5 rounded-full bg-white shadow-md transition-all duration-300";
         dot1.className = "w-2.5 h-2.5 rounded-full bg-white/40 hover:bg-white/60 transition-all duration-300";
     }
 }

 setInterval(() => {
    switchSlide(activeSlide === 1 ? 2 : 1);
 }, 6000);

 function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
 function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

 function openExpertModal(categoryName) {
     const catInput = document.getElementById('expertCategoryInput');
     if (catInput) catInput.value = categoryName;

     const nameInput = document.getElementById('expertPlannerName');
     if (nameInput && currentUser && currentUser.isLoggedIn) {
        nameInput.value = `${currentUser.name} 팀장`;
     }
    openModal('expertConsultModal');
 }

 function submitExpertConsult(e) {
    e.preventDefault();
     const category = document.getElementById('expertCategoryInput').value;
     const planner = document.getElementById('expertPlannerName').value;
    alert(`[${category}]\n${planner}님의 자문 신청이 성공적으로 접수되었습니다.\n담당 자문위원이 빠른 시일 내에 연락드리겠습니다.`);
    closeModal('expertConsultModal');
 }

 function checkAuthAndOpenAsk(expertType) {
     if (!currentUser.isLoggedIn) {
         alert('자문센터를 이용하시려면 먼저 로그인 또는 회원가입을 진행해주세요.');
         openModal('loginModal');
     } else if (currentUser.status !== '승인') {
         alert('현재 [승인 대기] 상태입니다. 관리자 승인 완료 후 이용하실 수 있습니다.');
     } else {
         window.open('insurance_ask.html?type=' + encodeURIComponent(expertType), 'eduWindow');
     }
 }

 function checkAuthAndOpen(modalId) {
     // 1. 비회원 기능
     if (modalId === 'indemnityCalcModal') {
        window.open('silbi_calculator.html', '_blank'); return;
     }
     // ⭐️ 수정 1: termsCloudModal 제거 (comingSoonModal만 남김)
     if (modalId === 'comingSoonModal') {
        openModal('comingSoonModal'); return;
     }

     // 2. 회원 기능 (로그인 + '승인' 상태 검증)
     if (!currentUser.isLoggedIn) {
         alert('원활한 서비스 사용을 위해 로그인 또는 회원가입 후 이용해주세요.');
         openModal('loginModal');
     } else if (currentUser.status !== '승인') {
         alert('현재 [승인 대기] 상태입니다. 관리자 승인 완료 후 이용 할 수 있습니다.');
     } else {
        localStorage.setItem('rion_logged_user', currentUser.name); 

         if (modalId === 'dbAssignPage') {
            window.open('db_assign.html', 'eduWindow'); 
         } else if (modalId === 'dutyModal') {
            window.open('duty_analysis.html', '_blank');
         } else if (modalId === 'termsCloudModal') {
            // ⭐️ 수정 2: 약관비교분석 새 창 실행 추가!
            window.open('policy_ai.html', '_blank');
         } else if (modalId === 'claimModal') { 
            window.open('claim.html', '_blank');
         } else if (modalId === 'contractDashboardModal') {
            window.open('db_carts.html', 'eduWindow');
         } else if (modalId === 'coverageModal') { 
            window.open('insurance_analysis.html', '_blank');
         } else if (modalId === 'unclaimedMoneyModal') { 
            window.open('insurance_money.html', 'eduWindow');
         } else {
            openModal(modalId); 
         }
     }
 }

 // ⭐️ 회원정보 창 띄우기 (이름만 표시하고 비밀번호 요구)
 function openMemberInfo() {
     if (!currentUser.isLoggedIn) return;
     document.getElementById('memberInfoDisplayName').innerText = currentUser.name;
     document.getElementById('memberInfoAuthPw').value = '';
     document.getElementById('memberInfoAuthStep').classList.remove('hidden');
     document.getElementById('memberInfoEditStep').classList.add('hidden');
     openModal('memberInfoModal');
 }

// ⭐️ 회원정보 창 - 비밀번호 확인 및 기존 정보(연락처, 이메일) 불러오기
  async function verifyMemberInfoAuth() {
      const pw = document.getElementById('memberInfoAuthPw').value.trim();
      if (!pw) { alert("비밀번호를 입력해주세요."); return; }

      const btn = document.querySelector('#memberInfoAuthStep button');
      btn.innerText = "확인 중...";

      // ⭐️ 실제 로그인 아이디 우선 사용
      const loggedUserId = localStorage.getItem('rion_logged_id') || localStorage.getItem('rion_logged_user');

      try {
          const res = await fetch(USER_DB_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'text/plain;charset=utf-8' },
              body: JSON.stringify({ action: "login", userId: loggedUserId, password: pw, force: true })
          });
          const data = await res.json();

          if (data.success || data.alreadyLoggedIn) {
              document.getElementById('memberInfoAuthStep').classList.add('hidden');
              document.getElementById('memberInfoEditStep').classList.remove('hidden');

              document.getElementById('editName').value = data.name || currentUser.name;
              document.getElementById('editEmpId').value = pw; 
              // ⭐️ 010 제외한 뒤 8자리만 추출하여 editPhone8에 세팅
              const rawDigits = String(data.phone || '').replace(/[^0-9]/g, '');
              document.getElementById('editPhone8').value = rawDigits.startsWith('010') ? rawDigits.slice(3, 11) : rawDigits.slice(-8);
              document.getElementById('editEmail').value = data.email || '';
              document.getElementById('editCompany').value = data.company || '';
              document.getElementById('editBranch').value = data.branch || '';
          } else {
              alert("비밀번호가 일치하지 않습니다.");
          }
      } catch (e) {
          alert("통신 오류가 발생했습니다.");
      } finally {
          btn.innerText = "정보 확인";
      }
  }
 async function saveMemberInfo() {
      const newPw = document.getElementById('editEmpId') ? document.getElementById('editEmpId').value.trim() : '';
      const newPhone = document.getElementById('editPhone') ? document.getElementById('editPhone').value.trim() : '';
      const newEmail = document.getElementById('editEmail') ? document.getElementById('editEmail').value.trim() : '';
      const newCompany = document.getElementById('editCompany') ? document.getElementById('editCompany').value.trim() : '';
      const newBranch = document.getElementById('editBranch') ? document.getElementById('editBranch').value.trim() : '';

      const btn = document.querySelector('#memberInfoEditStep button');
      if(btn) btn.innerText = "저장 중...";

      const loggedUserId = localStorage.getItem('rion_logged_user');

      try {
          const res = await fetch(USER_DB_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'text/plain;charset=utf-8' },
              body: JSON.stringify({
                  action: "updateProfile",
                  userId: loggedUserId, 
                  password: newPw,
                  phone: newPhone,
                  email: newEmail,
                  company: newCompany, 
                  branch: newBranch   
              })
          });
          const data = await res.json();
          alert(data.message);

          if (data.success) {
              closeModal('memberInfoModal');
          }
      } catch (e) {
          alert("통신 오류가 발생했습니다.");
      } finally {
          if(btn) btn.innerText = "정보 수정 완료";
      }
  }

 // ⭐️ 회원정보 창 - 프로필 업데이트 통신
 async function submitEditMemberInfo() {
      const loggedUserId = localStorage.getItem('rion_logged_id') || document.getElementById('editName').value.trim();
      const newPw = document.getElementById('editEmpId').value.trim();
      const phone8 = document.getElementById('editPhone8').value.trim().replace(/[^0-9]/g, '');
      const email = document.getElementById('editEmail').value.trim();
      const company = document.getElementById('editCompany').value.trim();
      const branch = document.getElementById('editBranch').value.trim();

      if (!newPw) { alert("비밀번호를 입력해주세요."); return; }

      const btn = document.querySelector('#memberInfoEditStep button');
      btn.innerText = "수정 중...";

      try {
          const res = await fetch(USER_DB_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'text/plain;charset=utf-8' },
              body: JSON.stringify({
                  action: "updateProfile",
                  userId: loggedUserId,
                  password: newPw,
                  phone: phone8.length === 8 ? `010-${phone8.slice(0,4)}-${phone8.slice(4)}` : '',
                  email: email,
                  company: company,
                  branch: branch
              })
          });
          const data = await res.json();
          alert(data.message || "수정되었습니다.");
          if (data.success) closeModal('memberInfoModal');
      } catch (e) {
          alert("통신 오류가 발생했습니다.");
      } finally {
          btn.innerText = "회원정보 수정 완료";
      }
  }
 // ⭐️ 아이디 찾기 전송 함수 추가
  async function submitFindId() {
      const name = document.getElementById('findIdName').value.trim();
      const phone = document.getElementById('findIdPhone').value.trim();
      if (!name || !phone) {
          alert("이름과 휴대폰 번호를 모두 입력해주세요."); return;
      }
      const btn = document.getElementById('findIdSubmitBtn');
      btn.innerText = "발송 중...";
      try {
          const res = await fetch(USER_DB_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'text/plain;charset=utf-8' },
              body: JSON.stringify({ action: "findId", name: name, phone: phone })
          });
          const data = await res.json();
          alert(data.message);
          if (data.success) {
              closeModal('findIdModal');
              document.getElementById('findIdName').value = '';
              document.getElementById('findIdPhone').value = '';
          }
      } catch (e) {
          alert("통신 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      } finally {
          btn.innerText = "이메일로 아이디 받기";
      }
  }
 async function submitFindPassword() {
      const name = document.getElementById('findPwName').value.trim();
      const phone = document.getElementById('findPwPhone').value.trim();

      if (!name || !phone) {
          alert("이름과 휴대폰 번호를 모두 입력해주세요."); return;
      }

      const btn = document.querySelector('#findPwModal button[onclick="submitFindPassword()"]');
      btn.innerText = "발송 중...";

      try {
          const res = await fetch(USER_DB_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'text/plain;charset=utf-8' },
              // ⭐️ 이메일 대신 이름과 휴대폰번호를 서버로 전송
              body: JSON.stringify({ action: "findPassword", name: name, phone: phone })
          });
          const data = await res.json();

          alert(data.message);
          if (data.success) {
              closeModal('findPwModal');
              document.getElementById('findPwName').value = '';
              document.getElementById('findPwPhone').value = '';
          }
      } catch (e) {
          alert("통신 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      } finally {
          btn.innerText = "임시 비밀번호 발송";
      }
  }
async function submitSignup() {
      const userId = document.getElementById('regUserId').value.trim();
      const name = document.getElementById('regName').value.trim();
      const company = document.getElementById('regCompany').value.trim();
      const branch = document.getElementById('regBranch').value.trim();
      const empId = document.getElementById('regEmpId').value.trim();
      const birth6 = document.getElementById('regBirth6').value.trim();
      const gender1 = document.getElementById('regGender1').value.trim();
      const phone8 = document.getElementById('regPhone8').value.trim();
      const email = document.getElementById('regEmail').value.trim();

      if (!userId || !name || !company || !branch || !empId || !birth6 || !gender1 || !phone8 || !email) {
          alert("모든 가입 항목을 입력해주세요."); return;
      }

      // ⭐️ 필수 약관 3가지 동의 체크 여부 확인
      const chkTerms = document.getElementById('regAgreeTerms').checked;
      const chkPrivacy = document.getElementById('regAgreePrivacy').checked;
      const chkSecurity = document.getElementById('regAgreeSecurity').checked;

      if (!chkTerms || !chkPrivacy || !chkSecurity) {
          alert("이용약관, 개인정보처리방침 및 고객정보(DB) 보호 서약에 모두 동의(체크)하셔야 회원가입이 가능합니다.");
          return;
      }

      const phone = "010-" + phone8.substring(0,4) + "-" + phone8.substring(4);
      const btn = document.querySelector('#signupModal button[onclick="submitSignup()"]');
      btn.innerText = "가입 신청 중...";

      try {
          const res = await fetch(USER_DB_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'text/plain;charset=utf-8' },
              body: JSON.stringify({
                  action: "signup",
                  privacyConsent: "동의",
                  userId: userId,
                  name: name,
                  company: company,
                  branch: branch,
                  empId: empId,
                  birth6: birth6,
                  gender1: gender1,
                  phone: phone,
                  email: email
              })
          });
          const data = await res.json();
          alert(data.message);

          if(data.success) {
              closeModal('signupModal');
              document.getElementById('regUserId').value = '';
              document.getElementById('regName').value = '';
              document.getElementById('regCompany').value = '';
              document.getElementById('regBranch').value = '';
              document.getElementById('regEmpId').value = '';
              document.getElementById('regBirth6').value = '';
              document.getElementById('regGender1').value = '';
              document.getElementById('regPhone8').value = '';
              document.getElementById('regEmail').value = '';
              if (typeof toggleRegAgreeAll === 'function') toggleRegAgreeAll(false);
              if (document.getElementById('regAgreeAll')) document.getElementById('regAgreeAll').checked = false;
          }
      } catch (e) {
          alert("통신 오류가 발생했습니다.");
      } finally {
          btn.innerText = "동의 및 가입 신청 완료하기";
      }
  }

 async function submitLogin(forceLogin = false) {
      const userId = document.getElementById('loginId').value.trim(); 
      const loginPw = document.getElementById('loginPw').value.trim();

      if (!userId || !loginPw) {
          alert("이름과 사번을 입력해주세요."); return;
      }

      const btn = document.getElementById('loginModal').querySelector('button[onclick="submitLogin()"]');
      btn.innerText = "로그인 중...";

      try {
          const res = await fetch(USER_DB_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'text/plain;charset=utf-8' },
              // ⭐️ 강제 로그인 옵션(force) 추가 전송
              body: JSON.stringify({ action: "login", userId: userId, password: loginPw, force: forceLogin })
          });
          const data = await res.json();

          if (data.success) {
             currentUser = { isLoggedIn: true, userId: userId, name: data.name, status: data.status.trim() };

             localStorage.setItem('rion_logged_id', userId); // ⭐️ 실제 로그인 아이디 저장
             localStorage.setItem('rion_logged_user', data.name); // 기존 하위 페이지 호환용 이름 유지
             if(data.role) localStorage.setItem('rion_logged_role', data.role); 
             if(data.sessionId) localStorage.setItem('rion_session_id', data.sessionId);
             sessionStorage.setItem('rion_main_tab_alive', 'true'); // ⭐️ 메인 창 생존 표식
             localStorage.removeItem('rion_main_closed_at');

             updateLoginUI();
             closeModal('loginModal');

             if(currentUser.status === '승인') {
                 alert(`환영합니다! ${currentUser.name}님, 정상 승인되었습니다.`);
                 startSessionCheck(); // ⭐️ 주기적인 로그인 상태 체크 시작
             } else {
                 alert('로그인 되었습니다. 현재 관리자 승인 대기 중입니다.');
             }
          } 
          // ⭐️ 이미 로그인 되어 있는 경우 확인창 띄우기
          else if (data.alreadyLoggedIn) {
             btn.innerText = "로그인 하기";
             if (confirm("기존 로그인을 로그아웃 하시겠습니까?\n확인을 누르시면 기존 자리에서 자동 로그아웃됩니다.")) {
                 submitLogin(true); // 강제 로그인 재실행
             }
          } else {
             alert(data.message);
             btn.innerText = "로그인 하기";
          }
      } catch (e) {
          alert("로그인 통신 오류가 발생했습니다.");
          btn.innerText = "로그인 하기";
      }
  }

 async function submitWithdraw() {
     const userId = document.getElementById('withdrawId').value.trim();
     const loginPw = document.getElementById('withdrawPw').value.trim();

     if (!userId || !loginPw) {
         alert("탈퇴를 위해 이름과 사번을 정확히 입력해주세요."); return;
     }

     if (!confirm(`정말로 잇츠리온에서 탈퇴하시겠습니까?\n모든 데이터가 즉시 삭제되며 복구할 수 없습니다.`)) return;

     const btn = document.getElementById('withdrawModal').querySelector('button[onclick="submitWithdraw()"]');
     btn.innerText = "탈퇴 처리 중...";

     try {
         const res = await fetch(USER_DB_URL, {
             method: 'POST',
             headers: { 'Content-Type': 'text/plain;charset=utf-8' },
             body: JSON.stringify({ action: "withdraw", userId: userId, password: loginPw })
         });
         const data = await res.json();
        alert(data.message);
         if (data.success) {
            closeModal('withdrawModal');
            if(currentUser.isLoggedIn && currentUser.name === userId) {
                logoutUser();
             }
         }
     } catch (e) {
         alert("통신 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
     } finally {
         btn.innerText = "영구 탈퇴하기";
     }
 }

 function updateLoginUI() {
     if (currentUser.isLoggedIn) {
        document.getElementById('loggedOutUI').classList.add('hidden');
        document.getElementById('loggedInUI').classList.remove('hidden');
        document.getElementById('displayUserName').innerText = currentUser.name + " 님";

         const greetingEl = document.getElementById('workspaceGreeting');
         if (greetingEl) {
            greetingEl.innerText = currentUser.name + " 팀장님의 주요 업무 기능";
         }

         const statusEl = document.getElementById('displayUserStatus');
         const dotEl = document.getElementById('statusDot');
         if (currentUser.status === '승인') {
            statusEl.innerText = "(승인완료)";
             statusEl.className = "text-emerald-400 font-semibold";
            dotEl.className = "w-2 h-2 rounded-full bg-emerald-400 animate-pulse";

            localStorage.setItem('rion_logged_user', currentUser.name);
         } else {
            statusEl.innerText = "(승인대기)";
            statusEl.className = "text-amber-400 font-semibold";
            dotEl.className = "w-2 h-2 rounded-full bg-amber-400 animate-pulse";
         }
     } else {
        document.getElementById('loggedOutUI').classList.remove('hidden');
        document.getElementById('loggedInUI').classList.add('hidden');

         const greetingEl = document.getElementById('workspaceGreeting');
         if (greetingEl) {
            greetingEl.innerText = "주요 업무 기능";
         }
     }
 }

function logoutUser() {
      const targetId = currentUser.userId || localStorage.getItem('rion_logged_id') || currentUser.name;
      if (targetId) {
          fetch(USER_DB_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'text/plain;charset=utf-8' },
              body: JSON.stringify({ action: "logout", userId: targetId })
          }).catch(e => console.log(e));
      }

      currentUser = { isLoggedIn: false, userId: '', name: '', status: '' };
      localStorage.removeItem('rion_logged_id');
      localStorage.removeItem('rion_logged_user');
      localStorage.removeItem('rion_logged_role');
      localStorage.removeItem('rion_session_id');
      localStorage.removeItem('rion_last_activity');
      localStorage.removeItem('rion_main_closed_at');
      sessionStorage.removeItem('rion_main_tab_alive');

      const loginIdInput = document.getElementById('loginId');
      const loginPwInput = document.getElementById('loginPw');
      if (loginIdInput) loginIdInput.value = '';
      if (loginPwInput) loginPwInput.value = '';

      updateLoginUI();
      alert('로그아웃 되었습니다.');
  }

// --- ⭐️ 다중 접속 감지 및 자동 로그아웃 엔진 ---
let sessionCheckTimer = null;

function startSessionCheck() {
    if (sessionCheckTimer) clearInterval(sessionCheckTimer);

    sessionCheckTimer = setInterval(async () => {
        if (!currentUser.isLoggedIn) return;

        const currentSession = localStorage.getItem('rion_session_id');
        const targetId = currentUser.userId || localStorage.getItem('rion_logged_id') || currentUser.name;
        if (!currentSession || !targetId) return;

        try {
            const res = await fetch(USER_DB_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ action: "checkSession", userId: targetId, sessionId: currentSession })
            });
            const data = await res.json();

            if (data.sessionExpired) {
                clearInterval(sessionCheckTimer);
                alert("다른 기기에서 로그인이 발생하여 자동으로 로그아웃 되었습니다.");

                currentUser = { isLoggedIn: false, userId: '', name: '', status: '' };
                localStorage.removeItem('rion_logged_id');
                localStorage.removeItem('rion_logged_user');
                localStorage.removeItem('rion_logged_role');
                localStorage.removeItem('rion_session_id');
                updateLoginUI();
            }
        } catch (e) {}
    }, 30000);
  }
  // --- ⭐️ [보안 엔진] 다중 창 동기화, 자동 로그아웃 및 🎬 영상 재생 감지 ---
  let idleTimer = null;
  let countdownTimer = null;
  let isVideoPlaying = false; // 영상 재생 상태 추적

  function initSecurityEngine() {
      const IDLE_TIMEOUT = 29 * 60 * 1000; // 29분 동안 미작동 시 경고창 팝업
      const COUNTDOWN_TIME = 60; // 경고창 팝업 후 60초 카운트다운

      function startIdleTimer() {
          clearTimeout(idleTimer);
          clearInterval(countdownTimer);

          if (localStorage.getItem('rion_logged_user')) {
              idleTimer = setTimeout(() => {
                  const lastActivity = parseInt(localStorage.getItem('rion_last_activity') || '0', 10);
                  const now = Date.now();

                  // ⭐️ 핵심: 영상이 재생 중이거나, 다른 창에서 활동이 있었다면 타이머 연장
                  if (isVideoPlaying || (now - lastActivity < IDLE_TIMEOUT)) {
                      // 영상 재생 중일 경우 현재 시간으로 활동 내역 갱신
                      if (isVideoPlaying) localStorage.setItem('rion_last_activity', now.toString());
                      startIdleTimer(); // 조용히 타이머 재시작 (경고창 안 띄움)
                  } else {
                      showWarningModal(COUNTDOWN_TIME); // 진짜 방치되었을 때만 팝업
                  }
              }, IDLE_TIMEOUT);
          }
      }

      function showWarningModal(seconds) {
          const modal = document.getElementById('sessionWarningModal');
          const countEl = document.getElementById('logoutCountdown');
          if(!modal || !countEl) return;

          modal.classList.remove('hidden');
          let timeLeft = seconds;
          countEl.innerText = timeLeft;

          countdownTimer = setInterval(() => {
              timeLeft -= 1;
              countEl.innerText = timeLeft;

              const lastActivity = parseInt(localStorage.getItem('rion_last_activity') || '0', 10);
              if (Date.now() - lastActivity < 5000) { 
                  clearInterval(countdownTimer);
                  modal.classList.add('hidden');
                  startIdleTimer();
                  return;
              }

              if (timeLeft <= 0) {
                  clearInterval(countdownTimer);
                  modal.classList.add('hidden');
                  logoutUser();
                  setTimeout(() => alert("시간이 초과되어 안전하게 자동 로그아웃 되었습니다."), 100);
              }
          }, 1000);
      }

      function resetOnActivity() {
          const modal = document.getElementById('sessionWarningModal');
          if (modal && modal.classList.contains('hidden')) {
              localStorage.setItem('rion_last_activity', Date.now().toString());
              startIdleTimer();
          }
      }

      // 1. 일반적인 마우스, 키보드, 화면 터치 활동 감지
      ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'].forEach(evt => {
          document.addEventListener(evt, resetOnActivity, true);
      });

      // 2. 🎬 HTML5 영상/음성 재생 자동 감지 로직
      document.addEventListener('play', (e) => {
          if(e.target.tagName === 'VIDEO' || e.target.tagName === 'AUDIO') {
              isVideoPlaying = true;
              resetOnActivity();
          }
      }, true);

      ['pause', 'ended'].forEach(evt => {
          document.addEventListener(evt, (e) => {
              if(e.target.tagName === 'VIDEO' || e.target.tagName === 'AUDIO') {
                  isVideoPlaying = false;
              }
          }, true);
      });

      // 3. 🎬 네이버 드라이브 등 iframe 외부 영상 대응 (세일즈 교육 페이지 예외 처리)
      // 현재 창의 URL 이름에 'education' 또는 'video'가 포함된 경우
      // 사용자가 화면을 가만히 보고만 있어도 5분 단위로 마우스를 움직인 것과 동일하게 처리함
      if (window.location.href.includes('education') || window.location.href.includes('video')) {
          setInterval(() => {
              if (localStorage.getItem('rion_logged_user')) {
                  localStorage.setItem('rion_last_activity', Date.now().toString());
              }
          }, 5 * 60 * 1000); // 5분마다 자동 생명 연장
      }

      // 최초 실행 세팅
      localStorage.setItem('rion_last_activity', Date.now().toString());
      startIdleTimer();

     // ⭐️ 다른 탭 로그아웃 동기화
      window.addEventListener('storage', function(e) {
          if (e.key === 'rion_logged_user' && !e.newValue && currentUser.isLoggedIn) {
              if (sessionCheckTimer) clearInterval(sessionCheckTimer);
              currentUser = { isLoggedIn: false, userId: '', name: '', status: '' };
              sessionStorage.removeItem('rion_main_tab_alive');
              updateLoginUI();
          }
      });

      // ⭐️ 메인 창 닫기 감지 (새로고침과 창 닫기 구분용 타임스탬프 기록)
      window.addEventListener('pagehide', function() {
          if (localStorage.getItem('rion_logged_user')) {
              localStorage.setItem('rion_main_closed_at', Date.now().toString());
          }
      });

      // 모달창 연장 버튼 클릭 연결
      window.extendSession = function() {
          clearInterval(countdownTimer);
          document.getElementById('sessionWarningModal').classList.add('hidden');
          localStorage.setItem('rion_last_activity', Date.now().toString());
          startIdleTimer(); 
      };

      // 모달창 즉시 로그아웃 연결
      window.executeLogoutNow = function() {
          clearInterval(countdownTimer);
          document.getElementById('sessionWarningModal').classList.add('hidden');
          logoutUser();
      };
  }

  document.addEventListener('DOMContentLoaded', () => {
      const savedName = localStorage.getItem('rion_logged_user');
      const savedId = localStorage.getItem('rion_logged_id');
      const savedSession = localStorage.getItem('rion_session_id');
      const isTabAlive = sessionStorage.getItem('rion_main_tab_alive') === 'true';
      const closedAt = parseInt(localStorage.getItem('rion_main_closed_at') || '0', 10);
      const isJustReloaded = closedAt > 0 && (Date.now() - closedAt < 4000); // 4초 이내 재진입은 새로고침(F5)

      if (savedName && savedSession) {
          if (isTabAlive || isJustReloaded) {
              // 새로고침이거나 같은 탭 내 이동이면 로그인 유지
              sessionStorage.setItem('rion_main_tab_alive', 'true');
              localStorage.removeItem('rion_main_closed_at');
              currentUser = { isLoggedIn: true, userId: savedId || savedName, name: savedName, status: '승인' };
              updateLoginUI();
              startSessionCheck();
          } else {
              // 메인 창을 닫았다가 새로 켠 경우 -> 서버 세션 및 로컬 로그인 정보 즉시 파기
              const targetId = savedId || savedName;
              fetch(USER_DB_URL, {
                  method: 'POST',
                  headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                  body: JSON.stringify({ action: "logout", userId: targetId })
              }).catch(() => {});

              localStorage.removeItem('rion_logged_id');
              localStorage.removeItem('rion_logged_user');
              localStorage.removeItem('rion_logged_role');
              localStorage.removeItem('rion_session_id');
              localStorage.removeItem('rion_last_activity');
              localStorage.removeItem('rion_main_closed_at');
          }
      }
      initSecurityEngine();
  });

// ==================== [약관 및 정책 열람 제어] ====================

let currentPolicyType = 'terms';

const RION_POLICIES = {
    terms: {
        title: "잇츠리온(It's RION) 서비스 이용약관",
        html: `
            <div class="space-y-4">
                <div class="p-3.5 bg-white rounded-xl border border-slate-200">
                    <h4 class="font-black text-slate-900 text-sm mb-1.5">제1조 (목적 및 Google 기반 플랫폼 고지)</h4>
                    <p>본 규칙은 잇츠리온(이하 "플랫폼")이 제공하는 보험설계사 전용 영업지원 시스템(고객 DB 배정 관리, AI 알릴의무분석, 보장분석, 못 받은 보험금 탐색기, 세일즈 교육센터, 전문가 자문센터 등)의 이용 조건 및 보안 준수사항을 규정함을 목적으로 합니다. 본 플랫폼은 <b>Google Cloud 및 Google Workspace(Google Sheets, Drive, Calendar 등)</b> 인프라를 기반으로 구동되며, 회원은 가입과 동시에 Google의 클라우드 보안 정책 및 데이터 처리 환경에 동의한 것으로 간주합니다.</p>
                </div>
                <div class="p-3.5 bg-white rounded-xl border border-slate-200">
                    <h4 class="font-black text-slate-900 text-sm mb-1.5">제2조 (회원가입, 승인 및 계정 보안)</h4>
                    <p>1. 회원가입은 보험설계사(소속 회사/지사 및 사번 보유자)가 본 이용약관 및 개인정보처리방침에 사전 동의하고 가입 신청을 완료한 후, 관리자가 최종 <b>'승인'</b>함으로써 효력이 발생합니다.<br>
                    2. 계정은 1인 1계정을 원칙으로 하며, 동시 접속 감지 엔진을 통해 타 기기 중복 로그인 시 기존 세션은 즉시 강제 종료됩니다. 아이디 및 비밀번호를 타인에게 대여·공유하는 행위는 엄격히 금지됩니다.</p>
                </div>
                <div class="p-3.5 bg-white rounded-xl border border-slate-200">
                    <h4 class="font-black text-slate-900 text-sm mb-1.5">제3조 (건강보험심사평가원·한국신용정보원 자료 활용 및 무저장 원칙)</h4>
                    <p>1. 플랫폼 내 <b>[알릴의무분석], [보장분석], [못 받은 보험금 찾기]</b> 기능은 회원이 업로드한 고객의 건강보험심사평가원 및 한국신용정보원 데이터를 자동분석 리포트를 생성하는 보조 도구입니다.<br>
                    2. <b>[서버 무저장 원칙]</b> 업로드된 모든 파일과 추출된 개인·민감·신용정보는 클라우드 연산 메모리에서 <b>일회성 휘발성(Zero-Retention)으로만 처리된 후 즉시 자동 파기</b>되며, 플랫폼 자체 서버나 데이터베이스에 저장·보관되지 않습니다.<br>
                    3. <b>[회원의 적법 동의 확보 의무]</b> 회원은 해당 기능을 사용하기 전, 반드시 정보주체(고객)로부터 「개인정보보호법」 및 「신용정보의 이용 및 보호에 관한 법률」에 따른 적법한 열람·제공 및 분석 동의를 직접 득해야 합니다. 고객의 동의 없이 문서를 무단 열람·업로드하여 발생하는 모든 법적 책임은 전적으로 회원 본인에게 있습니다.<br>
                    4. 데이터를 기반으로 자동분석된  모든 보고서는 영업 참고용 자료이며, 보험사별 인수 기준 및 실제 약관 해석과 차이가 있을 수 있으므로 최종 고지 및 청약 검토의 책임은 담당 설계사에게 있습니다.</p>
                </div>
                <div class="p-3.5 bg-rose-50 rounded-xl border border-rose-200 text-rose-950">
                    <h4 class="font-black text-rose-700 text-sm mb-1.5">제4조 (배정 고객 DB 관리 및 외부 반출·재사용 금지)</h4>
                    <p>1. 플랫폼을 통해 배정된 모든 고객 정보(성명, 연락처, 주소, 생년월일, 상담 녹취파일, 메모 등)는 당해 보험 상담 목적으로만 제한적으로 사용해야 합니다.<br>
                    2. <b>화면 캡처, 사진 촬영, 인쇄, 복사, 녹취파일 불법 추출, 제3자(타 GA 및 타 설계사 포함)에게 유출·양도·매매하는 행위는 원천 금지</b>됩니다.<br>
                    3. 배정 기한(24시간~단계별 기한) 초과, '거절', '본인설계사' 등으로 인해 <b>시스템에서 자동 회수(회수완료)된 DB는 즉시 열람 권한이 소멸되며, 회원이 이를 별도 수첩·엑셀·휴대폰에 저장해 두었다가 사후에 재접촉하거나 재사용하는 행위를 절대 금지</b>합니다.<br>
                    4. 본 조항 위반 적발 시 사전 통보 없이 <b>즉시 회원 자격 박탈 및 DB 배정 영구 중지</b> 처리되며, 「개인정보보호법」 제71조 및 부정경쟁방지법에 의거하여 민·형사상 고소 및 손해배상 청구가 진행됩니다.</p>
                </div>
                <div class="p-3.5 bg-white rounded-xl border border-slate-200">
                    <h4 class="font-black text-slate-900 text-sm mb-1.5">제5조 (교육 자료 및 저작권 보호)</h4>
                    <p>세일즈 교육센터의 모든 영상 강의, 세일즈북, 자료실 문서 및 분석 엔진의 UI/알고리즘에 대한 지식재산권은 잇츠리온에 귀속됩니다. 이를 무단 복제, 녹화, 외부 커뮤니티 배포 또는 타 조직 교육용으로 반출하는 행위를 엄격히 금지합니다.</p>
                </div>
            </div>
        `
    },
    privacy: {
        title: "잇츠리온(It's RION) 개인정보처리방침",
        html: `
            <div class="space-y-4">
                <p class="text-slate-600">잇츠리온(이하 "플랫폼")은 「개인정보 보호법」 제30조에 따라 회원의 개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 다음과 같이 개인정보처리방침을 수립·공개합니다.</p>
                <div class="p-3.5 bg-white rounded-xl border border-slate-200">
                    <h4 class="font-black text-slate-900 text-sm mb-1.5">1. 개인정보의 처리 목적</h4>
                    <p>플랫폼은 다음의 목적을 위하여 최소한의 개인정보를 처리합니다.<br>
                    ① <b>회원 가입 및 관리:</b> 설계사 본인 식별, 소속 확인, 관리자 가입 승인 심사, 부정 이용 방지 및 단일 세션 관리<br>
                    ② <b>영업지원 서비스 제공:</b> 지역별·한도별 맞춤 고객 자동 배정 등록, 알리고(Aligo) SMS 배정 알림 발송, 상담 현황 및 계약 통계 산출, Google 캘린더 상담 일정 자동 연동, 전문가 자문 매칭</p>
                </div>
                <div class="p-3.5 bg-white rounded-xl border border-slate-200">
                    <h4 class="font-black text-slate-900 text-sm mb-1.5">2. 처리하는 개인정보의 항목</h4>
                    <p>• <b>필수항목(회원):</b> 아이디, 이름, 소속 회사명, 소속 지사명, 사번(비밀번호), 생년월일(6자리), 성별(1자리), 휴대전화번호, 이메일 주소, 약관 동의 여부<br>
                    • <b>자동 수집 항목:</b> 접속 세션 ID, 로그인 및 활동 타임스탬프, 서비스 이용 기록<br>
                    • <b>고객 분석 자료(심평원·신용정보원 자료) 관련 특칙:</b> 회원이 업무센터 분석 도구에 업로드하는 고객의 민감정보 및 개인정보 데이터는 브라우저 및 클라우드 연산 컨테이너에서 <b>실시간 분석 후 즉시 휘발(삭제)</b>되며, 플랫폼의 데이터베이스에 저장·수집되지 않습니다.</p>
                </div>
                <div class="p-3.5 bg-white rounded-xl border border-slate-200">
                    <h4 class="font-black text-slate-900 text-sm mb-1.5">3. 개인정보의 처리 및 보유 기간</h4>
                    <p>회원의 개인정보는 원칙적으로 <b>회원 탈퇴 시 또는 위촉 계약 해지 시까지</b> 보유·이용하며, 회원이 탈퇴를 요청하거나 개인정보 수집·이용 목적이 달성된 후에는 해당 데이터를 지체 없이 영구 파기합니다. 단, 관계 법령 및 내부 부정사용 감사를 위해 보존할 필요가 있는 경우 일정 기간 보관 후 파기합니다.</p>
                </div>
                <div class="p-3.5 bg-white rounded-xl border border-slate-200">
                    <h4 class="font-black text-slate-900 text-sm mb-1.5">4. 개인정보 처리의 위탁 및 클라우드 인프라</h4>
                    <p>플랫폼은 원활한 전산 업무 처리를 위하여 다음과 같이 클라우드 인프라 및 외부 서비스를 활용(위탁)하고 있습니다.<br>
                    • <b>Google LLC (Google Workspace / Google Cloud):</b> 회원 DB 및 배정 현황 시트 암호화 보관, 녹취/자료실 파일 스트리밍, 고객 데이터 AI분석 연산, 캘린더 일정 연동<br>
                    • <b>알리고 (Aligo / 카페24 연동):</b> 신규 고객 등록 안내 SMS 문자 발송</p>
                </div>
                <div class="p-3.5 bg-white rounded-xl border border-slate-200">
                    <h4 class="font-black text-slate-900 text-sm mb-1.5">5. 정보 주체의 권리·의무 및 행사방법</h4>
                    <p>회원은 언제든지 상단 메뉴의 <b>[회원정보]</b>를 통해 본인의 개인정보를 열람·정정할 수 있으며, <b>[회원탈퇴]</b>를 통해 개인정보 수집·이용 동의를 철회하고 데이터를 즉시 삭제할 수 있습니다.</p>
                </div>
                <div class="p-3.5 bg-white rounded-xl border border-slate-200">
                    <h4 class="font-black text-slate-900 text-sm mb-1.5">6. 개인정보 보호책임자 및 문의처</h4>
                    <p>• <b>책임자/관리부서:</b> 잇츠리온 운영관리본부 (김성철 지사장)<br>
                    • <b>연락처:</b> 070-8633-2747 | <b>이메일:</b> bl0ckrussian@gmail.com</p>
                </div>
            </div>
        `
    },
    security: {
        title: "고객 정보(DB) 보호 및 민감정보 적법 활용 서약서",
        html: `
            <div class="space-y-4">
                <div class="p-4 bg-rose-50 rounded-xl border border-rose-200 text-rose-950 space-y-2.5">
                    <h4 class="font-black text-rose-700 text-sm">⚠️ [필수 서약] 제공 고객정보 외부 반출·무단 재사용 절대 금지</h4>
                    <p>1. 본인은 잇츠리온 시스템을 통해 배정받은 모든 고객 정보(이름, 연락처, 주소, 생년월일, 녹취파일, 상담 메모 일체)를 오직 지정된 보험 상담 목적으로만 열람하며, <b>화면 캡처, 사진 촬영, 무단 복제하거나 외부(타사 설계사, 제3자 등)에 유출·매매·공유하지 않을 것</b>을 엄중히 서약합니다.</p>
                    <p>2. 미작업 기한 경과, 거절, 본인설계사 등으로 인해 <b>시스템에서 회수된 고객 DB를 개인 휴대폰이나 별도 파일에 기록해 두었다가 사후에 연락하거나 재사용하지 않을 것</b>을 서약합니다.</p>
                    <p>3. 건강보험심사평가원 및 한국신용정보원 자료 분석 기능을 활용할 때에는 <b>반드시 사전에 고객 본인의 명시적 동의를 득한 후 업로드</b>하며, 분석 완료 후 다운로드한 결과 파일 역시 고객 상담 목적 외로 유출하지 않겠습니다.</p>
                    <p class="font-bold text-rose-700 pt-1">※ 위 서약을 위반할 경우 즉시 계정 영구 정지 및 기배정 DB 전량 회수에 이의를 제기하지 않으며, 「개인정보 보호법」 제71조(5년 이하의 징역 또는 5천만원 이하의 벌금)에 따른 모든 민·형사상 법적 책임을 본인이 전적으로 부담할 것에 동의합니다.</p>
                </div>
            </div>
        `
    }
};

function openPolicyModal(type) {
    currentPolicyType = type || 'terms';
    const policy = RION_POLICIES[currentPolicyType] || RION_POLICIES.terms;
    document.getElementById('policyModalTitle').innerText = policy.title;
    document.getElementById('policyModalBody').innerHTML = policy.html;
    openModal('policyViewerModal');
}

function openPolicyInNewWindow() {
    const policy = RION_POLICIES[currentPolicyType] || RION_POLICIES.terms;
    const win = window.open('', '_blank', 'width=820,height=760,scrollbars=yes,resizable=yes');
    if (!win) {
        alert('팝업 차단을 해제해 주세요.');
        return;
    }
    win.document.write(`
        <!DOCTYPE html>
        <html lang="ko">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${policy.title}</title>
            <script src="https://cdn.tailwindcss.com"><\/script>
            <style>@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css'); body { font-family: 'Pretendard', sans-serif; }</style>
        </head>
        <body class="bg-slate-100 p-6 sm:p-10 text-slate-800">
            <div class="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                <div class="bg-slate-900 text-white px-6 py-5 flex justify-between items-center">
                    <div>
                        <span class="text-[11px] text-blue-400 font-bold">It's RION POLICY</span>
                        <h1 class="text-lg sm:text-xl font-black mt-0.5">${policy.title}</h1>
                    </div>
                    <button onclick="window.print()" class="bg-slate-800 hover:bg-slate-700 text-xs font-bold px-3 py-1.5 rounded border border-slate-700">🖨️ 인쇄</button>
                </div>
                <div class="p-6 text-xs sm:text-sm leading-relaxed">${policy.html}</div>
                <div class="px-6 py-4 bg-slate-50 border-t border-slate-200 text-right">
                    <button onclick="window.close()" class="bg-slate-900 text-white text-xs font-bold px-5 py-2 rounded-lg">창 닫기</button>
                </div>
            </div>
        </body>
        </html>
    `);
    win.document.close();
}

function toggleRegAgreeAll(checked) {
    document.querySelectorAll('.reg-agree-item').forEach(el => el.checked = checked);
}

function syncRegAgreeState() {
    const items = Array.from(document.querySelectorAll('.reg-agree-item'));
    const allChecked = items.every(el => el.checked);
    const allBox = document.getElementById('regAgreeAll');
    if (allBox) allBox.checked = allChecked;
}

// ==================== [보안: 우클릭, 드래그, 소스보기(F12/Ctrl+U) 차단] ====================
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
