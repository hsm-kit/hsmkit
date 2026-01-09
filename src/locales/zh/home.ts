// Chinese translations - Home page
export default {
  home: {
    heroTitle: '免费在线加密与密钥管理工具',
    heroDescription: '为安全专业人员提供的全面密码学工具套件。所有计算均在浏览器端执行——您的数据不会离开设备。',
    searchPlaceholder: '搜索工具...（例如：MD5、AES、PIN Block）',
    availableTools: '最受欢迎的工具',
    gridView: '网格视图',
    listView: '列表视图',
    whyChoose: '为什么选择 HSM Kit？',
    categories: {
      all: '全部',
      symmetric: '对称',
      asymmetric: '非对称',
      payment: '支付',
      encoding: '编码',
      hashing: '哈希',
    },
    // Tool cards
    tools: {
    asn1: {
      title: 'ASN.1 解析器',
      description: '解析并分析 ASN.1 DER/BER 结构，解码 X.509 证书和 PKCS 格式。',
    },
    aes: {
      title: 'AES 加密',
      description: '使用 AES-128/192/256 以及 ECB、CBC、CFB、OFB、CTR 模式进行加密/解密。',
    },
    des: {
      title: 'DES/3DES 加密',
      description: '用于遗留系统的 DES 与 Triple DES 加密，支持多种填充选项。',
    },
    rsa: {
      title: 'RSA 加密',
      description: 'RSA 非对称加密、解密、数字签名与验证。',
    },
    ecc: {
      title: 'ECC/ECDSA',
      description: '椭圆曲线密码学，提供紧凑密钥与高效数字签名。',
    },
    fpe: {
      title: '格式保留加密',
      description: 'FPE（FF1/FF3-1）在保留格式和长度的同时对数据进行加密。',
    },
    keyGenerator: {
      title: '密钥生成器',
      description: '为 AES、DES、3DES 生成安全随机密钥。包含密钥组合与奇偶校验工具。',
    },
    tr31: {
      title: 'TR-31 密钥块',
      description: '使用 KBPK 保护对 TR-31/ANSI X9.143 密钥块进行编码与解码，支持 TDES 与 AES 版本。',
    },
    kcv: {
      title: 'KCV 计算器',
      description: '计算 AES 与 DES/3DES 密钥的 Key Check Value（KCV）以验证密钥正确性。',
    },
    pinBlock: {
      title: 'PIN Block 生成器',
      description: '生成 ISO 9564 格式的 PIN Block（格式 0、1、3、4）用于支付交易。',
    },
    pinBlockGeneral: {
      title: '通用 PIN Block',
      description: '对所有 ISO 9564 格式（0、1、2、3、4）进行 PIN Block 编码和解码，支持 PAN。',
    },
    pinBlockAes: {
      title: 'AES PIN Block',
      description: '对 ISO 9564 格式 4 的 PIN Block 使用 AES-128 加密/解密，输出 32 个十六进制字符。',
    },
    pinOffset: {
      title: 'PIN 偏移量',
      description: '使用 IBM 3624 方法计算与验证 PIN 偏移量，支持验证数据。',
    },
    pinPvv: {
      title: 'PIN PVV',
      description: 'Visa PIN 验证值（PVV）计算与与 PDK/PVKI 的 PIN 验证。',
    },
    as2805: {
      title: 'AS2805 消息工具',
      description: '澳大利亚 ISO 8583 支付工具，包含密钥生成、PIN Block 翻译与 MAC 计算。',
    },
    ansiMac: {
      title: 'ANSI MAC (X9.9 & X9.19)',
      description: 'ANSI X9.9/X9.19 MAC，使用 DES CBC-MAC 或 3DES 加密。',
    },
    as2805Mac: {
      title: 'AS2805 MAC',
      description: '用于澳大利亚 EFTPOS 的 AS2805.4.1 MAC，支持 Method 1 与 Method 2。',
    },
    tdesCbcMac: {
      title: 'TDES CBC-MAC',
      description: 'Triple DES CBC-MAC，支持双钥/三钥 TDES 与 ISO 9797-1 填充。',
    },
    hmac: {
      title: 'HMAC',
      description: '基于哈希的 MAC，使用 SHA-256/SHA-512 进行 API 认证与数据完整性保护。',
    },
    cmac: {
      title: 'CMAC',
      description: '符合 NIST SP 800-38B 的基于密码的 MAC，支持 AES/TDES 与 CMAC-96。',
    },
    retailMac: {
      title: '零售 MAC',
      description: '用于 POS 与 ATM 系统的 ISO 9797-1 Method 2 零售 MAC（DES/3DES）。',
    },
    iso9797: {
      title: 'ISO 9797-1 MAC',
      description: 'ISO/IEC 9797-1 MAC 计算器，支持算法 1-6 与多种填充方法。',
    },
    visaCertificates: {
      title: 'VISA 证书',
      description: '验证 VISA 签发者证书，支持 VSDC CA V92/V94 及自定义 CA 密钥。',
    },
    zka: {
      title: 'ZKA',
      description: '德国银行标准，支持会话密钥派生、PIN 加密与 MAC 计算。',
    },
    bitmap: {
      title: 'ISO8583 Bitmap',
      description: '对支付消息的 ISO 8583 位图进行编码与解码，支持主/次位图。',
    },
    cvv: {
      title: 'CVV/CVC',
      description: '生成与验证 CVV、iCVV、CVV2、dCVV，用于卡片验证与支付安全。',
    },
    amexCsc: {
      title: 'AMEX CSC',
      description: '生成与验证美国运通卡的卡片安全码（CSC-5、CSC-4、CSC-3）。',
    },
    mastercardCvc3: {
      title: 'MasterCard CVC3',
      description: '为 MasterCard 非接触 EMV 交易生成动态 CVC3。',
    },
    // Generic Tools
    hash: {
      title: '哈希计算器',
      description: '使用 MD5、SHA-1、SHA-256、SHA-512、BLAKE2 等算法计算哈希值。',
    },
    encoding: {
      title: '字符编码',
      description: '在 ASCII、EBCDIC、十六进制、二进制和 ATM 十进制格式之间转换。',
    },
    bcd: {
      title: 'BCD 编码/解码',
      description: '将十进制编码为 BCD 或将 BCD 解码为十进制格式。',
    },
    checkDigits: {
      title: '校验位',
      description: '使用 Luhn（MOD 10）和 MOD 9 算法计算与验证校验位。',
    },
    base64: {
      title: 'Base64',
      description: '使用 Base64 将数据编码/解码为二进制到文本的格式。',
    },
    base94: {
      title: 'Base94',
      description: '使用全部 94 个可打印 ASCII 字符的紧凑编码。',
    },
    messageParser: {
      title: '消息解析器',
      description: '解析 ATM NDC、Wincor 与 ISO 8583 金融消息格式。',
    },
    dukpt: {
      title: 'DUKPT (ISO 9797)',
      description: '从 BDK/IPEK 与 KSN 派生 PEK。加密/解密 PIN，计算 MAC，处理数据。',
    },
    dukptAes: {
      title: 'DUKPT (AES)',
      description: '支持 AES 的 DUKPT（2TDEA、3TDEA、AES-128/192/256）。派生工作密钥并处理数据。',
    },
    rsaDer: {
      title: 'RSA DER 公钥',
      description: '在模数/指数和 DER 格式之间编码/解码 RSA 公钥。',
    },
    uuid: {
      title: 'UUID 生成器',
      description: '生成通用唯一标识符（UUID v1、v3、v4、v5）。',
    },
    // Keys HSM Tools
    keyshareGenerator: {
      title: '密钥分片生成器',
      description: '生成用于密钥拆分和组件管理（含 KCV 校验）的密钥份额。',
    },
    futurexKeys: {
      title: 'Futurex 密钥',
      description: 'Futurex HSM 密钥加解密与查找，支持多种变体方法。',
    },
    atallaKeys: {
      title: 'Atalla 密钥（AKB）',
      description: 'Atalla AKB 格式密钥加解密，支持 MFK 与 MAC 校验。',
    },
    safeNetKeys: {
      title: 'SafeNet 密钥',
      description: 'SafeNet HSM 密钥加解密与查找，支持 KM 密钥变体。',
    },
    thalesKeys: {
      title: 'Thales 密钥',
      description: 'Thales HSM LMK 密钥加解密与查找，支持多种变体。',
    },
    thalesKeyBlock: {
      title: 'Thales 密钥块',
      description: '对 Thales 专有密钥块进行编码与解码，支持 KBPK 保护。',
    },
    sslCert: {
      title: 'SSL 证书',
      description: '生成 RSA 密钥、创建 CSR、自签 X.509 证书并解析证书。',
    },
  },
  // Features
  features: {
    clientSide: {
      title: '100% 浏览器端',
      description: '所有密码学操作完全在浏览器中运行。您的密钥、PIN 与敏感数据不会离开设备。',
    },
    free: {
      title: '免费且开源',
      description: '全部 44+ 工具完全免费。无需注册、登录或隐藏费用，立即使用。',
    },
    paymentReady: {
      title: '支持 HSM 与支付',
      description: '面向 Thales、Futurex、Atalla、SafeNet HSM 的专业工具。支持 TR-31、KCV、PIN Block 等。',
    },
  },
  },
};
