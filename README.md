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

| 子菜单 | 工具 | 描述 | URL |
|--------|------|------|-----|
| **Keys DEA** | 密钥生成器 | 生成 AES/DES/3DES 安全随机密钥，密钥组合、奇偶校验、验证 | `/keys-dea` |
| **Keyshare** | 密钥分量生成器 | 生成密钥分量用于安全分割保管，支持 KCV 计算 | `/keyshare-generator` |
| **Keys HSM** | Futurex 密钥 | Futurex HSM 密钥加密/解密/查找，支持多种变体 | `/futurex-keys` |
| **Keys HSM** | Atalla 密钥 (AKB) | Atalla AKB 格式密钥加密/解密，MFK 和 MAC 验证 | `/atalla-keys` |
| **Keys HSM** | SafeNet 密钥 | SafeNet HSM 密钥加密/解密/查找，KM 密钥变体 | `/safenet-keys` |
| **Keys HSM** | Thales 密钥 | Thales HSM LMK 密钥加密/解密/查找 | `/thales-keys` |
| **Key Blocks** | Thales 密钥块 | Thales 专有密钥块编码/解码，KBPK 保护 | `/thales-key-block` |
| **Key Blocks** | TR-31 密钥块 | ANSI X9.143 密钥块编码/解码，TDES/AES 支持 | `/tr31-key-block` |

### 🔐 PKI 工具

| 工具 | 描述 | URL |
|------|------|-----|
| **ASN.1 解码器** | DER/BER 结构解码，X.509 证书解析，PKCS 格式分析 | `/asn1-parser` |
| **SSL 证书 (X509)** | SSL/TLS 证书解析、验证，支持 PEM/DER 格式 | `/ssl-certificates` |

### 💳 支付安全工具

| 子菜单 | 工具 | 描述 | URL |
|--------|------|------|-----|
| **AS2805** | AS2805 消息工具 | 澳洲 ISO 8583 变体报文解析、密钥集生成、PIN Block 转换 | `/payments-as2805` |
| **Bitmap** | ISO 8583 位图 | ISO 8583 位图编码/解码，支持主/次位图 | `/payments-bitmap` |
| **Card Validation** | CVV/CVC | 生成和验证 CVV、iCVV、CVV2、dCVV | `/payments-card-validation-cvvs` |
| **Card Validation** | AMEX CSC | 生成和验证 AMEX CSC-3/CSC-4/CSC-5 | `/payments-card-validation-amex-cscs` |
| **Card Validation** | MasterCard CVC3 | 生成动态 CVC3 用于 EMV 非接触交易 | `/payments-card-validation-mastercard-cvc3` |
| **DUKPT** | DUKPT TDES | DUKPT 密钥派生 (ISO 9797)，PIN/MAC/Data 加密 | `/payments-dukpt-iso9797` |
| **DUKPT** | DUKPT AES | AES DUKPT 密钥派生，支持 128/192/256 位 | `/payments-dukpt-aes` |
| **MAC** | ISO 9797-1 MAC | ISO/IEC 9797-1 MAC 算法 1-6，多种填充方式 | `/payments-mac-iso9797-1` |
| **MAC** | ANSI X9.9/X9.19 | ANSI MAC 认证码，DES CBC-MAC 或 3DES | `/payments-mac-ansix9` |
| **MAC** | AS2805 MAC | AS2805.4.1 MAC，Method 1 和 Method 2 | `/payments-mac-as2805` |
| **MAC** | TDES CBC-MAC | Triple DES CBC-MAC，2/3 密钥 TDES | `/payments-mac-tdes-cbc-mac` |
| **MAC** | HMAC | 基于哈希的 MAC，SHA-256/SHA-512 | `/payments-mac-hmac` |
| **MAC** | CMAC | NIST SP 800-38B 基于密码的 MAC，AES/TDES | `/payments-mac-cmac` |
| **MAC** | Retail MAC | ISO 9797-1 Method 2 Retail MAC，DES/3DES | `/payments-mac-retail` |
| **PIN** | PIN Block 通用 | ISO 9564 Format 0/1/2/3/4 编码/解码 | `/payments-pin-blocks-general` |
| **PIN** | PIN Block AES | AES PIN Block Format 4 加密/解密 | `/payments-pin-blocks-aes` |
| **PIN** | PIN 偏移 | IBM 3624 PIN 偏移计算和验证 | `/payments-pin-offset` |
| **PIN** | PIN PVV | Visa PVV 计算和 PIN 验证 | `/payments-pin-pvv` |
| **Other** | VISA 证书 | VISA 证书验证，VSDC CA V92/V94 | `/payments-visa-certificates` |
| **Other** | ZKA | 德国银行标准，密钥派生、PIN 加密、MAC 计算 | `/payments-zka` |

### 🧰 通用工具

| 工具 | 描述 | URL |
|------|------|-----|
| **Hash 计算器** | MD5/SHA-1/SHA-256/SHA-512/SHA-3/BLAKE2/SM3 等 20+ 种算法 | `/hashes` |
| **字符编码转换** | ASCII/Hex/Binary/EBCDIC/ATM Decimal 互转 | `/character-encoding` |
| **BCD 编码** | 十进制与 BCD 编码互转 | `/bcd` |
| **校验位计算** | Luhn (MOD 10) / Amex SE (MOD 9) 校验位 | `/check-digits` |
| **Base64 编解码** | 标准 Base64 编码解码 | `/base64` |
| **Base94 编解码** | Base94 编码解码 | `/base94` |
| **Message Parser** | ISO 8583、ATM NDC/Wincor 报文解析 | `/message-parser` |
| **RSA DER 公钥** | RSA 公钥 DER/PEM 编码解码，Modulus/Exponent 提取 | `/rsa-der-public-key` |
| **UUID 生成器** | UUID v1/v3/v4/v5 生成，支持批量 | `/uuid` |

