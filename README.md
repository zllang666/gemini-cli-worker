# 🚀 Gemini CLI OpenAI Worker

<div align="center">

**[English](#english) | [中文](#中文)**

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/mrproper)

</div>

---

## English

Transform Google's Gemini models into OpenAI-compatible endpoints using Cloudflare Workers. Access Google's most advanced AI models through familiar OpenAI API patterns, powered by OAuth2 authentication and the same infrastructure that drives the official Gemini CLI.

### ✨ Features

- 🔐 **OAuth2 Authentication** - No API keys required, uses your Google account
- 🎯 **OpenAI-Compatible API** - Drop-in replacement for OpenAI endpoints
- 📚 **OpenAI SDK Support** - Works with official OpenAI SDKs and libraries
- 🖼️ **Vision Support** - Multi-modal conversations with images (base64 & URLs)
- 🌐 **Third-party Integration** - Compatible with Open WebUI, ChatGPT clients, and more
- ⚡ **Cloudflare Workers** - Global edge deployment with low latency
- 🔄 **Smart Token Caching** - Intelligent token management with KV storage
- 🆓 **Free Tier Access** - Leverage Google's free tier through Code Assist API
- 📡 **Real-time Streaming** - Server-sent events for live responses
- 🎭 **Multiple Models** - Access to latest Gemini models including experimental ones

### 🚀 Quick Start

#### Prerequisites
- Google account with Gemini access
- Cloudflare account with Workers enabled
- Node.js and npm installed

#### 1. Install Dependencies
```bash
npm install
```

#### 2. Get OAuth2 Credentials
```bash
# Install Gemini CLI
npm install -g @google/gemini-cli

# Authenticate with Google
gemini
# Select "Login with Google" and complete authentication

# Find credentials file:
# Windows: C:\Users\USERNAME\.gemini\oauth_creds.json
# macOS/Linux: ~/.gemini/oauth_creds.json
```

#### 3. Create KV Namespace
```bash
wrangler kv namespace create "GEMINI_CLI_KV"
# Update wrangler.toml with the returned namespace ID
```

#### 4. Configure Environment
Create `.dev.vars` file:
```bash
# Required: OAuth2 credentials from Gemini CLI
GCP_SERVICE_ACCOUNT={"access_token":"ya29...","refresh_token":"1//...","scope":"...","token_type":"Bearer","id_token":"eyJ...","expiry_date":1750927763467}

# Optional: API key for authentication
OPENAI_API_KEY=sk-your-secret-api-key-here
```

#### 5. Deploy or Run Locally
```bash
# Deploy to Cloudflare Workers
npm run deploy

# Or run locally for development
npm run dev
```

### 📖 Full Documentation

For detailed setup instructions, API documentation, and usage examples, see the sections below.

---

## 中文

将 Google 的 Gemini 模型转换为与 OpenAI 兼容的端点，使用 Cloudflare Workers 部署。通过熟悉的 OpenAI API 模式访问 Google 最先进的 AI 模型，由 OAuth2 身份验证和与官方 Gemini CLI 相同的基础设施提供支持。

### ✨ 功能特性

- 🔐 **OAuth2 身份验证** - 无需 API 密钥，使用您的 Google 账户
- 🎯 **OpenAI 兼容 API** - 可直接替换 OpenAI 端点
- 📚 **OpenAI SDK 支持** - 与官方 OpenAI SDK 和库兼容
- 🖼️ **视觉支持** - 支持图像的多模态对话（base64 和 URL）
- 🌐 **第三方集成** - 兼容 Open WebUI、ChatGPT 客户端等
- ⚡ **Cloudflare Workers** - 全球边缘部署，低延迟
- 🔄 **智能令牌缓存** - 使用 KV 存储的智能令牌管理
- 🆓 **免费层访问** - 通过 Code Assist API 利用 Google 免费层
- 📡 **实时流式传输** - 服务器发送事件用于实时响应
- 🎭 **多种模型** - 访问最新的 Gemini 模型，包括实验性模型

### 🚀 快速开始

#### 前提条件
- 具有 Gemini 访问权限的 Google 账户
- 启用 Workers 的 Cloudflare 账户
- 已安装 Node.js 和 npm

#### 1. 安装依赖
```bash
npm install
```

