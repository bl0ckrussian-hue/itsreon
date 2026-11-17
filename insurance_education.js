const USER_DB_URL = "https://script.google.com/macros/s/AKfycbza5DquXQvms-rDWJkcfq-iERjXnuMSJPKU-ZOH1Z_FvxFMbL5aVt3IGyzpRFL05qyP/exec";
const VIDEO_CHUNK_SIZE = 8 * 1024 * 1024; // 8MB (256KB 배수 규격 준수)

let boardData = [];
let videoData = [];
let currentVideoFilter = '전체';

// 창 닫기 및 안내 모달 제어 보조 함수
function closeEduWindow() {
    window.close();
}

function closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) modal.classList.add('hidden');
}

function toggleVideoFullscreen() {
    const w = document.getElementById('videoPlayerBox');
    if (!w) return;
    w.classList.toggle('fixed');
    w.classList.toggle('inset-0');
    w.classList.toggle('z-50');
    w.classList.toggle('max-w-none');
    w.classList.toggle('h-screen');
}

// 메인관리자 / 서브관리자 여부 엄격 판별 (자문관리자 제외)
function checkIsVideoAdmin() {
    const role = (localStorage.getItem('rion_logged_role') || '').replace(/\s/g, '');
    return (role === '메인관리자' || role === '서브관리자');
}

function updateVideoAdminUI() {
    const upBtn = document.getElementById('videoUploadOpenBtn');
    if (!upBtn) return;
    if (checkIsVideoAdmin()) {
        upBtn.classList.remove('hidden');
        upBtn.classList.add('flex');
    } else {
        upBtn.classList.add('hidden');
        upBtn.classList.remove('flex');
    }
}

function extractDriveIdClient(input) {
    if (!input) return '';
    const str = String(input).trim();
    const dMatch = str.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (dMatch && dMatch[1]) return dMatch[1];
    const idMatch = str.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idMatch && idMatch[1]) return idMatch[1];
    return str;
}

// ==================== [세일즈 교육 영상 게시판 로직] ====================

async function loadVideoData() {
    const loggedUser = localStorage.getItem('rion_logged_user') || '';
    try {
        const res = await fetch(USER_DB_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ action: "getVideos", userId: loggedUser })
        });
        const result = await res.json();
        if (result.success) {
            videoData = result.data || [];
            if (result.userRole && loggedUser) {
                localStorage.setItem('rion_logged_role', result.userRole);
            }
            updateVideoAdminUI();
            renderVideoBoard(currentVideoFilter);
        }
    } catch (e) {
        console.error("교육 영상 목록을 불러오지 못했습니다.", e);
    }
}

