// 全局状态
let voices = [];
let audioList = [];
let currentAudioId = null;
let currentRate = 0; // 语速，0表示正常
let selectedVoice = null; // 当前选中的语音
let collapsedFamilies = new Set(); // 折叠的语系

// DOM元素
const voiceSelect = document.getElementById('voice-select');
const voiceSearch = document.getElementById('voice-search');
const voiceToggle = document.getElementById('voice-toggle');
const voiceDropdown = document.getElementById('voice-dropdown');
const voiceList = document.getElementById('voice-list');
const selectedVoiceEl = document.getElementById('selected-voice');
const textInput = document.getElementById('text-input');
const charCount = document.getElementById('char-count');
const rateSlider = document.getElementById('rate-slider');
const rateValue = document.getElementById('rate-value');
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
    setupRateControl();
    setupVoiceSelector();
}

// 设置语速控制
function setupRateControl() {
    // 滑块控制
    rateSlider.addEventListener('input', (e) => {
        currentRate = parseInt(e.target.value);
        updateRateDisplay();
        updateRateOptions();
    });

    // 快捷按钮控制
    document.querySelectorAll('.rate-option').forEach(option => {
        option.addEventListener('click', () => {
            currentRate = parseInt(option.dataset.rate);
            rateSlider.value = currentRate;
            updateRateDisplay();
            updateRateOptions();
        });
    });
}

// 更新语速显示
function updateRateDisplay() {
    const rateLabels = {
        '-50': '0.5x (很慢)',
        '-40': '0.6x',
        '-30': '0.7x',
        '-25': '0.75x (较慢)',
        '-20': '0.8x',
        '-10': '0.9x',
        '0': '1x (正常)',
        '10': '1.1x',
        '20': '1.2x',
        '25': '1.25x (较快)',
        '30': '1.3x',
        '40': '1.4x',
        '50': '1.5x (快)',
        '60': '1.6x',
        '70': '1.7x',
        '80': '1.8x',
        '90': '1.9x',
        '100': '2x (很快)'
    };
    rateValue.textContent = rateLabels[currentRate.toString()] || `${(1 + currentRate / 100).toFixed(2)}x`;
}

// 更新语速选项高亮
function updateRateOptions() {
    document.querySelectorAll('.rate-option').forEach(option => {
        const rate = parseInt(option.dataset.rate);
        option.classList.toggle('active', rate === currentRate);
    });
}

// 更新字符计数
function updateCharCount() {
    const count = textInput.value.length;
    charCount.textContent = count;
    charCount.style.color = count > 5000 ? 'var(--danger)' : 'var(--text-secondary)';
}

// 设置语音选择器
function setupVoiceSelector() {
    // 搜索框
    voiceSearch.addEventListener('input', (e) => {
        filterVoices(e.target.value);
        showVoiceDropdown();
    });

    voiceSearch.addEventListener('focus', () => {
        showVoiceDropdown();
    });

    // 切换按钮
    voiceToggle.addEventListener('click', () => {
        toggleVoiceDropdown();
    });

    // 点击外部关闭下拉框
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.voice-selector') && !e.target.closest('.voice-dropdown')) {
            hideVoiceDropdown();
        }
    });
}

// 显示/隐藏下拉框
function showVoiceDropdown() {
    voiceDropdown.classList.remove('hidden');
}

function hideVoiceDropdown() {
    voiceDropdown.classList.add('hidden');
}

function toggleVoiceDropdown() {
    voiceDropdown.classList.toggle('hidden');
    const icon = document.getElementById('voice-toggle-icon');
    icon.textContent = voiceDropdown.classList.contains('hidden') ? '▼' : '▲';
}

// 加载语音列表
async function loadVoices() {
    try {
        const response = await fetch('/api/voices');
        const data = await response.json();

        if (data.voices) {
            voices = data.voices;
            renderVoiceList(voices);

            // 设置默认选择中文
            const defaultVoice = voices.find(v => v.locale === 'zh-CN');
            if (defaultVoice) {
                selectVoice(defaultVoice);
            }
        }
    } catch (error) {
        console.error('加载语音列表失败:', error);
        showNotification('加载语音列表失败', 'error');
    }
}

