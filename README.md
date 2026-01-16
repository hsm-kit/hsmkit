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

---

## 📖 项目简介

HSM Kit 是一款专业的在线加密工具套件，专为金融、支付和安全领域的开发者、测试人员和安全工程师设计。它提供与 BP-Tools 完全对标的功能，但完全在浏览器端运行，无需安装任何软件。

### 核心价值

- **安全第一** - 100% 客户端计算，密钥和敏感数据永不离开您的设备
- **专业完整** - 涵盖 HSM 密钥管理、支付安全、PKI 证书、加密算法等 50+ 工具
- **即开即用** - 打开浏览器即可使用，支持 Mac/Windows/Linux/移动端
- **开源透明** - 代码公开可审计，满足金融行业合规要求

---

## ✨ 特性

| 特性 | 描述 |
|------|------|
| 🔒 **本地计算** | 所有加密操作在浏览器执行，数据永不上传服务器 |
| 🌐 **跨平台** | Mac/Windows/Linux/iOS/Android 全平台适用 |
| 🌍 **多语言** | 英语、中文、日语、韩语、德语、法语 6 种语言 |
| 🌙 **暗黑模式** | 日/夜间主题切换，保护眼睛 |
| 📱 **响应式** | 完美适配桌面端和移动端 |
| ⚡ **极速加载** | 代码分割、懒加载、Service Worker 缓存 |
| 🔍 **SEO 优化** | 独立 URL、Schema 标记、多语言 hreflang |
| 📚 **知识库** | 内置安全知识库，深入理解工具背后的原理 |

---

## 🛠️ 功能模块

### 🔐 加密/解密工具 (5 个)

| 工具 | 描述 | 路由 |
|------|------|------|
| AES 加密 | AES-128/192/256，ECB/CBC/CFB/OFB/CTR 模式 | `/aes-encryption` |
| DES/3DES 加密 | DES/Triple DES，多种填充选项 | `/des-encryption` |
| RSA 加密 | RSA 加密/解密/签名/验证，PKCS#1/OAEP | `/rsa-encryption` |
| ECC/ECDSA | 椭圆曲线加密，secp256k1/P-256/P-384 | `/ecc-encryption` |
| FPE 格式保留加密 | FF1/FF3-1 算法，NIST SP 800-38G | `/fpe-encryption` |

### 🔑 密钥管理工具 (9 个)

| 工具 | 描述 | 路由 |
|------|------|------|
| 密钥生成器 | AES/DES/3DES 安全随机密钥，密钥组合、奇偶校验 | `/keys-dea` |
| 密钥分量生成器 | 密钥分量用于安全分割保管，KCV 计算 | `/keyshare-generator` |
| Futurex 密钥 | Futurex HSM 密钥加密/解密/查找 | `/futurex-keys` |
| Atalla 密钥 (AKB) | Atalla AKB 格式密钥加密/解密 | `/atalla-keys` |
| SafeNet 密钥 | SafeNet HSM 密钥加密/解密/查找 | `/safenet-keys` |
| Thales 密钥 | Thales HSM LMK 密钥加密/解密/查找 | `/thales-keys` |
| Thales 密钥块 | Thales 专有密钥块编码/解码 | `/thales-key-block` |
| TR-31 密钥块 | ANSI X9.143 密钥块编码/解码 | `/tr31-key-block` |

### 🔐 PKI 工具 (2 个)

| 工具 | 描述 | 路由 |
|------|------|------|
| ASN.1 解码器 | DER/BER 结构解码，X.509 证书解析 | `/asn1-parser` |
| SSL 证书 (X509) | SSL/TLS 证书解析、验证，PEM/DER | `/ssl-certificates` |

### 💳 支付安全工具 (21 个)

| 分类 | 工具 | 路由 |
|------|------|------|
| **AS2805** | AS2805 消息工具 | `/payments-as2805` |
| **Bitmap** | ISO 8583 位图 | `/payments-bitmap` |
| **Card Validation** | CVV/CVC | `/payments-card-validation-cvvs` |
| **Card Validation** | AMEX CSC | `/payments-card-validation-amex-cscs` |
| **Card Validation** | MasterCard CVC3 | `/payments-card-validation-mastercard-cvc3` |
| **DUKPT** | DUKPT TDES (ISO 9797) | `/payments-dukpt-iso9797` |
| **DUKPT** | DUKPT AES | `/payments-dukpt-aes` |
| **MAC** | ISO 9797-1 MAC | `/payments-mac-iso9797-1` |
| **MAC** | ANSI X9.9/X9.19 | `/payments-mac-ansix9` |
| **MAC** | AS2805 MAC | `/payments-mac-as2805` |
| **MAC** | TDES CBC-MAC | `/payments-mac-tdes-cbc-mac` |
| **MAC** | HMAC | `/payments-mac-hmac` |
| **MAC** | CMAC | `/payments-mac-cmac` |
| **MAC** | Retail MAC | `/payments-mac-retail` |
| **PIN** | PIN Block 通用 | `/payments-pin-blocks-general` |
| **PIN** | PIN Block AES | `/payments-pin-blocks-aes` |
| **PIN** | PIN 偏移 | `/payments-pin-offset` |
| **PIN** | PIN PVV | `/payments-pin-pvv` |
| **Other** | VISA 证书 | `/payments-visa-certificates` |
| **Other** | ZKA (德国银行标准) | `/payments-zka` |

