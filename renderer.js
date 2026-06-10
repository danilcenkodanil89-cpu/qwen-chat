let currentChatId = '';
let chats = {};
let currentCodeInEditor = '';

const sidebar = document.getElementById('sidebar');
const chatListEl = document.getElementById('chat-list');
const chatEl = document.getElementById('chat');
const titleEl = document.getElementById('current-chat-title');
const musicEl = document.getElementById('bg-music');
const statusEl = document.getElementById('music-status');
const codeEditor = document.getElementById('code-editor');
const closeEditorBtn = document.getElementById('close-editor-btn');
const lineNumbersEl = document.getElementById('line-numbers');
const editorCodeContent = document.getElementById('editor-code-content');
const editorFilename = document.getElementById('editor-filename');

let inputEl, sendBtn;

window.openSettings = function() {
    const modal = document.getElementById('settings-modal');

    if (modal) {
        modal.classList.add('active');

        const videoInput = document.getElementById('video-path-input');
        const musicInput = document.getElementById('music-path-input');

        if (videoInput) videoInput.value = localStorage.getItem('app_video_path') || '';
        if (musicInput) musicInput.value = localStorage.getItem('app_music_path') || '';
    }
};

window.closeSettings = function() {
    const modal = document.getElementById('settings-modal');

    if (modal) modal.classList.remove('active');
};

window.saveSettings = function() {
    const videoInput = document.getElementById('video-path-input');
    const musicInput = document.getElementById('music-path-input');

    if (videoInput && videoInput.value.trim()) localStorage.setItem('app_video_path', videoInput.value.trim());
    if (musicInput && musicInput.value.trim()) localStorage.setItem('app_music_path', musicInput.value.trim());

    closeSettings();

    initMusic();
    initVideo();
};

window.addEventListener('DOMContentLoaded', () => {
    try {
        inputEl = document.getElementById('input');
        sendBtn = document.getElementById('send');

        loadChats();

        const sortedIds = Object.keys(chats).sort((a, b) => b - a);

        if (sortedIds.length === 0) startNewChat();

        else {
            const newest = chats[sortedIds[0]];

            if (newest.messages.length === 0 && newest.title === 'Новый чат') loadChat(sortedIds[0]);

            else startNewChat();
        }

        initMusic();
        initVideo();

        setupEventListeners();

        console.log('✅ Приложение успешно запущено');
    } catch (error) {
        console.error('❌ Ошибка запуска:', error);
    }
});

function setupEventListeners() {
    const menuBtn = document.getElementById('menu-btn');

    if (menuBtn) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();

            sidebar.classList.toggle('open');
        });
    }

    document.addEventListener('click', (e) => {
        if (sidebar.classList.contains('open') &&
            !sidebar.contains(e.target) &&
            !e.target.closest('#menu-btn'))
            sidebar.classList.remove('open');
    });

    if (closeEditorBtn) closeEditorBtn.addEventListener('click', closeCodeEditor);

    if (sendBtn) sendBtn.addEventListener('click', handleSend);

    if (inputEl) {
        inputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();

                handleSend();
            }
        });
    }

    window.addEventListener('keydown', (e) => {
        if (e.target.id === 'input') return;

        let volumeChanged = false;

        if (e.ctrlKey && (e.key === '+' || e.key === '=')) {
            e.preventDefault();

            if (musicEl) {
                musicEl.volume = Math.min(1, musicEl.volume + 0.01);

                volumeChanged = true;
            }
        } else if (e.ctrlKey && e.key === '-') {
            e.preventDefault();

            if (musicEl) {
                musicEl.volume = Math.max(0, musicEl.volume - 0.01);

                volumeChanged = true;
            }
        }

        if (volumeChanged) {
            localStorage.setItem('app_music_volume', musicEl.volume.toString());

            updateMusicStatus();
        }
    });
}

