// 中文翻译
export default {
  common: {
    copy: '复制',
    generate: '生成',
    calculate: '计算',
    parse: '解析',
    copied: '已复制到剪贴板！',
    error: '错误',
    result: '结果',
    loading: '加载中...',
  },
  
  header: {
    title: 'HSM Kit',
    github: 'GitHub',
  },
  
  menu: {
    keyGenerator: '密钥生成器',
    tr31: 'TR-31 密钥块',
    kcv: 'KCV 计算器',
    pinBlock: 'PIN Block',
  },
  
  footer: {
    copyright: 'HSMKit.com ©2025 | 客户端安全计算',
  },
  
  keyGenerator: {
    title: '随机密钥生成器',
    description: '生成符合加密标准的强随机密钥，支持 DES、3DES 和 AES',
    keyLength: '密钥长度',
    bytes: '字节',
    bits: '位',
    generateNow: '立即生成',
    generatedKey: '生成的密钥（十六进制）',
    kcv: 'KCV',
    length: '长度',
  },
  
  kcvCalculator: {
    title: 'KCV 计算器',
    description: '计算密钥校验值 (Key Check Value)，用于验证密钥的正确性',
    algorithm: '算法类型',
    keyInput: '密钥（十六进制）',
    keyPlaceholder: '例如: 0123456789ABCDEFFEDCBA9876543210',
    calculateKCV: '计算 KCV',
    keyCheckValue: '密钥校验值',
    errorInvalidHex: '密钥必须是有效的十六进制字符',
    errorDesLength: 'DES/3DES 密钥长度必须是 8、16 或 24 字节',
    errorAesLength: 'AES 密钥长度必须是 16、24 或 32 字节',
    errorCalculation: '计算失败，请检查输入的密钥格式',
    format: '格式',
  },
  
  pinBlock: {
    title: 'PIN Block 生成器',
    description: '生成 ISO 格式的 PIN Block，用于支付交易中的 PIN 加密',
    format: 'PIN Block 格式',
    pinLabel: 'PIN（4-12位数字）',
    pinPlaceholder: '例如: 1234',
    panLabel: 'PAN（主账号/卡号）',
    panPlaceholder: '例如: 4111111111111111',
    generatePinBlock: '生成 PIN Block',
    pinBlockHex: 'PIN Block（十六进制）',
    errorInvalidPin: 'PIN 必须是 4-12 位数字',
    errorInvalidPan: 'PAN（卡号）必须是 13-19 位数字',
    errorGeneration: '生成失败，请检查输入',
    errorFormat1: 'ISO Format 1 功能开发中...',
  },
  
  tr31: {
    title: 'TR-31 密钥块分析器',
    description: '解析和分析 TR-31 格式的密钥块（ANSI X9.143 标准）',
    keyBlock: 'TR-31 密钥块',
    keyBlockPlaceholder: '例如: B0112P0TE00N0000...',
    parseKeyBlock: '解析密钥块',
    header: '密钥块头部',
    version: '版本',
    keyLength: '长度',
    keyUsage: '密钥用途',
    mode: '模式',
    keyVersion: '版本号',
    exportability: '可导出性',
    characters: '字符',
    errorTooShort: 'TR-31 密钥块长度不足',
    errorParsing: '解析失败，请检查 TR-31 格式',
    exportable: '可导出',
    nonExportable: '不可导出',
    sensitive: '敏感',
  },
  
  placeholder: {
    title: '开发中',
    description: '该工具正在开发中，敬请期待！',
  },
};