### 📜 法律信息

| 页面 | 描述 | URL |
|------|------|-----|
| **隐私政策** | 数据处理、客户端计算、隐私保护说明 | `/privacy-policy` |
| **服务条款** | 使用条款、许可协议、限制说明 | `/terms-of-service` |
| **免责声明** | 法律免责声明、安全警告、合规说明 | `/disclaimer` |

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

- ✅ 每个工具独立 URL（50+ 个页面）
- ✅ 动态页面标题和描述
- ✅ Schema.org 结构化数据 (WebApplication, SoftwareApplication, FAQPage)
- ✅ Hreflang 多语言标签
- ✅ Sitemap.xml 和 robots.txt
- ✅ Open Graph 和 Twitter Card 标签
- ✅ Google 搜索 favicon 支持

## 📦 版本历史

### v4.3.0 (2026-01-08) 🎉

**优化：**
- 🛠️ **ESLint 严格模式** - 修复所有 ESLint 错误和警告（0 errors, 0 warnings）
- 🔧 **代码重构** - 优化 React Hooks 依赖，移动工具函数到模块级别
- 🌐 **本地化修复** - 修复 fr.ts, ko.ts 语法错误
- 📄 **Sitemap 更新** - 添加所有 50+ 页面路由，更新日期
- 📝 **README 更新** - 完善支付工具文档

**修复的文件：**
- `PageLayout.tsx` - Schema 生成移入 useEffect
- `Base64Tool.tsx` - 工具函数移到组件外部
- `CharacterEncodingTool.tsx` - 工具函数移到组件外部
- `HashCalculator.tsx` - 工具函数移到组件外部
- `RSADerPublicKeyTool.tsx` - 移除不必要的依赖
- `useTheme.tsx` - 修复 ESLint 规则
- `BitmapTool.tsx` - 修复 useMemo 模式
- `ThalesKeyBlockTool.tsx`, `TR31KeyBlockTool.tsx` - 类型修复
- `fr.ts`, `ko.ts` - 修复重复的 pinOffset 定义

### v4.2.0 (2026-01-05)

**优化：**
- 🔒 **SEO 合规优化** - 移除写死的评价数据 (aggregateRating)
- 🧹 **代码清理** - 移除未使用的组件、页面和函数
- 📄 **Sitemap 更新** - 添加 SSL 证书页面

### v4.1.0 (2026-01-04)

**新增功能：**
- 📜 **法律信息页面** - 隐私政策、服务条款、免责声明
- 🔝 **固定顶部导航栏** - 滚动时导航栏始终可见
- 🏠 **首页优化** - 列表视图工具名悬浮提示、动态分类计数器

### v4.0.0 (2026-01-04)

**新增功能：**
- 🔑 **HSM 密钥管理套件** - Futurex/Atalla/SafeNet/Thales 密钥工具
- 🔐 **PKI 工具菜单** - ASN.1 解码器移至 PKI 菜单
- 📦 **TR-31 密钥块** - 完整的编码/解码功能

### v3.0.0 (2025-12-31)

**新增功能：**
- 🧰 **通用工具套件** - Hash/编码/校验位/Base64/UUID 等
- 🌙 **暗黑模式** - 日/夜间主题切换
- 🔍 **首页搜索** - 快速定位工具

### v2.0.0 (2025-12-26)

**新增功能：**
- 🔐 **完整加密工具套件** - AES/DES/RSA/ECC/FPE
- 🔍 **ASN.1 解析器** - DER/BER/PEM 支持

### v1.0.0 (2025-12-10)
- ✅ 密钥生成器（DES/3DES/AES）
- ✅ KCV 计算器
- ✅ PIN Block 工具
- ✅ TR-31 密钥块分析器

## 📁 项目结构

```
hsmkit/
├── src/
│   ├── components/           # 可复用组件
│   │   ├── cipher/           # 加密工具组件
│   │   ├── common/           # 通用组件（SEO、布局）
│   │   ├── generic/          # 通用工具组件
│   │   ├── keys/             # 密钥管理组件
│   │   ├── payment/          # 支付工具组件
│   │   └── pki/              # PKI 工具组件
│   ├── pages/                # 页面组件（带 SEO）
│   │   ├── cipher/           # 加密工具页面 (5)
│   │   ├── generic/          # 通用工具页面 (9)
│   │   ├── home/             # 首页 (1)
│   │   ├── keys/             # 密钥管理页面 (9)
│   │   ├── legal/            # 法律信息页面 (3)
│   │   ├── payment/          # 支付工具页面 (21)
│   │   └── pki/              # PKI 工具页面 (2)
│   ├── locales/              # 多语言文件 (6 种语言)
│   ├── hooks/                # 自定义 Hooks
│   ├── utils/                # 工具函数
│   └── lib/                  # 第三方库
├── public/                   # 静态资源
│   ├── sitemap.xml           # 网站地图 (50 URLs)
│   ├── robots.txt            # 爬虫指令
│   └── _redirects            # SPA 路由重定向
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
