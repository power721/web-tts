# 文本转语音 (TTS) Web 应用

基于 Microsoft Edge TTS 的文本转语音 Web 应用，支持多语言语音合成。

## 功能特点

- ✨ 支持多种语言和音色（基于 edge-tts）
- 🎙️ 文本转语音生成
- 📋 音频列表管理
- ▶️ 在线播放音频
- 🗑️ 删除音频文件
- 🌙 暗色主题界面

## 安装

```bash
# 安装依赖
pip3 install -r requirements.txt
```

## 使用

### 启动应用

```bash
python3 app.py
```

应用将在 http://localhost:5001 启动

### 使用步骤

1. 在浏览器中打开 http://localhost:5001
2. 选择语音（支持多种语言）
3. 输入要转换的文本（最多5000字符）
4. 点击"生成语音"按钮
5. 等待生成完成后，在下方列表中播放或删除

## 项目结构

```
my-tts/
├── app.py              # Flask 后端应用
├── requirements.txt    # Python 依赖
├── audio/              # 音频文件存储目录
├── static/             # 静态资源
│   ├── css/style.css  # 样式文件
│   └── js/app.js       # 前端逻辑
└── templates/          # HTML 模板
    └── index.html      # 主页面
```

## API 接口

- `GET /` - 主页
- `GET /api/voices` - 获取所有可用语音
- `POST /api/generate` - 生成语音
  - 参数: `{"text": "文本内容", "voice": "语音ID"}`
- `GET /api/list` - 获取音频列表
- `GET /audio/<filename>` - 播放音频
- `DELETE /api/audio/<id>` - 删除音频

## 注意事项

1. **网络要求**: edge-tts 需要连接到微软服务器，请确保网络畅通
2. **文本限制**: 单次最多转换 5000 字符
3. **存储位置**: 音频文件保存在 `audio/` 目录
4. **手动清理**: 音频文件需要手动删除，不会自动清理

## 常见问题

### 生成失败怎么办？
- 检查网络连接
- 尝试使用不同的语音
- 如果问题持续，可能是 edge-tts 服务暂时不可用

### 如何更改端口？
编辑 `app.py` 文件，修改最后的 `port` 值：
```python
if __name__ == '__main__':
    port = 8080  # 修改为你想要的端口
    ...
```

### 支持哪些语言？
edge-tts 支持数百种语音，包括：
- 中文（简体/繁体）
- 英语（美式/英式等）
- 日语、韩语
- 欧洲各国语言
- 等等...

## 技术栈

- **后端**: Flask (Python)
- **TTS引擎**: edge-tts
- **前端**: HTML + CSS + JavaScript
