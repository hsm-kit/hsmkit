// Japanese translations - Home page
export default {
  home: {
    heroTitle: '無料のオンライン暗号化＆鍵管理ツール',
    heroDescription: 'セキュリティ専門家のための包括的な暗号化ツールスイート。すべての計算はブラウザ内のクライアントサイドで実行され、データがデバイスから離れることはありません。',
    searchPlaceholder: 'ツールを検索... (例: MD5, AES, PIN Block)',
    availableTools: '人気のツール',
    gridView: 'グリッド表示',
    listView: 'リスト表示',
    whyChoose: 'HSM Kit が選ばれる理由',
    categories: {
      all: 'すべて',
      symmetric: '共通鍵暗号',
      asymmetric: '公開鍵暗号',
      payment: '決済・金融',
      encoding: 'エンコーディング',
      hashing: 'ハッシュ',
    },
    // Tool cards
    tools: {
      asn1: {
        title: 'ASN.1 パーサー',
        description: 'ASN.1 DER/BER 構造の解析と分析、X.509 証明書および PKCS 形式のデコード。',
      },
      aes: {
        title: 'AES 暗号化',
        description: 'ECB、CBC、CFB、OFB、CTR モードを使用した AES-128/192/256 によるデータの暗号化と復号。',
      },
      des: {
        title: 'DES/3DES 暗号化',
        description: 'レガシーシステム向けの複数のパディングオプションを備えた DES および Triple DES 暗号化。',
      },
      rsa: {
        title: 'RSA 暗号化',
        description: 'RSA 非対称暗号化、復号、デジタル署名、および検証。',
      },
      ecc: {
        title: 'ECC/ECDSA',
        description: 'コンパクトな鍵と効率的なデジタル署名のための楕円曲線暗号。',
      },
      fpe: {
        title: 'フォーマット保持暗号化 (FPE)',
        description: 'フォーマットと長さを維持したままデータを暗号化する FPE (FF1/FF3-1)。',
      },
      keyGenerator: {
        title: '鍵生成 (Key Generator)',
        description: 'AES、DES、3DES 用の安全なランダムキーを生成。鍵結合およびパリティツール付き。',
      },
      tr31: {
        title: 'TR-31 キーブロック',
        description: 'KBPK 保護を使用した TR-31/ANSI X9.143 キーブロックのエンコードとデコード。TDES および AES バージョンをサポート。',
      },
      kcv: {
        title: 'KCV 計算機',
        description: 'AES および DES/3DES 鍵の検証のための鍵チェック値 (KCV) を計算。',
      },
      pinBlock: {
        title: 'PIN ブロック生成',
        description: '決済取引のための ISO 9564 PIN ブロック (フォーマット 0, 1, 3, 4) を生成。',
      },
      pinBlockGeneral: {
        title: 'PIN ブロック (ISO 9564)',
        description: 'PAN を使用したすべての ISO 9564 フォーマット (0, 1, 2, 3, 4) の PIN ブロックのエンコードとデコード。',
      },
      pinBlockAes: {
        title: 'PIN ブロック (AES)',
        description: 'ISO 9564 フォーマット 4 PIN ブロックの AES-128 暗号化/復号 (32 hex 出力)。',
      },
      pinOffset: {
        title: 'PIN オフセット',
        description: '検証データを使用した IBM 3624 メソッドによる PIN オフセットの計算と検証。',
      },
      pinPvv: {
        title: 'PIN PVV',
        description: 'PDK/PVKI を使用した Visa PIN Verification Value (PVV) の計算と PIN 検証。',
      },
      as2805: {
        title: 'AS2805 メッセージツール',
        description: '鍵生成、PIN ブロック変換、MAC 計算を備えたオーストラリア ISO 8583 決済ツール。',
      },
      ansiMac: {
        title: 'ANSI MAC (X9.9 & X9.19)',
        description: 'DES CBC-MAC または 3DES 暗号化を使用した ANSI X9.9/X9.19 MAC。',
      },
      as2805Mac: {
        title: 'AS2805 MAC',
        description: 'オーストラリア EFTPOS 向けの AS2805.4.1 MAC (Method 1 および Method 2)。',
      },
      tdesCbcMac: {
        title: 'TDES CBC-MAC',
        description: '2キー/3キー TDES と ISO 9797-1 パディングを使用した Triple DES CBC-MAC。',
      },
      hmac: {
        title: 'HMAC',
        description: 'API 認証とデータ整合性のための SHA-256/SHA-512 を使用したハッシュベース MAC。',
      },
      cmac: {
        title: 'CMAC',
        description: 'AES/TDES および CMAC-96 をサポートする NIST SP 800-38B 暗号ベース MAC。',
      },
      retailMac: {
        title: 'Retail MAC',
        description: 'POS および ATM システム向けの DES/3DES を使用した ISO 9797-1 Method 2 Retail MAC。',
      },
      iso9797: {
        title: 'ISO 9797-1 MAC',
        description: 'アルゴリズム 1-6 および複数のパディング方式を備えた ISO/IEC 9797-1 MAC 計算機。',
      },
      visaCertificates: {
        title: 'VISA 証明書',
        description: 'VSDC CA V92/V94 およびカスタム CA キーを使用した VISA 発行者証明書の検証。',
      },
      zka: {
        title: 'ZKA',
        description: 'セッションキー導出、PIN 暗号化、MAC 計算を備えたドイツ銀行標準。',
      },
      bitmap: {
        title: 'ISO8583 ビットマップ',
        description: '決済メッセージ用の ISO 8583 ビットマップのエンコードとデコード。プライマリおよびセカンダリビットマップをサポート。',
      },
      cvv: {
        title: 'CVV/CVC',
        description: 'カード検証と決済セキュリティのための CVV、iCVV、CVV2、dCVV の生成と検証。',
      },
      amexCsc: {
        title: 'AMEX CSC',
        description: 'American Express 用のカードセキュリティコード (CSC-5, CSC-4, CSC-3) の生成と検証。',
      },
      mastercardCvc3: {
        title: 'MasterCard CVC3',
        description: 'MasterCard 非接触 EMV 取引のためのダイナミック CVC3 の生成。',
      },
      // Generic Tools
      hash: {
        title: 'ハッシュ計算機',
        description: 'MD5、SHA-1、SHA-256、SHA-512、BLAKE2 などのアルゴリズムを使用したハッシュ値の計算。',
      },
      encoding: {
        title: '文字コード変換',
        description: 'ASCII、EBCDIC、16進数、バイナリ、ATM Decimal 形式間の変換。',
      },
      bcd: {
        title: 'BCD エンコーダー/デコーダー',
        description: '10進数の BCD エンコード、または BCD の10進数形式へのデコード。',
      },
      checkDigits: {
        title: 'チェックデジット',
        description: 'Luhn (MOD 10) および MOD 9 アルゴリズムを使用したチェックデジットの計算と検証。',
      },
      base64: {
        title: 'Base64',
        description: 'Base64 バイナリ・テキスト・エンコーディングを使用したデータのエンコードとデコード。',
      },
      base94: {
        title: 'Base94',
        description: '94個の印刷可能な ASCII 文字すべてを使用したコンパクトなエンコーディング。',
      },
      messageParser: {
        title: 'メッセージパーサー',
        description: 'ATM NDC、Wincor、および ISO 8583 金融メッセージ形式の解析。',
      },
      dukpt: {
        title: 'DUKPT (ISO 9797)',
        description: 'BDK/IPEK と KSN からの PEK 導出。PIN 暗号化/復号、MAC 計算、データ処理。',
      },
      dukptAes: {
        title: 'DUKPT (AES)',
        description: 'AES 対応 DUKPT (2TDEA, 3TDEA, AES-128/192/256)。ワーキングキーの導出とデータ処理。',
      },
      rsaDer: {
        title: 'RSA DER 公開鍵',
        description: 'モジュラス/指数と DER 形式間での RSA 公開鍵のエンコード/デコード。',
      },
      uuid: {
        title: 'UUID 生成',
        description: '汎用一意識別子 (UUID v1, v3, v4, v5) の生成。',
      },
      // Keys HSM Tools
      keyshareGenerator: {
        title: 'キーシェア生成',
        description: '安全な鍵分割とコンポーネント管理のためのキーシェア生成（KCV付き）。',
      },
      futurexKeys: {
        title: 'Futurex キー',
        description: '複数のバリアントを使用した Futurex HSM 鍵の暗号化、復号、および検索。',
      },
      atallaKeys: {
        title: 'Atalla キー (AKB)',
        description: 'MFK と MAC 検証を使用した Atalla AKB 形式の鍵暗号化と復号。',
      },
      safeNetKeys: {
        title: 'SafeNet キー',
        description: 'KM キーバリアントを使用した SafeNet HSM 鍵の暗号化、復号、および検索。',
      },
      thalesKeys: {
        title: 'Thales キー',
        description: 'バリアントを使用した Thales HSM LMK 鍵の暗号化、復号、および検索。',
      },
      thalesKeyBlock: {
        title: 'Thales キーブロック',
        description: 'KBPK 保護を使用した Thales 独自キーブロックのエンコードとデコード。',
      },
      sslCert: {
        title: 'SSL 証明書',
        description: 'RSA 鍵の生成、CSR の作成、自己署名 X.509 証明書の生成、および証明書の解析。',
      },
    },
    // Features
    features: {
      clientSide: {
        title: '完全ブラウザベース',
        description: 'すべての暗号化操作はブラウザ内で完全に実行されます。鍵、PIN、機密データがデバイスから離れることはありません。',
      },
      free: {
        title: '無料＆オープン',
        description: '44種類以上のツールすべてが完全に無料です。登録、ログイン、隠れたコストは一切ありません。すぐにご利用いただけます。',
      },
      paymentReady: {
        title: 'HSM & 決済対応',
        description: 'Thales、Futurex、Atalla、SafeNet HSM 用のプロフェッショナルツール。TR-31、KCV、PIN ブロックなどをサポート。',
      },
    },
  },
};