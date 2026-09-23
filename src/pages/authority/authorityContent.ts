export interface AuthoritySection {
  id: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface AuthorityContent {
  title: string;
  seoTitle: string;
  description: string;
  keywords: string;
  updatedLabel: string;
  updatedDate: string;
  sections: AuthoritySection[];
}

export const aboutContent: Record<'en' | 'zh', AuthorityContent> = {
  en: {
    title: 'About HSM Kit',
    seoTitle: 'About HSM Kit - Open-Source Cryptography Tools',
    description: 'Learn how HSM Kit builds, reviews, and maintains client-side cryptography, HSM key management, payment security, and PKI tools.',
    keywords: 'HSM Kit, open source cryptography tools, client-side security tools, HSM testing',
    updatedLabel: 'Last reviewed',
    updatedDate: 'September 23, 2026',
    sections: [
      { id: 'purpose', title: 'Purpose and Audience', paragraphs: ['HSM Kit is an open-source toolkit for developers, testers, students, and security engineers working with cryptography, HSM key management, payment security, PKI, and data encoding. The project focuses on transparent educational and interoperability workflows rather than production key custody.'] },
      { id: 'privacy', title: 'Client-Side Processing', paragraphs: ['Tool calculations run in the browser. HSM Kit does not intentionally transmit form inputs, cryptographic keys, PINs, certificates, or calculated results to an application server. Users should still avoid entering live production secrets into any browser-based tool.'] },
      { id: 'sources', title: 'Standards and Sources', paragraphs: ['Technical guides prioritize primary sources from NIST, IETF, W3C, ISO, PCI SSC, EMVCo, ASC X9, and relevant vendor documentation. References are listed on guide pages so claims can be checked independently.'] },
      { id: 'open-source', title: 'Open-Source Development', paragraphs: ['Source code, tests, and issue history are available in the public HSM Kit GitHub repository. Corrections can be proposed through issues and pull requests.'], bullets: ['Repository: github.com/hsm-kit/hsmkit', 'MIT-licensed source code', 'Automated unit, page, documentation, and prerender checks'] },
      { id: 'limitations', title: 'Scope and Limitations', paragraphs: ['HSM Kit is not a certified HSM, PCI-approved device, key ceremony system, or substitute for vendor and standards documentation. Examples are intended for development, education, and test data only.'] },
      { id: 'contact', title: 'Contact and Corrections', paragraphs: ['Report factual errors, security concerns, or interoperability problems through GitHub Issues or contact@hsmkit.com. Material corrections are reviewed and reflected in page revision dates.'] },
    ],
  },
  zh: {
    title: '关于 HSM Kit',
    seoTitle: '关于 HSM Kit - 开源密码学与 HSM 工具',
    description: '了解 HSM Kit 如何构建、审核和维护客户端密码学、HSM 密钥管理、支付安全与 PKI 工具。',
    keywords: 'HSM Kit, 开源密码学工具, 客户端安全工具, HSM 测试',
    updatedLabel: '最近审核',
    updatedDate: '2026年9月23日',
    sections: [
      { id: 'purpose', title: '项目目的与受众', paragraphs: ['HSM Kit 是面向开发者、测试人员、学生和安全工程师的开源工具集，覆盖密码学、HSM 密钥管理、支付安全、PKI 与数据编码。项目重点是透明的教育和互操作测试流程，而不是生产密钥托管。'] },
      { id: 'privacy', title: '客户端处理', paragraphs: ['工具计算在浏览器中运行。HSM Kit 不会有意将表单输入、密码密钥、PIN、证书或计算结果传输到应用服务器。即便如此，也不应在任何浏览器工具中输入真实生产秘密。'] },
      { id: 'sources', title: '标准与资料来源', paragraphs: ['技术指南优先引用 NIST、IETF、W3C、ISO、PCI SSC、EMVCo、ASC X9 以及相关厂商文档。指南页面列出参考资料，便于独立核验。'] },
      { id: 'open-source', title: '开源开发', paragraphs: ['源代码、测试和问题记录公开在 HSM Kit GitHub 仓库，可通过 Issue 和 Pull Request 提交修正。'], bullets: ['仓库：github.com/hsm-kit/hsmkit', '源代码采用 MIT 许可证', '包含单元测试、页面检查、文档检查和预渲染检查'] },
      { id: 'limitations', title: '范围与限制', paragraphs: ['HSM Kit 不是认证 HSM、PCI 批准设备、密钥仪式系统，也不能替代厂商和标准文档。示例仅用于开发、教育和测试数据。'] },
      { id: 'contact', title: '联系与纠错', paragraphs: ['可通过 GitHub Issues 或 contact@hsmkit.com 报告事实错误、安全问题或互操作问题。重大修正会经过审核并更新页面修订日期。'] },
    ],
  },
};

export const editorialContent: Record<'en' | 'zh', AuthorityContent> = {
  en: {
    title: 'Editorial Policy',
    seoTitle: 'HSM Kit Editorial and Technical Review Policy',
    description: 'How HSM Kit researches, tests, reviews, corrects, and updates cryptography and payment-security content.',
    keywords: 'HSM Kit editorial policy, technical review, cryptography references, corrections policy',
    updatedLabel: 'Effective date',
    updatedDate: 'September 23, 2026',
    sections: [
      { id: 'principles', title: 'Editorial Principles', paragraphs: ['Content should be technically useful, independently verifiable, explicit about limitations, and written for real development and testing tasks. Search visibility never overrides correctness or user safety.'] },
      { id: 'sources', title: 'Source Hierarchy', paragraphs: ['Primary standards and normative specifications are preferred. Secondary explanations are used only when they add implementation context and do not replace authoritative requirements.'], bullets: ['Standards and RFCs', 'Official platform and vendor documentation', 'Published test vectors and reference implementations', 'Clearly identified project analysis'] },
      { id: 'review', title: 'Technical Review', paragraphs: ['Material changes are checked for algorithm parameters, byte and encoding assumptions, terminology, security warnings, source links, and consistency with the corresponding tool. Automated tests support review but do not replace technical judgment.'] },
      { id: 'examples', title: 'Examples and Test Vectors', paragraphs: ['Examples use synthetic, public, or standards-derived data. Expected results are reproduced with project code and, where practical, compared with a separate platform or published vector. Production secrets and live payment data are prohibited.'] },
      { id: 'automation', title: 'Automation Disclosure', paragraphs: ['Automation and AI-assisted tools may support drafting, translation, code changes, and consistency checks. Published material remains subject to repository review, automated validation, source verification, and correction through the open-source workflow.'] },
      { id: 'corrections', title: 'Corrections and Updates', paragraphs: ['Confirmed factual or security errors are corrected promptly. Significant content changes update the last-reviewed date. Dates are not changed solely to create an appearance of freshness.'] },
    ],
  },
  zh: {
    title: '编辑政策',
    seoTitle: 'HSM Kit 编辑与技术审核政策',
    description: 'HSM Kit 如何研究、测试、审核、纠正和更新密码学与支付安全内容。',
    keywords: 'HSM Kit 编辑政策, 技术审核, 密码学参考资料, 纠错政策',
    updatedLabel: '生效日期',
    updatedDate: '2026年9月23日',
    sections: [
      { id: 'principles', title: '编辑原则', paragraphs: ['内容应具备技术实用性、可独立验证性，明确说明限制，并服务于真实开发和测试任务。搜索曝光不能凌驾于正确性和用户安全之上。'] },
      { id: 'sources', title: '资料来源层级', paragraphs: ['优先使用主要标准和规范性文件。二级资料只用于补充实现背景，不能替代权威要求。'], bullets: ['标准与 RFC', '官方平台及厂商文档', '公开测试向量和参考实现', '明确标注的项目分析'] },
      { id: 'review', title: '技术审核', paragraphs: ['重大修改会检查算法参数、字节与编码假设、术语、安全警告、来源链接以及与对应工具的一致性。自动测试辅助审核，但不替代技术判断。'] },
      { id: 'examples', title: '示例与测试向量', paragraphs: ['示例使用合成、公开或来自标准的数据。预期结果由项目代码复现，并在可行时与独立平台或公开向量比对。禁止使用生产秘密和真实支付数据。'] },
      { id: 'automation', title: '自动化使用说明', paragraphs: ['自动化和 AI 辅助工具可能参与草拟、翻译、代码修改与一致性检查。发布内容仍需经过仓库审核、自动验证、来源核验和开源纠错流程。'] },
      { id: 'corrections', title: '纠错与更新', paragraphs: ['确认的事实或安全错误会及时修正。重大内容变更会更新最近审核日期，不会仅为制造“新鲜度”而修改日期。'] },
    ],
  },
};

export const teamContent: Record<'en' | 'zh', AuthorityContent> = {
  en: {
    title: 'HSM Kit Editorial Team',
    seoTitle: 'HSM Kit Editorial and Security Review Team',
    description: 'Meet the project-level editorial and security review roles responsible for HSM Kit technical content.',
    keywords: 'HSM Kit editorial team, security review, cryptography technical writers',
    updatedLabel: 'Profile reviewed',
    updatedDate: 'September 23, 2026',
    sections: [
      { id: 'editorial-role', title: 'Editorial Role', paragraphs: ['The HSM Kit Editorial Team is a project-level attribution for contributors who prepare technical explanations, examples, metadata, and cross-links. It is not presented as an individual professional credential or certification.'] },
      { id: 'security-review', title: 'Security Review Role', paragraphs: ['The Security Review Team label identifies the project review function that checks standards references, unsafe recommendations, cryptographic assumptions, interoperability notes, and consistency between guides and tools.'] },
      { id: 'method', title: 'Review Method', paragraphs: ['Review combines primary-source references, reproducible examples, automated tests, static page checks, and public source history. Claims that depend on proprietary HSM behavior are identified as vendor-specific and linked to vendor documentation where available.'] },
      { id: 'accountability', title: 'Accountability and Corrections', paragraphs: ['The public repository provides change history and an issue channel. Readers can challenge a claim, supply a counterexample, or propose a correction. Accepted material changes update the affected page and its review date.'] },
      { id: 'contact', title: 'Contact', paragraphs: ['Technical corrections: github.com/hsm-kit/hsmkit/issues. Private contact: contact@hsmkit.com. Do not send production keys, PINs, credentials, or confidential payment data.'] },
    ],
  },
  zh: {
    title: 'HSM Kit 编辑团队',
    seoTitle: 'HSM Kit 编辑与安全审核团队',
    description: '了解负责 HSM Kit 技术内容的项目级编辑与安全审核职责。',
    keywords: 'HSM Kit 编辑团队, 安全审核, 密码学技术写作',
    updatedLabel: '资料审核日期',
    updatedDate: '2026年9月23日',
    sections: [
      { id: 'editorial-role', title: '编辑职责', paragraphs: ['HSM Kit 编辑团队是项目级署名，代表参与技术说明、示例、元数据和内链维护的贡献者，并不表示某个个人的职业资质或认证。'] },
      { id: 'security-review', title: '安全审核职责', paragraphs: ['安全审核团队代表项目中的审核职能，检查标准引用、不安全建议、密码学假设、互操作说明，以及指南与工具之间的一致性。'] },
      { id: 'method', title: '审核方法', paragraphs: ['审核结合主要来源、可复现示例、自动测试、静态页面检查和公开代码历史。涉及专有 HSM 行为的说明会标记为厂商特定内容，并尽可能链接厂商文档。'] },
      { id: 'accountability', title: '责任与纠错', paragraphs: ['公开仓库提供变更历史和问题反馈渠道。读者可以质疑结论、提供反例或提出修正。接受的重大修改会更新相关页面及审核日期。'] },
      { id: 'contact', title: '联系方式', paragraphs: ['技术纠错：github.com/hsm-kit/hsmkit/issues。非公开联系：contact@hsmkit.com。请勿发送生产密钥、PIN、凭据或机密支付数据。'] },
    ],
  },
};