function initMusic() {
    if (!musicEl) return;

    let musicUrl;
    const customPath = localStorage.getItem('app_music_path');

    if (customPath) musicUrl = 'file:///' + customPath.replace(/\\/g, '/').replace(/ /g, '%20');

    else if (window.electronAPI && window.electronAPI.getMusicUrl) musicUrl = window.electronAPI.getMusicUrl();

    else return;

    musicEl.src = musicUrl;

    const savedVol = localStorage.getItem('app_music_volume');

    musicEl.volume = savedVol ? parseFloat(savedVol) : 0.15;

    updateMusicStatus();

    musicEl.addEventListener('canplaythrough', updateMusicStatus);
    musicEl.addEventListener('error', () => {
        if (statusEl) statusEl.textContent = '⚠️ Ошибка загрузки музыки';
    });

    musicEl.play().catch(() => {
        if (statusEl) statusEl.textContent = '🎵 Нажмите в чат, чтобы включить музыку';

        const enable = () => {
            musicEl.play();

            updateMusicStatus();

            document.removeEventListener('click', enable);
            document.removeEventListener('keydown', enable);
        };

        document.addEventListener('click', enable);
        document.addEventListener('keydown', enable);
    });
}

function updateMusicStatus() {
    if (statusEl && musicEl) statusEl.textContent = `🎵 Громкость: ${Math.round(musicEl.volume * 100)}%`;
}

function initVideo() {
    const bgVideo = document.getElementById('bg-video');

    if (!bgVideo) return;

    let videoUrl;
    const customPath = localStorage.getItem('app_video_path');

    if (customPath) videoUrl = 'file:///' + customPath.replace(/\\/g, '/').replace(/ /g, '%20');

    else if (window.electronAPI && window.electronAPI.getVideoUrl) videoUrl = window.electronAPI.getVideoUrl();

    else return;

    if (videoUrl) {
        bgVideo.src = videoUrl;
        bgVideo.muted = true;
        bgVideo.play().catch(e => console.warn('Video play error:', e));

        bgVideo.addEventListener('ended', () => {
            bgVideo.currentTime = 0;
            bgVideo.play();
        });
    }
}

function startNewChat() {
    currentChatId = Date.now().toString();

    chats[currentChatId] = { title: 'Новый чат', messages: [] };

    saveChats();
    renderChatList();
    clearChatView();
    closeSidebar();
}

function loadChat(id) {
    if (!chats[id]) return;

    currentChatId = id;

    chatEl.innerHTML = '';

    chats[id].messages.forEach(msg => addMessage(msg.content, msg.role === 'user'));

    titleEl.textContent = chats[id].title;

    renderChatList();
    scrollToBottom();
    closeSidebar();
}

function saveChats() {
    localStorage.setItem('app_chats', JSON.stringify(chats));
}

function loadChats() {
    const stored = localStorage.getItem('app_chats');

    if (stored) chats = JSON.parse(stored);
}

function renderChatList() {
    chatListEl.innerHTML = '';

    Object.keys(chats).sort((a, b) => b - a).forEach(id => {
        const item = document.createElement('div');
        item.className = `chat-item ${id === currentChatId ? 'active' : ''}`;
        item.textContent = chats[id].title;
        item.onclick = () => loadChat(id);

        chatListEl.appendChild(item);
    });
}

function clearChatView() {
    chatEl.innerHTML = '';
    titleEl.textContent = 'Новый чат';
}

function closeSidebar() {
    sidebar.classList.remove('open');
}

function scrollToBottom() {
    chatEl.scrollTop = chatEl.scrollHeight;
}

function openCodeEditor(code, language = 'javascript') {
    try {
        currentCodeInEditor = code;
        const lines = code.split('\n');

        lineNumbersEl.innerHTML = lines.map((_, i) => i + 1).join('<br>');
        editorCodeContent.textContent = code;

        const extMap = { javascript: 'js', js: 'js', python: 'py', py: 'py', html: 'html', css: 'css', json: 'json', typescript: 'ts' };
        editorFilename.textContent = `code.${extMap[language] || 'txt'}`;

        chatEl.style.display = 'none';
        codeEditor.style.display = 'flex';
        closeEditorBtn.style.display = 'block';
    } catch (error) {
        console.error('Ошибка редактора:', error);
    }
}