#### 2. 获取 OAuth2 凭据
```bash
# 安装 Gemini CLI
npm install -g @google/gemini-cli

# 使用 Google 身份验证
gemini
# 选择"使用 Google 登录"并完成身份验证

# 查找凭据文件：
# Windows: C:\Users\USERNAME\.gemini\oauth_creds.json
# macOS/Linux: ~/.gemini/oauth_creds.json
```

#### 3. 创建 KV 命名空间
```bash
wrangler kv namespace create "GEMINI_CLI_KV"
# 使用返回的命名空间 ID 更新 wrangler.toml
```

#### 4. 配置环境
创建 `.dev.vars` 文件：
```bash
# 必需：来自 Gemini CLI 的 OAuth2 凭据
GCP_SERVICE_ACCOUNT={"access_token":"ya29...","refresh_token":"1//...","scope":"...","token_type":"Bearer","id_token":"eyJ...","expiry_date":1750927763467}

# 可选：用于身份验证的 API 密钥
OPENAI_API_KEY=sk-your-secret-api-key-here
```

#### 5. 部署或本地运行
```bash
# 部署到 Cloudflare Workers
npm run deploy

# 或本地开发运行
npm run dev
```

### 📖 完整文档

详细的设置说明、API 文档和使用示例，请参阅以下部分。

---

## 🤖 Supported Models / 支持的模型

| Model ID | Context Window | Max Tokens | Thinking Support | Description |
|----------|----------------|------------|------------------|-------------|
| `gemini-2.5-pro` | 1M | 65K | ✅ | Latest Gemini 2.5 Pro model with reasoning capabilities |
| `gemini-2.5-flash` | 1M | 65K | ✅ | Fast Gemini 2.5 Flash model with reasoning capabilities |

> **Note / 注意:** Gemini 2.5 models have thinking enabled by default. The API automatically manages this:
> - When real thinking is disabled (environment), thinking budget is set to 0 to disable it
> - When real thinking is enabled (environment), thinking budget defaults to -1 (dynamic allocation by Gemini)

## 🛠️ Setup / 设置

### Step 1: Get OAuth2 Credentials / 步骤1：获取 OAuth2 凭据

You need OAuth2 credentials from a Google account that has accessed Gemini. The easiest way to get these is through the official Gemini CLI.

您需要从已访问 Gemini 的 Google 账户获取 OAuth2 凭据。最简单的方法是通过官方 Gemini CLI。

#### Using Gemini CLI / 使用 Gemini CLI

1. **Install Gemini CLI / 安装 Gemini CLI**:
   ```bash
   npm install -g @google/gemini-cli
   ```

2. **Start the Gemini CLI / 启动 Gemini CLI**:
   ```bash
   gemini
   ```

3. **Authenticate with Google / 使用 Google 进行身份验证**:
   Select `● Login with Google` / 选择 `● 使用 Google 登录`

   A browser window will now open prompting you to login with your Google account.

   现在将打开浏览器窗口，提示您使用 Google 账户登录。

4. **Locate the credentials file / 找到凭据文件**:

   **Windows:**
   ```
   C:\Users\USERNAME\.gemini\oauth_creds.json
   ```

   **macOS/Linux:**
   ```
   ~/.gemini/oauth_creds.json
   ```

5. **Copy the credentials / 复制凭据**:
   The file contains JSON in this format / 文件包含以下格式的 JSON：
   ```json
   {
     "access_token": "ya29.a0AS3H6Nx...",
     "refresh_token": "1//09FtpJYpxOd...",
     "scope": "https://www.googleapis.com/auth/cloud-platform ...",
     "token_type": "Bearer",
     "id_token": "eyJhbGciOiJSUzI1NiIs...",
     "expiry_date": 1750927763467
   }
   ```

### Step 2: Create KV Namespace / 步骤2：创建 KV 命名空间

```bash
# Create a KV namespace for token caching
# 为令牌缓存创建 KV 命名空间
wrangler kv namespace create "GEMINI_CLI_KV"
```

Note the namespace ID returned. Update `wrangler.toml` with your KV namespace ID:

记录返回的命名空间 ID。使用您的 KV 命名空间 ID 更新 `wrangler.toml`：

```toml
kv_namespaces = [
  { binding = "GEMINI_CLI_KV", id = "your-kv-namespace-id" }
]
```

### Step 3: Environment Setup / 步骤3：环境设置

Create a `.dev.vars` file / 创建 `.dev.vars` 文件：