function renderVideoBoard(filterCat = '전체') {
    const container = document.getElementById('videoBoardList');
    if (!container) return;
    container.innerHTML = '';

    const filtered = filterCat === '전체'
        ? [...videoData]
        : videoData.filter(v => v.category === filterCat);

    const isVideoAdmin = checkIsVideoAdmin();

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="py-16 text-center bg-slate-50/50">
                <div class="text-4xl mb-3">🎬</div>
                <h3 class="text-base sm:text-lg font-bold text-slate-600">${filterCat === '전체' ? '등록된 교육 영상이 없습니다.' : `'${filterCat}' 영상은 준비 중입니다.`}</h3>
                <p class="text-xs sm:text-sm text-slate-400 mt-1.5">유익한 교육 강의가 곧 업데이트됩니다.</p>
            </div>
        `;
        return;
    }

    filtered.sort((a, b) => b.id - a.id).forEach((item, index) => {
        const fileId = extractDriveIdClient(item.fileId || item.videoUrl);
        const playUrl = `https://drive.google.com/file/d/${fileId}/view`;
        const thumbUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w640`;

        let badgeCls = "bg-rose-100 text-rose-700";
        if (item.category === '법인 세일즈') badgeCls = "bg-blue-100 text-blue-700";
        if (item.category === '원수사 교육') badgeCls = "bg-emerald-100 text-emerald-700";

        let adminButtons = '';
        if (isVideoAdmin) {
            adminButtons = `
                <button type="button" data-video-edit-id="${item.id}" class="video-edit-btn bg-white border border-teal-300 text-teal-600 hover:bg-teal-50 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm">수정</button>
                <button type="button" data-video-delete-id="${item.id}" class="video-delete-btn bg-white border border-rose-300 text-rose-500 hover:bg-rose-50 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm">삭제</button>
            `;
        }

        const row = document.createElement('div');
        row.className = 'p-4 sm:p-6 hover:bg-slate-50/80 transition flex flex-col sm:flex-row gap-4 sm:gap-6 items-stretch sm:items-center';
        row.innerHTML = `
            <!-- 좌측: 영상 썸네일 영역 -->
            <div data-video-url="${playUrl}" class="w-full sm:w-64 md:w-72 aspect-video bg-slate-900 rounded-xl overflow-hidden relative flex-shrink-0 cursor-pointer group shadow-sm border border-slate-200">
                <img src="${thumbUrl}" alt="Thumbnail" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" onerror="this.style.display='none'; this.nextElementSibling.classList.remove('hidden');">
                <div class="hidden absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex flex-col items-center justify-center text-slate-300 p-3 text-center">
                    <span class="text-2xl mb-1">🎬</span>
                    <span class="text-[11px] font-semibold">클릭하여 영상 재생</span>
                </div>
                <div class="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/10 transition-all z-10"></div>
                <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                    <div class="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white text-slate-800 transition-all duration-300">
                        <svg class="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                </div>
            </div>

            <!-- 우측: 게시판 내용 및 관리 영역 -->
            <div class="flex-1 min-w-0 flex flex-col justify-between gap-3">
                <div>
                    <div class="flex flex-wrap items-center gap-2 mb-2">
                        <span class="text-xs font-bold text-slate-400">No.${filtered.length - index}</span>
                        <span class="${badgeCls} text-[11px] font-bold px-2.5 py-0.5 rounded-full">${item.category}</span>
                        <span class="text-xs text-slate-400 ml-auto">${item.author || '관리자'} · ${item.date || ''}</span>
                    </div>
                    <h3 data-video-url="${playUrl}" class="font-bold text-slate-900 text-base sm:text-lg hover:text-blue-600 cursor-pointer transition leading-snug">
                        ${item.title}
                    </h3>
                    <p class="text-xs sm:text-sm text-slate-600 mt-1.5 whitespace-pre-line leading-relaxed">${item.description || ''}</p>
                </div>

                <div class="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button type="button" data-video-url="${playUrl}" class="bg-slate-900 hover:bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition shadow-sm flex items-center gap-1.5">
                        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        영상 재생
                    </button>
                    ${adminButtons}
                </div>
            </div>
        `;
        container.appendChild(row);
    });
}

function filterVideos(category) {
    currentVideoFilter = category;
    const buttons = document.querySelectorAll('.video-filter');
    buttons.forEach(btn => {
        if (btn.innerText.trim() === category) {
            btn.className = 'video-filter filter-active px-5 py-2 rounded-full text-sm font-bold transition shadow-sm';
        } else {
            btn.className = 'video-filter filter-inactive px-5 py-2 rounded-full text-sm font-bold transition shadow-sm';
        }
    });
    renderVideoBoard(category);
}

function toggleVideoUploadMode() {
    const mode = document.querySelector('input[name="vUploadMode"]:checked').value;
    if (mode === 'file') {
        document.getElementById('vFileInputBox').classList.remove('hidden');
        document.getElementById('vLinkInputBox').classList.add('hidden');
    } else {
        document.getElementById('vFileInputBox').classList.add('hidden');
        document.getElementById('vLinkInputBox').classList.remove('hidden');
    }
}

function openVideoUploadModal() {
    if (!checkIsLoggedIn()) {
        document.getElementById('authModal').classList.remove('hidden');
        return;
    }
    if (!checkIsVideoAdmin()) {
        alert('메인관리자 및 서브관리자만 영상을 등록할 수 있습니다.');
        return;
    }
    document.getElementById('videoUploadForm').classList.remove('hidden');
    document.getElementById('videoUploadProgressBox').classList.add('hidden');
    document.getElementById('closeVideoUploadBtn').classList.remove('hidden');
    document.getElementById('videoUploadModal').classList.remove('hidden');
}

function closeVideoUploadModal() {
    document.getElementById('videoUploadModal').classList.add('hidden');
    document.getElementById('vProgressBar').style.width = '0%';
    document.getElementById('vProgressPercent').innerText = '0%';
}

function readBlobAsBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

async function uploadLargeVideoToDrive(file, loggedUser, category, onProgress) {
    const initRes = await fetch(USER_DB_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
            action: "initVideoUpload",
            userId: loggedUser,
            category: category,
            fileName: file.name,
            mimeType: file.type || "video/mp4",
            fileSize: file.size
        })
    });
    const initData = await initRes.json();
    if (!initData.success) throw new Error(initData.message);

    const uploadUrl = initData.uploadUrl;
    const totalBytes = file.size;
    let offset = 0;

    while (offset < totalBytes) {
        const end = Math.min(offset + VIDEO_CHUNK_SIZE, totalBytes) - 1;
        const chunkBlob = file.slice(offset, end + 1);
        const chunkBase64 = await readBlobAsBase64(chunkBlob);

        const chunkRes = await fetch(USER_DB_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({
                action: "uploadVideoChunk",
                userId: loggedUser,
                uploadUrl: uploadUrl,
                mimeType: file.type || "video/mp4",
                chunkBase64: chunkBase64,
                startByte: offset,
                endByte: end,
                totalBytes: totalBytes
            })
        });
        const chunkData = await chunkRes.json();
        if (!chunkData.success) throw new Error(chunkData.message);

        offset = end + 1;
        const pct = Math.min(98, Math.round((offset / totalBytes) * 100));
        if (onProgress) onProgress(pct);

        if (chunkData.done && chunkData.fileId) {
            return chunkData.fileId;
        }
    }
    throw new Error("영상 파일 ID를 확인하지 못했습니다.");
}

async function startVideoUpload() {
    if (!checkIsVideoAdmin()) {
        alert('메인관리자 및 서브관리자만 영상을 등록할 수 있습니다.');
        return;
    }
    const loggedUser = localStorage.getItem('rion_logged_user');
    const category = document.getElementById('vUploadCategory').value;
    const title = document.getElementById('vUploadTitle').value.trim();
    const description = document.getElementById('vUploadDescription').value.trim();
    const mode = document.querySelector('input[name="vUploadMode"]:checked').value;

    if (!category || !title || !description) {
        alert("교육 분류, 영상 제목, 내용을 모두 입력해주세요.");
        return;
    }

    const fileInput = document.getElementById('vUploadFile');
    const linkInput = document.getElementById('vUploadLink').value.trim();

    if (mode === 'file' && fileInput.files.length === 0) {
        alert("업로드할 영상 파일을 선택해주세요.");
        return;
    }
    if (mode === 'link' && !linkInput) {
        alert("구글 드라이브 영상 링크를 입력해주세요.");
        return;
    }

    document.getElementById('videoUploadForm').classList.add('hidden');
    document.getElementById('videoUploadProgressBox').classList.remove('hidden');
    document.getElementById('closeVideoUploadBtn').classList.add('hidden');

    const bar = document.getElementById('vProgressBar');
    const pctText = document.getElementById('vProgressPercent');
    const statusText = document.getElementById('vProgressStatus');

    try {
        let finalFileId = '';
        if (mode === 'file') {
            const file = fileInput.files[0];
            statusText.innerText = `영상을 구글 드라이브로 업로드 중입니다... (${(file.size / (1024 * 1024)).toFixed(1)}MB)`;
            finalFileId = await uploadLargeVideoToDrive(file, loggedUser, category, (pct) => {
                bar.style.width = pct + '%';
                pctText.innerText = pct + '%';
            });
        } else {
            bar.style.width = '60%';
            pctText.innerText = '60%';
            finalFileId = extractDriveIdClient(linkInput);
        }

        statusText.innerText = '게시판 데이터베이스에 등록 중입니다...';
        const saveRes = await fetch(USER_DB_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({
                action: "saveVideoBoard",
                userId: loggedUser,
                category: category,
                title: title,
                description: description,
                fileId: finalFileId
            })
        });
        const saveResult = await saveRes.json();
        if (!saveResult.success) throw new Error(saveResult.message);

        bar.style.width = '100%';
        pctText.innerText = '100%';
        statusText.innerText = '✅ 교육 영상 등록 완료!';

        setTimeout(() => {
            alert('교육 영상이 성공적으로 등록되었습니다.');
            document.getElementById('vUploadCategory').value = '';
            document.getElementById('vUploadTitle').value = '';
            document.getElementById('vUploadDescription').value = '';
            document.getElementById('vUploadFile').value = '';
            document.getElementById('vUploadLink').value = '';
            closeVideoUploadModal();
            loadVideoData();
        }, 500);
    } catch (err) {
        alert('영상 등록 실패: ' + err.message);
        closeVideoUploadModal();
    }
}

function openVideoEditModal(id) {
    if (!checkIsVideoAdmin()) {
        alert('메인관리자 및 서브관리자만 영상을 수정할 수 있습니다.');
        return;
    }
    const item = videoData.find(v => v.id === id);
    if (!item) return;

    document.getElementById('editVideoId').value = item.id;
    document.getElementById('editVideoCategory').value = item.category;
    document.getElementById('editVideoTitle').value = item.title;
    document.getElementById('editVideoDescription').value = item.description || '';
    document.getElementById('editVideoFile').value = '';

    document.getElementById('videoEditForm').classList.remove('hidden');
    document.getElementById('videoEditProgressBox').classList.add('hidden');
    document.getElementById('closeVideoEditBtn').classList.remove('hidden');
    document.getElementById('videoEditModal').classList.remove('hidden');
}

function closeVideoEditModal() {
    document.getElementById('videoEditModal').classList.add('hidden');
    document.getElementById('vEditProgressBar').style.width = '0%';
    document.getElementById('vEditProgressPercent').innerText = '0%';
}

async function submitEditVideo() {
    if (!checkIsVideoAdmin()) {
        alert('메인관리자 및 서브관리자만 영상을 수정할 수 있습니다.');
        return;
    }
    const loggedUser = localStorage.getItem('rion_logged_user');
    const id = document.getElementById('editVideoId').value;
    const category = document.getElementById('editVideoCategory').value;
    const title = document.getElementById('editVideoTitle').value.trim();
    const description = document.getElementById('editVideoDescription').value.trim();
    const fileInput = document.getElementById('editVideoFile');

    if (!category || !title || !description) {
        alert("분류, 제목, 내용을 모두 입력해주세요.");
        return;
    }

    try {
        let newFileId = '';
        if (fileInput.files.length > 0) {
            document.getElementById('videoEditForm').classList.add('hidden');
            document.getElementById('videoEditProgressBox').classList.remove('hidden');
            document.getElementById('closeVideoEditBtn').classList.add('hidden');

            const bar = document.getElementById('vEditProgressBar');
            const pctText = document.getElementById('vEditProgressPercent');
            newFileId = await uploadLargeVideoToDrive(fileInput.files[0], loggedUser, category, (pct) => {
                bar.style.width = pct + '%';
                pctText.innerText = pct + '%';
            });
        }

        const res = await fetch(USER_DB_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({
                action: "updateVideoBoard",
                id: id,
                userId: loggedUser,
                category: category,
                title: title,
                description: description,
                newFileId: newFileId
            })
        });
        const result = await res.json();
        if (result.success) {
            alert('✅ 영상 정보가 수정되었습니다.');
            closeVideoEditModal();
            loadVideoData();
        } else {
            alert('수정 실패\n' + result.message);
            closeVideoEditModal();
        }
    } catch (e) {
        alert('오류가 발생했습니다: ' + e.message);
        closeVideoEditModal();
    }
}

async function handleDeleteVideoItem(id) {
    if (!checkIsVideoAdmin()) {
        alert('메인관리자 및 서브관리자만 영상을 삭제할 수 있습니다.');
        return;
    }
    const loggedUser = localStorage.getItem('rion_logged_user');
    if (confirm('이 교육 영상 게시글과 구글 드라이브 영상을 삭제하시겠습니까?')) {
        try {
            const res = await fetch(USER_DB_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ action: "deleteVideoBoard", id: id, userId: loggedUser })
            });
            const result = await res.json();
            if (result.success) {
                alert('✅ 영상이 삭제되었습니다.');
                loadVideoData();
            } else {
                alert('삭제 실패\n' + result.message);
            }
        } catch (e) {
            alert('서버 통신 오류가 발생했습니다.');
        }
    }
}

// ==================== [세일즈 자료실 로직] ====================

async function loadBoardData() {
    const loggedUser = localStorage.getItem('rion_logged_user') || '';
    try {
        const res = await fetch(USER_DB_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ action: "getBoard", userId: loggedUser })
        });
        const result = await res.json();
        if (result.success) {
            boardData = result.data;
            if (result.userRole && loggedUser) {
                localStorage.setItem('rion_logged_role', result.userRole);
                updateVideoAdminUI();
            }
            const activeFilterBtn = document.querySelector('.board-filter.bg-slate-800');
            const currentFilter = activeFilterBtn ? activeFilterBtn.innerText : '전체';
            renderBoard(currentFilter);
        }
    } catch (e) {
        console.error("게시판 목록을 불러오지 못했습니다.", e);
    }
}

function renderBoard(filterCat = '전체') {
    const tbody = document.getElementById('boardBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    let filtered = filterCat === '전체' ? boardData : boardData.filter(item => item.category === filterCat || item.category === '전체');
    
    const loggedUser = localStorage.getItem('rion_logged_user');
    const loggedUserRole = localStorage.getItem('rion_logged_role') || '';
    const isAdmin = (loggedUser === '김성철' || loggedUserRole.includes('관리자') || loggedUser === '관리자');

    filtered.sort((a,b) => b.id - a.id).forEach((item, index) => {
        const row = document.createElement('tr');
        row.className = 'border-b border-slate-100 hover:bg-slate-50 transition cursor-pointer';
        
        let colorCls = "bg-blue-100 text-blue-700";
        if(item.category==='세일즈(상담)자료') colorCls = "bg-indigo-100 text-indigo-700";
        if(item.category==='법인 세일즈') colorCls = "bg-blue-100 text-blue-700";
        if(item.category==='TA자료') colorCls = "bg-pink-100 text-pink-700";
        if(item.category==='고객관리') colorCls = "bg-purple-100 text-purple-700";
        if(item.category==='장기(보장성)') colorCls = "bg-rose-100 text-rose-700";
        if(item.category==='종신') colorCls = "bg-slate-200 text-slate-700";
        if(item.category==='연금') colorCls = "bg-amber-100 text-amber-700";
        if(item.category==='저축') colorCls = "bg-emerald-100 text-emerald-700";
        if(item.category==='변액') colorCls = "bg-cyan-100 text-cyan-700";
        if(item.category==='자격증') colorCls = "bg-fuchsia-100 text-fuchsia-700";

        let actionButtons = `<button type="button" data-download-url="${item.id}" class="download-btn inline-block bg-white border border-slate-300 text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 px-3 py-1.5 rounded text-xs font-bold transition shadow-sm">내려받기</button>`;
        
        if (isAdmin || String(item.author).trim() === String(loggedUser).trim()) {
            actionButtons += ` <button type="button" data-edit-id="${item.id}" class="edit-btn inline-block bg-white border border-teal-300 text-teal-500 hover:bg-teal-50 hover:text-teal-600 px-3 py-1.5 rounded text-xs font-bold transition shadow-sm ml-1">수정</button>`;
            actionButtons += ` <button type="button" data-delete-id="${item.id}" class="delete-btn inline-block bg-white border border-rose-300 text-rose-500 hover:bg-rose-50 hover:text-rose-600 px-3 py-1.5 rounded text-xs font-bold transition shadow-sm ml-1">삭제</button>`;
        }

        row.innerHTML = `
            <td class="p-4 text-center text-slate-500 align-middle">${filtered.length - index}</td>
            <td class="p-4 text-center align-middle"><span class="${colorCls} text-[10px] font-bold px-2 py-1 rounded">${item.category}</span></td>
            <td class="p-4 cursor-pointer group align-middle" onclick="openFileModal(${item.id})">
                <div class="font-bold text-slate-800 group-hover:text-blue-600 transition">${item.title}</div>
                <div class="text-[11px] text-slate-500 mt-0.5 line-clamp-1">${item.description ? item.description : ''}</div>
            </td>
            <td class="p-4 text-center font-bold text-slate-600 align-middle">${item.author || '관리자'}</td>
            <td class="p-4 text-center text-slate-500 align-middle">${item.date}</td>
            <td class="p-4 text-center whitespace-nowrap align-middle">${actionButtons}</td>
        `;
        tbody.appendChild(row);
    });
}

function openEditModal(id) {
    const item = boardData.find(d => d.id === id);
    if(item) {
        document.getElementById('editBoardId').value = item.id;
        document.getElementById('editCategory').value = item.category;
        document.getElementById('editTitle').value = item.title;
        document.getElementById('editDescription').value = item.description || '';
        document.getElementById('editModal').classList.remove('hidden');
    }
}

function closeEditModal() {
    document.getElementById('editModal').classList.add('hidden');
}

async function submitEditBoard() {
    const loggedUser = localStorage.getItem('rion_logged_user');
    const id = document.getElementById('editBoardId').value;
    const category = document.getElementById('editCategory').value;
    const title = document.getElementById('editTitle').value;
    const description = document.getElementById('editDescription').value;

    if (!category || !title || !description) {
        alert("카테고리, 제목, 설명을 모두 입력해주세요.");
        return;
    }

    try {
        const res = await fetch(USER_DB_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ 
                action: "updateBoard", 
                id: id, 
                userId: loggedUser, 
                category: category, 
                title: title, 
                description: description 
            })
        });
        const result = await res.json();
        
        if(result.success) {
            alert('✅ 수정이 완료되었습니다.');
            closeEditModal();
            loadBoardData(); 
        } else {
            alert("수정 실패\n" + result.message);
        }
    } catch(e) {
        alert("서버 통신 오류가 발생했습니다.");
    }
}

async function handleDeleteBoardItem(id) {
    const loggedUser = localStorage.getItem('rion_logged_user');
    if (confirm('구글 시트에서 이 자료를 영구 삭제하시겠습니까?')) {
        try {
            const res = await fetch(USER_DB_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ action: "deleteBoard", id: id, userId: loggedUser })
            });
            const result = await res.json();
            
            if(result.success) {
                alert('✅ 삭제가 완료되었습니다.');
                loadBoardData(); 
            } else {
                alert("삭제 실패\n" + result.message);
            }
        } catch(e) {
            alert("서버 통신 오류가 발생했습니다. 잠시 후 시도해주세요.");
        }
    }
}

function checkIsLoggedIn() {
    const loggedUser = localStorage.getItem('rion_logged_user');
    if (!loggedUser || loggedUser === "null" || loggedUser === "undefined" || loggedUser.trim() === "") {
        return false;
    }
    return true;
}

function openFileModal(id) {
    if (!checkIsLoggedIn()) {
        document.getElementById('authModal').classList.remove('hidden');
        return;
    }
    const item = boardData.find(d => d.id === id);
    if(item) {
        const fileNameEl = document.getElementById('dlFileName');
        fileNameEl.innerText = item.fileName + " (클릭하여 직접 다운로드)";
        fileNameEl.onclick = () => promptDownload(item.id);
        document.getElementById('fileDownloadModal').classList.remove('hidden');
    }
}

function promptDownload(id) {
    if(confirm('이 파일을 컴퓨터로 다운로드 하시겠습니까?')) {
        const item = boardData.find(d => d.id === id);
        if(item && item.downloadUrl) {
            window.location.href = item.downloadUrl; 
            document.getElementById('fileDownloadModal').classList.add('hidden');
        } else {
            alert('다운로드 링크를 찾을 수 없습니다.');
        }
    }
}

function closeFileModal() {
    document.getElementById('fileDownloadModal').classList.add('hidden');
}

function checkAuthAndUpload() {
    if (!checkIsLoggedIn()) {
        document.getElementById('authModal').classList.remove('hidden');
    } else {
        document.getElementById('uploadModal').classList.remove('hidden');
        document.getElementById('uploadFormContainer').classList.remove('hidden');
        document.getElementById('uploadProgressContainer').classList.add('hidden');
    }
}

async function startRealUpload() {
    if (!checkIsLoggedIn()) return;
    const loggedUser = localStorage.getItem('rion_logged_user');
    
    const category = document.getElementById('uploadCategory').value;
    const title = document.getElementById('uploadTitle').value;
    const description = document.getElementById('uploadDescription').value;
    const fileInput = document.getElementById('uploadFile');

    if (!category || !title || !description || fileInput.files.length === 0) {
        alert("카테고리, 제목, 설명, 파일을 모두 입력/선택해주세요.");
        return;
    }

    const file = fileInput.files[0];
    if(file.size > 10 * 1024 * 1024) {
        alert("시스템 한도 초과: 10MB 이하의 파일만 자동 업로드 가능합니다.");
        return;
    }

    document.getElementById('uploadFormContainer').classList.add('hidden');
    document.getElementById('uploadProgressContainer').classList.remove('hidden');
    document.getElementById('closeUploadBtn').classList.add('hidden');
    
    let progress = 0;
    const bar = document.getElementById('progressBar');
    const percentText = document.getElementById('progressPercentText');
    const statusText = document.getElementById('progressStatusText');
    
    const interval = setInterval(() => {
        if (progress < 90) {
            progress += Math.floor(Math.random() * 10) + 2;
            if (progress > 90) progress = 90;
            bar.style.width = progress + '%';
            percentText.innerText = progress + '%';
        }
    }, 300);

    const reader = new FileReader();
    reader.onload = async function(e) {
        const base64Data = e.target.result.split(',')[1];
        
        try {
            const res = await fetch(USER_DB_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ 
                    action: "uploadBoard", 
                    userId: loggedUser, 
                    category: category,
                    title: title,
                    description: description, 
                    fileName: file.name, 
                    mimeType: file.type, 
                    base64: base64Data 
                })
            });
            
            const result = await res.json();
            clearInterval(interval);
            
            if(result.success) {
                bar.style.width = '100%';
                percentText.innerText = '100%';
                statusText.innerText = '✅ 구글 시트 게시판 실시간 등록 완료!';
                statusText.className = 'text-sm font-bold text-blue-600 mb-3';
                
                setTimeout(() => {
                    alert("자료가 시스템 서버에 성공적으로 등록되었습니다.");
                    document.getElementById('uploadCategory').value = "";
                    document.getElementById('uploadTitle').value = "";
                    document.getElementById('uploadDescription').value = ""; 
                    document.getElementById('uploadFile').value = "";
                    closeUploadModal();
                    loadBoardData(); 
                }, 800);
            } else {
                alert("업로드 실패: " + result.message);
                closeUploadModal();
            }
        } catch (error) {
            clearInterval(interval);
            alert("서버 통신 중 오류가 발생했습니다.");
            closeUploadModal();
        }
    };
    reader.readAsDataURL(file);
}

function closeUploadModal() {
    document.getElementById('uploadModal').classList.add('hidden');
    document.getElementById('closeUploadBtn').classList.remove('hidden');
    document.getElementById('progressStatusText').innerText = '파일을 구글 시트 및 드라이브에 동기화 중입니다...';
    document.getElementById('progressStatusText').className = 'text-sm font-bold text-slate-700 mb-3';
    document.getElementById('progressBar').style.width = '0%';
}

function closeVideoModal() {
    const w = document.getElementById('videoPlayerBox');
    if (w) w.classList.remove('fixed', 'inset-0', 'z-50', 'max-w-none', 'h-screen');
    document.getElementById('videoModal').classList.add('hidden');
    document.getElementById('videoIframe').src = ''; 
}

function switchMainTab(tabName) {
    const tabVideo = document.getElementById('tabVideo');
    const tabMaterial = document.getElementById('tabMaterial');
    const secVideo = document.getElementById('sectionVideo');
    const secMaterial = document.getElementById('sectionMaterial');

    if (tabName === 'video') {
        tabVideo.className = 'tab-active py-3.5 sm:py-4 px-2 text-sm sm:text-lg whitespace-nowrap transition duration-200';
        tabMaterial.className = 'tab-inactive py-3.5 sm:py-4 px-2 text-sm sm:text-lg whitespace-nowrap transition duration-200';
        secVideo.classList.remove('hidden');
        secMaterial.classList.add('hidden');
        renderVideoBoard(currentVideoFilter);
    } else {
        tabMaterial.className = 'tab-active py-3.5 sm:py-4 px-2 text-sm sm:text-lg whitespace-nowrap transition duration-200';
        tabVideo.className = 'tab-inactive py-3.5 sm:py-4 px-2 text-sm sm:text-lg whitespace-nowrap transition duration-200';
        secMaterial.classList.remove('hidden');
        secVideo.classList.add('hidden');
        
        const activeFilterBtn = document.querySelector('.board-filter.bg-slate-800');
        const currentFilter = activeFilterBtn ? activeFilterBtn.innerText : '전체';
        renderBoard(currentFilter);
    }
}

function filterBoard(category) {
    const buttons = document.querySelectorAll('.board-filter');
    buttons.forEach(btn => {
        if(btn.innerText === category) {
            btn.className = 'board-filter bg-slate-800 text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-sm';
        } else {
            btn.className = 'board-filter bg-white text-slate-600 border border-slate-300 hover:bg-slate-100 px-4 py-1.5 rounded-lg text-xs font-bold';
        }
    });
    renderBoard(category);
}

// ==================== [이벤트 위임 및 초기화 / 보안 스크립트] ====================

document.addEventListener('click', function(e) {
    const vEditBtn = e.target.closest('.video-edit-btn[data-video-edit-id]');
    if (vEditBtn) {
        const id = parseInt(vEditBtn.getAttribute('data-video-edit-id'));
        openVideoEditModal(id);
        return;
    }

    const vDeleteBtn = e.target.closest('.video-delete-btn[data-video-delete-id]');
    if (vDeleteBtn) {
        const id = parseInt(vDeleteBtn.getAttribute('data-video-delete-id'));
        handleDeleteVideoItem(id);
        return;
    }

    const videoTrigger = e.target.closest('[data-video-url]');
    if (videoTrigger) {
        if (!checkIsLoggedIn()) {
            document.getElementById('authModal').classList.remove('hidden');
            return;
        }
        const url = videoTrigger.getAttribute('data-video-url');
        const fileId = extractDriveIdClient(url);
        const previewUrl = fileId ? `https://drive.google.com/file/d/${fileId}/preview` : url.replace('/view', '/preview');
        document.getElementById('videoIframe').src = previewUrl;
        document.getElementById('videoModal').classList.remove('hidden');
        return;
    }

    const downloadBtn = e.target.closest('.download-btn[data-download-url]');
    if (downloadBtn) {
        if (!checkIsLoggedIn()) {
            document.getElementById('authModal').classList.remove('hidden');
            return;
        }
        const id = parseInt(downloadBtn.getAttribute('data-download-url'));
        openFileModal(id);
        return;
    }

    const deleteBtn = e.target.closest('.delete-btn[data-delete-id]');
    if (deleteBtn) {
        const id = parseInt(deleteBtn.getAttribute('data-delete-id'));
        handleDeleteBoardItem(id);
        return;
    }

    const editBtn = e.target.closest('.edit-btn[data-edit-id]');
    if (editBtn) {
        const id = parseInt(editBtn.getAttribute('data-edit-id'));
        openEditModal(id);
        return;
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const loggedUser = localStorage.getItem('rion_logged_user');
    if (loggedUser && loggedUser !== "null" && loggedUser.trim() !== "") {
        const statusEl = document.getElementById('eduLoginStatus');
        if (statusEl) {
            statusEl.innerText = loggedUser + "님 접속중";
            statusEl.classList.remove('hidden');
        }

        localStorage.setItem('rion_last_activity', Date.now().toString());
        setInterval(() => {
            if (localStorage.getItem('rion_logged_user')) {
                localStorage.setItem('rion_last_activity', Date.now().toString());
            }
        }, 3 * 60 * 1000);
    }
    updateVideoAdminUI();
    loadVideoData();
    loadBoardData();
});

// 보안: 우클릭, 드래그, 소스보기(F12/Ctrl+U) 차단
document.addEventListener('contextmenu', function(e) { e.preventDefault(); });
document.addEventListener('selectstart', function(e) {
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
    e.preventDefault();
});
document.addEventListener('keydown', function(e) {
    if (e.key === 'F12') { e.preventDefault(); }
    if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i')) { e.preventDefault(); }
    if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) { e.preventDefault(); }
    if (e.ctrlKey && (e.key === 'C' || e.key === 'c')) {
        if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
        e.preventDefault();
    }
});
