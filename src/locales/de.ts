// German translations
export default {
  common: {
    copy: 'Kopieren',
    generate: 'Generieren',
    calculate: 'Berechnen',
    parse: 'Analysieren',
    copied: 'In die Zwischenablage kopiert!',
    error: 'Fehler',
    result: 'Ergebnis',
    loading: 'Wird geladen...',
  },
  
  header: {
    title: 'HSM Kit',
    github: 'GitHub',
  },
  
  menu: {
    keyGenerator: 'Schlüssel Gen.',
    tr31: 'TR-31',
    kcv: 'KCV Rechner',
    pinBlock: 'PIN-Block',
  },
  
  footer: {
    copyright: 'HSMKit.com ©2025 | Sichere clientseitige Berechnung',
  },
  
  keyGenerator: {
    title: 'Zufälliger Schlüsselgenerator',
    description: 'Generieren Sie kryptografisch starke Zufallsschlüssel für DES, 3DES oder AES.',
    keyLength: 'Schlüssellänge',
    bytes: 'Bytes',
    bits: 'Bits',
    generateNow: 'Jetzt generieren',
    generatedKey: 'Generierter Schlüssel (Hexadezimal)',
    kcv: 'KCV',
    length: 'Länge',
  },
  
  kcvCalculator: {
    title: 'KCV-Rechner',
    description: 'Berechnen Sie den Schlüsselprüfwert zur Überprüfung der Schlüsselkorrektheit.',
    algorithm: 'Algorithmus',
    keyInput: 'Schlüssel (Hexadezimal)',
    keyPlaceholder: 'z.B.: 0123456789ABCDEFFEDCBA9876543210',
    calculateKCV: 'KCV berechnen',
    keyCheckValue: 'Schlüsselprüfwert',
    errorInvalidHex: 'Der Schlüssel muss aus gültigen Hexadezimalzeichen bestehen',
    errorDesLength: 'DES/3DES-Schlüssellänge muss 8, 16 oder 24 Bytes betragen',
    errorAesLength: 'AES-Schlüssellänge muss 16, 24 oder 32 Bytes betragen',
    errorCalculation: 'Berechnung fehlgeschlagen, bitte Schlüsselformat überprüfen',
    format: 'Format',
  },
  
  pinBlock: {
    title: 'PIN-Block-Generator',
    description: 'Generieren Sie ISO-Format-PIN-Blöcke für Zahlungstransaktionen.',
    format: 'PIN-Block-Format',
    pinLabel: 'PIN (4-12 Ziffern)',
    pinPlaceholder: 'z.B.: 1234',
    panLabel: 'PAN (Primäre Kontonummer)',
    panPlaceholder: 'z.B.: 4111111111111111',
    generatePinBlock: 'PIN-Block generieren',
    pinBlockHex: 'PIN-Block (Hexadezimal)',
    errorInvalidPin: 'PIN muss 4-12 Ziffern lang sein',
    errorInvalidPan: 'PAN muss 13-19 Ziffern lang sein',
    errorGeneration: 'Generierung fehlgeschlagen, bitte Eingabe überprüfen',
    errorFormat1: 'ISO Format 1 in Kürze verfügbar...',
  },
  
  tr31: {
    title: 'TR-31-Schlüsselblock-Analysator',
    description: 'Analysieren und untersuchen Sie TR-31-Format-Schlüsselblöcke (ANSI X9.143-Standard).',
    keyBlock: 'TR-31-Schlüsselblock',
    keyBlockPlaceholder: 'z.B.: B0112P0TE00N0000...',
    parseKeyBlock: 'Schlüsselblock analysieren',
    header: 'Schlüsselblock-Header',
    version: 'Version',
    keyLength: 'Länge',
    keyUsage: 'Schlüsselverwendung',
    mode: 'Modus',
    keyVersion: 'Schlüsselversion',
    exportability: 'Exportierbarkeit',
    characters: 'Zeichen',
    errorTooShort: 'TR-31-Schlüsselblocklänge unzureichend',
    errorParsing: 'Analyse fehlgeschlagen, bitte TR-31-Format überprüfen',
    exportable: 'Exportierbar',
    nonExportable: 'Nicht exportierbar',
    sensitive: 'Sensibel',
  },
  
  placeholder: {
    title: 'Demnächst verfügbar',
    description: 'Dieses Tool befindet sich in der Entwicklung. Bleiben Sie dran!',
  },
};

