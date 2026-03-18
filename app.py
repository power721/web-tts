#!/usr/bin/env python3
"""
TTS Web Application
使用 edge-tts 实现文本转语音功能
"""

import os
import json
import uuid
import asyncio
from datetime import datetime
from flask import Flask, render_template, request, jsonify, send_file
from edge_tts import Communicate, list_voices

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024  # 16KB max text input

# 数据目录
AUDIO_DIR = 'audio'
METADATA_FILE = 'audio/metadata.json'

# 确保目录存在
os.makedirs(AUDIO_DIR, exist_ok=True)


def load_metadata():
    """加载音频元数据"""
    if os.path.exists(METADATA_FILE):
        with open(METADATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []


def save_metadata(metadata):
    """保存音频元数据"""
    with open(METADATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, ensure_ascii=False, indent=2)


@app.route('/')
def index():
    """主页"""
    return render_template('index.html')


@app.route('/api/voices')
def get_voices():
    """获取中文、美音和英音语音"""
    try:
        async def fetch_voices():
            return await list_voices()

        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        voices = loop.run_until_complete(fetch_voices())
        loop.close()

        voice_list = []
        for voice in voices:
            locale = voice.get('Locale', '')
            # 只保留中文、美音和英音
            if locale.startswith('zh') or locale in ['en-US', 'en-GB']:
                # 提取简短名称：en-US, AndrewNeural
                short_name = voice['Name'].replace('Microsoft Server Speech Text to Speech Voice (', '').replace(')', '')
                voice_list.append({
                    'id': voice['Name'],
                    'name': voice['Name'],
                    'short_name': short_name,
                    'locale': locale,
                    'language': 'zh' if locale.startswith('zh') else 'en',
                    'region': '美音' if locale == 'en-US' else '英音' if locale == 'en-GB' else '中文'
                })
        # 按语言和地区分组
        voice_list.sort(key=lambda x: (x['language'], x['locale']))
        return jsonify({'voices': voice_list})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/generate', methods=['POST'])
def generate_audio():
    """生成语音"""
    try:
        data = request.get_json()
        text = data.get('text', '').strip()
        voice = data.get('voice', 'zh-CN-XiaoxiaoNeural')
        rate = data.get('rate', 0)  # 语速，-50到100

        if not text:
            return jsonify({'error': '文本不能为空'}), 400

        if len(text) > 5000:
            return jsonify({'error': '文本长度不能超过5000字符'}), 400

        # 生成唯一ID和文件名
        audio_id = str(uuid.uuid4())
        filename = f"{audio_id}.mp3"
        filepath = os.path.join(AUDIO_DIR, filename)

        # 格式化语速参数
        rate_str = f"{rate:+d}%" if rate != 0 else "+0%"

        # 异步生成音频
        async def create_audio():
            communicate = Communicate(text, voice, rate=rate_str)
            await communicate.save(filepath)

        # 运行异步任务（使用 asyncio.run）
        try:
            asyncio.run(create_audio())
        except RuntimeError:
            # 如果已有事件循环，使用 run_until_complete
            loop = asyncio.get_event_loop()
            if loop.is_running():
                # 在运行中的循环中创建新任务
                import concurrent.futures
                with concurrent.futures.ThreadPoolExecutor() as executor:
                    future = executor.submit(
                        lambda: asyncio.run(create_audio())
                    )
                    future.result()
            else:
                loop.run_until_complete(create_audio())

        # 验证文件生成
        if not os.path.exists(filepath) or os.path.getsize(filepath) == 0:
            return jsonify({'error': '音频生成失败，请稍后重试'}), 500

        # 保存元数据
        metadata = load_metadata()
        metadata.insert(0, {
            'id': audio_id,
            'filename': filename,
            'text': text[:100] + '...' if len(text) > 100 else text,
            'full_text': text,
            'voice': voice,
            'rate': rate,
            'created_at': datetime.now().isoformat()
        })
        save_metadata(metadata)

        return jsonify({
            'success': True,
            'id': audio_id,
            'filename': filename
        })

    except Exception as e:
        return jsonify({'error': f'生成失败: {str(e)}'}), 500


@app.route('/api/list')
def list_audio():
    """获取音频列表"""
    try:
        metadata = load_metadata()
        # 过滤掉已删除的文件
        valid_metadata = []
        for item in metadata:
            filepath = os.path.join(AUDIO_DIR, item['filename'])
            if os.path.exists(filepath):
                valid_metadata.append(item)
        # 更新元数据
        if len(valid_metadata) != len(metadata):
            save_metadata(valid_metadata)
        return jsonify({'audio_list': valid_metadata})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/audio/<filename>')
def serve_audio(filename):
    """提供音频文件"""
    try:
        filepath = os.path.join(AUDIO_DIR, filename)
        if os.path.exists(filepath):
            return send_file(filepath, mimetype='audio/mpeg')
        return jsonify({'error': '文件不存在'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/audio/<audio_id>', methods=['DELETE'])
def delete_audio(audio_id):
    """删除音频"""
    try:
        metadata = load_metadata()
        new_metadata = []
        deleted = False

        for item in metadata:
            if item['id'] == audio_id:
                # 删除文件
                filepath = os.path.join(AUDIO_DIR, item['filename'])
                if os.path.exists(filepath):
                    os.remove(filepath)
                deleted = True
            else:
                new_metadata.append(item)

        if deleted:
            save_metadata(new_metadata)
            return jsonify({'success': True})
        else:
            return jsonify({'error': '音频不存在'}), 404

    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    port = 5001
    print(f"TTS Web 应用启动中...")
    print(f"请在浏览器中访问: http://localhost:{port}")
    # 关闭 debug 模式以避免事件循环冲突
    app.run(host='0.0.0.0', port=port, debug=False)
