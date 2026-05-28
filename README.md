# HSM Kit - Professional Online Encryption Toolkit

<div align="center">

<img src="public/favicon.svg" alt="HSM Kit Logo" width="120" height="120">

🔐 **Professional encryption & key management tools, 100% client-side, secure & reliable**

[![Website](https://img.shields.io/badge/Website-hsmkit.com-8B5CF6?style=flat-square)](https://hsmkit.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![Tests](https://img.shields.io/badge/Tests-56%20passed-brightgreen?style=flat-square)](#testing)

**English** | [简体中文](README.zh-CN.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Deutsch](README.de.md) | [Français](README.fr.md)

</div>

---

## 📖 Introduction

HSM Kit is a professional online encryption toolkit designed for developers, testers, and security engineers in finance, payment, and security domains. It provides 44+ tools covering HSM key management, payment security, PKI certificates, and cryptographic algorithms, all running entirely in the browser.

### Core Values

- **Security First** - 100% client-side computation, keys and sensitive data never leave your device
- **Professional & Complete** - 44+ tools covering HSM key management, payment security, PKI certificates, and cryptographic algorithms
- **Ready to Use** - Open browser and start working, supports PWA installation, works on Mac/Windows/Linux/mobile
- **Open Source** - Code is publicly auditable, meets financial industry compliance requirements

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔒 **Local Computation** | All crypto operations run in browser, data never uploaded |
| 📱 **PWA Support** | Installable to desktop, works like native app, offline available |
| 🌐 **Cross Platform** | Mac/Windows/Linux/iOS/Android supported |
| 🌍 **Multi-language** | English, Chinese, Japanese, Korean, German, French - 100% coverage |
| 🌙 **Dark Mode** | Day/night theme switching to protect your eyes |
| ♿ **Accessible** | ARIA labels, keyboard navigation, skip-to-content, aria-live regions, WCAG 2.1 AA compliant |
| ⚡ **Lazy Loading** | Route-level code splitting, only loads current page |
| 🔍 **SEO Optimized** | Pre-rendered static HTML, Schema markup, multi-language hreflang |
| 📚 **Knowledge Base** | 38 in-depth technical articles on encryption, payment, HSM topics |
| 📝 **Example Button** | One-click example data fill for all tools |
| 🕐 **Recent Tools** | Track frequently used tools for quick access |
| 🧪 **Test Coverage** | Vitest unit tests, 100% coverage for core utility functions |

---

## 🛠️ Tool Modules

### 🔐 Encryption/Decryption Tools (5)

| Tool | Description | Route |
|------|-------------|-------|
| AES Encryption | AES-128/192/256, ECB/CBC/CFB/OFB/CTR modes | `/aes-encryption` |
| DES/3DES Encryption | DES/Triple DES, multiple padding options | `/des-encryption` |
| RSA Encryption | RSA encrypt/decrypt/sign/verify, PKCS#1/OAEP | `/rsa-encryption` |
| ECC/ECDSA | Elliptic curve, secp256k1/P-256/P-384 | `/ecc-encryption` |
| FPE Format-Preserving | FF1/FF3-1 algorithms, NIST SP 800-38G | `/fpe-encryption` |

### 🔑 Key Management Tools (8)

| Tool | Description | Route |
|------|-------------|-------|
| Key Generator | AES/DES/3DES secure random keys, key combining, parity | `/keys-dea` |
| Keyshare Generator | Key splitting for secure custody, KCV calculation | `/keyshare-generator` |
| Futurex Keys | Futurex HSM key encrypt/decrypt/lookup | `/futurex-keys` |
| Atalla Keys (AKB) | Atalla AKB format key encrypt/decrypt | `/atalla-keys` |
| SafeNet Keys | SafeNet HSM key encrypt/decrypt/lookup | `/safenet-keys` |
| Thales Keys | Thales HSM LMK key encrypt/decrypt/lookup | `/thales-keys` |
| Thales Key Block | Thales proprietary key block encode/decode | `/thales-key-block` |
| TR-31 Key Block | ANSI X9.143 key block encode/decode | `/tr31-key-block` |

### 🔐 PKI Tools (2)

| Tool | Description | Route |
|------|-------------|-------|
| ASN.1 Decoder | DER/BER structure decoding, X.509 certificate parsing | `/asn1-parser` |
| SSL Certificates (X509) | SSL/TLS certificate parsing & validation | `/ssl-certificates` |

### 💳 Payment Security Tools (21)

| Category | Tool | Route |
|----------|------|-------|
| **AS2805** | AS2805 Message Tool | `/payments-as2805` |
| **Bitmap** | ISO 8583 Bitmap | `/payments-bitmap` |
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
| **PIN** | PIN Block General | `/payments-pin-blocks-general` |
| **PIN** | PIN Block AES | `/payments-pin-blocks-aes` |
| **PIN** | PIN Offset | `/payments-pin-offset` |
| **PIN** | PIN PVV | `/payments-pin-pvv` |
| **Other** | VISA Certificates | `/payments-visa-certificates` |
| **Other** | ZKA (German Banking) | `/payments-zka` |

### 🧰 General Tools (9)

| Tool | Description | Route |
|------|-------------|-------|
| Hash Calculator | MD5/SHA/SHA-3/BLAKE2/SM3 20+ algorithms | `/hashes` |
| Character Encoding | ASCII/Hex/Binary/EBCDIC/ATM conversion | `/character-encoding` |
| BCD Encoding | Decimal to BCD encoding conversion | `/bcd` |
| Check Digits | Luhn (MOD 10) / Amex SE (MOD 9) | `/check-digits` |
| Base64 Encode/Decode | Standard Base64 encoding/decoding | `/base64` |
| Base94 Encode/Decode | Base94 encoding/decoding | `/base94` |
| Message Parser | ISO 8583, ATM NDC/Wincor parsing | `/message-parser` |
| RSA DER Public Key | RSA public key DER/PEM encode/decode | `/rsa-der-public-key` |
| UUID Generator | UUID v1/v3/v4/v5 generation | `/uuid` |

---

## 📚 Knowledge Base

HSM Kit includes a built-in knowledge base (`/guides`) with 38 in-depth technical articles covering encryption algorithms, payment security, HSM key management, and more. Articles are cross-linked and directly connected to corresponding tools.

### Knowledge Base Features

- 📝 **Markdown Rendering** - Code blocks, tables, internal links
- 🔗 **Tool Integration** - Direct links to related tools and articles
- 🌍 **Bilingual** - English and Chinese, 38 articles each, fully translated
- 📖 **Table of Contents** - Right-side TOC navigation with scroll highlighting
- 🔍 **Search** - Full-text search across articles

---

## 📁 Project Structure

```
hsmkit/
├── public/                     # Static assets
│   ├── favicon.svg             # Website logo
│   ├── favicon-*.png           # PWA icons (48/192/512)
│   ├── apple-touch-icon.png    # iOS icon
│   ├── sitemap.xml             # Sitemap (80+ URLs with hreflang)
│   ├── robots.txt              # Crawler instructions
│   ├── _headers                # HTTP headers (Cloudflare)
│   └── _redirects              # SPA route redirects
│
├── scripts/                    # Build scripts
│   ├── generate-favicon-png.js # Favicon generation
│   └── update-sitemap-lastmod.js # Sitemap date update
│
├── src/
│   ├── components/             # Reusable components
│   │   ├── cipher/             # Encryption tool components
│   │   ├── common/             # Common components
│   │   │   ├── PageLayout.tsx  # Page layout + Schema.org
│   │   │   ├── ToolPage.tsx    # Tool page factory
│   │   │   ├── SEO.tsx         # SEO meta tags + prerender
│   │   │   ├── ResultCard.tsx  # Result display (aria-live)
│   │   │   ├── ErrorCard.tsx   # Error display (role="alert")
│   │   │   ├── ErrorBoundary.tsx # Error boundary
│   │   │   ├── ReloadPrompt.tsx # PWA update prompt (dark mode)
│   │   │   └── ...
│   │   ├── generic/            # General tool components
│   │   ├── keys/               # Key management components
│   │   ├── payment/            # Payment tool components
│   │   └── pki/                # PKI tool components
│   │
│   ├── hooks/                  # Custom hooks
│   │   ├── useLanguage.tsx     # Multi-language switching
│   │   ├── useTheme.tsx        # Theme switching
│   │   ├── useToolForm.ts      # Tool form hook
│   │   └── ...
│   │
│   ├── locales/                # Translations (6 languages)
│   │   ├── en/                 # English
│   │   ├── zh/                 # Chinese
│   │   ├── ja/                 # Japanese
│   │   ├── ko/                 # Korean
│   │   ├── de/                 # German
│   │   └── fr/                 # French
│   │
│   ├── utils/                  # Utility functions
│   │   ├── crypto.ts           # Core crypto utilities
│   │   ├── crypto.test.ts      # Crypto unit tests
│   │   ├── hex.ts              # Hex utilities
│   │   ├── hex.test.ts         # Hex unit tests
│   │   ├── logger.ts           # Production-safe logger
│   │   └── ...
│   │
│   ├── App.tsx                 # Root component + routes
│   ├── routeConfig.ts          # Route configuration
│   ├── routes.tsx              # Lazy-loaded page components
│   └── main.tsx                # Entry point
│
├── vitest.config.ts            # Test configuration
├── vite.config.ts              # Build configuration
├── tsconfig.json               # TypeScript config (strict mode)
└── package.json                # Dependencies
```

---

## 🚀 Quick Start

### Online

Visit [https://hsmkit.com](https://hsmkit.com) to use all tools directly.

### PWA Install

After visiting the website, your browser will prompt "Install HSM Kit". Click to install to desktop.

### Local Development

```bash
# Clone repository
git clone https://github.com/hsm-kit/hsmkit.git
cd hsmkit

# Install dependencies
npm install

# Start development server
npm run dev
# Visit http://localhost:5173
```

### Build for Production

```bash
# Build (includes sitemap update + Puppeteer prerender + PWA Service Worker)
npm run build

# Preview production build
npm run preview
```

> **Note**: Chrome is required for building. The `prebuild` script automatically installs it via `npx puppeteer browsers install chrome`.

### Type Checking

```bash
# TypeScript type checking (strict mode)
npm run typecheck

# ESLint code checking
npm run lint

# ESLint auto-fix
npm run lint:fix
```

### Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Test coverage
npm run test:coverage
```

---

## 🏗️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19 | Frontend framework |
| **TypeScript** | 5.9 | Type safety (strict mode) |
| **Vite (Rolldown)** | 7.2 | Build tool |
| **Ant Design** | 6 | UI component library |
| **React Router** | 7 | Routing |
| **CryptoJS** | 4.2 | Symmetric encryption (AES/DES/3DES) |
| **node-forge** | 1.3 | RSA/ASN.1/X.509 |
| **elliptic** | 6.6 | ECC/ECDSA |
| **hash-wasm** | 4.12 | High-performance hashing (WASM) |
| **react-markdown** | 10.x | Markdown rendering |
| **vite-plugin-pwa** | 1.3 | PWA support (Service Worker) |
| **Vitest** | 4.x | Unit testing framework |
| **@testing-library/react** | 16.x | React component testing |

---

## ⚡ Performance

| Optimization | Description |
|--------------|-------------|
| **Route Lazy Loading** | All pages use `React.lazy()` for on-demand loading |
| **Vendor Splitting** | React / Ant Design / Crypto packaged separately for caching |
| **Pre-rendering SSG** | Puppeteer generates static HTML at build time |
| **Hydration Reuse** | Uses `hydrateRoot` when pre-rendered HTML exists |
| **PWA Caching** | Service Worker pre-caches 210+ resources for offline use |
| **Long-term Caching** | Static assets `max-age=31536000, immutable` |

---

## 🔐 Security

- **Client-side Encryption** - All crypto operations run in browser using Web Crypto API and crypto-js
- **Zero Data Transfer** - Keys and sensitive data never leave your device
- **Open Source** - All code is publicly auditable
- **Compliance Ready** - Meets financial industry security requirements
- **CSP Protection** - Content-Security-Policy prevents XSS attacks
- **Production Logging** - Debug logs silenced in production, only errors recorded

---

## ♿ Accessibility

HSM Kit follows WCAG 2.1 AA standards with comprehensive accessibility support:

- **Skip-to-content Link** - Keyboard users can quickly jump to main content
- **ARIA Labels** - Navigation, buttons, form elements have proper aria-labels
- **aria-live Regions** - Dynamic results and errors are announced by screen readers
- **Keyboard Navigation** - All interactive elements support Tab/Enter/Space
- **Focus Management** - Clear focus indicators and logical focus order
- **Semantic HTML** - Uses role="banner", role="main", role="alert" etc.

---

## 🌍 Internationalization

HSM Kit supports 6 languages with 100% translation coverage:

| Language | Code | Status |
|----------|------|--------|
| English | en | ✅ 100% |
| 简体中文 | zh | ✅ 100% |
| 日本語 | ja | ✅ 100% |
| 한국어 | ko | ✅ 100% |
| Deutsch | de | ✅ 100% |
| Français | fr | ✅ 100% |

Translation files are located in `src/locales/` with lazy loading for optimal performance.

---

## 🌍 Deployment

HSM Kit can be deployed to any static hosting service:

| Platform | Config File |
|----------|-------------|
| **Cloudflare Pages** | `wrangler.json`, `public/_headers`, `public/_redirects` |
| **Vercel** | `vercel.json` |
| **Netlify** | `public/_redirects` |

```bash
# The dist/ directory can be deployed directly after build
npm run build
```

---

## 🤝 Contributing

Welcome to submit Issues and Pull Requests!

1. Fork this repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Submit a Pull Request

### Adding New Knowledge Base Articles

1. Create `{slug}.md` in `src/content/guides/en/` (and `zh/` for Chinese)
2. Update `src/data/guides/en.json` and `zh.json` with metadata
3. Add routes in `prerender.config.ts`
4. Add URL in `public/sitemap.xml`
5. Run `npm run build` to verify

---

## 📄 License

MIT License - See [LICENSE](LICENSE) file

---

## 🔗 Links

- 🌐 [Website](https://hsmkit.com)
- 📚 [Knowledge Base](https://hsmkit.com/guides)
- 📦 [GitHub Repository](https://github.com/hsm-kit/hsmkit)
- 🐛 [Issue Tracker](https://github.com/hsm-kit/hsmkit/issues)

---

<div align="center">

**⚠️ Note**: This tool is intended for testing and development environments. Please ensure compliance with relevant security standards before using in production.

Made with ❤️ by [HSM Kit Team](https://hsmkit.com)

</div>