### 🧰 通用工具 (9 个)

| 工具 | 描述 | 路由 |
|------|------|------|
| Hash 计算器 | MD5/SHA/SHA-3/BLAKE2/SM3 等 20+ 算法 | `/hashes` |
| 字符编码转换 | ASCII/Hex/Binary/EBCDIC/ATM 互转 | `/character-encoding` |
| BCD 编码 | 十进制与 BCD 编码互转 | `/bcd` |
| 校验位计算 | Luhn (MOD 10) / Amex SE (MOD 9) | `/check-digits` |
| Base64 编解码 | 标准 Base64 编码解码 | `/base64` |
| Base94 编解码 | Base94 编码解码 | `/base94` |
| Message Parser | ISO 8583、ATM NDC/Wincor 解析 | `/message-parser` |
| RSA DER 公钥 | RSA 公钥 DER/PEM 编解码 | `/rsa-der-public-key` |
| UUID 生成器 | UUID v1/v3/v4/v5 生成 | `/uuid` |

---

## 📚 知识库

HSM Kit 内置了安全知识库 (`/guides`)，提供深入的技术文章帮助您理解工具背后的原理：

| 文章 | 主题 | 路由 |
|------|------|------|
| 密钥分量与 KCV 详解 | 密钥拆分、XOR 组合、KCV 计算原理 | `/guides/understanding-key-splitting-kcv` |
| TR-31 密钥块详解 | ANSI X9.143 标准、头部字段、版本差异 | `/guides/what-is-tr31-key-block` |
| PIN Block 格式详解 | ISO 9564 Format 0/1/2/3/4 结构与计算 | `/guides/pin-block-formats-iso9564` |
| DUKPT 密钥派生教程 | 初始密钥、KSN、派生过程详解 | `/guides/dukpt-key-derivation-tutorial` |
| CVV/CVC 计算方法 | CVV1/CVV2/iCVV/dCVV 算法解析 | `/guides/cvv-cvc-calculation-methods` |

### 知识库特性

- 📝 **Markdown 渲染** - 支持代码块、表格、内部链接
- 🔗 **关联工具** - 文章与相关工具直接跳转
- 🌍 **多语言** - 支持英语和中文（更多语言开发中）
- 📖 **目录导航** - 右侧 TOC 快速定位，滚动高亮
- 🔍 **搜索功能** - 全文搜索文章内容

---

## 📁 项目结构

```
hsmkit/
├── public/                     # 静态资源
│   ├── logo.svg                # 网站 Logo
│   ├── sitemap.xml             # 网站地图 (70+ URLs)
│   ├── robots.txt              # 爬虫指令
│   ├── sw.js                   # Service Worker 缓存
│   ├── _headers                # HTTP 头配置 (Cloudflare)
│   └── _redirects              # SPA 路由重定向
│
├── scripts/                    # 构建脚本
│   ├── generate-favicon-png.js # Favicon 生成
│   └── update-sitemap-lastmod.js # Sitemap 日期更新
│
├── src/
│   ├── components/             # 可复用组件
│   │   ├── cipher/             # 加密工具组件 (5)
│   │   ├── common/             # 通用组件
│   │   │   ├── PageLayout.tsx  # 页面布局 + Schema
│   │   │   ├── SEO.tsx         # SEO 元标签 + 预渲染
│   │   │   ├── ResultCard.tsx  # 结果展示卡片
│   │   │   └── ...
│   │   ├── generic/            # 通用工具组件 (9)
│   │   ├── keys/               # 密钥管理组件 (9)
│   │   ├── payment/            # 支付工具组件 (21)
│   │   └── pki/                # PKI 工具组件 (2)
│   │
│   ├── content/                # 知识库内容
│   │   └── guides/
│   │       ├── en/             # 英文文章 (Markdown)
│   │       └── zh/             # 中文文章 (Markdown)
│   │
│   ├── data/                   # 数据文件
│   │   └── guides/
│   │       ├── en.json         # 英文文章元数据
│   │       └── zh.json         # 中文文章元数据
│   │
│   ├── hooks/                  # 自定义 Hooks
│   │   ├── useLanguage.tsx     # 多语言切换
│   │   └── useTheme.tsx        # 主题切换
│   │
│   ├── lib/                    # 第三方库
│   │   └── asn1js/             # ASN.1 解析库
│   │
│   ├── locales/                # 多语言翻译 (6 种语言)
│   │   ├── en/                 # 英语
│   │   ├── zh/                 # 简体中文
│   │   ├── ja/                 # 日语
│   │   ├── ko/                 # 韩语
│   │   ├── de/                 # 德语
│   │   └── fr/                 # 法语
│   │
│   ├── pages/                  # 页面组件
│   │   ├── cipher/             # 加密工具页面 (5)
│   │   ├── generic/            # 通用工具页面 (9)
│   │   ├── guides/             # 知识库页面
│   │   │   ├── GuidesListPage.tsx    # 文章列表
│   │   │   └── GuideDetailPage.tsx   # 文章详情
│   │   ├── home/               # 首页 (1)
│   │   ├── keys/               # 密钥管理页面 (9)
│   │   ├── legal/              # 法律信息页面 (3)
│   │   ├── payment/            # 支付工具页面 (21)
│   │   └── pki/                # PKI 工具页面 (2)
│   │
│   ├── utils/                  # 工具函数
│   │   ├── crypto.ts           # 加密工具函数
│   │   ├── cryptoWorker.ts     # Web Worker 加密
│   │   ├── format.ts           # 格式化工具
│   │   └── webCrypto.ts        # Web Crypto API 封装
│   │
│   ├── App.tsx                 # 根组件 + 路由配置
│   ├── main.tsx                # 入口文件
│   └── index.css               # 全局样式
│
├── prerender.config.ts         # 预渲染路由配置 (70+ 路由)
├── vite.config.ts              # Vite 构建配置
├── tsconfig.json               # TypeScript 配置
├── eslint.config.js            # ESLint 配置
└── package.json                # 依赖管理
```

