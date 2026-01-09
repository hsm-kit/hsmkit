// French translations - Home page
export default {
  home: {
    heroTitle: 'Outils gratuits en ligne de chiffrement et de gestion de clés',
    heroDescription: 'Suite complète d\'outils cryptographiques pour les professionnels de la sécurité. Tous les calculs s\'exécutent côté client dans votre navigateur — vos données ne quittent jamais votre appareil.',
    searchPlaceholder: 'Rechercher des outils... (ex. : MD5, AES, PIN Block)',
    availableTools: 'Outils les plus populaires',
    gridView: 'Affichage grille',
    listView: 'Affichage liste',
    whyChoose: 'Pourquoi choisir HSM Kit ?',
    categories: {
      all: 'Tous',
      symmetric: 'Symétrique',
      asymmetric: 'Asymétrique',
      payment: 'Paiement',
      encoding: 'Encodage',
      hashing: 'Hachage',
    },
    // Tool cards
    tools: {
    asn1: {
      title: 'Analyseur ASN.1',
      description: 'Analyser et décoder les structures ASN.1 DER/BER, les certificats X.509 et les formats PKCS.',
    },
    aes: {
      title: 'Chiffrement AES',
      description: 'Chiffrer et déchiffrer des données avec AES-128/192/256 en modes ECB, CBC, CFB, OFB, CTR.',
    },
    des: {
      title: 'Chiffrement DES/3DES',
      description: 'Chiffrement DES et Triple DES avec plusieurs options de padding pour systèmes hérités.',
    },
    rsa: {
      title: 'Chiffrement RSA',
      description: 'Chiffrement asymétrique RSA, déchiffrement, signature numérique et vérification.',
    },
    ecc: {
      title: 'ECC/ECDSA',
      description: 'Cryptographie à courbe elliptique pour des clés compactes et des signatures efficaces.',
    },
    fpe: {
      title: 'Chiffrement préservant le format',
      description: 'FPE (FF1/FF3-1) pour chiffrer des données tout en préservant leur format et longueur.',
    },
    keyGenerator: {
      title: 'Générateur de clés',
      description: 'Générer des clés aléatoires sécurisées pour AES, DES, 3DES. Outils de combinaison de clés et de parité.',
    },
    tr31: {
      title: 'Bloc clé TR-31',
      description: 'Encoder et décoder les blocs de clés TR-31/ANSI X9.143 avec protection KBPK. Prend en charge les versions TDES et AES.',
    },
    kcv: {
      title: 'Calculateur de KCV',
      description: 'Calculer la Key Check Value (KCV) pour la vérification des clés AES et DES/3DES.',
    },
    pinBlock: {
      title: 'Générateur de PIN Block',
      description: 'Générer des PIN Blocks ISO 9564 (Format 0, 1, 3, 4) pour les transactions de paiement.',
    },
    pinBlockGeneral: {
      title: 'PIN Blocks (Général)',
      description: 'Encoder et décoder les PIN Blocks dans tous les formats ISO 9564 (0, 1, 2, 3, 4) avec PAN.',
    },
    pinBlockAes: {
      title: 'PIN Blocks AES',
      description: 'Chiffrement/déchiffrement AES-128 des PIN Blocks ISO 9564 Format 4 avec sortie hex de 32 caractères.',
    },
    pinOffset: {
      title: 'Décalage PIN',
      description: 'Calculer et vérifier le décalage PIN en utilisant la méthode IBM 3624 avec données de validation.',
    },
    pinPvv: {
      title: 'PIN PVV',
      description: 'Calcul du Visa PIN Verification Value (PVV) et vérification du PIN avec PDK/PVKI.',
    },
    as2805: {
      title: 'Outils AS2805',
      description: 'Outils de paiement ISO 8583 australiens avec génération de clés, traduction de PIN block et calcul de MAC.',
    },
    ansiMac: {
      title: 'MAC ANSI (X9.9 & X9.19)',
      description: 'MAC ANSI X9.9/X9.19 avec DES CBC-MAC ou chiffrement 3DES.',
    },
    as2805Mac: {
      title: 'MAC AS2805',
      description: 'MAC AS2805.4.1 pour EFTPOS australien avec Méthode 1 et Méthode 2.',
    },
    tdesCbcMac: {
      title: 'TDES CBC-MAC',
      description: 'TDES CBC-MAC avec TDES 2-key/3-key et padding ISO 9797-1.',
    },
    hmac: {
      title: 'HMAC',
      description: 'MAC basé sur hachage utilisant SHA-256/SHA-512 pour l\'authentification API et l\'intégrité des données.',
    },
    cmac: {
      title: 'CMAC',
      description: 'MAC basé sur chiffre (NIST SP 800-38B) avec AES/TDES et CMAC-96.',
    },
    retailMac: {
      title: 'Retail MAC',
      description: 'Retail MAC ISO 9797-1 Méthode 2 avec DES/3DES pour systèmes POS et ATM.',
    },
    iso9797: {
      title: 'ISO 9797-1 MAC',
      description: 'Calculateur MAC ISO/IEC 9797-1 avec algorithmes 1-6 et plusieurs méthodes de padding.',
    },
    visaCertificates: {
      title: 'Certificats VISA',
      description: 'Valider les certificats d\'émetteur VISA avec VSDC CA V92/V94 et clés CA personnalisées.',
    },
    zka: {
      title: 'ZKA',
      description: 'Norme bancaire allemande avec dérivation de clé de session, chiffrement PIN et calcul MAC.',
    },
    bitmap: {
      title: 'Bitmap ISO8583',
      description: 'Encoder et décoder les bitmaps ISO 8583 pour les messages de paiement. Bitmaps primaire et secondaire pris en charge.',
    },
    cvv: {
      title: 'CVV/CVC',
      description: 'Générer et valider CVV, iCVV, CVV2, dCVV pour la vérification des cartes et la sécurité des paiements.',
    },
    amexCsc: {
      title: 'AMEX CSC',
      description: 'Générer et valider les codes de sécurité AMEX (CSC-5, CSC-4, CSC-3) pour American Express.',
    },
    mastercardCvc3: {
      title: 'MasterCard CVC3',
      description: 'Générer le CVC3 dynamique pour les transactions EMV sans contact MasterCard.',
    },
    // Generic Tools
    hash: {
      title: 'Calculateur de hachage',
      description: 'Calculer des valeurs de hachage en utilisant MD5, SHA-1, SHA-256, SHA-512, BLAKE2 et d\'autres algorithmes.',
    },
    encoding: {
      title: 'Encodage des caractères',
      description: 'Convertir entre ASCII, EBCDIC, Hexadécimal, Binaire et formats décimaux ATM.',
    },
    bcd: {
      title: 'Encodeur/Décodeur BCD',
      description: 'Encoder le décimal en BCD ou décoder le BCD en format décimal.',
    },
    checkDigits: {
      title: 'Chiffres de contrôle',
      description: 'Calculer et vérifier les chiffres de contrôle en utilisant Luhn (MOD 10) et MOD 9.',
    },
    base64: {
      title: 'Base64',
      description: 'Encoder et décoder des données en utilisant l\'encodage binaire-vers-texte Base64.',
    },
    base94: {
      title: 'Base94',
      description: 'Encodage compact utilisant les 94 caractères ASCII imprimables.',
    },
    messageParser: {
      title: 'Analyseur de messages',
      description: 'Analyser les formats de messages financiers ATM NDC, Wincor et ISO 8583.',
    },
    dukpt: {
      title: 'DUKPT (ISO 9797)',
      description: 'Dériver PEK à partir de BDK/IPEK et KSN. Chiffrer/déchiffrer le PIN, calculer le MAC, traiter des données.',
    },
    dukptAes: {
      title: 'DUKPT (AES)',
      description: 'DUKPT avec prise en charge AES (2TDEA, 3TDEA, AES-128/192/256). Dériver les clés de travail et traiter les données.',
    },
    rsaDer: {
      title: 'Clé publique RSA DER',
      description: 'Encoder/décoder les clés publiques RSA entre modulus/exposant et format DER.',
    },
    uuid: {
      title: 'Générateur d\'UUID',
      description: 'Générer des identifiants universellement uniques (UUID v1, v3, v4, v5).',
    },
    // Keys HSM Tools
    keyshareGenerator: {
      title: 'Générateur de parts de clé',
      description: 'Générer des parts de clé pour une séparation sécurisée des clés et la gestion des composants avec KCV.',
    },
    futurexKeys: {
      title: 'Clés Futurex',
      description: 'Chiffrement/déchiffrement et recherche de clés HSM Futurex avec plusieurs variantes.',
    },
    atallaKeys: {
      title: 'Clés Atalla (AKB)',
      description: 'Chiffrement/déchiffrement de clés au format Atalla AKB avec MFK et vérification MAC.',
    },
    safeNetKeys: {
      title: 'Clés SafeNet',
      description: 'Chiffrement/déchiffrement et recherche de clés HSM SafeNet avec variantes de clé KM.',
    },
    thalesKeys: {
      title: 'Clés Thales',
      description: 'Chiffrement/déchiffrement et recherche de clés LMK Thales avec variantes.',
    },
    thalesKeyBlock: {
      title: 'Bloc clé Thales',
      description: 'Encoder et décoder les blocs de clés propriétaires Thales avec protection KBPK.',
    },
    sslCert: {
      title: 'Certificats SSL',
      description: 'Générer des clés RSA, créer des CSR, certificats X.509 auto-signés et analyser des certificats.',
    },
  },
  // Features
  features: {
    clientSide: {
      title: '100% basé sur le navigateur',
      description: 'Toutes les opérations cryptographiques s\'exécutent entièrement dans votre navigateur. Vos clés, PIN et données sensibles ne quittent jamais votre appareil.',
    },
    free: {
      title: 'Gratuit et open-source',
      description: 'Les 44+ outils sont entièrement gratuits. Aucune inscription, aucun login, aucun coût caché. Utilisez instantanément.',
    },
    paymentReady: {
      title: 'Prêt HSM & Paiement',
      description: 'Outils professionnels pour HSM Thales, Futurex, Atalla, SafeNet. TR-31, KCV, PIN Block et plus.',
    },
  },
  },
};
