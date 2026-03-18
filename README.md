# 🎙️ 文本转语音 Web 应用

基于 Microsoft Edge TTS 的文本转语音 Web 应用，简洁易用。

![GitHub](https://img.shields.io/badge/Python-3.8+-blue.svg)
![Flask](https://img.shields.io/badge/Flask-3.0-green.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

## ✨ 功能特点

- 🎙️ **文本转语音**: 支持 100+ 种语言
- 🌍 **322种音色**: 高质量语音，按语系分类
  - 🌏 东亚: 中文、日语、韩语 (19种)
  - 🇬🇧 英语: 美式、英式、澳式等 (47种)
  - 🇪🇺 欧洲: 法语、德语、西班牙语等 (88种)
  - 🌍 东欧: 俄语、波兰语、捷克语等 (26种)
  - 🕌 中东: 阿拉伯语、希伯来语、波斯语 (40种)
  - 🇮🇳 南亚: 印地语、泰米尔语等 (26种)
  - 🌴 东南亚: 泰语、越南语、印尼语 (20种)
  - 🌐 其他: 56种
- ⚡ **语速调节**: 支持 0.5x - 2x 语速调节
  - 滑块调节: -50% 到 +100%
  - 快捷按钮: 0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x
- 🔍 **智能搜索**: 实时搜索语音，支持多语言
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

### 🌏 东亚语言 (19种)
**中文**:
- zh-CN, XiaoxiaoNeural (女声)
- zh-CN, YunjianNeural (男声)
- zh-CN, YunxiNeural (男声)
- zh-CN, XiaoyiNeural (女声)
- zh-HK, HiugaaiNeural (粤语女声)
- zh-TW, HsiaoChenNeural (台湾女声)

**日语**:
- ja-JP, NanamiNeural (女声)
- ja-JP, KeitaNeural (男声)

**韩语**:
- ko-KR, SunHiNeural (女声)
- ko-KR, InJoonNeural (男声)

### 🇬🇧 英语系 (47种)
**美式英语**:
- en-US, JennyNeural (女声)
- en-US, GuyNeural (男声)
- en-US, AnaNeural (女声)
- en-US, ChristopherNeural (男声)

**英式英语**:
- en-GB, LibbyNeural (女声)
- en-GB, RyanNeural (男声)
- en-GB, SoniaNeural (女声)

**其他**: en-AU (澳式), en-CA (加拿大), en-IN (印度) 等

### 🇪🇺 欧洲语言 (88种)
- **法语**: fr-FR, DeniNeural (女声); fr-CA, SylvieNeural (女声)
- **德语**: de-DE, KatjaNeural (女声); de-DE, ConradNeural (男声)
- **西班牙语**: es-ES, ElviraNeural (女声); es-MX, DaliaNeural (女声)
- **意大利语**: it-IT, ElsaNeural (女声); it-IT, DiegoNeural (男声)
- **葡萄牙语**: pt-BR, FranciscaNeural (女声); pt-PT, RaquelNeural (女声)
- **荷兰语**: nl-NL, ColetteNeural (女声); nl-NL, MaartenNeural (男声)
- **瑞典语**: sv-SE, SofieNeural (女声); sv-SE, MattiasNeural (男声)
- **丹麦语**: da-DK, ChristelNeural (女声); da-DK, JeppeNeural (男声)
- **挪威语**: nb-NO, IselinNeural (女声); nb-NO, FinnNeural (男声)
- **芬兰语**: fi-FI, NooraNeural (女声); fi-FI, HarriNeural (男声)

### 🌍 东欧语言 (26种)
- **俄语**: ru-RU, SvetlanaNeural (女声); ru-RU, DmitryNeural (男声)
- **波兰语**: pl-PL, ZofiaNeural (女声); pl-PL, MarekNeural (男声)
- **捷克语**: cs-CZ, VlastaNeural (女声); cs-CZ, AntoninNeural (男声)
- **罗马尼亚语**: ro-RO, AlinaNeural (女声); ro-RO, EmilNeural (男声)
- **乌克兰语**: uk-UA, PolinaNeural (女声); uk-UA, OleksandrNeural (男声)
- **希腊语**: el-GR, AthinaNeural (女声); el-GR, NestorasNeural (男声)
- **土耳其语**: tr-TR, EmelNeural (女声); tr-TR, AhmetNeural (男声)

### 🕌 中东语言 (40种)
- **阿拉伯语**: ar-SA, ZariyahNeural (女声); ar-SA, HamdanNeural (男声)
- **希伯来语**: he-IL, HilaNeural (女声); he-IL, AvriNeural (男声)
- **波斯语**: fa-IR, DilaraNeural (女声); fa-IR, FaridNeural (男声)

### 🇮🇳 南亚语言 (26种)
- **印地语**: hi-IN, SwaraNeural (女声); hi-IN, MadhurNeural (男声)
- **泰米尔语**: ta-IN, PallaviNeural (女声); ta-IN, ValluvarNeural (男声)
- **孟加拉语**: bn-IN, TanishaaNeural (女声); bn-IN, BashkarNeural (男声)

### 🌴 东南亚语言 (20种)
- **泰语**: th-TH, AcharaNeural (女声); th-TH, NiwatNeural (男声)
- **越南语**: vi-VN, HoaiMyNeural (女声); vi-VN, NamMinhNeural (男声)
- **印尼语**: id-ID, GadisNeural (女声); id-ID, AriNeural (男声)
- **马来语**: ms-MY, YasminNeural (女声); ms-MY, RizwanNeural (男声)

**以及更多语言...**

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
- [x] 支持更多语言 ✅ (100+ 种语言, 322 种语音)
- [ ] 支持批量文本转换
- [ ] 添加音频下载功能
- [ ] 添加历史记录搜索

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📮 联系方式

- GitHub: [@power721](https://github.com/power721)

---

**⭐ 如果这个项目对你有帮助，请给个 Star！**
