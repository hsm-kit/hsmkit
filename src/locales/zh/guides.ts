// Chinese translations - Guides section
export default {
  guides: {
    // Page title and hero section
    title: '安全知识库',
    subtitle: '深入了解密码学、支付安全和 HSM 管理的指南。',
    heroTagline: '掌握工具背后的概念。',
    searchPlaceholder: '搜索指南、算法或概念...',
    
    // Header button
    exploreTools: '探索工具',
    
    // Category filters
    categories: {
      all: '所有指南',
      concept: '概念',
      tutorial: '教程',
      bestPractice: '最佳实践',
    },
    
    // Article categories (mapped from tool categories)
    articleCategories: {
      Keys: '密钥管理',
      Payment: '支付安全',
      Cipher: '加密',
      Generic: '通用',
      PKI: 'PKI 与证书',
    },
    
    // List page
    featuredGuides: '精选指南',
    latestGuides: '最新指南',
    allGuides: '所有指南',
    readMore: '阅读更多',
    minRead: '分钟阅读',
    lastUpdated: '最后更新',
    noArticles: '未找到文章。',
    noSearchResults: '未找到"{term}"相关指南。尝试搜索"AES"或"密钥"。',
    
    // Article page
    onThisPage: '本页内容',
    relatedTool: '相关工具',
    openTool: '打开工具',
    needToCalculate: '现在需要计算吗？',
    useOurTool: '使用我们免费的在线 {toolName} 工具。',
    backToGuides: '返回指南',
    readNext: '继续阅读',
    articleNotFound: '文章未找到',
    articleNotFoundDesc: '未找到请求的文章。',
    invalidArticle: '无效文章',
    byTeam: 'HSM Kit 团队',
    translationNotice: '此文章显示为英文版本，翻译即将推出。',
    searchResults: '搜索结果',
    articlesCount: '篇文章',
    
    // Breadcrumb
    home: '首页',
    
    // SEO
    seoTitle: '安全知识库 - HSM Kit 指南',
    seoDescription: '深入的密码学、支付安全、密钥管理和 HSM 操作指南和教程。通过实际示例学习加密概念。',
    seoKeywords: '密码学指南, 支付安全教程, HSM 文档, 密钥管理, TR-31, DUKPT, PIN 块, KCV, 加密教程',

    // FAQ & Usage for SEO
    faqTitle: '知识库常见问题',
    usageTitle: '如何使用知识库',
    faqs: [
      { question: '指南涵盖哪些主题？', answer: '我们的指南涵盖密钥管理（TR-31、KCV、密钥分割）、支付安全（PIN 块、DUKPT、CVV/CVC）、加密算法（AES、DES、RSA、ECC）以及 Thales、Futurex、Atalla 和 SafeNet 的 HSM 操作。' },
      { question: '指南是免费阅读的吗？', answer: '是的，所有指南完全免费。无需注册或登录。由 HSM Kit 团队编写，帮助开发者和安全专业人士理解密码学概念。' },
      { question: '我可以将指南用于生产系统吗？', answer: '指南是教育资源。虽然概念是准确的，但在生产环境中实施之前，请始终查阅官方供应商文档并进行适当的安全审查。' },
      { question: '指南多久更新一次？', answer: '我们定期更新指南，以反映密码学和支付安全领域的最新标准、算法变更和最佳实践。' },
    ],
    usage: [
      '按类别浏览指南：密钥管理、支付安全、加密或 PKI 与证书。',
      '使用搜索栏快速查找特定主题的指南，如 AES、TR-31 或 PIN 块。',
      '每个指南都包含相关工具，可直接链接到实际操作。',
      '指南提供多种语言版本，包括英文和中文。',
    ],
    
    // Tags
    tags: {
      KCV: 'KCV',
      XOR: 'XOR',
      Compliance: '合规性',
      'PCI DSS': 'PCI DSS',
      'TR-31': 'TR-31',
      'Key Block': '密钥块',
      'ANSI X9.143': 'ANSI X9.143',
      HSM: 'HSM',
      'PIN Block': 'PIN 块',
      'ISO 9564': 'ISO 9564',
      'Payment Security': '支付安全',
      DUKPT: 'DUKPT',
      'Key Derivation': '密钥派生',
      POS: 'POS',
      ATM: 'ATM',
      CVV: 'CVV',
      CVC: 'CVC',
      'Card Security': '卡片安全',
      EMV: 'EMV',
    },
  },
};
