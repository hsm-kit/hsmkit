/**
 * SEO Content for all pages in multiple languages
 * This helps search engines understand page content and improves rankings
 */

export interface SEOContent {
  title: string;
  description: string;
  keywords: string;
  faqTitle: string;
  usageTitle: string;
  faqs: Array<{ question: string; answer: string }>;
  usage: string[];
}

export interface PageSEO {
  home: SEOContent;
  asn1: SEOContent;
  aes: SEOContent;
  des: SEOContent;
  rsa: SEOContent;
  ecc: SEOContent;
  fpe: SEOContent;
  keyGenerator: SEOContent;
  tr31: SEOContent;
  kcv: SEOContent;
  pinBlock: SEOContent;
}

const seoContent: Record<string, PageSEO> = {
  en: {
    home: {
      title: 'HSM Kit - Free Online Encryption & Key Management Tools',
      description: 'Free online cryptographic tools for HSM key management. Calculate KCV, parse TR-31 key blocks, generate secure keys, encrypt with AES/DES/RSA, and more. All calculations performed client-side for maximum security.',
      keywords: 'HSM tools, encryption toolkit, key management, KCV calculator, TR-31 parser, AES encryption, DES encryption, RSA encryption, PIN block, key generator, cryptography tools, payment security',
      faqTitle: 'Frequently Asked Questions',
      usageTitle: 'About HSM Kit',
      faqs: [
        { question: 'Is HSM Kit free to use?', answer: 'Yes, HSM Kit is completely free. All tools are available without registration or payment.' },
        { question: 'Is my data secure?', answer: 'Absolutely. All cryptographic operations are performed entirely in your browser (client-side). No data is ever sent to our servers.' },
        { question: 'What encryption algorithms are supported?', answer: 'HSM Kit supports AES (128/192/256-bit), DES, 3DES, RSA, ECC (ECDSA), and Format-Preserving Encryption (FPE).' },
        { question: 'Can I use HSM Kit for payment security?', answer: 'Yes, HSM Kit includes tools specifically designed for payment security, including PIN Block generation, TR-31 key block parsing, and KCV calculation.' },
      ],
      usage: [
        'HSM Kit is a comprehensive suite of cryptographic tools designed for security professionals, developers, and anyone working with encryption.',
        'All tools work entirely in your browser - no server communication means your sensitive data never leaves your device.',
        'Perfect for testing, development, and educational purposes in the field of cryptography and payment security.',
      ],
    },
    asn1: {
      title: 'ASN.1 Parser Online - Free DER/BER Structure Decoder | HSM Kit',
      description: 'Free online ASN.1 parser and decoder. Parse ASN.1 DER/BER structures, decode X.509 certificates, analyze PKCS formats. Supports hex, Base64, and PEM input with RFC definition matching.',
      keywords: 'ASN.1 parser, DER decoder, BER decoder, X.509 certificate parser, PKCS decoder, ASN1 online tool, certificate analyzer, PEM parser, Base64 decoder',
      faqTitle: 'ASN.1 Parser FAQ',
      usageTitle: 'How to Use ASN.1 Parser',
      faqs: [
        { question: 'What is ASN.1?', answer: 'ASN.1 (Abstract Syntax Notation One) is a standard interface description language for defining data structures that can be serialized and deserialized. It\'s widely used in cryptography, telecommunications, and network protocols.' },
        { question: 'What formats does this parser support?', answer: 'This parser supports DER (Distinguished Encoding Rules) and BER (Basic Encoding Rules) encoded ASN.1 structures. You can input data in hexadecimal, Base64, or PEM format.' },
        { question: 'Can I parse X.509 certificates?', answer: 'Yes, this tool can parse X.509 certificates, CSRs, PKCS#7/8/12 structures, and other certificate formats that use ASN.1 encoding.' },
        { question: 'What is the hex dump feature?', answer: 'The hex dump feature shows the raw bytes of the ASN.1 structure alongside the parsed tree view, making it easier to understand the binary encoding.' },
      ],
      usage: [
        'Paste your ASN.1 encoded data in hexadecimal, Base64, or PEM format into the input field.',
        'Click "Parse" to decode the structure and view the hierarchical tree representation.',
        'Enable "with hex dump" to see the raw bytes alongside the parsed structure.',
        'Use "with definitions" to match the structure against known RFC definitions like X.509, PKCS, etc.',
      ],
    },
    aes: {
      title: 'AES Encryption/Decryption Online - Free AES Calculator | HSM Kit',
      description: 'Free online AES encryption and decryption tool. Supports AES-128, AES-192, AES-256 with ECB, CBC, CFB, OFB, CTR modes. Calculate KCV, encrypt/decrypt hex or text data securely in your browser.',
      keywords: 'AES encryption, AES decryption, AES-128, AES-192, AES-256, AES calculator, AES online tool, AES ECB, AES CBC, AES CFB, AES OFB, AES CTR, AES KCV',
      faqTitle: 'AES Encryption FAQ',
      usageTitle: 'How to Use AES Encryption Tool',
      faqs: [
        { question: 'What is AES encryption?', answer: 'AES (Advanced Encryption Standard) is a symmetric block cipher that has become the global standard for encryption. It encrypts data in 128-bit blocks using keys of 128, 192, or 256 bits.' },
        { question: 'Which AES mode should I use?', answer: 'CBC mode is commonly recommended for most applications. ECB mode should be avoided for encrypting data larger than one block as it reveals patterns. CTR mode is good for streaming data.' },
        { question: 'What key sizes does AES support?', answer: 'AES supports three key sizes: AES-128 (16 bytes), AES-192 (24 bytes), and AES-256 (32 bytes). Longer keys provide stronger security.' },
        { question: 'What is IV in AES encryption?', answer: 'IV (Initialization Vector) is a random value used with modes like CBC, CFB, OFB, and CTR to ensure that identical plaintexts produce different ciphertexts. IV should be unique but doesn\'t need to be secret.' },
      ],
      usage: [
        'Select the AES key size (128, 192, or 256 bits) and encryption mode (ECB, CBC, etc.).',
        'Enter your encryption key in hexadecimal format.',
        'For modes other than ECB, provide an IV (16 bytes in hex).',
        'Enter your data to encrypt or decrypt and click the corresponding button.',
      ],
    },
    des: {
      title: 'DES/3DES Encryption Online - Free Triple DES Calculator | HSM Kit',
      description: 'Free online DES and Triple DES (3DES) encryption and decryption tool. Supports DES, 2-key 3DES, 3-key 3DES with ECB/CBC modes. Multiple padding options including PKCS5, ISO 7816, and more.',
      keywords: 'DES encryption, 3DES encryption, Triple DES, DES decryption, DES calculator, 3DES online tool, TDES, DES ECB, DES CBC, PKCS5 padding',
      faqTitle: 'DES/3DES Encryption FAQ',
      usageTitle: 'How to Use DES/3DES Tool',
      faqs: [
        { question: 'What is the difference between DES and 3DES?', answer: 'DES uses a single 56-bit key (8 bytes with parity) while 3DES applies the DES algorithm three times with two or three different keys (16 or 24 bytes), providing much stronger security.' },
        { question: 'Is DES still secure?', answer: 'Single DES is considered insecure and deprecated. 3DES is still used in legacy systems, especially in the payment industry, but AES is recommended for new applications.' },
        { question: 'What are parity bits in DES keys?', answer: 'In DES, each byte of the key has one parity bit (the least significant bit), making effective key length 56 bits from 64 bits. This tool can auto-adjust parity bits for you.' },
        { question: 'Which padding should I use?', answer: 'PKCS5/PKCS7 is the most common choice. ISO 9797 is often used in banking applications. The choice should match what your counterparty expects.' },
      ],
      usage: [
        'Select DES (8 bytes key) or 3DES (16 or 24 bytes key).',
        'Choose the encryption mode (ECB or CBC) and padding method.',
        'Enter your key in hexadecimal format.',
        'For CBC mode, provide an IV (8 bytes in hex).',
        'Enter data and click Encrypt or Decrypt.',
      ],
    },
    rsa: {
      title: 'RSA Encryption Online - Free RSA Calculator & Key Generator | HSM Kit',
      description: 'Free online RSA encryption, decryption, signing, and verification tool. Generate RSA key pairs (1024-4096 bit), encrypt with public key, sign with private key. Supports PKCS#1 and OAEP padding.',
      keywords: 'RSA encryption, RSA decryption, RSA key generator, RSA calculator, RSA online tool, RSA signing, RSA verification, public key encryption, PKCS1, OAEP',
      faqTitle: 'RSA Encryption FAQ',
      usageTitle: 'How to Use RSA Tool',
      faqs: [
        { question: 'What is RSA encryption?', answer: 'RSA is an asymmetric encryption algorithm that uses a pair of keys - a public key for encryption and a private key for decryption. It\'s widely used for secure data transmission and digital signatures.' },
        { question: 'What key size should I use?', answer: 'For current security standards, 2048-bit keys are considered minimum. 4096-bit keys are recommended for long-term security. 1024-bit keys are deprecated.' },
        { question: 'What is the difference between PKCS#1 and OAEP?', answer: 'PKCS#1 v1.5 is an older padding scheme. OAEP (Optimal Asymmetric Encryption Padding) is more secure and recommended for new applications as it prevents certain attacks.' },
        { question: 'What is the maximum data size for RSA encryption?', answer: 'RSA can only encrypt data smaller than the key size minus padding overhead. For 2048-bit key with OAEP-SHA256, maximum is about 190 bytes. Use hybrid encryption for larger data.' },
      ],
      usage: [
        'Generate a new RSA key pair or import existing keys.',
        'For encryption: enter plaintext and click Encrypt (uses public key).',
        'For decryption: enter ciphertext and click Decrypt (requires private key).',
        'For signing: enter data hash and click Sign (requires private key).',
        'For verification: enter data, signature, and click Verify (uses public key).',
      ],
    },
    ecc: {
      title: 'ECC/ECDSA Online Tool - Elliptic Curve Cryptography | HSM Kit',
      description: 'Free online ECC (Elliptic Curve Cryptography) tool. Generate ECDSA key pairs, sign and verify data with secp256k1, P-256, P-384 curves. Compact keys with strong security for modern applications.',
      keywords: 'ECC encryption, ECDSA, elliptic curve, secp256k1, P-256, P-384, ECC key generator, ECDSA signing, ECDSA verification, Bitcoin cryptography',
      faqTitle: 'ECC/ECDSA FAQ',
      usageTitle: 'How to Use ECC/ECDSA Tool',
      faqs: [
        { question: 'What is ECC?', answer: 'Elliptic Curve Cryptography (ECC) is an approach to public-key cryptography based on the algebraic structure of elliptic curves. It provides equivalent security to RSA with much smaller key sizes.' },
        { question: 'What is secp256k1?', answer: 'secp256k1 is the elliptic curve used by Bitcoin and Ethereum for their digital signatures. It offers a good balance of security and performance.' },
        { question: 'Why use ECC over RSA?', answer: 'ECC provides the same security level as RSA with much smaller keys (256-bit ECC ≈ 3072-bit RSA), resulting in faster operations and less storage/bandwidth requirements.' },
        { question: 'What is ECDSA?', answer: 'ECDSA (Elliptic Curve Digital Signature Algorithm) is the signature algorithm based on ECC. It\'s used to create digital signatures that can verify data authenticity.' },
      ],
      usage: [
        'Select the elliptic curve (secp256k1, P-256, or P-384).',
        'Generate a new key pair or import existing keys.',
        'For signing: enter data (or its hash) and click Sign.',
        'For verification: enter original data, signature, and click Verify.',
      ],
    },
    fpe: {
      title: 'Format-Preserving Encryption (FPE) Online - FF1/FF3-1 Tool | HSM Kit',
      description: 'Free online Format-Preserving Encryption tool implementing NIST SP 800-38G. Encrypt data while preserving format and length. Ideal for tokenizing credit card numbers, SSNs, and other structured data.',
      keywords: 'FPE, format preserving encryption, FF1, FF3, FF3-1, NIST 800-38G, tokenization, credit card encryption, data masking, PCI DSS',
      faqTitle: 'Format-Preserving Encryption FAQ',
      usageTitle: 'How to Use FPE Tool',
      faqs: [
        { question: 'What is Format-Preserving Encryption?', answer: 'FPE is an encryption method that produces ciphertext in the same format and length as the plaintext. For example, a 16-digit credit card number encrypts to another 16-digit number.' },
        { question: 'What is the difference between FF1 and FF3-1?', answer: 'Both are NIST-approved FPE algorithms. FF1 supports variable-length tweaks while FF3-1 uses a fixed 56-bit tweak. FF3-1 is generally faster but has more constraints.' },
        { question: 'What is tokenization?', answer: 'Tokenization replaces sensitive data with non-sensitive placeholders (tokens). FPE is often used for tokenization because the tokens maintain the original data format.' },
        { question: 'Is FPE compliant with PCI DSS?', answer: 'Yes, FPE using NIST SP 800-38G approved algorithms (FF1, FF3-1) is accepted for PCI DSS compliance when implemented correctly.' },
      ],
      usage: [
        'Select the FPE algorithm (FF1 or FF3-1) and radix (number base).',
        'Enter your AES key (16, 24, or 32 bytes in hex).',
        'Optionally provide a tweak value for additional security.',
        'Enter plaintext data and click Encrypt to generate format-preserved ciphertext.',
      ],
    },
    keyGenerator: {
      title: 'Secure Key Generator Online - Random AES/DES Key Generator | HSM Kit',
      description: 'Free online cryptographic key generator. Generate secure random keys for AES, DES, 3DES encryption. Key combination (XOR), parity adjustment, and key validation tools included.',
      keywords: 'key generator, random key, AES key generator, DES key generator, 3DES key generator, cryptographic key, secure random, key combination, XOR keys, parity bits',
      faqTitle: 'Key Generator FAQ',
      usageTitle: 'How to Use Key Generator',
      faqs: [
        { question: 'How are the random keys generated?', answer: 'Keys are generated using the Web Crypto API (crypto.getRandomValues), which provides cryptographically secure random numbers suitable for encryption keys.' },
        { question: 'What is key combination (XOR)?', answer: 'Key combination allows you to XOR multiple key components together to form a complete key. This is commonly used in ceremonies where multiple custodians each hold a component.' },
        { question: 'What are parity bits?', answer: 'In DES/3DES keys, each byte has a parity bit for error detection. This tool can automatically adjust parity bits to odd parity as required by the DES standard.' },
        { question: 'What key lengths are supported?', answer: 'The generator supports DES (8 bytes/64 bits), 2-key 3DES (16 bytes/128 bits), 3-key 3DES (24 bytes/192 bits), and AES-128/192/256.' },
      ],
      usage: [
        'Select the desired key length from the dropdown.',
        'Click "Generate" to create a new random key.',
        'Use the Key Combination tab to XOR multiple components together.',
        'Use the Parity tab to adjust DES/3DES key parity bits.',
        'Use Validation tab to check if a key has correct format and parity.',
      ],
    },
    tr31: {
      title: 'TR-31 Key Block Parser Online - ANSI X9.143 Decoder | HSM Kit',
      description: 'Free online TR-31 key block parser and analyzer. Decode ANSI X9.143 (TR-31) key blocks, view version, key usage, algorithm, exportability, and optional blocks. Essential tool for payment HSM operations.',
      keywords: 'TR-31, key block, ANSI X9.143, TR31 parser, key block decoder, payment HSM, key usage, key exportability, DUKPT, key management',
      faqTitle: 'TR-31 Key Block FAQ',
      usageTitle: 'How to Use TR-31 Parser',
      faqs: [
        { question: 'What is TR-31?', answer: 'TR-31 (now ANSI X9.143) is a standard format for secure key exchange in the payment industry. It wraps encryption keys with metadata including key usage, algorithm, and exportability rules.' },
        { question: 'What are the TR-31 versions?', answer: 'Version A/B use TDES key wrapping, Version C uses TDES with variant binding, Version D uses AES key wrapping (most secure), and Version E uses AES with variant binding.' },
        { question: 'What is key usage in TR-31?', answer: 'Key usage (2 characters like P0, B0, D0) defines how the wrapped key can be used - P0 for PIN encryption, B0 for BDK (Base Derivation Key), D0 for data encryption, etc.' },
        { question: 'What is exportability?', answer: 'Exportability flag indicates whether the key can be exported: E=Exportable, N=Non-exportable, S=Sensitive (exportable under certain conditions).' },
      ],
      usage: [
        'Paste your TR-31 key block string into the input field.',
        'Click "Parse Key Block" to decode the structure.',
        'View the header information including version, length, and key usage.',
        'Examine algorithm, mode, key version, and exportability settings.',
      ],
    },
    kcv: {
      title: 'KCV Calculator Online - Key Check Value Generator | HSM Kit',
      description: 'Free online KCV (Key Check Value) calculator for AES and DES/3DES keys. Verify encryption key correctness by calculating the check value. Supports auto parity adjustment for DES keys.',
      keywords: 'KCV calculator, key check value, KCV generator, AES KCV, DES KCV, 3DES KCV, CMAC, key verification, payment keys',
      faqTitle: 'KCV Calculator FAQ',
      usageTitle: 'How to Use KCV Calculator',
      faqs: [
        { question: 'What is KCV (Key Check Value)?', answer: 'KCV is a checksum used to verify that a cryptographic key has been correctly entered or transmitted. It\'s calculated by encrypting a block of zeros and taking the first 3 bytes of the result.' },
        { question: 'How is KCV calculated for DES/3DES?', answer: 'For DES/3DES: Encrypt 8 bytes of zeros (0x0000000000000000) using ECB mode, then take the first 6 hex characters (3 bytes) of the ciphertext.' },
        { question: 'How is KCV calculated for AES?', answer: 'For AES: Calculate CMAC over 16 bytes of zeros using the key, then take the first 6 hex characters (3 bytes) of the MAC value.' },
        { question: 'What is auto parity adjustment?', answer: 'DES keys require odd parity on each byte. If your key doesn\'t have correct parity, enable auto-adjust to fix it before KCV calculation.' },
      ],
      usage: [
        'Select the algorithm (AES or DES/3DES).',
        'Enter your encryption key in hexadecimal format.',
        'For DES keys, optionally enable auto parity adjustment.',
        'Click "Calculate KCV" to generate the key check value.',
        'Compare the KCV with the expected value to verify key correctness.',
      ],
    },
    pinBlock: {
      title: 'PIN Block Generator Online - ISO 9564 Format 0/1/3/4 | HSM Kit',
      description: 'Free online PIN Block generator supporting ISO 9564 formats (Format 0, 1, 3, 4). Generate PIN blocks for payment transactions, ATM, and POS systems. Essential tool for payment security testing.',
      keywords: 'PIN block, ISO 9564, PIN block format 0, PIN block format 4, payment security, ATM PIN, POS PIN, PIN encryption, card PIN',
      faqTitle: 'PIN Block FAQ',
      usageTitle: 'How to Use PIN Block Generator',
      faqs: [
        { question: 'What is a PIN Block?', answer: 'A PIN Block is a standardized format for encoding a PIN (Personal Identification Number) before encryption. It combines the PIN with a fill pattern or PAN data to create a fixed-length block for encryption.' },
        { question: 'What is Format 0 (ISO 9564-1)?', answer: 'Format 0 XORs the PIN block with the rightmost 12 digits of the PAN (excluding check digit). It\'s the most widely used format in payment systems.' },
        { question: 'What is Format 4 (ISO 9564-1:2017)?', answer: 'Format 4 is the newest format designed for AES encryption. It includes random padding and provides better security than older formats.' },
        { question: 'Why is PAN needed for PIN Block?', answer: 'In Format 0 and some others, the PAN is XORed with the PIN data, binding the PIN to a specific card and preventing certain attacks.' },
      ],
      usage: [
        'Select the PIN Block format (0, 1, 3, or 4).',
        'Enter the PIN (4-12 digits).',
        'For formats that require PAN, enter the card number.',
        'Click "Generate" to create the PIN Block.',
        'Use the generated hex string as input for your encryption process.',
      ],
    },
  },
  
  zh: {
    home: {
      title: 'HSM Kit - 免费在线加密与密钥管理工具',
      description: '免费在线密码学工具套件，用于HSM密钥管理。计算KCV、解析TR-31密钥块、生成安全密钥、AES/DES/RSA加密等。所有计算在浏览器本地执行，确保最高安全性。',
      keywords: 'HSM工具, 加密工具箱, 密钥管理, KCV计算器, TR-31解析器, AES加密, DES加密, RSA加密, PIN Block, 密钥生成器, 密码学工具, 支付安全',
      faqTitle: '常见问题',
      usageTitle: '关于 HSM Kit',
      faqs: [
        { question: 'HSM Kit 是否免费？', answer: '是的，HSM Kit 完全免费。所有工具无需注册或付费即可使用。' },
        { question: '我的数据安全吗？', answer: '绝对安全。所有加密操作完全在您的浏览器中执行（客户端），数据永远不会发送到我们的服务器。' },
        { question: '支持哪些加密算法？', answer: 'HSM Kit 支持 AES（128/192/256位）、DES、3DES、RSA、ECC（ECDSA）和格式保留加密（FPE）。' },
        { question: '可以用于支付安全吗？', answer: '是的，HSM Kit 包含专门为支付安全设计的工具，包括 PIN Block 生成、TR-31 密钥块解析和 KCV 计算。' },
      ],
      usage: [
        'HSM Kit 是一套综合性的密码学工具套件，专为安全专家、开发者和任何从事加密工作的人设计。',
        '所有工具完全在浏览器中运行——无服务器通信意味着您的敏感数据永远不会离开您的设备。',
        '非常适合密码学和支付安全领域的测试、开发和教育目的。',
      ],
    },
    asn1: {
      title: 'ASN.1 在线解析器 - 免费 DER/BER 结构解码器 | HSM Kit',
      description: '免费在线 ASN.1 解析和解码工具。解析 ASN.1 DER/BER 结构，解码 X.509 证书，分析 PKCS 格式。支持十六进制、Base64 和 PEM 输入，带 RFC 定义匹配。',
      keywords: 'ASN.1解析器, DER解码器, BER解码器, X.509证书解析, PKCS解码器, ASN1在线工具, 证书分析器, PEM解析器',
      faqTitle: 'ASN.1 解析器常见问题',
      usageTitle: '如何使用 ASN.1 解析器',
      faqs: [
        { question: '什么是 ASN.1？', answer: 'ASN.1（抽象语法标记一）是一种标准接口描述语言，用于定义可序列化和反序列化的数据结构。它广泛用于密码学、电信和网络协议。' },
        { question: '这个解析器支持哪些格式？', answer: '此解析器支持 DER（可区分编码规则）和 BER（基本编码规则）编码的 ASN.1 结构。您可以输入十六进制、Base64 或 PEM 格式的数据。' },
        { question: '可以解析 X.509 证书吗？', answer: '是的，此工具可以解析 X.509 证书、CSR、PKCS#7/8/12 结构以及其他使用 ASN.1 编码的证书格式。' },
        { question: '十六进制转储功能是什么？', answer: '十六进制转储功能在解析树视图旁边显示 ASN.1 结构的原始字节，便于理解二进制编码。' },
      ],
      usage: [
        '将 ASN.1 编码数据以十六进制、Base64 或 PEM 格式粘贴到输入框。',
        '点击"解析"解码结构并查看层级树形表示。',
        '启用"带十六进制转储"可在解析结构旁边查看原始字节。',
        '使用"带定义"可将结构与已知的 RFC 定义（如 X.509、PKCS 等）进行匹配。',
      ],
    },
    aes: {
      title: 'AES 在线加密解密 - 免费 AES 计算器 | HSM Kit',
      description: '免费在线 AES 加密解密工具。支持 AES-128、AES-192、AES-256，ECB、CBC、CFB、OFB、CTR 模式。计算 KCV，在浏览器中安全加密/解密十六进制或文本数据。',
      keywords: 'AES加密, AES解密, AES-128, AES-192, AES-256, AES计算器, AES在线工具, AES ECB, AES CBC, AES KCV',
      faqTitle: 'AES 加密常见问题',
      usageTitle: '如何使用 AES 加密工具',
      faqs: [
        { question: '什么是 AES 加密？', answer: 'AES（高级加密标准）是一种对称分组密码，已成为全球加密标准。它使用 128、192 或 256 位密钥以 128 位块加密数据。' },
        { question: '应该使用哪种 AES 模式？', answer: 'CBC 模式通常推荐用于大多数应用。ECB 模式应避免用于加密大于一个块的数据，因为它会显示模式。CTR 模式适合流式数据。' },
        { question: 'AES 支持哪些密钥大小？', answer: 'AES 支持三种密钥大小：AES-128（16字节）、AES-192（24字节）和 AES-256（32字节）。更长的密钥提供更强的安全性。' },
        { question: 'AES 加密中的 IV 是什么？', answer: 'IV（初始化向量）是与 CBC、CFB、OFB 和 CTR 等模式一起使用的随机值，确保相同的明文产生不同的密文。IV 应该是唯一的，但不需要保密。' },
      ],
      usage: [
        '选择 AES 密钥大小（128、192 或 256 位）和加密模式（ECB、CBC 等）。',
        '以十六进制格式输入您的加密密钥。',
        '对于 ECB 以外的模式，提供 IV（16字节十六进制）。',
        '输入要加密或解密的数据，然后点击相应按钮。',
      ],
    },
    des: {
      title: 'DES/3DES 在线加密 - 免费三重 DES 计算器 | HSM Kit',
      description: '免费在线 DES 和三重 DES（3DES）加密解密工具。支持 DES、双密钥 3DES、三密钥 3DES，ECB/CBC 模式。多种填充选项包括 PKCS5、ISO 7816 等。',
      keywords: 'DES加密, 3DES加密, 三重DES, DES解密, DES计算器, 3DES在线工具, TDES, DES ECB, DES CBC',
      faqTitle: 'DES/3DES 加密常见问题',
      usageTitle: '如何使用 DES/3DES 工具',
      faqs: [
        { question: 'DES 和 3DES 有什么区别？', answer: 'DES 使用单个 56 位密钥（带奇偶校验为 8 字节），而 3DES 使用两个或三个不同的密钥（16 或 24 字节）应用 DES 算法三次，提供更强的安全性。' },
        { question: 'DES 还安全吗？', answer: '单 DES 被认为不安全且已弃用。3DES 仍在遗留系统中使用，特别是在支付行业，但新应用建议使用 AES。' },
        { question: 'DES 密钥中的奇偶校验位是什么？', answer: '在 DES 中，密钥的每个字节都有一个奇偶校验位（最低有效位），使有效密钥长度从 64 位变为 56 位。此工具可以为您自动调整奇偶校验位。' },
        { question: '应该使用哪种填充？', answer: 'PKCS5/PKCS7 是最常见的选择。ISO 9797 经常用于银行应用。选择应与对方期望的匹配。' },
      ],
      usage: [
        '选择 DES（8字节密钥）或 3DES（16或24字节密钥）。',
        '选择加密模式（ECB 或 CBC）和填充方法。',
        '以十六进制格式输入您的密钥。',
        '对于 CBC 模式，提供 IV（8字节十六进制）。',
        '输入数据并点击加密或解密。',
      ],
    },
    rsa: {
      title: 'RSA 在线加密 - 免费 RSA 计算器和密钥生成器 | HSM Kit',
      description: '免费在线 RSA 加密、解密、签名和验证工具。生成 RSA 密钥对（1024-4096位），用公钥加密，用私钥签名。支持 PKCS#1 和 OAEP 填充。',
      keywords: 'RSA加密, RSA解密, RSA密钥生成器, RSA计算器, RSA在线工具, RSA签名, RSA验证, 公钥加密, PKCS1, OAEP',
      faqTitle: 'RSA 加密常见问题',
      usageTitle: '如何使用 RSA 工具',
      faqs: [
        { question: '什么是 RSA 加密？', answer: 'RSA 是一种非对称加密算法，使用一对密钥——公钥用于加密，私钥用于解密。它广泛用于安全数据传输和数字签名。' },
        { question: '应该使用什么密钥大小？', answer: '对于当前安全标准，2048 位密钥被认为是最低要求。建议使用 4096 位密钥以获得长期安全性。1024 位密钥已弃用。' },
        { question: 'PKCS#1 和 OAEP 有什么区别？', answer: 'PKCS#1 v1.5 是较旧的填充方案。OAEP（最优非对称加密填充）更安全，推荐用于新应用，因为它可以防止某些攻击。' },
        { question: 'RSA 加密的最大数据大小是多少？', answer: 'RSA 只能加密小于密钥大小减去填充开销的数据。对于带 OAEP-SHA256 的 2048 位密钥，最大约 190 字节。对于更大的数据，请使用混合加密。' },
      ],
      usage: [
        '生成新的 RSA 密钥对或导入现有密钥。',
        '加密：输入明文并点击加密（使用公钥）。',
        '解密：输入密文并点击解密（需要私钥）。',
        '签名：输入数据哈希并点击签名（需要私钥）。',
        '验证：输入数据、签名并点击验证（使用公钥）。',
      ],
    },
    ecc: {
      title: 'ECC/ECDSA 在线工具 - 椭圆曲线密码学 | HSM Kit',
      description: '免费在线 ECC（椭圆曲线密码学）工具。生成 ECDSA 密钥对，使用 secp256k1、P-256、P-384 曲线签名和验证数据。紧凑密钥，强安全性，适用于现代应用。',
      keywords: 'ECC加密, ECDSA, 椭圆曲线, secp256k1, P-256, P-384, ECC密钥生成器, ECDSA签名, ECDSA验证, 比特币密码学',
      faqTitle: 'ECC/ECDSA 常见问题',
      usageTitle: '如何使用 ECC/ECDSA 工具',
      faqs: [
        { question: '什么是 ECC？', answer: '椭圆曲线密码学（ECC）是一种基于椭圆曲线代数结构的公钥密码学方法。它用更小的密钥大小提供与 RSA 等效的安全性。' },
        { question: '什么是 secp256k1？', answer: 'secp256k1 是比特币和以太坊用于数字签名的椭圆曲线。它提供了良好的安全性和性能平衡。' },
        { question: '为什么使用 ECC 而不是 RSA？', answer: 'ECC 用更小的密钥提供与 RSA 相同的安全级别（256位 ECC ≈ 3072位 RSA），从而实现更快的操作和更少的存储/带宽需求。' },
        { question: '什么是 ECDSA？', answer: 'ECDSA（椭圆曲线数字签名算法）是基于 ECC 的签名算法。它用于创建可以验证数据真实性的数字签名。' },
      ],
      usage: [
        '选择椭圆曲线（secp256k1、P-256 或 P-384）。',
        '生成新的密钥对或导入现有密钥。',
        '签名：输入数据（或其哈希）并点击签名。',
        '验证：输入原始数据、签名并点击验证。',
      ],
    },
    fpe: {
      title: '格式保留加密（FPE）在线工具 - FF1/FF3-1 | HSM Kit',
      description: '免费在线格式保留加密工具，实现 NIST SP 800-38G 标准。加密数据同时保留格式和长度。非常适合标记化信用卡号、身份证号等结构化数据。',
      keywords: 'FPE, 格式保留加密, FF1, FF3, FF3-1, NIST 800-38G, 标记化, 信用卡加密, 数据脱敏, PCI DSS',
      faqTitle: '格式保留加密常见问题',
      usageTitle: '如何使用 FPE 工具',
      faqs: [
        { question: '什么是格式保留加密？', answer: 'FPE 是一种加密方法，产生与明文相同格式和长度的密文。例如，16位信用卡号加密为另一个16位数字。' },
        { question: 'FF1 和 FF3-1 有什么区别？', answer: '两者都是 NIST 批准的 FPE 算法。FF1 支持可变长度调整值，而 FF3-1 使用固定的 56 位调整值。FF3-1 通常更快，但约束更多。' },
        { question: '什么是标记化？', answer: '标记化用非敏感占位符（令牌）替换敏感数据。FPE 常用于标记化，因为令牌保持原始数据格式。' },
        { question: 'FPE 符合 PCI DSS 吗？', answer: '是的，正确实施时，使用 NIST SP 800-38G 批准算法（FF1、FF3-1）的 FPE 符合 PCI DSS 合规要求。' },
      ],
      usage: [
        '选择 FPE 算法（FF1 或 FF3-1）和基数（数制）。',
        '输入您的 AES 密钥（16、24 或 32 字节十六进制）。',
        '可选提供调整值以增加安全性。',
        '输入明文数据并点击加密以生成格式保留的密文。',
      ],
    },
    keyGenerator: {
      title: '安全密钥生成器在线 - 随机 AES/DES 密钥生成器 | HSM Kit',
      description: '免费在线密码学密钥生成器。为 AES、DES、3DES 加密生成安全随机密钥。包含密钥组合（XOR）、奇偶校验调整和密钥验证工具。',
      keywords: '密钥生成器, 随机密钥, AES密钥生成器, DES密钥生成器, 3DES密钥生成器, 加密密钥, 安全随机, 密钥组合, XOR密钥',
      faqTitle: '密钥生成器常见问题',
      usageTitle: '如何使用密钥生成器',
      faqs: [
        { question: '随机密钥是如何生成的？', answer: '密钥使用 Web Crypto API（crypto.getRandomValues）生成，它提供适用于加密密钥的密码学安全随机数。' },
        { question: '什么是密钥组合（XOR）？', answer: '密钥组合允许您将多个密钥分量异或在一起形成完整密钥。这通常用于多个保管人各持有一个分量的仪式中。' },
        { question: '什么是奇偶校验位？', answer: '在 DES/3DES 密钥中，每个字节都有一个用于错误检测的奇偶校验位。此工具可以自动将奇偶校验位调整为 DES 标准要求的奇校验。' },
        { question: '支持哪些密钥长度？', answer: '生成器支持 DES（8字节/64位）、双密钥 3DES（16字节/128位）、三密钥 3DES（24字节/192位）和 AES-128/192/256。' },
      ],
      usage: [
        '从下拉菜单选择所需的密钥长度。',
        '点击"生成"创建新的随机密钥。',
        '使用"密钥组合"标签将多个分量异或在一起。',
        '使用"奇偶校验"标签调整 DES/3DES 密钥的奇偶校验位。',
        '使用"验证"标签检查密钥是否具有正确的格式和奇偶校验。',
      ],
    },
    tr31: {
      title: 'TR-31 密钥块解析器在线 - ANSI X9.143 解码器 | HSM Kit',
      description: '免费在线 TR-31 密钥块解析和分析工具。解码 ANSI X9.143（TR-31）密钥块，查看版本、密钥用途、算法、可导出性和可选块。支付 HSM 操作的必备工具。',
      keywords: 'TR-31, 密钥块, ANSI X9.143, TR31解析器, 密钥块解码器, 支付HSM, 密钥用途, 密钥可导出性, DUKPT, 密钥管理',
      faqTitle: 'TR-31 密钥块常见问题',
      usageTitle: '如何使用 TR-31 解析器',
      faqs: [
        { question: '什么是 TR-31？', answer: 'TR-31（现为 ANSI X9.143）是支付行业安全密钥交换的标准格式。它用元数据包装加密密钥，包括密钥用途、算法和可导出性规则。' },
        { question: 'TR-31 有哪些版本？', answer: '版本 A/B 使用 TDES 密钥包装，版本 C 使用带变体绑定的 TDES，版本 D 使用 AES 密钥包装（最安全），版本 E 使用带变体绑定的 AES。' },
        { question: 'TR-31 中的密钥用途是什么？', answer: '密钥用途（如 P0、B0、D0 的 2 个字符）定义包装密钥的使用方式——P0 用于 PIN 加密，B0 用于 BDK（基础派生密钥），D0 用于数据加密等。' },
        { question: '什么是可导出性？', answer: '可导出性标志指示密钥是否可以导出：E=可导出，N=不可导出，S=敏感（在某些条件下可导出）。' },
      ],
      usage: [
        '将您的 TR-31 密钥块字符串粘贴到输入框。',
        '点击"解析密钥块"解码结构。',
        '查看头部信息，包括版本、长度和密钥用途。',
        '检查算法、模式、密钥版本和可导出性设置。',
      ],
    },
    kcv: {
      title: 'KCV 计算器在线 - 密钥校验值生成器 | HSM Kit',
      description: '免费在线 KCV（密钥校验值）计算器，支持 AES 和 DES/3DES 密钥。通过计算校验值验证加密密钥的正确性。支持 DES 密钥的自动奇偶校验调整。',
      keywords: 'KCV计算器, 密钥校验值, KCV生成器, AES KCV, DES KCV, 3DES KCV, CMAC, 密钥验证, 支付密钥',
      faqTitle: 'KCV 计算器常见问题',
      usageTitle: '如何使用 KCV 计算器',
      faqs: [
        { question: '什么是 KCV（密钥校验值）？', answer: 'KCV 是用于验证加密密钥是否正确输入或传输的校验和。它通过加密一块零并取结果的前 3 个字节来计算。' },
        { question: 'DES/3DES 的 KCV 如何计算？', answer: '对于 DES/3DES：使用 ECB 模式加密 8 字节零（0x0000000000000000），然后取密文的前 6 个十六进制字符（3字节）。' },
        { question: 'AES 的 KCV 如何计算？', answer: '对于 AES：使用密钥对 16 字节零计算 CMAC，然后取 MAC 值的前 6 个十六进制字符（3字节）。' },
        { question: '什么是自动奇偶校验调整？', answer: 'DES 密钥要求每个字节具有奇校验。如果您的密钥没有正确的奇偶校验，启用自动调整可在 KCV 计算前修复它。' },
      ],
      usage: [
        '选择算法（AES 或 DES/3DES）。',
        '以十六进制格式输入您的加密密钥。',
        '对于 DES 密钥，可选择启用自动奇偶校验调整。',
        '点击"计算 KCV"生成密钥校验值。',
        '将 KCV 与预期值进行比较以验证密钥正确性。',
      ],
    },
    pinBlock: {
      title: 'PIN Block 生成器在线 - ISO 9564 格式 0/1/3/4 | HSM Kit',
      description: '免费在线 PIN Block 生成器，支持 ISO 9564 格式（格式 0、1、3、4）。为支付交易、ATM 和 POS 系统生成 PIN Block。支付安全测试的必备工具。',
      keywords: 'PIN Block, ISO 9564, PIN Block格式0, PIN Block格式4, 支付安全, ATM PIN, POS PIN, PIN加密, 银行卡PIN',
      faqTitle: 'PIN Block 常见问题',
      usageTitle: '如何使用 PIN Block 生成器',
      faqs: [
        { question: '什么是 PIN Block？', answer: 'PIN Block 是在加密前编码 PIN（个人识别码）的标准化格式。它将 PIN 与填充模式或 PAN 数据组合，创建用于加密的固定长度块。' },
        { question: '什么是格式 0（ISO 9564-1）？', answer: '格式 0 将 PIN 块与 PAN 的最右 12 位数字（不包括校验位）进行异或。它是支付系统中最广泛使用的格式。' },
        { question: '什么是格式 4（ISO 9564-1:2017）？', answer: '格式 4 是专为 AES 加密设计的最新格式。它包含随机填充，比旧格式提供更好的安全性。' },
        { question: '为什么 PIN Block 需要 PAN？', answer: '在格式 0 和其他一些格式中，PAN 与 PIN 数据进行异或，将 PIN 绑定到特定卡片，防止某些攻击。' },
      ],
      usage: [
        '选择 PIN Block 格式（0、1、3 或 4）。',
        '输入 PIN（4-12 位数字）。',
        '对于需要 PAN 的格式，输入卡号。',
        '点击"生成"创建 PIN Block。',
        '使用生成的十六进制字符串作为加密过程的输入。',
      ],
    },
  },
};

// Import localized SEO content
import jaSEO from './seo-ja';
import koSEO from './seo-ko';
import deSEO from './seo-de';
import frSEO from './seo-fr';

// Add localized SEO content
seoContent.ja = jaSEO;
seoContent.ko = koSEO;
seoContent.de = deSEO;
seoContent.fr = frSEO;

export default seoContent;