// 渲染语音列表
function renderVoiceList(voicesToRender) {
    // 语系信息
    const families = {
        'chinese': { name: '中文', icon: '🇨🇳' },
        'en-US': { name: '美式英语', icon: '🇺🇸' },
        'east-asian': { name: '东亚语言', icon: '🌏' },
        'english': { name: '其他英语', icon: '🇬🇧' },
        'european': { name: '欧洲语言', icon: '🇪🇺' },
        'eastern-european': { name: '东欧语言', icon: '🌍' },
        'middle-east': { name: '中东语言', icon: '🕌' },
        'south-asian': { name: '南亚语言', icon: '🇮🇳' },
        'southeast-asian': { name: '东南亚语言', icon: '🌴' },
        'other': { name: '其他语言', icon: '🌐' }
    };

    // 按语系和语言分组
    const grouped = {};
    voicesToRender.forEach(voice => {
        // 特殊处理中文和美音
        let family = voice.family || 'other';
        if (voice.locale.startsWith('zh')) {
            family = 'chinese';
        } else if (voice.locale === 'en-US') {
            family = 'en-US';
        }

        const lang = voice.language_name || voice.language;

        if (!grouped[family]) {
            grouped[family] = {};
        }
        if (!grouped[family][lang]) {
            grouped[family][lang] = [];
        }
        grouped[family][lang].push(voice);
    });

    // 生成HTML
    let html = '';

    // 定义语系显示顺序
    const familyOrder = ['chinese', 'en-US', 'east-asian', 'english', 'european',
                         'eastern-european', 'southeast-asian', 'south-asian',
                         'middle-east', 'other'];

    for (const familyKey of familyOrder) {
        if (!grouped[familyKey]) continue;

        const familyData = grouped[familyKey];
        const familyInfo = families[familyKey] || families['other'];
        const isCollapsed = collapsedFamilies.has(familyKey);

        html += `
            <div class="voice-family">
                <div class="voice-family-header ${isCollapsed ? 'collapsed' : ''}"
                     onclick="toggleFamily('${familyKey}')">
                    <span>${familyInfo.icon} ${familyInfo.name}</span>
                    <span class="collapse-icon">▼</span>
                </div>
                <div class="voice-family-voices ${isCollapsed ? 'collapsed' : ''}">
        `;

        for (const [lang, langVoices] of Object.entries(familyData)) {
            html += `<div style="padding: 4px 12px; color: var(--text-secondary); font-size: 0.875rem;">${lang}</div>`;

            langVoices.forEach(voice => {
                const isSelected = selectedVoice && selectedVoice.id === voice.id;
                html += `
                    <div class="voice-option ${isSelected ? 'selected' : ''}"
                         onclick="selectVoiceById('${voice.id}')">
                        <span class="voice-lang">${voice.short_name}</span>
                        <span class="voice-locale">${voice.locale}</span>
                    </div>
                `;
            });
        }

        html += `
                </div>
            </div>
        `;
    }

    if (voicesToRender.length === 0) {
        html = '<div class="voice-no-results">未找到匹配的语音</div>';
    }

    voiceList.innerHTML = html;
}

// 过滤语音列表
function filterVoices(query) {
    query = query.toLowerCase().trim();

    if (!query) {
        renderVoiceList(voices);
        return;
    }

    const filtered = voices.filter(voice => {
        return voice.short_name.toLowerCase().includes(query) ||
               voice.locale.toLowerCase().includes(query) ||
               (voice.language_name && voice.language_name.toLowerCase().includes(query)) ||
               (voice.language && voice.language.toLowerCase().includes(query));
    });

    renderVoiceList(filtered);
}

// 选择语音
function selectVoiceById(voiceId) {
    const voice = voices.find(v => v.id === voiceId);
    if (voice) {
        selectVoice(voice);
        hideVoiceDropdown();
    }
}

function selectVoice(voice) {
    selectedVoice = voice;
    voiceSelect.value = voice.id;

    // 更新显示
    selectedVoiceEl.innerHTML = `
        <div class="selected-voice-info">
            <strong>${voice.short_name}</strong>
            <span style="color: var(--text-secondary); margin-left: 8px;">${voice.locale}</span>
        </div>
        <button class="selected-voice-clear" onclick="clearVoice()" title="清除">×</button>
    `;

    // 重新渲染列表以更新选中状态
    filterVoices(voiceSearch.value);
}

// 清除选择
function clearVoice() {
    selectedVoice = null;
    voiceSelect.value = '';
    selectedVoiceEl.innerHTML = '<span class="voice-placeholder">请选择语音</span>';
    filterVoices(voiceSearch.value);
}

// 切换语系折叠
function toggleFamily(familyKey) {
    if (collapsedFamilies.has(familyKey)) {
        collapsedFamilies.delete(familyKey);
    } else {
        collapsedFamilies.add(familyKey);
    }
    filterVoices(voiceSearch.value);
}

// 生成音频
async function generateAudio() {
    const text = textInput.value.trim();

    if (!text) {
        showNotification('请输入文本', 'warning');
        textInput.focus();
        return;
    }

    if (!selectedVoice) {
        showNotification('请选择语音', 'warning');
        voiceSearch.focus();
        return;
    }

    if (text.length > 5000) {
        showNotification('文本长度不能超过5000字符', 'error');
        return;
    }

    const voice = selectedVoice.id;

    showLoading(true);
    generateBtn.disabled = true;

    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text, voice, rate: currentRate })
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

    audioListContainer.innerHTML = audioList.map(item => {
        const rate = item.rate || 0;
        const rateLabel = formatRateLabel(rate);
        const voiceShort = item.voice.includes('(') ?
            item.voice.match(/\(([^)]+)\)/)[1] :
            item.voice;

        return `
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
                <span>🎙️ ${escapeHtml(voiceShort)}</span>
                <span>⚡ ${rateLabel}</span>
                <span>📅 ${formatDate(item.created_at)}</span>
            </div>
        </div>
        `;
    }).join('');
}

// 格式化语速标签
function formatRateLabel(rate) {
    if (!rate || rate === 0) return '1x 正常';
    if (rate < 0) return `${(1 + rate / 100).toFixed(2)}x 慢速`;
    return `${(1 + rate / 100).toFixed(2)}x 快速`;
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
