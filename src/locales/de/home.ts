// German translations - Home page
export default {
  home: {
    heroTitle: 'Kostenlose Online-Tools für Verschlüsselung & Schlüsselverwaltung',
    heroDescription: 'Eine umfassende Suite kryptografischer Werkzeuge für Sicherheitsexperten. Alle Berechnungen erfolgen clientseitig in Ihrem Browser — Ihre Daten verlassen niemals Ihr Gerät.',
    searchPlaceholder: 'Tools durchsuchen... (z. B. MD5, AES, PIN Block)',
    availableTools: 'Beliebteste Tools',
    gridView: 'Rasteransicht',
    listView: 'Listenansicht',
    whyChoose: 'Warum HSM Kit wählen?',
    categories: {
      all: 'Alle',
      symmetric: 'Symmetrisch',
      asymmetric: 'Asymmetrisch',
      payment: 'Zahlung',
      encoding: 'Kodierung',
      hashing: 'Hashing',
    },
    // Tool cards
    tools: {
    asn1: {
      title: 'ASN.1-Parser',
      description: 'ASN.1 DER/BER-Strukturen parsen und analysieren, X.509-Zertifikate und PKCS-Formate dekodieren.',
    },
    aes: {
      title: 'AES-Verschlüsselung',
      description: 'Daten mit AES-128/192/256 in den Modi ECB, CBC, CFB, OFB, CTR verschlüsseln und entschlüsseln.',
    },
    des: {
      title: 'DES/3DES-Verschlüsselung',
      description: 'DES- und Triple-DES-Verschlüsselung mit verschiedenen Padding-Optionen für Legacy-Systeme.',
    },
    rsa: {
      title: 'RSA-Verschlüsselung',
      description: 'Asymmetrische RSA-Verschlüsselung, Entschlüsselung, digitale Signatur und Verifikation.',
    },
    ecc: {
      title: 'ECC/ECDSA',
      description: 'Elliptische Kurven-Kryptographie für kompakte Schlüssel und effiziente digitale Signaturen.',
    },
    fpe: {
      title: 'Formaterhaltende Verschlüsselung',
      description: 'FPE (FF1/FF3-1) zum Verschlüsseln von Daten bei Erhalt von Format und Länge.',
    },
    keyGenerator: {
      title: 'Schlüsselgenerator',
      description: 'Sichere Zufallsschlüssel für AES, DES und 3DES erzeugen. Werkzeuge zur Schlüsselkombination und Parität.',
    },
    tr31: {
      title: 'TR-31 Key Block',
      description: 'TR-31/ANSI X9.143 Key Blocks mit KBPK-Schutz kodieren und dekodieren. Unterstützt TDES- und AES-Versionen.',
    },
    kcv: {
      title: 'KCV-Rechner',
      description: 'Key Check Value (KCV) zur Verifikation von AES- und DES/3DES-Schlüsseln berechnen.',
    },
    pinBlock: {
      title: 'PIN-Block-Generator',
      description: 'ISO 9564 PIN-Blöcke (Format 0, 1, 3, 4) für Zahlungstransaktionen erzeugen.',
    },
    pinBlockGeneral: {
      title: 'PIN-Blöcke (Allgemein)',
      description: 'PIN-Blöcke in allen ISO 9564-Formaten (0,1,2,3,4) mit PAN kodieren und dekodieren.',
    },
    pinBlockAes: {
      title: 'PIN-Blöcke (AES)',
      description: 'AES-128 Verschlüsselung/Entschlüsselung von ISO 9564 Format 4 PIN-Blöcken mit 32 hex Ausgabe.',
    },
    pinOffset: {
      title: 'PIN-Offset',
      description: 'PIN-Offset mithilfe der IBM 3624-Methode mit Validierungsdaten berechnen und verifizieren.',
    },
    pinPvv: {
      title: 'PIN PVV',
      description: 'Visa PIN Verification Value (PVV) Berechnung und PIN-Verifikation mit PDK/PVKI.',
    },
    as2805: {
      title: 'AS2805 Nachrichtentools',
      description: 'Australische ISO 8583 Zahlungstools mit Schlüsselerzeugung, PIN-Block-Übersetzung und MAC-Berechnung.',
    },
    ansiMac: {
      title: 'ANSI MAC (X9.9 & X9.19)',
      description: 'ANSI X9.9/X9.19 MAC mit DES CBC-MAC oder 3DES-Verschlüsselung.',
    },
    as2805Mac: {
      title: 'AS2805 MAC',
      description: 'AS2805.4.1 MAC für australisches EFTPOS mit Methode 1 und Methode 2.',
    },
    tdesCbcMac: {
      title: 'TDES CBC-MAC',
      description: 'Triple-DES CBC-MAC mit 2-Key/3-Key TDES und ISO 9797-1 Padding.',
    },
    hmac: {
      title: 'HMAC',
      description: 'Hash-basierter MAC mit SHA-256/SHA-512 für API-Authentifizierung und Datenintegrität.',
    },
    cmac: {
      title: 'CMAC',
      description: 'NIST SP 800-38B Cipher-basierter MAC mit AES/TDES und CMAC-96.',
    },
    retailMac: {
      title: 'Retail MAC',
      description: 'ISO 9797-1 Methode 2 Retail MAC mit DES/3DES für POS- und ATM-Systeme.',
    },
    iso9797: {
      title: 'ISO 9797-1 MAC',
      description: 'ISO/IEC 9797-1 MAC-Rechner mit Algorithmen 1–6 und verschiedenen Padding-Methoden.',
    },
    visaCertificates: {
      title: 'VISA-Zertifikate',
      description: 'VISA-Ausstellerzertifikate mit VSDC CA V92/V94 und benutzerdefinierten CA-Schlüsseln validieren.',
    },
    zka: {
      title: 'ZKA',
      description: 'Deutsche Bankennorm mit Sitzungsschlüsselableitung, PIN-Verschlüsselung und MAC-Berechnung.',
    },
    bitmap: {
      title: 'ISO8583 Bitmap',
      description: 'ISO 8583 Bitmaps für Zahlungnachrichten kodieren und dekodieren. Primäre und sekundäre Bitmaps werden unterstützt.',
    },
    cvv: {
      title: 'CVV/CVC',
      description: 'CVV, iCVV, CVV2, dCVV für Kartenverifikation und Zahlungssicherheit erzeugen und validieren.',
    },
    amexCsc: {
      title: 'AMEX CSC',
      description: 'AMEX Card Security Codes (CSC-5, CSC-4, CSC-3) erzeugen und validieren.',
    },
    mastercardCvc3: {
      title: 'MasterCard CVC3',
      description: 'Dynamisches CVC3 für MasterCard kontaktlose EMV-Transaktionen erzeugen.',
    },
    // Generic Tools
    hash: {
      title: 'Hash-Rechner',
      description: 'Hash-Werte mit MD5, SHA-1, SHA-256, SHA-512, BLAKE2 und weiteren Algorithmen berechnen.',
    },
    encoding: {
      title: 'Zeichenkodierung',
      description: 'Konvertiert zwischen ASCII, EBCDIC, Hexadezimal, Binär und ATM-Dezimalformaten.',
    },
    bcd: {
      title: 'BCD Kodierer/Dekodierer',
      description: 'Dezimal in BCD kodieren oder BCD zurück in Dezimal dekodieren.',
    },
    checkDigits: {
      title: 'Prüfziffern',
      description: 'Prüfziffern mit Luhn (MOD 10) und MOD 9 Algorithmen berechnen und verifizieren.',
    },
    base64: {
      title: 'Base64',
      description: 'Daten mit Base64 Binär-zu-Text-Kodierung kodieren und dekodieren.',
    },
    base94: {
      title: 'Base94',
      description: 'Kompakte Kodierung unter Verwendung aller 94 druckbaren ASCII-Zeichen.',
    },
    messageParser: {
      title: 'Nachrichten-Parser',
      description: 'ATM NDC-, Wincor- und ISO 8583 Finanznachrichtenformate parsen.',
    },
    dukpt: {
      title: 'DUKPT (ISO 9797)',
      description: 'PEK aus BDK/IPEK und KSN ableiten. PIN verschlüsseln/entschlüsseln, MAC berechnen, Daten verarbeiten.',
    },
    dukptAes: {
      title: 'DUKPT (AES)',
      description: 'DUKPT mit AES-Unterstützung (2TDEA, 3TDEA, AES-128/192/256). Arbeitschlüssel ableiten und Daten verarbeiten.',
    },
    rsaDer: {
      title: 'RSA DER öffentlicher Schlüssel',
      description: 'RSA-Public-Keys zwischen Modul/Exponent und DER-Format kodieren/dekodieren.',
    },
    uuid: {
      title: 'UUID-Generator',
      description: 'Universell eindeutige Bezeichner (UUID v1, v3, v4, v5) erzeugen.',
    },
    // Keys HSM Tools
    keyshareGenerator: {
      title: 'Keyshare-Generator',
      description: 'Keyshares für sicheres Schlüssel-Splitting und Komponentenverwaltung mit KCV erzeugen.',
    },
    futurexKeys: {
      title: 'Futurex-Schlüssel',
      description: 'Futurex HSM Schlüsselverschlüsselung, -entschlüsselung und Lookup mit mehreren Varianten.',
    },
    atallaKeys: {
      title: 'Atalla-Schlüssel (AKB)',
      description: 'Atalla AKB-Format Schlüsselverschlüsselung und -entschlüsselung mit MFK- und MAC-Prüfung.',
    },
    safeNetKeys: {
      title: 'SafeNet-Schlüssel',
      description: 'SafeNet HSM Schlüsselverschlüsselung, -entschlüsselung und Lookup mit KM-Schlüsselvarianten.',
    },
    thalesKeys: {
      title: 'Thales-Schlüssel',
      description: 'Thales HSM LMK-Schlüsselverschlüsselung, -entschlüsselung und Lookup mit Varianten.',
    },
    thalesKeyBlock: {
      title: 'Thales Key Block',
      description: 'Thales proprietäre Key Blocks mit KBPK-Schutz kodieren und dekodieren.',
    },
    sslCert: {
      title: 'SSL-Zertifikate',
      description: 'RSA-Schlüssel generieren, CSRs erstellen, selbstsignierte X.509-Zertifikate erzeugen und Zertifikate analysieren.',
    },
  },
  // Features
  features: {
    clientSide: {
      title: '100% Browser-basiert',
      description: 'Alle kryptografischen Operationen laufen vollständig in Ihrem Browser. Ihre Schlüssel, PINs und sensiblen Daten verlassen niemals Ihr Gerät.',
    },
    free: {
      title: 'Kostenlos & Open Source',
      description: 'Alle 44+ Tools sind vollständig kostenlos. Keine Registrierung, kein Login, keine versteckten Kosten. Sofort nutzbar.',
    },
    paymentReady: {
      title: 'HSM & Zahlungsbereit',
      description: 'Professionelle Werkzeuge für Thales, Futurex, Atalla und SafeNet HSMs. TR-31, KCV, PIN-Block und mehr.',
    },
  },
  },
};
