# HSM Kit - 专业在线加密工具套件

<div align="center">

<img src="public/logo.svg" alt="HSM Kit Logo" width="120" height="120">

🔐 **在线HSM工具，全面对标BP-Tools，完全本地计算，安全可靠**

[![Website](https://img.shields.io/badge/Website-hsmkit.com-8B5CF6?style=flat-square)](https://hsmkit.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript)](https://typescriptlang.org)

[English](#features) | [简体中文](#✨-特性) | [日本語](#) | [한국어](#) | [Deutsch](#) | [Français](#)

</div>

## ✨ 特性

- 🌐 **跨平台支持** - Mac/Windows/Linux/移动端全平台适用
- 🔒 **100% 本地计算** - 所有加密操作在浏览器执行，数据永不上传服务器
- 🌍 **6种语言支持** - 英语、中文、日语、韩语、德语、法语
- 📱 **响应式设计** - 完美适配桌面端和移动端
- 🌙 **暗黑模式** - 支持日/夜间模式切换，保护眼睛
- ⚡ **无需安装** - 打开浏览器即可使用
- 🎨 **现代化UI** - 基于Ant Design的美观界面
- 🚀 **极速加载** - 代码分割、懒加载、Service Worker 缓存
- 🔍 **SEO优化** - 独立URL、Schema标记、多语言元数据

## 🛠️ 功能模块

### 🔐 加密/解密工具

| 工具 | 描述 | URL |
|------|------|-----|
| **AES 加密** | AES-128/192/256，支持 ECB/CBC/CFB/OFB/CTR 模式 | `/aes-encryption` |
| **DES/3DES 加密** | DES/Triple DES，多种填充选项 | `/des-encryption` |
| **RSA 加密** | RSA 加密/解密/签名/验证，支持 PKCS#1 和 OAEP | `/rsa-encryption` |
| **ECC/ECDSA** | 椭圆曲线加密，支持 secp256k1/P-256/P-384 | `/ecc-encryption` |
| **FPE 格式保留加密** | FF1/FF3-1 算法，NIST SP 800-38G 标准 | `/fpe-encryption` |

### 🔑 密钥管理工具

| 工具 | 描述 | URL |
|------|------|-----|
| **密钥生成器** | 生成 AES/DES/3DES 安全随机密钥 | `/key-generator` |
| **密钥组件合成** | XOR 多个密钥分量形成完整密钥 | `/key-generator` |
| **奇偶校验调整** | DES/3DES 密钥奇偶校验位调整 | `/key-generator` |
| **密钥验证** | 检查密钥格式和奇偶校验 | `/key-generator` |
| **KCV 计算器** | AES/DES/3DES 密钥校验值计算 | `/kcv-calculator` |
| **TR-31 解析器** | ANSI X9.143 密钥块解析分析 | `/tr31-calculator` |

### 💳 支付安全工具

| 工具 | 描述 | URL |
|------|------|-----|
| **PIN Block 生成器** | ISO 9564 Format 0/1/3/4 | `/pin-block-generator` |
| **Message Parser** | ISO 8583、ATM NDC/Wincor 报文解析 | `/message-parser` |

### 🔍 解析工具

| 工具 | 描述 | URL |
|------|------|-----|
| **ASN.1 解析器** | DER/BER 结构解码，X.509 证书解析，PKCS 格式分析 | `/asn1-parser` |
| **RSA DER 公钥** | RSA 公钥 DER/PEM 编码解码，Modulus/Exponent 提取 | `/rsa-der-public-key` |

### 🧰 通用工具

| 工具 | 描述 | URL |
|------|------|-----|
| **Hash 计算器** | MD5/SHA-1/SHA-256/SHA-512/SHA-3/BLAKE2/SM3 等 20+ 种算法 | `/hashes` |
| **字符编码转换** | ASCII/Hex/Binary/EBCDIC/ATM Decimal 互转 | `/character-encoding` |
| **BCD 编码** | 十进制与 BCD 编码互转 | `/bcd` |
| **校验位计算** | Luhn (MOD 10) / Amex SE (MOD 9) 校验位 | `/check-digits` |
| **Base64 编解码** | 标准 Base64 编码解码 | `/base64` |
| **Base94 编解码** | Base94 编码解码 | `/base94` |
| **UUID 生成器** | UUID v1/v3/v4/v5 生成，支持批量 | `/uuid` |

## 🚀 快速开始

### 在线使用

访问 [https://hsmkit.com](https://hsmkit.com) 即可直接使用所有工具。

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/hsm-kit/hsmkit.git
cd hsmkit

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 🔐 安全性

- **客户端加密** - 使用 Web Crypto API 和 crypto-js 在浏览器本地进行所有加密操作
- **零数据传输** - 密钥和敏感数据永远不会离开您的设备
- **开源透明** - 所有代码公开可审计
- **符合合规** - 满足金融行业对密钥安全的严格要求

## 🏗️ 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 19 | 前端框架 |
| TypeScript | 5.9 | 类型安全 |
| Vite (Rolldown) | 7.2 | 构建工具 |
| Ant Design | 6 | UI 组件库 |
| React Router | 7 | 路由管理 |
| CryptoJS | 4.2 | 对称加密 |
| node-forge | 1.3 | RSA/ASN.1 |
| elliptic | 6.6 | ECC/ECDSA |
| hash-wasm | 4.12 | 高性能哈希 |

## ⚡ 性能优化

HSM Kit 采用多项性能优化技术：

| 优化项 | 效果 |
|--------|------|
| **代码分割** | 主包减少 81%（2.2MB → 413KB） |
| **路由懒加载** | 各页面按需加载（0.8-10KB） |
| **Vendor 分包** | React/Antd/Crypto 独立打包 |
| **Service Worker** | 离线缓存，二次访问秒开 |
| **预加载提示** | DNS prefetch, preconnect |

## 🌍 国际化支持

HSM Kit 支持 6 种语言，自动根据用户浏览器语言切换：

- 🇺🇸 English
- 🇨🇳 简体中文
- 🇯🇵 日本語
- 🇰🇷 한국어
- 🇩🇪 Deutsch
- 🇫🇷 Français

## 📊 SEO 优化

- ✅ 每个工具独立 URL（19 个页面）
- ✅ 动态页面标题和描述
- ✅ Schema.org 结构化数据 (WebApplication, SoftwareApplication, FAQPage)
- ✅ Hreflang 多语言标签
- ✅ Sitemap.xml 和 robots.txt
- ✅ Open Graph 和 Twitter Card 标签
- ✅ Google 搜索 favicon 支持

## 📦 版本历史

### v3.0.0 (2025-12-31) 🎉

**新增功能：**
- 🧰 **通用工具套件** (Generic Tools)
  - Hash 计算器（20+ 种算法）
  - 字符编码转换（ASCII/Hex/Binary/EBCDIC）
  - BCD 编码/解码
  - 校验位计算（Luhn/Amex SE）
  - Base64/Base94 编解码
  - Message Parser（ISO8583/ATM）
  - RSA DER 公钥编解码
  - UUID 生成器（v1/v3/v4/v5）
- 🌙 **暗黑模式** - 日/夜间主题切换
- 🔍 **首页搜索** - 快速定位工具
- 🏷️ **工具分类** - 按类型筛选

**性能优化：**
- ⚡ **代码分割** - 主包减少 81%
- 🚀 **路由懒加载** - 按需加载页面
- 💾 **Service Worker** - 离线缓存支持
- 📦 **Vendor 分包** - 依赖独立打包

**UI/UX 优化：**
- 🎨 **新 Logo** - 紫蓝渐变盾牌+钥匙设计
- 📱 **等宽字体** - 防止字符混淆
- 🎯 **结果区域** - 增强视觉权重
- 💡 **信息提示** - 悬浮气泡优化

### v2.0.0 (2025-12-26)

**新增功能：**
- 🔐 **完整加密工具套件**
  - AES 加密/解密（ECB/CBC/CFB/OFB/CTR）
  - DES/3DES 加密（多种填充）
  - RSA 加密/签名/验证
  - ECC/ECDSA 数字签名
  - FPE 格式保留加密（FF1/FF3-1）
- 🔍 **ASN.1 解析器** - 支持 DER/BER/PEM，RFC 定义匹配
- 🔑 **密钥组件管理** - XOR 合成、奇偶校验、密钥验证

**架构优化：**
- 🌐 **多路由架构** - 每个工具独立 URL，SEO 友好
- 📊 **Schema.org 结构化数据** - 支持评分星级和应用程序标签
- 🌍 **6种语言 SEO 内容** - 英/中/日/韩/德/法
- 📝 **FAQ 和使用说明** - 每个工具页面增加文字内容

### v1.0.0 (2025-12-10)
- ✅ 密钥生成器（DES/3DES/AES）
- ✅ KCV 计算器（DES/AES）
- ✅ PIN Block 工具（ISO Format 0）
- ✅ TR-31 密钥块分析器
- ✅ 响应式移动端设计
- ✅ 多语言界面支持

## 📁 项目结构

```
hsmkit/
├── src/
│   ├── components/           # 可复用组件
│   │   ├── cipher/           # 加密工具组件
│   │   ├── common/           # 通用组件（SEO、布局、结果展示）
│   │   ├── generic/          # 通用工具组件
│   │   ├── keys/             # 密钥管理组件
│   │   ├── parser/           # 解析器组件
│   │   └── payment/          # 支付工具组件
│   ├── pages/                # 页面组件（带 SEO）
│   │   ├── cipher/           # 加密工具页面
│   │   ├── generic/          # 通用工具页面
│   │   ├── home/             # 首页
│   │   ├── keys/             # 密钥管理页面
│   │   ├── parser/           # 解析器页面
│   │   └── payment/          # 支付工具页面
│   ├── locales/              # 多语言文件
│   │   ├── en.ts             # 英语
│   │   ├── zh.ts             # 中文
│   │   ├── ja.ts             # 日语
│   │   ├── ko.ts             # 韩语
│   │   ├── de.ts             # 德语
│   │   ├── fr.ts             # 法语
│   │   └── seo.ts            # SEO 内容
│   ├── hooks/                # 自定义 Hooks
│   │   ├── useLanguage.tsx   # 语言切换
│   │   └── useTheme.tsx      # 主题切换
│   └── App.tsx               # 主应用（路由懒加载）
├── public/                   # 静态资源
│   ├── favicon.svg           # 网站图标（SVG）
│   ├── favicon-*.png         # 网站图标（PNG 多尺寸）
│   ├── logo.svg              # 完整 Logo
│   ├── sitemap.xml           # 网站地图（19 页）
│   ├── robots.txt            # 爬虫指令
│   ├── sw.js                 # Service Worker
│   └── _redirects            # SPA 路由重定向
├── scripts/                  # 构建脚本
│   └── generate-favicon-png.js  # PNG 图标生成
├── vite.config.ts            # Vite 配置（代码分割）
└── dist/                     # 构建输出
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🔗 相关链接

- 🌐 [在线演示](https://hsmkit.com)
- 📦 [GitHub 仓库](https://github.com/hsm-kit/hsmkit)
- 🐛 [问题反馈](https://github.com/hsm-kit/hsmkit/issues)

---

<div align="center">

**⚠️ 注意**: 本工具适用于测试和开发环境。在生产环境使用前，请确保遵守相关安全规范。

Made with ❤️ by [HSM Kit Team](https://hsmkit.com)

</div>