function closeCodeEditor() {
    codeEditor.style.display = 'none';
    closeEditorBtn.style.display = 'none';
    chatEl.style.display = 'flex'

    scrollToBottom();
}

window.copyEditorCode = () => {
    navigator.clipboard.writeText(currentCodeInEditor);

    const btn = document.querySelector('#code-editor .copy-btn');

    if (btn) {
        const oldText = btn.textContent;

        btn.textContent = '✅ Скопировано!';

        setTimeout(() => btn.textContent = oldText, 1500);
    }
};

function addMessage(text, isUser) {
    const div = document.createElement('div');

    div.className = `msg ${isUser ? 'user' : 'ai'}`;

    if (isUser) div.textContent = text;

    else {
        div.innerHTML = formatCodeBlocks(text);

        if (typeof Prism !== 'undefined') Prism.highlightAllUnder(div);
    }

    chatEl.appendChild(div);

    scrollToBottom();
}

function formatCodeBlocks(text) {
    let formatted = escapeHtml(text);

    formatted = formatted.replace(/```(\w+)?\s*([\s\S]*?)```/g, (match, lang, code) => {
        const safeCode = code.replace(/\n/g, '<br>');
        const encodedRawCode = encodeURIComponent(code);
        const language = lang || 'plaintext';

        return `
           <div class="code-block">
             <div class="code-block-header">
               <span class="code-lang">${language}</span>
               <div style="display:flex; gap:8px;">
                 <button class="open-editor-btn" onclick="openCodeBlockInEditor(this)">📂 Открыть в редакторе</button>
                 <button class="copy-code-btn" onclick="copyCodeBlock(this)">📋 Копировать</button>
               </div>
             </div>
             <pre style="white-space: pre !important;"><code class="language-${language}" data-raw="${encodedRawCode}">${safeCode}</code></pre>
           </div>
        `;
    });

    return formatted.replace(/\n/g, '<br>');
}

window.openCodeBlockInEditor = (btn) => {
    const codeBlock = btn.closest('.code-block');
    const codeEl = codeBlock.querySelector('code');
    const rawCode = decodeURIComponent(codeEl.dataset.raw);
    const language = codeEl.className.replace('language-', '');

    openCodeEditor(rawCode, language);
};

function escapeHtml(text) {
    const d = document.createElement('div');

    d.textContent = text;

    return d.innerHTML;
}

window.copyCodeBlock = (btn) => {
    const codeEl = btn.closest('.code-block').querySelector('code');
    const rawCode = decodeURIComponent(codeEl.dataset.raw);

    navigator.clipboard.writeText(rawCode);

    const old = btn.innerHTML;

    btn.innerHTML = '✅';

    setTimeout(() => btn.innerHTML = old, 1500);
};

async function handleSend() {
    try {
        if (!inputEl || !sendBtn) {
            console.error('Элементы ввода не найдены');

            return;
        }

        const text = inputEl.value.trim();

        if (!text) return;

        chats[currentChatId].messages.push({ role: 'user', content: text });

        if (chats[currentChatId].messages.length === 1) {
            chats[currentChatId].title = text.substring(0, 20) + (text.length > 20 ? '...' : '');

            renderChatList();

            titleEl.textContent = chats[currentChatId].title;
        }

        addMessage(text, true);

        inputEl.value = '';
        sendBtn.disabled = true;

        saveChats();

        const loading = document.createElement('div');
        loading.className = 'msg ai loading';
        loading.innerHTML = '⏳ Думаю...';

        chatEl.appendChild(loading);

        scrollToBottom();

        const res = await window.electronAPI.sendMessage(text);

        loading.remove();

        chats[currentChatId].messages.push({ role: 'assistant', content: res });

        saveChats();

        addMessage(res, false);
    } catch (error) {
        console.error('Ошибка отправки:', error);

        const loading = document.querySelector('.loading');

        if (loading) loading.remove();

        addMessage(`❌ Ошибка: ${error.message}`, false);
    } finally {
        if (sendBtn) sendBtn.disabled = false;

        if (inputEl) inputEl.focus();
    }
}