```bash
# Required: OAuth2 credentials JSON from Gemini CLI authentication
# 必需：来自 Gemini CLI 身份验证的 OAuth2 凭据 JSON
GCP_SERVICE_ACCOUNT={"access_token":"ya29...","refresh_token":"1//...","scope":"...","token_type":"Bearer","id_token":"eyJ...","expiry_date":1750927763467}

# Optional: Google Cloud Project ID (auto-discovered if not set)
# 可选：Google Cloud 项目 ID（如果未设置则自动发现）
# GEMINI_PROJECT_ID=your-project-id

# Optional: API key for authentication (if not set, API is public)
# 可选：用于身份验证的 API 密钥（如果未设置，API 是公开的）
# When set, clients must include "Authorization: Bearer <your-api-key>" header
# 设置后，客户端必须包含 "Authorization: Bearer <your-api-key>" 头部
# Example: sk-1234567890abcdef1234567890abcdef
OPENAI_API_KEY=sk-your-secret-api-key-here
```

For production, set the secrets / 对于生产环境，设置密钥：

```bash
wrangler secret put GCP_SERVICE_ACCOUNT
wrangler secret put OPENAI_API_KEY  # Optional, only if you want authentication
```

### Step 4: Deploy / 步骤4：部署

```bash
# Install dependencies / 安装依赖
npm install

# Deploy to Cloudflare Workers / 部署到 Cloudflare Workers
npm run deploy

# Or run locally for development / 或本地开发运行
npm run dev
```

## 🔧 Configuration / 配置

### Environment Variables / 环境变量

| Variable | Required / 必需 | Description / 描述 |
|----------|----------|-------------|
| `GCP_SERVICE_ACCOUNT` | ✅ | OAuth2 credentials JSON string / OAuth2 凭据 JSON 字符串 |
| `GEMINI_PROJECT_ID` | ❌ | Google Cloud Project ID (auto-discovered if not set) / Google Cloud 项目 ID（如果未设置则自动发现） |
| `OPENAI_API_KEY` | ❌ | API key for authentication (if not set, API is public) / 用于身份验证的 API 密钥（如果未设置，API 是公开的） |
| `ENABLE_FAKE_THINKING` | ❌ | Enable synthetic thinking output for thinking models / 为思考模型启用合成思考输出 |
| `ENABLE_REAL_THINKING` | ❌ | Enable real Gemini thinking output / 启用真实的 Gemini 思考输出 |
| `STREAM_THINKING_AS_CONTENT` | ❌ | Stream thinking as content with `<thinking>` tags / 以内容形式流式传输思考，带有 `<thinking>` 标签 |
| `ENABLE_AUTO_MODEL_SWITCHING` | ❌ | Enable automatic fallback from pro to flash models / 启用从 pro 到 flash 模型的自动回退 |

## 💻 Usage Examples / 使用示例

### OpenAI SDK (Python)
```python
from openai import OpenAI

# Initialize with your worker endpoint
# 使用您的 worker 端点初始化
client = OpenAI(
    base_url="https://your-worker.workers.dev/v1",
    api_key="sk-your-secret-api-key-here"  # Use your OPENAI_API_KEY if authentication is enabled
)

# Chat completion / 聊天完成
response = client.chat.completions.create(
    model="gemini-2.5-flash",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Explain machine learning in simple terms"}
    ],
    stream=True
)

for chunk in response:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
```

### OpenAI SDK (JavaScript/TypeScript)
```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'https://your-worker.workers.dev/v1',
  apiKey: 'sk-your-secret-api-key-here', // Use your OPENAI_API_KEY if authentication is enabled
});

const stream = await openai.chat.completions.create({
  model: 'gemini-2.5-flash',
  messages: [
    { role: 'user', content: 'Write a haiku about coding' }
  ],
  stream: true,
});

for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content || '';
  process.stdout.write(content);
}
```

### cURL
```bash
curl -X POST https://your-worker.workers.dev/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-your-secret-api-key-here" \
  -d '{
    "model": "gemini-2.5-flash",
    "messages": [
      {"role": "user", "content": "Explain quantum computing"}
    ]
  }'
```

## 📡 API Endpoints / API 端点

### Base URL / 基础 URL
```
https://your-worker.your-subdomain.workers.dev
```

### List Models / 列出模型
```http
GET /v1/models
```

### Chat Completions / 聊天完成
```http
POST /v1/chat/completions
Content-Type: application/json

{
  "model": "gemini-2.5-flash",
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful assistant."
    },
    {
      "role": "user",
      "content": "Hello! How are you?"
    }
  ]
}
```

