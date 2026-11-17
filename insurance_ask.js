function closeAskWindow() {
    window.close();
}

function triggerAdvPhotoFile() {
    const el = document.getElementById('advPhotoFile');
    if (el) el.click();
}

function triggerPostFile() {
    const el = document.getElementById('postFile');
    if (el) el.click();
}

function triggerInfoFile() {
    const el = document.getElementById('infoFile');
    if (el) el.click();
}

 // ⭐️ 앱스 스크립트 웹앱 주소 입력 필수!
 const ASK_DB_URL = "https://script.google.com/macros/s/AKfycbza5DquXQvms-rDWJkcfq-iERjXnuMSJPKU-ZOH1Z_FvxFMbL5aVt3IGyzpRFL05qyP/exec";

 const loggedUser = localStorage.getItem('rion_logged_user');
 const loggedRole = localStorage.getItem('rion_logged_role') || ''; 
 const urlParams = new URLSearchParams(window.location.search);
 const expertType = urlParams.get('type') || '변호사'; 

 let boardData = []; 
 let advisorData = [];
 let infoBoardData = []; 

 let currentDetailRowIdx = null;
 let currentDetailFileId = null;
 let activePostRowIdx = null; 

 document.getElementById('headerTitle').innerText = `${expertType} 자문센터`;
 document.getElementById('infoBoardTitle').innerText = `${expertType} 자문위원 정보공유`;
 const iconMap = { '변호사': '⚖️', '세무사': '📑', '공인회계사': '📊', '변리사': '💡', '손해사정사': '🛡️', '공인노무사': '👥' };
 document.getElementById('expertIcon').innerText = iconMap[expertType] || '🏛️';