---

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
# 访问 http://localhost:5173
```

### 构建生产版本

```bash
# 构建（包含预渲染）
npm run build

# 预览生产构建
npm run preview
```

### 类型检查

```bash
# TypeScript 类型检查
npx tsc --noEmit

# ESLint 代码检查
npm run lint
```

---

## 🏗️ 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| **React** | 19 | 前端框架 |
| **TypeScript** | 5.9 | 类型安全 |
| **Vite (Rolldown)** | 7.2 | 构建工具 |
| **Ant Design** | 6 | UI 组件库 |
| **React Router** | 7 | 路由管理 |
| **CryptoJS** | 4.2 | 对称加密 (AES/DES/3DES) |
| **node-forge** | 1.3 | RSA/ASN.1/X.509 |
| **elliptic** | 6.6 | ECC/ECDSA |
| **hash-wasm** | 4.12 | 高性能哈希 (WASM) |
| **react-markdown** | 9.x | Markdown 渲染 |
| **@prerenderer/rollup-plugin** | - | 构建时预渲染 (SEO) |

---

## ⚡ 性能优化

| 优化项 | 说明 |
|--------|------|
| **代码分割** | 主包从 2.2MB 减少到 413KB（-81%） |
| **路由懒加载** | 各页面按需加载（0.8-10KB） |
| **Vendor 分包** | React/Antd/Crypto 独立打包 |
| **预渲染** | 构建时生成静态 HTML，SEO 友好 |
| **Service Worker** | 离线缓存，二次访问秒开 |
| **DNS 预解析** | preconnect, dns-prefetch |

---

## 🔐 安全性

- **客户端加密** - 使用 Web Crypto API 和 crypto-js 在浏览器本地进行所有加密操作
- **零数据传输** - 密钥和敏感数据永远不会离开您的设备
- **开源透明** - 所有代码公开可审计
- **符合合规** - 满足金融行业对密钥安全的严格要求

---

## 🌍 部署

HSM Kit 可以部署到任何静态托管服务：

| 平台 | 配置文件 |
|------|----------|
| **Vercel** | `vercel.json` |
| **Cloudflare Pages** | `public/_headers`, `public/_redirects` |
| **Netlify** | `public/_redirects` |

```bash
# 构建后 dist/ 目录可直接部署
npm run build
```

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

### 添加新文章

1. 在 `src/content/guides/en/` 创建 `{slug}.md` 文件
2. 更新 `src/data/guides/en.json` 添加元数据
3. 在 `prerender.config.ts` 添加路由
4. 运行 `npm run build` 验证

---

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

---

## 🔗 相关链接

- 🌐 [在线演示](https://hsmkit.com)
- 📚 [知识库](https://hsmkit.com/guides)
- 📦 [GitHub 仓库](https://github.com/hsm-kit/hsmkit)
- 🐛 [问题反馈](https://github.com/hsm-kit/hsmkit/issues)

---

<div align="center">

**⚠️ 注意**: 本工具适用于测试和开发环境。在生产环境使用前，请确保遵守相关安全规范。

Made with ❤️ by [HSM Kit Team](https://hsmkit.com)

</div>
