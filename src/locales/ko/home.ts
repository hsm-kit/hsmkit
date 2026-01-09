// Korean translations - Home page
export default {
  home: {
    heroTitle: '무료 온라인 암호화 및 키 관리 도구',
    heroDescription: '보안 전문가를 위한 포괄적인 암호화 도구 모음입니다. 모든 계산은 브라우저 내 클라이언트 측에서 수행되며, 데이터는 기기를 절대 벗어나지 않습니다.',
    searchPlaceholder: '도구 검색... (예: MD5, AES, PIN Block)',
    availableTools: '인기 도구',
    gridView: '격자 보기',
    listView: '목록 보기',
    whyChoose: 'HSM Kit를 선택해야 하는 이유',
    categories: {
      all: '전체',
      symmetric: '대칭키',
      asymmetric: '비대칭키',
      payment: '결제',
      encoding: '인코딩',
      hashing: '해싱',
    },
    // Tool cards
    tools: {
      asn1: {
        title: 'ASN.1 파서',
        description: 'ASN.1 DER/BER 구조를 파싱 및 분석하고, X.509 인증서와 PKCS 포맷을 디코딩합니다.',
      },
      aes: {
        title: 'AES 암호화',
        description: 'ECB, CBC, CFB, OFB, CTR 모드로 AES-128/192/256을 사용하여 데이터를 암호화 및 복호화합니다.',
      },
      des: {
        title: 'DES/3DES 암호화',
        description: '레거시 시스템을 위한 다양한 패딩 옵션을 제공하는 DES 및 Triple DES 암호화입니다.',
      },
      rsa: {
        title: 'RSA 암호화',
        description: 'RSA 비대칭 암호화, 복호화, 전자 서명 및 검증을 수행합니다.',
      },
      ecc: {
        title: 'ECC/ECDSA',
        description: '작은 키 크기와 효율적인 전자 서명을 위한 타원 곡선 암호(ECC) 도구입니다.',
      },
      fpe: {
        title: '형태 보존 암호화 (FPE)',
        description: '형식과 길이를 보존하며 데이터를 암호화하는 FPE (FF1/FF3-1) 도구입니다.',
      },
      keyGenerator: {
        title: '키 생성기',
        description: 'AES, DES, 3DES용 보안 무작위 키를 생성합니다. 키 결합 및 패리티 도구가 포함되어 있습니다.',
      },
      tr31: {
        title: 'TR-31 키 블록',
        description: 'KBPK 보호가 적용된 TR-31/ANSI X9.143 키 블록을 인코딩 및 디코딩합니다. TDES 및 AES 버전을 지원합니다.',
      },
      kcv: {
        title: 'KCV 계산기',
        description: 'AES 및 DES/3DES 키 검증을 위한 키 체크 값(KCV)을 계산합니다.',
      },
      pinBlock: {
        title: 'PIN 블록 생성기',
        description: '결제 거래를 위한 ISO 9564 PIN 블록(Format 0, 1, 3, 4)을 생성합니다.',
      },
      pinBlockGeneral: {
        title: 'PIN 블록 (일반)',
        description: 'PAN을 포함한 모든 ISO 9564 포맷(0, 1, 2, 3, 4)의 PIN 블록을 인코딩 및 디코딩합니다.',
      },
      pinBlockAes: {
        title: 'PIN 블록 (AES)',
        description: '32 hex 출력을 생성하는 ISO 9564 Format 4 PIN 블록의 AES-128 암호화/복호화 도구입니다.',
      },
      pinOffset: {
        title: 'PIN 오프셋',
        description: '검증 데이터를 사용하여 IBM 3624 방식으로 PIN 오프셋을 계산하고 검증합니다.',
      },
      pinPvv: {
        title: 'PIN PVV',
        description: 'PDK/PVKI를 사용한 Visa PIN 검증 값(PVV) 계산 및 PIN 검증을 수행합니다.',
      },
      as2805: {
        title: 'AS2805 메시지 도구',
        description: '키 생성, PIN 블록 변환, MAC 계산을 포함한 호주 ISO 8583 결제 도구입니다.',
      },
      ansiMac: {
        title: 'ANSI MAC (X9.9 & X9.19)',
        description: 'DES CBC-MAC 또는 3DES 암호화를 사용하는 ANSI X9.9/X9.19 MAC 도구입니다.',
      },
      as2805Mac: {
        title: 'AS2805 MAC',
        description: 'Method 1 및 Method 2를 사용하는 호주 EFTPOS용 AS2805.4.1 MAC입니다.',
      },
      tdesCbcMac: {
        title: 'TDES CBC-MAC',
        description: '2-key/3-key TDES 및 ISO 9797-1 패딩을 사용하는 Triple DES CBC-MAC입니다.',
      },
      hmac: {
        title: 'HMAC',
        description: 'API 인증 및 데이터 무결성을 위해 SHA-256/SHA-512를 사용하는 해시 기반 MAC입니다.',
      },
      cmac: {
        title: 'CMAC',
        description: 'AES/TDES 및 CMAC-96을 사용하는 NIST SP 800-38B 암호 기반 MAC입니다.',
      },
      retailMac: {
        title: '리테일 MAC',
        description: 'POS 및 ATM 시스템을 위한 DES/3DES 기반 ISO 9797-1 Method 2 리테일 MAC입니다.',
      },
      iso9797: {
        title: 'ISO 9797-1 MAC',
        description: '알고리즘 1-6 및 다양한 패딩 방법을 지원하는 ISO/IEC 9797-1 MAC 계산기입니다.',
      },
      visaCertificates: {
        title: 'VISA 인증서',
        description: 'VSDC CA V92/V94 및 사용자 지정 CA 키로 VISA 발급사 인증서를 검증합니다.',
      },
      zka: {
        title: 'ZKA',
        description: '세션 키 유도, PIN 암호화, MAC 계산을 포함한 독일 뱅킹 표준 도구입니다.',
      },
      bitmap: {
        title: 'ISO8583 비트맵',
        description: '결제 메시지용 ISO 8583 비트맵을 인코딩 및 디코딩합니다. 1차 및 2차 비트맵을 지원합니다.',
      },
      cvv: {
        title: 'CVV/CVC',
        description: '카드 검증 및 결제 보안을 위한 CVV, iCVV, CVV2, dCVV를 생성하고 검증합니다.',
      },
      amexCsc: {
        title: 'AMEX CSC',
        description: '아메리칸 익스프레스용 AMEX 카드 보안 코드(CSC-5, CSC-4, CSC-3)를 생성하고 검증합니다.',
      },
      mastercardCvc3: {
        title: 'MasterCard CVC3',
        description: 'MasterCard 비접촉 EMV 거래를 위한 동적 CVC3를 생성합니다.',
      },
      // Generic Tools
      hash: {
        title: '해시 계산기',
        description: 'MD5, SHA-1, SHA-256, SHA-512, BLAKE2 등의 알고리즘을 사용하여 해시 값을 계산합니다.',
      },
      encoding: {
        title: '문자 인코딩',
        description: 'ASCII, EBCDIC, Hexadecimal, Binary, ATM Decimal 포맷 간을 변환합니다.',
      },
      bcd: {
        title: 'BCD 인코더/디코더',
        description: '10진수를 BCD로 인코딩하거나 BCD를 다시 10진수 포맷으로 디코딩합니다.',
      },
      checkDigits: {
        title: '체크 디지트',
        description: 'Luhn (MOD 10) 및 MOD 9 알고리즘을 사용하여 체크 디지트를 계산하고 검증합니다.',
      },
      base64: {
        title: 'Base64',
        description: 'Base64 이진-텍스트 인코딩을 사용하여 데이터를 인코딩 및 디코딩합니다.',
      },
      base94: {
        title: 'Base94',
        description: '인쇄 가능한 모든 94개 ASCII 문자를 사용하는 컴팩트 인코딩 도구입니다.',
      },
      messageParser: {
        title: '메시지 파서',
        description: 'ATM NDC, Wincor 및 ISO 8583 금융 메시지 포맷을 파싱합니다.',
      },
      dukpt: {
        title: 'DUKPT (ISO 9797)',
        description: 'BDK/IPEK 및 KSN에서 PEK를 유도합니다. PIN 암호화/복호화, MAC 계산, 데이터 처리를 지원합니다.',
      },
      dukptAes: {
        title: 'DUKPT (AES)',
        description: 'AES 지원(2TDEA, 3TDEA, AES-128/192/256)이 포함된 DUKPT입니다. 작업 키 유도 및 데이터 처리를 지원합니다.',
      },
      rsaDer: {
        title: 'RSA DER 공개 키',
        description: '모듈러/지수와 DER 포맷 간에 RSA 공개 키를 인코딩/디코딩합니다.',
      },
      uuid: {
        title: 'UUID 생성기',
        description: '범용 고유 식별자(UUID v1, v3, v4, v5)를 생성합니다.',
      },
      // Keys HSM Tools
      keyshareGenerator: {
        title: '키 공유(Keyshare) 생성기',
        description: 'KCV를 포함한 안전한 키 분할 및 구성 요소 관리를 위한 키 공유를 생성합니다.',
      },
      futurexKeys: {
        title: 'Futurex 키',
        description: '다양한 변형(Variant)을 지원하는 Futurex HSM 키 암호화, 복호화 및 조회 도구입니다.',
      },
      atallaKeys: {
        title: 'Atalla 키 (AKB)',
        description: 'MFK 및 MAC 검증을 포함한 Atalla AKB 포맷 키 암호화 및 복호화 도구입니다.',
      },
      safeNetKeys: {
        title: 'SafeNet 키',
        description: 'KM 키 변형을 지원하는 SafeNet HSM 키 암호화, 복호화 및 조회 도구입니다.',
      },
      thalesKeys: {
        title: 'Thales 키',
        description: '변형을 지원하는 Thales HSM LMK 키 암호화, 복호화 및 조회 도구입니다.',
      },
      thalesKeyBlock: {
        title: 'Thales 키 블록',
        description: 'KBPK 보호가 적용된 Thales 독점 키 블록을 인코딩 및 디코딩합니다.',
      },
      sslCert: {
        title: 'SSL 인증서',
        description: 'RSA 키 생성, CSR 생성, 자체 서명 X.509 인증서 생성 및 인증서 파싱을 수행합니다.',
      },
    },
    // Features
    features: {
      clientSide: {
        title: '100% 브라우저 기반',
        description: '모든 암호화 작업은 브라우저 내에서 전적으로 실행됩니다. 키, PIN 및 민감한 데이터는 기기를 절대 벗어나지 않습니다.',
      },
      free: {
        title: '무료 & 오픈',
        description: '44개 이상의 모든 도구가 완전히 무료입니다. 회원가입, 로그인, 숨겨진 비용이 없습니다. 즉시 사용하세요.',
      },
      paymentReady: {
        title: 'HSM & 결제 준비 완료',
        description: 'Thales, Futurex, Atalla, SafeNet HSM을 위한 전문 도구입니다. TR-31, KCV, PIN 블록 등을 지원합니다.',
      },
    },
  },
};