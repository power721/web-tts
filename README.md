# 🎙️ 文本转语音 Web 应用

基于 Microsoft Edge TTS 的文本转语音 Web 应用，简洁易用。

![GitHub](https://img.shields.io/badge/Python-3.8+-blue.svg)
![Flask](https://img.shields.io/badge/Flask-3.0-green.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

## ✨ 功能特点

- 🎙️ **文本转语音**: 支持中文、美式英语、英式英语
- 🌍 **36种音色**: 精选高质量语音
  - 中文: 14 种
  - 美音: 17 种
  - 英音: 5 种
- ⚡ **语速调节**: 支持 0.5x - 2x 语速调节
  - 滑块调节: -50% 到 +100%
  - 快捷按钮: 0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x
- 📋 **音频管理**: 列表展示、在线播放、一键删除
- 🎨 **现代化界面**: 暗色主题，响应式设计
- 📱 **简单易用**: 无需注册，打开即用

## 📸 界面预览

```
┌─────────────────────────────────────┐
│          🎙️ 文本转语音              │
│     基于 Microsoft Edge TTS         │
├─────────────────────────────────────┤
│  选择语音                            │
│  ┌─────────────────────────────┐   │
│  │ 中文 ▼                       │   │
│  ├─────────────────────────────┤   │
│  │ zh-CN, XiaoxiaoNeural       │   │
│  │ zh-CN, YunjianNeural        │   │
│  └─────────────────────────────┘   │
│                                     │
│  输入文本                            │
│  ┌─────────────────────────────┐   │
│  │ 请输入要转换的文本...        │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│  0 / 5000                          │
│                                     │
│  [ 🎵 生成语音 ]                     │
└─────────────────────────────────────┘
```

## 🚀 快速开始

### 安装依赖

```bash
git clone https://github.com/power721/web-tts.git
cd web-tts
pip3 install -r requirements.txt
```

### 启动应用

```bash
python3 app.py
```

应用将在 **http://localhost:5001** 启动

### 使用步骤

1. 打开浏览器访问 http://localhost:5001
2. 选择语音（中文/美音/英音）
3. 输入要转换的文本（最多5000字符）
4. 点击"生成语音"按钮
5. 等待生成完成后播放或下载

## 📁 项目结构

```
web-tts/
├── app.py              # Flask 后端应用
├── requirements.txt    # Python 依赖
├── README.md          # 项目文档
├── .gitignore         # Git 忽略配置
├── audio/             # 音频文件存储目录（git忽略）
├── static/            # 静态资源
│   ├── css/style.css # 暗色主题样式
│   └── js/app.js     # 前端交互逻辑
└── templates/         # HTML 模板
    └── index.html    # 主页面
```

## 🔧 配置说明

### 修改端口

编辑 `app.py` 文件，修改端口号：

```python
if __name__ == '__main__':
    port = 8080  # 修改为你想要的端口
    print(f"TTS Web 应用启动中...")
    print(f"请在浏览器中访问: http://localhost:{port}")
    app.run(host='0.0.0.0', port=port, debug=False)
```

### 网络要求

edge-tts 需要连接到微软服务器：
- 确保网络可以访问 `speech.platform.bing.com`
- 如果无法连接，请检查网络设置或使用代理

## 📡 API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/` | 主页 |
| GET | `/api/voices` | 获取可用语音列表 |
| POST | `/api/generate` | 生成语音 |
| GET | `/api/list` | 获取音频列表 |
| GET | `/audio/<filename>` | 播放音频文件 |
| DELETE | `/api/audio/<id>` | 删除音频 |

### 生成语音示例

```bash
curl -X POST http://localhost:5001/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "你好，欢迎使用文本转语音服务。",
    "voice": "Microsoft Server Speech Text to Speech Voice (zh-CN, XiaoxiaoNeural)"
  }'
```

## 🎯 支持的语音

### 中文 (14种)
- zh-CN, XiaoxiaoNeural (女声)
- zh-CN, YunjianNeural (男声)
- zh-CN, YunxiNeural (男声)
- zh-CN, XiaoyiNeural (女声)
- zh-CN, YunyangNeural (男声)
- zh-HK, HiugaaiNeural (粤语女声)
- zh-TW, HsiaoChenNeural (台湾女声)
- 等等...

### 美式英语 (17种)
- en-US, JennyNeural (女声)
- en-US, GuyNeural (男声)
- en-US, AnaNeural (女声)
- en-US, AriaNeural (女声)
- en-US, ChristopherNeural (男声)
- en-US, EricNeural (男声)
- en-US, MichelleNeural (女声)
- 等等...

### 英式英语 (5种)
- en-GB, LibbyNeural (女声)
- en-GB, RyanNeural (男声)
- en-GB, SoniaNeural (女声)
- en-GB, ThomasNeural (男声)
- en-GB, MaisieNeural (女声)

## ❓ 常见问题

### Q: 生成失败怎么办？

A: 可能的原因和解决方法：
1. **网络问题**: 检查能否访问微软服务器
2. **edge-tts 版本**: 运行 `pip3 install --upgrade edge-tts`
3. **端口占用**: 修改 app.py 中的端口号

### Q: 如何批量转换？

A: 可以通过 API 接口调用，编写脚本批量处理：

```python
import requests

texts = ["第一段文本", "第二段文本", "第三段文本"]
voice = "Microsoft Server Speech Text to Speech Voice (zh-CN, XiaoxiaoNeural)"
rate = 0  # 语速: -50到100 (0.5x-2x), 0表示正常

for text in texts:
    response = requests.post('http://localhost:5001/api/generate',
        json={'text': text, 'voice': voice, 'rate': rate})
    print(response.json())
```

### Q: 音频文件保存在哪里？

A: 音频文件保存在 `audio/` 目录，以 UUID 命名（.mp3格式）。元数据保存在 `audio/metadata.json`。

### Q: 如何清理旧文件？

A: 手动删除 `audio/` 目录中的文件，或通过网页界面逐个删除。

## 🛠️ 技术栈

- **后端**: Flask 3.0 + Python 3.8+
- **TTS引擎**: edge-tts 7.2+
- **前端**: HTML5 + CSS3 + JavaScript (ES6+)
- **音频格式**: MP3

## 📝 开发计划

- [x] 添加语音速度调节 ✅
- [ ] 支持批量文本转换
- [ ] 添加音频下载功能
- [ ] 支持更多语言（可选）
- [ ] 添加历史记录搜索

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📮 联系方式

- GitHub: [@power721](https://github.com/power721)

---

**⭐ 如果这个项目对你有帮助，请给个 Star！**
