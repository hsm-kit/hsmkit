// English translations - Home page
export default {
  home: {
    heroTitle: 'Free Online Encryption & Key Management Tools',
    heroDescription: 'A comprehensive suite of cryptographic tools for security professionals. All calculations are performed client-side in your browser — your data never leaves your device.',
    searchPlaceholder: 'Search tools... (e.g., MD5, AES, PIN Block)',
    availableTools: 'Most Popular Tools',
    gridView: 'Grid View',
    listView: 'List View',
    whyChoose: 'Why Choose HSM Kit?',
    categories: {
      all: 'All',
      symmetric: 'Symmetric',
      asymmetric: 'Asymmetric',
      payment: 'Payment',
      encoding: 'Encoding',
      hashing: 'Hashing',
    },
    // Tool cards
    tools: {
    asn1: {
      title: 'ASN.1 Parser',
      description: 'Parse and analyze ASN.1 DER/BER structures, decode X.509 certificates and PKCS formats.',
    },
    aes: {
      title: 'AES Encryption',
      description: 'Encrypt and decrypt data using AES-128/192/256 with ECB, CBC, CFB, OFB, CTR modes.',
    },
    des: {
      title: 'DES/3DES Encryption',
      description: 'DES and Triple DES encryption with multiple padding options for legacy systems.',
    },
    rsa: {
      title: 'RSA Encryption',
      description: 'RSA asymmetric encryption, decryption, digital signing and verification.',
    },
    ecc: {
      title: 'ECC/ECDSA',
      description: 'Elliptic Curve Cryptography for compact keys and efficient digital signatures.',
    },
    fpe: {
      title: 'Format-Preserving Encryption',
      description: 'FPE (FF1/FF3-1) for encrypting data while preserving format and length.',
    },
    keyGenerator: {
      title: 'Key Generator',
      description: 'Generate secure random keys for AES, DES, 3DES. Key combination and parity tools.',
    },
    tr31: {
      title: 'TR-31 Key Block',
      description: 'Encode and decode TR-31/ANSI X9.143 key blocks with KBPK protection. Supports TDES and AES versions.',
    },
    kcv: {
      title: 'KCV Calculator',
      description: 'Calculate Key Check Value (KCV) for AES and DES/3DES keys verification.',
    },
    pinBlock: {
      title: 'PIN Block Generator',
      description: 'Generate ISO 9564 PIN Blocks (Format 0, 1, 3, 4) for payment transactions.',
    },
    pinBlockGeneral: {
      title: 'PIN Blocks General',
      description: 'Encode and decode PIN Blocks in all ISO 9564 formats (0, 1, 2, 3, 4) with PAN.',
    },
    pinBlockAes: {
      title: 'PIN Blocks AES',
      description: 'AES-128 encryption/decryption of ISO 9564 Format 4 PIN Blocks with 32 hex output.',
    },
    pinOffset: {
      title: 'PIN Offset',
      description: 'Calculate and verify PIN offset using IBM 3624 method with validation data.',
    },
    pinPvv: {
      title: 'PIN PVV',
      description: 'Visa PIN Verification Value (PVV) calculation and PIN verification with PDK/PVKI.',
    },
    as2805: {
      title: 'AS2805 Message Tools',
      description: 'Australian ISO 8583 payment tools with key generation, PIN block translation, and MAC calculation.',
    },
    ansiMac: {
      title: 'ANSI MAC (X9.9 & X9.19)',
      description: 'ANSI X9.9/X9.19 MAC with DES CBC-MAC or 3DES encryption.',
    },
    as2805Mac: {
      title: 'AS2805 MAC',
      description: 'AS2805.4.1 MAC for Australian EFTPOS with Method 1 and Method 2.',
    },
    tdesCbcMac: {
      title: 'TDES CBC-MAC',
      description: 'Triple DES CBC-MAC with 2-key/3-key TDES and ISO 9797-1 padding.',
    },
    hmac: {
      title: 'HMAC',
      description: 'Hash-based MAC using SHA-256/SHA-512 for API authentication and data integrity.',
    },
    cmac: {
      title: 'CMAC',
      description: 'NIST SP 800-38B cipher-based MAC with AES/TDES and CMAC-96.',
    },
    retailMac: {
      title: 'Retail MAC',
      description: 'ISO 9797-1 Method 2 Retail MAC with DES/3DES for POS and ATM systems.',
    },
    iso9797: {
      title: 'ISO 9797-1 MAC',
      description: 'ISO/IEC 9797-1 MAC calculator with algorithms 1-6 and multiple padding methods.',
    },
    visaCertificates: {
      title: 'VISA Certificates',
      description: 'Validate VISA issuer certificates with VSDC CA V92/V94 and custom CA keys.',
    },
    zka: {
      title: 'ZKA',
      description: 'German banking standard with session key derivation, PIN encryption, and MAC calculation.',
    },
    bitmap: {
      title: 'ISO8583 Bitmap',
      description: 'Encode and decode ISO 8583 bitmaps for payment messages. Primary and secondary bitmaps supported.',
    },
    cvv: {
      title: 'CVV/CVC',
      description: 'Generate and validate CVV, iCVV, CVV2, dCVV for card verification and payment security.',
    },
    amexCsc: {
      title: 'AMEX CSC',
      description: 'Generate and validate AMEX Card Security Codes (CSC-5, CSC-4, CSC-3) for American Express.',
    },
    mastercardCvc3: {
      title: 'MasterCard CVC3',
      description: 'Generate dynamic CVC3 for MasterCard contactless EMV transactions.',
    },
    // Generic Tools
    hash: {
      title: 'Hash Calculator',
      description: 'Calculate hash values using MD5, SHA-1, SHA-256, SHA-512, BLAKE2, and more algorithms.',
    },
    encoding: {
      title: 'Character Encoding',
      description: 'Convert between ASCII, EBCDIC, Hexadecimal, Binary, and ATM Decimal formats.',
    },
    bcd: {
      title: 'BCD Encoder/Decoder',
      description: 'Encode decimal to BCD or decode BCD back to decimal format.',
    },
    checkDigits: {
      title: 'Check Digits',
      description: 'Calculate and verify check digits using Luhn (MOD 10) and MOD 9 algorithms.',
    },
    base64: {
      title: 'Base64',
      description: 'Encode and decode data using Base64 binary-to-text encoding.',
    },
    base94: {
      title: 'Base94',
      description: 'Compact encoding using all 94 printable ASCII characters.',
    },
    messageParser: {
      title: 'Message Parser',
      description: 'Parse ATM NDC, Wincor, and ISO 8583 financial message formats.',
    },
    dukpt: {
      title: 'DUKPT (ISO 9797)',
      description: 'Derive PEK from BDK/IPEK and KSN. Encrypt/decrypt PIN, calculate MAC, process data.',
    },
    dukptAes: {
      title: 'DUKPT (AES)',
      description: 'DUKPT with AES support (2TDEA, 3TDEA, AES-128/192/256). Derive working keys and process data.',
    },
    rsaDer: {
      title: 'RSA DER Public Key',
      description: 'Encode/decode RSA public keys between modulus/exponent and DER format.',
    },
    uuid: {
      title: 'UUID Generator',
      description: 'Generate universally unique identifiers (UUID v1, v3, v4, v5).',
    },
    // Keys HSM Tools
    keyshareGenerator: {
      title: 'Keyshare Generator',
      description: 'Generate key shares for secure key splitting and component management with KCV.',
    },
    futurexKeys: {
      title: 'Futurex Keys',
      description: 'Futurex HSM key encryption, decryption and lookup with multiple variants.',
    },
    atallaKeys: {
      title: 'Atalla Keys (AKB)',
      description: 'Atalla AKB format key encryption and decryption with MFK and MAC verification.',
    },
    safeNetKeys: {
      title: 'SafeNet Keys',
      description: 'SafeNet HSM key encryption, decryption and lookup with KM key variants.',
    },
    thalesKeys: {
      title: 'Thales Keys',
      description: 'Thales HSM LMK key encryption, decryption and lookup with variants.',
    },
    thalesKeyBlock: {
      title: 'Thales Key Block',
      description: 'Encode and decode Thales proprietary key blocks with KBPK protection.',
    },
    sslCert: {
      title: 'SSL Certificates',
      description: 'Generate RSA keys, create CSRs, self-signed X.509 certificates, and parse certificates.',
    },
  },
  // Features
  features: {
    clientSide: {
      title: '100% Browser-Based',
      description: 'All cryptographic operations run entirely in your browser. Your keys, PINs, and sensitive data never leave your device.',
    },
    free: {
      title: 'Free & Open',
      description: 'All 44+ tools are completely free. No registration, no login, no hidden costs. Use instantly.',
    },
    paymentReady: {
      title: 'HSM & Payment Ready',
      description: 'Professional tools for Thales, Futurex, Atalla, SafeNet HSMs. TR-31, KCV, PIN Block and more.',
    },
  },
  },
};