### Image Support (Vision) / 图像支持（视觉）

The worker supports multimodal conversations with images for vision-capable models.

Worker 支持具有视觉功能的模型进行多模态图像对话。

```python
from openai import OpenAI
import base64

# Encode your image / 编码您的图像
with open("image.jpg", "rb") as image_file:
    base64_image = base64.b64encode(image_file.read()).decode('utf-8')

client = OpenAI(
    base_url="https://your-worker.workers.dev/v1",
    api_key="sk-your-secret-api-key-here"
)

response = client.chat.completions.create(
    model="gemini-2.5-flash",
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "What do you see in this image?"
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{base64_image}"
                    }
                }
            ]
        }
    ]
)

print(response.choices[0].message.content)
```

## 🚨 Troubleshooting / 故障排除

### Common Issues / 常见问题

**401 Authentication Error / 401 身份验证错误**
- Check if your OAuth2 credentials are valid / 检查您的 OAuth2 凭据是否有效
- Ensure the refresh token is working / 确保刷新令牌正常工作
- Verify the credentials format matches exactly / 验证凭据格式完全匹配

**Token Refresh Failed / 令牌刷新失败**
- Credentials might be from wrong OAuth2 client / 凭据可能来自错误的 OAuth2 客户端
- Refresh token might be expired or revoked / 刷新令牌可能已过期或被撤销
- Check the debug cache endpoint for token status / 检查调试缓存端点以了解令牌状态

**Project ID Discovery Failed / 项目 ID 发现失败**
- Set `GEMINI_PROJECT_ID` environment variable manually / 手动设置 `GEMINI_PROJECT_ID` 环境变量
- Ensure your Google account has access to Gemini / 确保您的 Google 账户有权访问 Gemini

### Debug Commands / 调试命令

```bash
# Check KV cache status / 检查 KV 缓存状态
curl https://your-worker.workers.dev/v1/debug/cache

# Test authentication only / 仅测试身份验证
curl -X POST https://your-worker.workers.dev/v1/token-test

# Test full flow / 测试完整流程
curl -X POST https://your-worker.workers.dev/v1/test
```

## 🏗️ How It Works / 工作原理

```mermaid
graph TD
    A[Client Request / 客户端请求] --> B[Cloudflare Worker]
    B --> C{Token in KV Cache? / 令牌在 KV 缓存中？}
    C -->|Yes / 是| D[Use Cached Token / 使用缓存令牌]
    C -->|No / 否| E[Check Environment Token / 检查环境令牌]
    E --> F{Token Valid? / 令牌有效？}
    F -->|Yes / 是| G[Cache & Use Token / 缓存并使用令牌]
    F -->|No / 否| H[Refresh Token / 刷新令牌]
    H --> I[Cache New Token / 缓存新令牌]
    D --> J[Call Gemini API / 调用 Gemini API]
    G --> J
    I --> J
    J --> K[Stream Response / 流式响应]
    K --> L[OpenAI Format / OpenAI 格式]
    L --> M[Client Response / 客户端响应]
```

The worker acts as a translation layer, converting OpenAI API calls to Google's Code Assist API format while managing OAuth2 authentication automatically.

Worker 充当翻译层，将 OpenAI API 调用转换为 Google 的 Code Assist API 格式，同时自动管理 OAuth2 身份验证。

## 🤝 Contributing / 贡献

1. Fork the repository / 复刻仓库
2. Create a feature branch / 创建功能分支
3. Make your changes / 进行更改
4. Test thoroughly / 彻底测试
5. Submit a pull request / 提交拉取请求

## 📄 License / 许可证

This project is licensed under the MIT License - see the LICENSE file for details.

本项目采用 MIT 许可证 - 有关详细信息，请参阅 LICENSE 文件。

## 🙏 Acknowledgments / 致谢

- Inspired by the official [Google Gemini CLI](https://github.com/google-gemini/gemini-cli)
- Built on [Cloudflare Workers](https://workers.cloudflare.com/)
- Uses [Hono](https://hono.dev/) web framework
- Source Project [gemini-cli-openai](https://github.com/GewoonJaap/gemini-cli-openai)

---

**⚠️ Important / 重要提示**: This project uses Google's Code Assist API which may have usage limits and terms of service. Please ensure compliance with Google's policies when using this worker.

本项目使用 Google 的 Code Assist API，可能有使用限制和服务条款。使用此 Worker 时请确保符合 Google 的政策。
