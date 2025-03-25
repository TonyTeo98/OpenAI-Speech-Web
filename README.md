# OpenAI Speech Web 应用 | OpenAI Speech Web Application

[English](#english) | [中文](#chinese)

<a name="english"></a>
## English

This is a web application that utilizes the OpenAI Speech API to convert speech to text and text to speech. The application provides a clean, intuitive interface for users to interact with OpenAI's powerful speech models.

> **Note**: This project was entirely programmed with the assistance of AI (GitHub Copilot and Claude). As someone with no prior coding experience, I was able to create this functional application through AI guidance, demonstrating the potential of AI-assisted development.

### Features

- **Speech to Text**: Record audio directly or upload audio files for transcription
- **Text to Speech**: Convert text to lifelike spoken audio with various voice options
- **Multiple Voice Options**: Choose from 10 different voices with distinct characteristics
- **Voice Instructions**: Add specific instructions for voice tone and style
- **Advanced Settings**: Select different TTS models and audio output formats
- **Local API Key Storage**: Securely store your OpenAI API key in your browser's local storage

### Technology Stack

- React.js
- Vite
- Axios for API requests
- OpenAI Speech API

### Deployment

1. **Clone the repository:**
   ```
   git clone https://github.com/TonyTeo98/OpenAI-Speech-Web.git
   cd openai-speech-web
   ```

2. **Install dependencies:**
   ```
   npm install
   ```

3. **Run the development server:**
   ```
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5173` (or the port specified in your terminal) to view the application.

5. **Build for production:**
   ```
   npm run build
   ```

### Usage

1. **Set up your API Key**: 
   - Click the "Settings" button
   - Enter your OpenAI API key (get it from [OpenAI Platform](https://platform.openai.com/api-keys))
   - Your key is stored locally in your browser

2. **Speech to Text**:
   - Click the "Speech to Text" tab
   - Record audio using the microphone button or upload an audio file
   - View transcription results and copy text as needed

3. **Text to Speech**:
   - Click the "Text to Speech" tab
   - Select a voice from the available options
   - Enter text to convert to speech
   - Choose voice instructions (optional)
   - Click "Generate Speech" and play or download the result

### License

This project is licensed under the MIT License.

---

<a name="chinese"></a>
## 中文

这是一个利用 OpenAI Speech API 实现语音转文字和文字转语音功能的 Web 应用。应用提供了简洁直观的界面，让用户能够方便地使用 OpenAI 强大的语音模型。

> **注意**：本项目完全由 AI（GitHub Copilot 和 Claude）辅助编程完成。作为一个没有编程经验的人，我通过 AI 指导创建了这个功能完善的应用，展示了 AI 辅助开发的潜力。

### 功能特点

- **语音转文字**：直接录音或上传音频文件进行转录
- **文字转语音**：将文本转换为逼真的语音，支持多种声音选项
- **多种声音选择**：提供 10 种不同特点的声音供选择
- **语音指令**：添加特定的语音语调和风格指令
- **高级设置**：选择不同的 TTS 模型和音频输出格式
- **本地 API 密钥存储**：在浏览器本地存储中安全保存 OpenAI API 密钥

### 技术栈

- React.js
- Vite
- Axios 用于 API 请求
- OpenAI Speech API

### 部署步骤

1. **克隆仓库：**
   ```
   git clone https://github.com/TonyTeo98/OpenAI-Speech-Web.git
   cd openai-speech-web
   ```

2. **安装依赖：**
   ```
   npm install
   ```

3. **运行开发服务器：**
   ```
   npm run dev
   ```

4. **打开浏览器：**
   导航到 `http://localhost:5173`（或终端中指定的端口）查看应用程序。

5. **生产环境构建：**
   ```
   npm run build
   ```

### 使用说明

1. **设置 API 密钥**： 
   - 点击"设置"按钮
   - 输入您的 OpenAI API 密钥（从 [OpenAI 平台](https://platform.openai.com/api-keys) 获取）
   - 您的密钥将安全地存储在浏览器本地

2. **语音转文字**：
   - 点击"Speech to Text"标签页
   - 使用麦克风按钮录制音频或上传音频文件
   - 查看转录结果并根据需要复制文本

3. **文字转语音**：
   - 点击"Text to Speech"标签页
   - 从可用选项中选择一个声音
   - 输入要转换为语音的文本
   - 选择语音指令（可选）
   - 点击"生成语音"并播放或下载结果

### 许可证

本项目采用 MIT 许可证。