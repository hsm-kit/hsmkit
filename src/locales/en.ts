// English translations
export default {
  common: {
    copy: 'Copy',
    generate: 'Generate',
    calculate: 'Calculate',
    parse: 'Parse',
    copied: 'Copied to clipboard!',
    error: 'Error',
    result: 'Result',
    loading: 'Loading...',
  },
  
  header: {
    title: 'HSM Kit',
    github: 'GitHub',
  },
  
  menu: {
    keyGenerator: 'Key Gen',
    tr31: 'TR-31',
    kcv: 'KCV Calc',
    pinBlock: 'PIN Block',
  },
  
  footer: {
    copyright: 'HSMKit.com ©2025 | Secure Client-side Calculation',
  },
  
  keyGenerator: {
    title: 'Random Key Generator',
    description: 'Generate cryptographically strong random keys for DES, 3DES, or AES.',
    keyLength: 'Key Length',
    bytes: 'Bytes',
    bits: 'bits',
    generateNow: 'Generate Now',
    generatedKey: 'GENERATED KEY (HEX)',
    kcv: 'KCV',
    length: 'Length',
    
    // Tabs
    tabKeyGen: 'Key Generator',
    tabCombination: 'Key Combination',
    tabParity: 'Parity Enforcement',
    tabValidation: 'Key Validation',
    
    // Key Combination
    combinationTitle: 'Key Component Combination',
    combinationDesc: 'XOR multiple key components to form a complete key',
    component: 'Component',
    components: 'components',
    combinedKey: 'Combined Key',
    addComponent: 'Add Component',
    removeComponent: 'Remove Component',
    combineKeys: 'Combine Keys',
    errorInvalidComponent: 'Component {index} is invalid',
    errorComponentLength: 'All components must have the same length',
    errorComponentLength2: 'Length must be',
    errorMinComponents: 'At least 2 components required',
    errorMaxComponents: 'Maximum 9 components allowed',
    clearAll: 'Clear All',
    
    // Parity Enforcement
    parityTitle: 'Key Parity Adjustment',
    parityDesc: 'Adjust parity bits for DES/3DES keys',
    keyInput: 'Key Input',
    keyInputPlaceholder: 'Enter hexadecimal key',
    parityType: 'Parity Type',
    odd: 'Odd',
    even: 'Even',
    adjustParity: 'Adjust Parity',
    adjustedKey: 'Adjusted Key',
    
    // Key Validation
    validationTitle: 'Key Validity Check',
    validationDesc: 'Check key format, length and parity',
    validateKey: 'Validate Key',
    validKey: 'Valid Key',
    invalidKey: 'Invalid Key',
    keyType: 'Key Type',
    parityStatus: 'Parity Status',
    parityValid: 'Valid',
    parityInvalid: 'Invalid',
  },
  
  kcvCalculator: {
    title: 'KCV Calculator',
    description: 'Calculate Key Check Value to verify key correctness.',
    algorithm: 'Algorithm',
    keyInput: 'Key (Hexadecimal)',
    keyPlaceholder: 'e.g., 0123456789ABCDEFFEDCBA9876543210',
    calculateKCV: 'Calculate KCV',
    keyCheckValue: 'Key Check Value',
    errorInvalidHex: 'Key must be valid hexadecimal characters',
    errorDesLength: 'DES/3DES key length must be 8, 16 or 24 bytes',
    errorAesLength: 'AES key length must be 16, 24 or 32 bytes',
    errorCalculation: 'Calculation failed, please check key format',
    format: 'Format',
    autoAdjustParity: 'Auto-adjust Parity Bits',
    parityAdjustmentHint: 'Some keys may not have correct parity bits set, check this option to auto-correct',
  },
  
  pinBlock: {
    title: 'PIN Block Generator',
    description: 'Generate ISO format PIN Block for payment transactions.',
    format: 'PIN Block Format',
    pinLabel: 'PIN (4-12 digits)',
    pinPlaceholder: 'e.g., 1234',
    panLabel: 'PAN (Primary Account Number)',
    panPlaceholder: 'e.g., 4111111111111111',
    generatePinBlock: 'Generate PIN Block',
    pinBlockHex: 'PIN Block (Hexadecimal)',
    errorInvalidPin: 'PIN must be 4-12 digits',
    errorInvalidPan: 'PAN must be 13-19 digits',
    errorGeneration: 'Generation failed, please check input',
    errorFormat1: 'ISO Format 1 coming soon...',
    pinLengthHint: 'Supports 4-12 digit PIN',
    panHint: 'Enter complete card number (13-19 digits), system will automatically extract rightmost 12 digits (excluding check digit)',
  },
  
  tr31: {
    title: 'TR-31 Key Block Analyzer',
    description: 'Parse and analyze TR-31 format key blocks (ANSI X9.143 standard).',
    keyBlock: 'TR-31 Key Block',
    keyBlockPlaceholder: 'e.g., B0112P0TE00N0000...',
    parseKeyBlock: 'Parse Key Block',
    header: 'Key Block Header',
    version: 'Version',
    keyLength: 'Length',
    keyUsage: 'Key Usage',
    mode: 'Mode',
    keyVersion: 'Key Version',
    exportability: 'Exportability',
    characters: 'characters',
    errorTooShort: 'TR-31 key block length insufficient',
    errorParsing: 'Parsing failed, please check TR-31 format',
    exportable: 'Exportable',
    nonExportable: 'Non-exportable',
    sensitive: 'Sensitive',
    keyBlockFormatHint: 'TR-31 Key Block format (e.g., B0112P0TE00N...), system will auto-validate format',
  },
  
  placeholder: {
    title: 'Coming Soon',
    description: 'This tool is under construction. Stay tuned!',
  },
};

