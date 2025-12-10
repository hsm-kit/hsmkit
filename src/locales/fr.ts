// French translations
export default {
  common: {
    copy: 'Copier',
    generate: 'Générer',
    calculate: 'Calculer',
    parse: 'Analyser',
    copied: 'Copié dans le presse-papiers !',
    error: 'Erreur',
    result: 'Résultat',
    loading: 'Chargement...',
  },
  
  header: {
    title: 'HSM Kit',
    github: 'GitHub',
  },
  
  menu: {
    keyGenerator: 'Gén. Clé',
    tr31: 'TR-31',
    kcv: 'Calc. KCV',
    pinBlock: 'Bloc PIN',
  },
  
  footer: {
    copyright: 'HSMKit.com ©2025 | Calcul sécurisé côté client',
  },
  
  keyGenerator: {
    title: 'Générateur de Clés Aléatoires',
    description: 'Générez des clés aléatoires cryptographiquement fortes pour DES, 3DES ou AES.',
    keyLength: 'Longueur de Clé',
    bytes: 'Octets',
    bits: 'Bits',
    generateNow: 'Générer maintenant',
    generatedKey: 'Clé Générée (Hexadécimal)',
    kcv: 'KCV',
    length: 'Longueur',
  },
  
  kcvCalculator: {
    title: 'Calculateur KCV',
    description: 'Calculez la valeur de vérification de clé pour vérifier l\'exactitude de la clé.',
    algorithm: 'Algorithme',
    keyInput: 'Clé (Hexadécimal)',
    keyPlaceholder: 'ex : 0123456789ABCDEFFEDCBA9876543210',
    calculateKCV: 'Calculer KCV',
    keyCheckValue: 'Valeur de Vérification de Clé',
    errorInvalidHex: 'La clé doit contenir des caractères hexadécimaux valides',
    errorDesLength: 'La longueur de clé DES/3DES doit être de 8, 16 ou 24 octets',
    errorAesLength: 'La longueur de clé AES doit être de 16, 24 ou 32 octets',
    errorCalculation: 'Échec du calcul, veuillez vérifier le format de la clé',
    format: 'Format',
  },
  
  pinBlock: {
    title: 'Générateur de Bloc PIN',
    description: 'Générez des blocs PIN au format ISO pour les transactions de paiement.',
    format: 'Format de Bloc PIN',
    pinLabel: 'PIN (4-12 chiffres)',
    pinPlaceholder: 'ex : 1234',
    panLabel: 'PAN (Numéro de Compte Principal)',
    panPlaceholder: 'ex : 4111111111111111',
    generatePinBlock: 'Générer le Bloc PIN',
    pinBlockHex: 'Bloc PIN (Hexadécimal)',
    errorInvalidPin: 'Le PIN doit comporter 4 à 12 chiffres',
    errorInvalidPan: 'Le PAN doit comporter 13 à 19 chiffres',
    errorGeneration: 'Échec de la génération, veuillez vérifier la saisie',
    errorFormat1: 'ISO Format 1 à venir...',
  },
  
  tr31: {
    title: 'Analyseur de Bloc de Clé TR-31',
    description: 'Analysez et examinez les blocs de clé au format TR-31 (norme ANSI X9.143).',
    keyBlock: 'Bloc de Clé TR-31',
    keyBlockPlaceholder: 'ex : B0112P0TE00N0000...',
    parseKeyBlock: 'Analyser le Bloc de Clé',
    header: 'En-tête du Bloc de Clé',
    version: 'Version',
    keyLength: 'Longueur',
    keyUsage: 'Usage de la Clé',
    mode: 'Mode',
    keyVersion: 'Version de la Clé',
    exportability: 'Exportabilité',
    characters: 'caractères',
    errorTooShort: 'Longueur du bloc de clé TR-31 insuffisante',
    errorParsing: 'Échec de l\'analyse, veuillez vérifier le format TR-31',
    exportable: 'Exportable',
    nonExportable: 'Non exportable',
    sensitive: 'Sensible',
  },
  
  placeholder: {
    title: 'Bientôt disponible',
    description: 'Cet outil est en cours de développement. Restez à l\'écoute !',
  },
};

