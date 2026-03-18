// 全局状态
let voices = [];
let audioList = [];
let currentAudioId = null;

// DOM元素
const voiceSelect = document.getElementById('voice-select');
const textInput = document.getElementById('text-input');
const charCount = document.getElementById('char-count');
const generateBtn = document.getElementById('generate-btn');
const refreshBtn = document.getElementById('refresh-btn');
const audioListContainer = document.getElementById('audio-list');
const loadingOverlay = document.getElementById('loading-overlay');

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    loadVoices();
    loadAudioList();
    setupEventListeners();
});

// 设置事件监听
function setupEventListeners() {
    textInput.addEventListener('input', updateCharCount);
    generateBtn.addEventListener('click', generateAudio);
    refreshBtn.addEventListener('click', loadAudioList);
}

// 更新字符计数
function updateCharCount() {
    const count = textInput.value.length;
    charCount.textContent = count;
    charCount.style.color = count > 5000 ? 'var(--danger)' : 'var(--text-secondary)';
}

// 加载语音列表
async function loadVoices() {
    try {
        const response = await fetch('/api/voices');
        const data = await response.json();

        if (data.voices) {
            voices = data.voices;

            // 清空并重新填充
            voiceSelect.innerHTML = '';

            // 按地区分组
            const grouped = {};
            voices.forEach(voice => {
                const region = voice.region;
                if (!grouped[region]) {
                    grouped[region] = [];
                }
                grouped[region].push(voice);
            });

            // 创建选项（按顺序：中文、美音、英音）
            const regionOrder = ['中文', '美音', '英音'];
            regionOrder.forEach(region => {
                if (grouped[region]) {
                    const optgroup = document.createElement('optgroup');
                    optgroup.label = region;

                    grouped[region].forEach(voice => {
                        const option = document.createElement('option');
                        option.value = voice.id;
                        option.textContent = voice.short_name;
                        optgroup.appendChild(option);
                    });

                    voiceSelect.appendChild(optgroup);
                }
            });

            // 设置默认选择中文
            const zhOption = voiceSelect.querySelector('option[value*="zh-CN"]');
            if (zhOption) {
                voiceSelect.value = zhOption.value;
            }
        }
    } catch (error) {
        console.error('加载语音列表失败:', error);
        showNotification('加载语音列表失败', 'error');
    }
}

// 生成音频
async function generateAudio() {
    const text = textInput.value.trim();
    const voice = voiceSelect.value;

    if (!text) {
        showNotification('请输入文本', 'warning');
        textInput.focus();
        return;
    }

    if (text.length > 5000) {
        showNotification('文本长度不能超过5000字符', 'error');
        return;
    }

    showLoading(true);
    generateBtn.disabled = true;

    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text, voice })
        });

        const data = await response.json();

        if (data.success) {
            showNotification('语音生成成功', 'success');
            textInput.value = '';
            updateCharCount();
            await loadAudioList();
        } else {
            showNotification(data.error || '生成失败', 'error');
        }
    } catch (error) {
        console.error('生成音频失败:', error);
        showNotification('生成音频失败', 'error');
    } finally {
        showLoading(false);
        generateBtn.disabled = false;
    }
}

// 加载音频列表
async function loadAudioList() {
    try {
        const response = await fetch('/api/list');
        const data = await response.json();

        if (data.audio_list) {
            audioList = data.audio_list;
            renderAudioList();
        }
    } catch (error) {
        console.error('加载音频列表失败:', error);
    }
}

// 渲染音频列表
function renderAudioList() {
    if (audioList.length === 0) {
        audioListContainer.innerHTML = `
            <div class="empty-state">
                <p>暂无语音文件</p>
                <p class="hint">在上方输入文本并生成语音</p>
            </div>
        `;
        return;
    }

    audioListContainer.innerHTML = audioList.map(item => `
        <div class="audio-item" data-id="${item.id}">
            <div class="audio-header">
                <div class="audio-text">
                    <div class="preview">${escapeHtml(item.text)}</div>
                    <div class="full">${escapeHtml(item.full_text)}</div>
                </div>
                <div class="audio-actions">
                    <button class="btn-toggle" onclick="toggleText('${item.id}')" title="展开/收起">📄</button>
                    <button class="btn-delete" onclick="deleteAudio('${item.id}', '${escapeHtml(item.text)}')" title="删除">🗑️</button>
                </div>
            </div>
            <div class="audio-player">
                <audio controls src="/audio/${item.filename}"></audio>
            </div>
            <div class="audio-meta">
                <span>🎙️ ${item.voice}</span>
                <span>📅 ${formatDate(item.created_at)}</span>
            </div>
        </div>
    `).join('');
}

// 切换文本显示
function toggleText(id) {
    const item = document.querySelector(`.audio-item[data-id="${id}"]`);
    if (item) {
        const textDiv = item.querySelector('.audio-text');
        textDiv.classList.toggle('show-full');
    }
}

// 删除音频
async function deleteAudio(id, text) {
    if (!confirm(`确定要删除"${text}"吗?`)) {
        return;
    }

    try {
        const response = await fetch(`/api/audio/${id}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
            showNotification('删除成功', 'success');
            await loadAudioList();
        } else {
            showNotification(data.error || '删除失败', 'error');
        }
    } catch (error) {
        console.error('删除失败:', error);
        showNotification('删除失败', 'error');
    }
}

// 显示加载状态
function showLoading(show) {
    loadingOverlay.classList.toggle('hidden', !show);
}

// 显示通知
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '12px 20px',
        background: type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--danger)' : 'var(--primary)',
        color: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        zIndex: '2000',
        animation: 'slideIn 0.3s ease-out'
    });

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// 转义HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 格式化日期
function formatDate(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diff = now - date;

    // 小于1分钟
    if (diff < 60000) {
        return '刚刚';
    }

    // 小于1小时
    if (diff < 3600000) {
        return `${Math.floor(diff / 60000)}分钟前`;
    }

    // 小于1天
    if (diff < 86400000) {
        return `${Math.floor(diff / 3600000)}小时前`;
    }

    // 格式化为日期
    return date.toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