window.onload = function() {
     if (!loggedUser) { 
         alert("회원만 접근 가능합니다."); 
         window.close(); 
         location.replace('./index.html');
         return; 
     }

     // ⭐️ [3번 반영] 자문센터 이용 및 글 작성 중 메인 창 자동 로그아웃 방지 (3분마다 활성 시간 갱신)
     localStorage.setItem('rion_last_activity', Date.now().toString());
     setInterval(() => {
         if (localStorage.getItem('rion_logged_user')) {
             localStorage.setItem('rion_last_activity', Date.now().toString());
         }
     }, 3 * 60 * 1000);

     const requiredAdminRole = `자문관리자(${expertType})`;
     const isAdmin = loggedRole.includes(requiredAdminRole) || loggedRole === '최고관리자' || loggedUser === '김성철';

     if (isAdmin) {
         document.getElementById('adminControls').classList.remove('hidden');
         document.getElementById('infoUploadBtn').classList.remove('hidden'); 
     }
     loadAllData();
 };

 // =====================================
 // DATA LOAD & RENDER
 // =====================================
 async function loadAllData() {
     try {
         const res = await fetch(ASK_DB_URL, {
             method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
             body: JSON.stringify({ action: "getAskData", expertType: expertType })
         });
         const result = await res.json();
         if(result.success) {
             boardData = result.boardData || [];
             advisorData = result.advisorData || [];
             infoBoardData = result.infoBoardData || []; 

             renderBoard(); renderAdvisors(); renderInfoBoard();

             if(activePostRowIdx && !document.getElementById('postDetailModal').classList.contains('hidden')) {
                 openPostDetail(activePostRowIdx);
             }
         }
     } catch(e) {}
 }

 function renderAdvisors() {
     const listArea = document.getElementById('advisorListArea');
     listArea.innerHTML = '';
     if (advisorData.length === 0) { listArea.innerHTML = '<div class="text-center py-10 text-slate-400 text-sm">등록된 자문위원이 없습니다.</div>'; return; }
     advisorData.forEach(adv => {
         let photoHtml = `<div class="w-[60px] h-[80px] bg-slate-100 rounded flex flex-shrink-0 items-center justify-center text-2xl border border-slate-200">👤</div>`;
         if (adv.photoData && adv.photoData.id) { photoHtml = `<img src="https://drive.google.com/thumbnail?id=${adv.photoData.id}&sz=w200" class="w-[60px] h-[80px] object-cover rounded border border-slate-200 flex-shrink-0">`; }
         const div = document.createElement('div');
         div.className = 'border border-slate-200 rounded-lg p-3 cursor-pointer hover:border-blue-400 hover:shadow-md transition bg-white';
         div.onclick = () => openAdvisorDetail(adv);
         div.innerHTML = `<div class="flex items-center gap-4">${photoHtml}<div class="overflow-hidden flex-1"><h3 class="font-bold text-slate-900">${adv.name} <span class="text-[10px] text-blue-600 font-semibold ml-1 bg-blue-50 px-1.5 py-0.5 rounded">${expertType}</span></h3><p class="text-[11px] text-slate-500 mt-1 line-clamp-2">${adv.history}</p></div></div>`;
         listArea.appendChild(div);
     });
 }

 function renderBoard() {
     const listArea = document.getElementById('boardListArea');
     listArea.innerHTML = '';
     if (boardData.length === 0) { listArea.innerHTML = '<div class="text-center py-10 text-slate-400 text-sm">등록된 게시물이 없습니다.</div>'; return; }

     boardData.sort((a,b) => b.rowIdx - a.rowIdx).forEach((item) => {
         const statusClass = item.status === '답변완료' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700';
         const isSecret = item.isSecret === true || String(item.isSecret).toLowerCase() === 'true';
         const secretIcon = isSecret ? '🔒 ' : '';

         const div = document.createElement('div');
         div.className = 'border border-slate-200 rounded-lg overflow-hidden bg-white hover:border-blue-300 transition cursor-pointer p-3.5';

         // 클릭 시 모달창 열기 함수에 속성 전달
         div.onclick = () => openPostDetail(item.rowIdx);
         div.innerHTML = `
             <div class="flex justify-between items-center">
                 <div class="flex items-center gap-3 overflow-hidden">
                     <span class="text-[10px] font-bold ${statusClass} px-2 py-0.5 rounded flex-shrink-0">${item.status || '대기중'}</span>
                     <h4 class="font-bold text-sm text-slate-800 truncate">${secretIcon}${item.title}</h4>
                 </div>
                 <div class="flex items-center gap-4 text-xs text-slate-500 font-medium flex-shrink-0">
                     <span>${item.author}</span><span>${item.date}</span>
                 </div>
             </div>
         `;
         listArea.appendChild(div);
     });
 }

 function renderInfoBoard() {
     const tbody = document.getElementById('infoBoardBody');
     tbody.innerHTML = '';
     if (infoBoardData.length === 0) { tbody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-slate-400">등록된 공유 자료가 없습니다.</td></tr>'; return; }

     const isAdmin = loggedRole.includes(`자문관리자(${expertType})`) || loggedRole === '최고관리자' || loggedUser === '김성철';

     infoBoardData.sort((a,b) => b.rowIdx - a.rowIdx).forEach((item, index) => {
         const tr = document.createElement('tr');
         tr.className = 'border-b border-slate-100 hover:bg-slate-50 transition';

         let dlBtn = `<button onclick="window.open('${item.fileData ? item.fileData.url : ''}', '_blank')" class="bg-white border border-slate-300 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 px-3 py-1.5 rounded text-xs font-bold transition shadow-sm">내려받기</button>`;
         if (isAdmin) dlBtn += ` <button onclick="deleteInfoPost(${item.rowIdx}, '${item.fileData ? item.fileData.id : ''}')" class="bg-white border border-rose-300 text-rose-500 hover:bg-rose-50 px-3 py-1.5 rounded text-xs font-bold transition shadow-sm ml-1">삭제</button>`;

         tr.innerHTML = `
             <td class="p-3 text-center text-slate-500 align-middle">${infoBoardData.length - index}</td>
             <td class="p-3 text-center align-middle"><span class="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded">${item.category}</span></td>
             <td class="p-3 align-middle">
                 <div class="font-bold text-slate-800">${item.title}</div>
                 <div class="text-[11px] text-slate-500 mt-0.5 line-clamp-1">${item.content}</div>
             </td>
             <td class="p-3 text-center font-bold text-slate-600 align-middle">${item.author}</td>
             <td class="p-3 text-center text-slate-500 align-middle text-xs">${item.date}</td>
             <td class="p-3 text-center whitespace-nowrap align-middle">${dlBtn}</td>
         `;
         tbody.appendChild(tr);
     });
 }

 // =====================================
 // 모달 제어 및 디테일 보기
 // =====================================
 function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
 function closeModal(id) { document.getElementById(id).classList.add('hidden'); }
 function togglePasswordField() {
     const isChecked = document.getElementById('isSecret').checked;
     const container = document.getElementById('passwordFieldContainer');
     if (isChecked) { container.classList.remove('hidden'); document.getElementById('postPassword').required = true; } 
     else { container.classList.add('hidden'); document.getElementById('postPassword').required = false; document.getElementById('postPassword').value = ''; }
 }

 // ⭐️ 게시물 상세 보기
 function openPostDetail(rowIdx) {
     const item = boardData.find(d => d.rowIdx === rowIdx);
     if (!item) return;

     const isAdmin = loggedRole.includes(`자문관리자(${expertType})`) || loggedRole === '최고관리자' || loggedUser === '김성철';
     const isOwner = loggedUser === item.author;
     const isSecret = item.isSecret === true || String(item.isSecret).toLowerCase() === 'true';

     // 비밀글 검증
     if (isSecret && !isOwner && !isAdmin) {
         const inputPw = prompt("🔒 이 글은 비밀글입니다. 작성 시 입력한 비밀번호 4자리를 입력해주세요.");
         if (inputPw === null) return; 
         if (inputPw !== String(item.password)) { alert("비밀번호가 일치하지 않습니다."); return; }
     }

     activePostRowIdx = rowIdx;
     const statusClass = item.status === '답변완료' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700';

     document.getElementById('detailModalStatus').className = `text-[10px] font-bold ${statusClass} px-2 py-0.5 rounded`;
     document.getElementById('detailModalStatus').innerText = item.status || '대기중';
     document.getElementById('detailModalSubject').innerText = item.title;
     document.getElementById('detailModalAuthor').innerText = item.author;
     document.getElementById('detailModalDate').innerText = item.date;
     document.getElementById('detailModalContent').innerText = item.content;

     // 다운로드 및 삭제 버튼 렌더링
     const fileArea = document.getElementById('detailModalFileArea');
     const fileBtn = document.getElementById('detailModalFileBtn');
     const deleteBtn = document.getElementById('detailModalDeleteBtn');
     const fileIcon = document.getElementById('detailModalFileIcon');
     const fileNameText = document.getElementById('detailModalFileName');

     // 1. 파일 세팅 유무
     if (item.fileData && item.fileData.url) {
         fileArea.classList.remove('hidden');
         fileIcon.innerText = "📎";
         fileNameText.innerText = item.fileData.name;
         fileBtn.classList.remove('hidden');
         fileBtn.onclick = () => window.open(item.fileData.url, '_blank');
     } else {
         fileArea.classList.remove('hidden');
         fileIcon.innerText = "📄";
         fileNameText.innerText = "첨부파일 없음";
         fileBtn.classList.add('hidden');
     }

     // 2. 삭제 권한 노출
     if (isOwner || isAdmin) {
         deleteBtn.classList.remove('hidden');
         deleteBtn.onclick = () => deletePost(item.rowIdx, item.fileData ? item.fileData.id : null);
     } else {
         deleteBtn.classList.add('hidden');
     }

     // 만약 첨부파일도 없고 삭제권한도 없으면 해당 바 자체를 숨김
     if (!(item.fileData && item.fileData.url) && !(isOwner || isAdmin)) {
         fileArea.classList.add('hidden');
     }

     // 댓글 세팅
     const replyArea = document.getElementById('detailModalReplyArea');
     if (item.adminReply) {
         replyArea.innerHTML = '';
         item.adminReply.split('||').forEach(rep => {
             if(!rep) return;
             const p = document.createElement('p');
             p.className = 'pb-2 mb-2 border-b border-slate-200 last:border-0 last:mb-0';
             p.innerText = rep;
             replyArea.appendChild(p);
         });
     } else { replyArea.innerHTML = '<span class="text-slate-400 italic">아직 등록된 답변이 없습니다.</span>'; }

     openModal('postDetailModal');
 }

 async function submitReply(e) {
     e.preventDefault();
     const replyText = document.getElementById('replyContent').value.trim();
     if(!replyText) return;
     const btn = document.getElementById('replySubmitBtn');
     btn.innerText = "등록 중..."; btn.disabled = true;

     // ⭐️ [2번 반영] 댓글 구분자(||)와 충돌하지 않도록 단일 기호(|)로 자동 변환
     const cleanReply = replyText.replace(/\|\|/g, '|');
     const formattedReply = `[${loggedUser}] ${cleanReply}`; 

     try {
         const res = await fetch(ASK_DB_URL, {
             method: "POST", headers: { 'Content-Type': 'text/plain;charset=utf-8' },
             body: JSON.stringify({ action: "addReply", expertType: expertType, rowIdx: activePostRowIdx, newReply: formattedReply })
         });
         const result = await res.json();
         if(result.success) { document.getElementById('replyForm').reset(); loadAllData(); } 
         else { alert("등록 실패"); }
     } catch(error) { alert("통신 오류 발생"); }
     btn.innerText = "답변 등록"; btn.disabled = false;
 }

 // =====================================
 // 상단 문의글 작성 및 업로드
 // =====================================
 function openWriteModal() {
     document.getElementById('askFormContainer').reset();
     cancelUpload(); togglePasswordField(); openModal('writeModal');
 }
 function closeWriteModal() {
     closeModal('writeModal'); document.getElementById('askFormContainer').classList.remove('hidden'); document.getElementById('uploadProgressContainer').classList.add('hidden');
 }
 function handleFileSelect(e) {
     const file = e.target.files[0];
     if (!file) return;
     if (file.size > 10 * 1024 * 1024) { alert("파일은 10MB 이하만 가능합니다."); cancelUpload(); return; }
     const reader = new FileReader();
     reader.onload = function(ev) {
         document.getElementById('uploadStatus').classList.remove('hidden');
         document.getElementById('uploadedFileName').innerText = file.name;
         document.getElementById('postFileName').value = file.name;
         document.getElementById('postFileMime').value = file.type;
         document.getElementById('postFileBase64').value = ev.target.result.split(',')[1];
     };
     reader.readAsDataURL(file);
 }
 function cancelUpload() { document.getElementById('postFile').value = ''; document.getElementById('uploadStatus').classList.add('hidden'); document.getElementById('postFileBase64').value = ''; document.getElementById('postFileName').value = ''; }

 async function startRealUpload() {
     const title = document.getElementById('postTitle').value;
     const content = document.getElementById('postContent').value;
     const isSecret = document.getElementById('isSecret').checked;
     const password = document.getElementById('postPassword').value;
     if (!title || !content) { alert("제목과 내용을 입력해주세요."); return; }
     if (isSecret && !password) { alert("비밀번호를 입력해주세요."); return; }

     document.getElementById('askFormContainer').classList.add('hidden');
     document.getElementById('uploadProgressContainer').classList.remove('hidden');

     let progress = 0; const bar = document.getElementById('progressBar'); const pct = document.getElementById('progressPercentText');
     const interval = setInterval(() => { if (progress < 90) { progress += 10; bar.style.width = progress + '%'; pct.innerText = progress + '%'; } }, 300);

     const b64 = document.getElementById('postFileBase64').value;
     const hasFile = b64 && b64.length > 0;
     const payload = {
         action: "writeAskPost", expertType: expertType, title: title, content: content, author: loggedUser,
         isSecret: isSecret, password: password, 
         fileName: hasFile ? document.getElementById('postFileName').value : "",
         mimeType: hasFile ? document.getElementById('postFileMime').value : "", fileData: hasFile ? b64 : ""        
     };

     try {
         const res = await fetch(ASK_DB_URL, { 
             method: "POST", 
             headers: { 'Content-Type': 'text/plain;charset=utf-8' },
             body: JSON.stringify(payload) 
         });
         const result = await res.json();
         clearInterval(interval);
         if (result.success) { bar.style.width = '100%'; pct.innerText = '100%'; setTimeout(() => { alert("게시글이 등록되었습니다."); closeWriteModal(); loadAllData(); }, 500); } 
         else { alert("오류"); closeWriteModal(); }
     } catch(e) { clearInterval(interval); alert("통신 오류 발생"); closeWriteModal(); }
 }

 // ⭐️ 작성자/관리자 게시글 및 파일 삭제
 async function deletePost(rowIdx, fileId) {
     if (!confirm("게시글과 연결된 첨부파일을 영구 삭제하시겠습니까?")) return;
     try {
         const res = await fetch(ASK_DB_URL, {
             method: "POST", 
             headers: { 'Content-Type': 'text/plain;charset=utf-8' },
             body: JSON.stringify({ action: "deleteAskPost", expertType: expertType, rowIdx: rowIdx, fileId: fileId })
         });
         const result = await res.json();
         if (result.success) { alert("삭제 완료"); closeModal('postDetailModal'); loadAllData(); }
     } catch(e) { alert("삭제 실패"); }
 }

 // =====================================
 // 하단 정보공유 자료 업로드
 // =====================================
 function openInfoUploadModal() {
     document.getElementById('infoFormContainer').reset();
     cancelInfoUpload(); openModal('infoUploadModal');
 }
 function closeInfoUploadModal() {
     closeModal('infoUploadModal'); document.getElementById('infoFormContainer').classList.remove('hidden'); document.getElementById('infoProgressContainer').classList.add('hidden');
 }
 function handleInfoFileSelect(e) {
     const file = e.target.files[0];
     if (!file) return;
     if (file.size > 10 * 1024 * 1024) { alert("파일은 10MB 이하만 가능합니다."); cancelInfoUpload(); return; }
     const reader = new FileReader();
     reader.onload = function(ev) {
         document.getElementById('infoUploadStatus').classList.remove('hidden');
         document.getElementById('infoUploadedFileName').innerText = file.name;
         document.getElementById('infoFileName').value = file.name;
         document.getElementById('infoFileMime').value = file.type;
         document.getElementById('infoFileBase64').value = ev.target.result.split(',')[1];
     };
     reader.readAsDataURL(file);
 }
 function cancelInfoUpload() { document.getElementById('infoFile').value = ''; document.getElementById('infoUploadStatus').classList.add('hidden'); document.getElementById('infoFileBase64').value = ''; document.getElementById('infoFileName').value = ''; }

 async function startInfoUpload() {
     const cat = document.getElementById('infoCategory').value;
     const title = document.getElementById('infoTitle').value;
     const content = document.getElementById('infoContent').value;
     const b64 = document.getElementById('infoFileBase64').value;
     if (!cat || !title || !content || !b64) { alert("분류, 제목, 내용, 첨부파일을 모두 입력해주세요."); return; }

     document.getElementById('infoFormContainer').classList.add('hidden');
     document.getElementById('infoProgressContainer').classList.remove('hidden');

     let progress = 0; const bar = document.getElementById('infoBar'); const pct = document.getElementById('infoPercentText');
     const interval = setInterval(() => { if (progress < 90) { progress += 10; bar.style.width = progress + '%'; pct.innerText = progress + '%'; } }, 300);

     const payload = {
         action: "uploadInfoData", expertType: expertType, category: cat, title: title, content: content, author: loggedUser,
         fileName: document.getElementById('infoFileName').value, mimeType: document.getElementById('infoFileMime').value, fileData: b64
     };

     try {
         const res = await fetch(ASK_DB_URL, { 
             method: "POST", 
             headers: { 'Content-Type': 'text/plain;charset=utf-8' },
             body: JSON.stringify(payload) 
         });
         const result = await res.json();
         clearInterval(interval);
         if (result.success) { bar.style.width = '100%'; pct.innerText = '100%'; setTimeout(() => { alert("공유 자료가 등록되었습니다."); closeInfoUploadModal(); loadAllData(); }, 500); } 
         else { alert("오류"); closeInfoUploadModal(); }
     } catch(e) { clearInterval(interval); alert("통신 오류 발생"); closeInfoUploadModal(); }
 }

 async function deleteInfoPost(rowIdx, fileId) {
     if (!confirm("공유 자료와 파일을 영구 삭제하시겠습니까?")) return;
     try {
         const res = await fetch(ASK_DB_URL, { 
             method: "POST", 
             headers: { 'Content-Type': 'text/plain;charset=utf-8' },
             body: JSON.stringify({ action: "deleteInfoData", expertType: expertType, rowIdx: rowIdx, fileId: fileId }) 
         });
         const result = await res.json();
         if (result.success) { alert("삭제 완료"); loadAllData(); }
     } catch(e) { alert("삭제 실패"); }
 }

 function openAdvisorDetail(adv) {
     document.getElementById('detailName').innerText = adv.name;
     document.getElementById('detailHistory').innerText = adv.history;
     document.getElementById('detailSpecialty').innerText = adv.specialty;
     let photoHtml = `👤`;
     if (adv.photoData && adv.photoData.id) {
         photoHtml = `<img src="https://drive.google.com/thumbnail?id=${adv.photoData.id}&sz=w400" class="w-full h-full object-cover">`;
     }
     document.getElementById('detailPhotoContainer').innerHTML = photoHtml;
     const canDelete = (loggedUser === adv.authorId || loggedRole.includes(`자문관리자(${expertType})`) || loggedRole === '최고관리자' || loggedUser === '김성철');
     if (canDelete) {
         document.getElementById('detailDeleteBtnContainer').classList.remove('hidden');
         currentDetailRowIdx = adv.rowIdx;
         currentDetailFileId = adv.photoData ? adv.photoData.id : null;
     } else { document.getElementById('detailDeleteBtnContainer').classList.add('hidden'); }
     openModal('advisorViewModal');
 }

 function openAdvisorRegModal() { document.getElementById('advRegForm').reset(); cancelAdvPhoto(); openModal('advisorRegModal'); }
 function handleAdvPhotoSelect(e) {
     const file = e.target.files[0];
     if (!file) return;
     const reader = new FileReader();
     reader.onload = function(e) {
         document.getElementById('advPhotoStatus').classList.remove('hidden');
         document.getElementById('advPhotoFileName').innerText = file.name;
         document.getElementById('advPhotoName').value = file.name;
         document.getElementById('advPhotoMime').value = file.type;
         document.getElementById('advPhotoBase64').value = e.target.result.split(',')[1];
     };
     reader.readAsDataURL(file);
 }
 function cancelAdvPhoto() { document.getElementById('advPhotoFile').value = ''; document.getElementById('advPhotoStatus').classList.add('hidden'); document.getElementById('advPhotoBase64').value = ''; document.getElementById('advPhotoName').value = ''; }

 async function submitAdvisorReg(e) {
     e.preventDefault();
     const btn = document.getElementById('submitAdvBtn');
     btn.innerText = "저장 중..."; btn.disabled = true;

     const base64Data = document.getElementById('advPhotoBase64').value;
     const hasFile = base64Data && base64Data.length > 0;
     const payload = {
         action: "registerAdvisor", expertType: expertType,
         name: document.getElementById('regAdvName').value,
         history: document.getElementById('regAdvHistory').value,
         specialty: document.getElementById('regAdvSpecialty').value, authorId: loggedUser,
         fileName: hasFile ? document.getElementById('advPhotoName').value : "",
         mimeType: hasFile ? document.getElementById('advPhotoMime').value : "", fileData: hasFile ? base64Data : ""
     };
     try {
         const res = await fetch(ASK_DB_URL, { 
             method: "POST", 
             headers: { 'Content-Type': 'text/plain;charset=utf-8' },
             body: JSON.stringify(payload) 
         });
         const result = await res.json();
         if(result.success) { alert("프로필이 등록되었습니다."); closeModal('advisorRegModal'); loadAllData(); } else { alert("등록 실패"); }
     } catch(e) { alert("오류 발생"); }
     btn.innerText = "저장 및 반영"; btn.disabled = false;
 }

 async function deleteAdvisorProfile() {
     if(!confirm("자문위원 프로필과 사진을 영구 삭제하시겠습니까?")) return;

     // 💡 삭제 버튼 비활성화 (중복 클릭 방지)
     const delBtnContainer = document.getElementById('detailDeleteBtnContainer');
     const originalHtml = delBtnContainer.innerHTML;
     delBtnContainer.innerHTML = '<button class="w-full bg-slate-200 text-slate-500 text-xs font-bold py-2 rounded cursor-not-allowed">삭제 처리 중...</button>';

     try {
         // 💡 수정: headers 규격을 명시하여 구글 앱스크립트 서버 오류(CORS) 방지
         const res = await fetch(ASK_DB_URL, { 
             method: "POST", 
             headers: { 'Content-Type': 'text/plain;charset=utf-8' },
             body: JSON.stringify({ 
                 action: "deleteAdvisor", 
                 expertType: expertType, 
                 rowIdx: currentDetailRowIdx, 
                 fileId: currentDetailFileId 
             }) 
         });

         const result = await res.json();

         if(result.success) { 
             alert("삭제 완료되었습니다."); 
             closeModal('advisorViewModal'); 
             loadAllData(); // 화면 즉시 갱신
         } else {
             alert("삭제 실패: " + result.message);
             delBtnContainer.innerHTML = originalHtml; // 롤백
         }
     } catch(e) { 
         alert("삭제 중 통신 오류가 발생했습니다."); 
         delBtnContainer.innerHTML = originalHtml; // 롤백
     }
 }

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
