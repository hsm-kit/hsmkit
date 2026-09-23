import type { Language } from '../../locales';

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

export const aboutContent: Record<Language, AuthorityContent> = {
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
  ja: {
    title: 'HSM Kitについて',
    seoTitle: 'HSM Kitについて - オープンソース暗号ツール',
    description: 'HSM Kitがクライアントサイドの暗号、HSM鍵管理、決済セキュリティ、PKIツールをどのように開発・レビュー・保守しているかをご紹介します。',
    keywords: 'HSM Kit, オープンソース暗号ツール, クライアントサイドセキュリティ, HSMテスト',
    updatedLabel: '最終レビュー',
    updatedDate: '2026年9月23日',
    sections: [
      { id: 'purpose', title: '目的と対象者', paragraphs: ['HSM Kitは、暗号技術、HSM鍵管理、決済セキュリティ、PKI、データエンコーディングに携わる開発者、テスター、学生、セキュリティエンジニア向けのオープンソースツールキットです。本番鍵の保管ではなく、透明性のある学習と相互運用性テストに重点を置いています。'] },
      { id: 'privacy', title: 'クライアントサイド処理', paragraphs: ['ツールの計算はブラウザ内で実行されます。HSM Kitは、フォーム入力、暗号鍵、PIN、証明書、計算結果をアプリケーションサーバーへ意図的に送信しません。それでも、ブラウザベースのツールに本番環境の機密情報を入力しないでください。'] },
      { id: 'sources', title: '標準と情報源', paragraphs: ['技術ガイドでは、NIST、IETF、W3C、ISO、PCI SSC、EMVCo、ASC X9、および関連ベンダーの一次資料を優先します。主張を独立して検証できるよう、各ガイドに参考資料を掲載しています。'] },
      { id: 'open-source', title: 'オープンソース開発', paragraphs: ['ソースコード、テスト、課題履歴は公開GitHubリポジトリで確認でき、IssueやPull Requestで修正を提案できます。'], bullets: ['リポジトリ: github.com/hsm-kit/hsmkit', 'MITライセンスのソースコード', '単体テスト、ページ、文書、プリレンダリングの自動チェック'] },
      { id: 'limitations', title: '範囲と制限', paragraphs: ['HSM Kitは認証済みHSM、PCI承認デバイス、鍵セレモニーシステム、またはベンダー・標準文書の代替ではありません。例は開発、教育、テストデータ専用です。'] },
      { id: 'contact', title: 'お問い合わせと訂正', paragraphs: ['事実誤認、セキュリティ上の懸念、相互運用性の問題はGitHub Issuesまたはcontact@hsmkit.comへお知らせください。重要な訂正はレビューし、ページの改訂日に反映します。'] },
    ],
  },
  ko: {
    title: 'HSM Kit 소개',
    seoTitle: 'HSM Kit 소개 - 오픈 소스 암호화 도구',
    description: 'HSM Kit가 클라이언트 측 암호화, HSM 키 관리, 결제 보안 및 PKI 도구를 구축하고 검토하며 유지하는 방법을 소개합니다.',
    keywords: 'HSM Kit, 오픈 소스 암호화 도구, 클라이언트 측 보안 도구, HSM 테스트',
    updatedLabel: '최종 검토',
    updatedDate: '2026년 9월 23일',
    sections: [
      { id: 'purpose', title: '목적과 대상', paragraphs: ['HSM Kit는 암호화, HSM 키 관리, 결제 보안, PKI 및 데이터 인코딩을 다루는 개발자, 테스터, 학생과 보안 엔지니어를 위한 오픈 소스 도구 모음입니다. 운영 키 보관이 아니라 투명한 학습과 상호 운용성 테스트에 중점을 둡니다.'] },
      { id: 'privacy', title: '클라이언트 측 처리', paragraphs: ['도구 계산은 브라우저에서 실행됩니다. HSM Kit는 양식 입력값, 암호화 키, PIN, 인증서 또는 계산 결과를 애플리케이션 서버로 의도적으로 전송하지 않습니다. 그럼에도 브라우저 기반 도구에 실제 운영 비밀을 입력하지 마십시오.'] },
      { id: 'sources', title: '표준과 출처', paragraphs: ['기술 가이드는 NIST, IETF, W3C, ISO, PCI SSC, EMVCo, ASC X9 및 관련 공급업체 문서의 1차 자료를 우선합니다. 주장을 독립적으로 검증할 수 있도록 가이드 페이지에 참고 자료를 제공합니다.'] },
      { id: 'open-source', title: '오픈 소스 개발', paragraphs: ['소스 코드, 테스트 및 이슈 기록은 공개 GitHub 저장소에서 확인할 수 있으며 Issue와 Pull Request로 수정을 제안할 수 있습니다.'], bullets: ['저장소: github.com/hsm-kit/hsmkit', 'MIT 라이선스 소스 코드', '단위, 페이지, 문서 및 프리렌더 자동 검사'] },
      { id: 'limitations', title: '범위와 제한', paragraphs: ['HSM Kit는 인증된 HSM, PCI 승인 장치, 키 세리머니 시스템 또는 공급업체와 표준 문서의 대체물이 아닙니다. 예제는 개발, 교육 및 테스트 데이터에만 사용해야 합니다.'] },
      { id: 'contact', title: '연락 및 정정', paragraphs: ['사실 오류, 보안 우려 또는 상호 운용성 문제는 GitHub Issues나 contact@hsmkit.com으로 알려주십시오. 중요한 정정은 검토 후 페이지 개정일에 반영합니다.'] },
    ],
  },
  de: {
    title: 'Über HSM Kit',
    seoTitle: 'Über HSM Kit - Open-Source-Kryptographie-Tools',
    description: 'Erfahren Sie, wie HSM Kit clientseitige Kryptographie-, HSM-Schlüsselverwaltungs-, Zahlungssicherheits- und PKI-Tools entwickelt, prüft und pflegt.',
    keywords: 'HSM Kit, Open-Source-Kryptographie-Tools, clientseitige Sicherheit, HSM-Tests',
    updatedLabel: 'Zuletzt geprüft',
    updatedDate: '23. September 2026',
    sections: [
      { id: 'purpose', title: 'Zweck und Zielgruppe', paragraphs: ['HSM Kit ist ein Open-Source-Toolkit für Entwickler, Tester, Studierende und Sicherheitsfachleute, die mit Kryptographie, HSM-Schlüsselverwaltung, Zahlungssicherheit, PKI und Datenkodierung arbeiten. Im Mittelpunkt stehen transparente Lern- und Interoperabilitätsabläufe, nicht die Verwahrung produktiver Schlüssel.'] },
      { id: 'privacy', title: 'Clientseitige Verarbeitung', paragraphs: ['Die Berechnungen laufen im Browser. HSM Kit überträgt Formulareingaben, kryptographische Schlüssel, PINs, Zertifikate oder Ergebnisse nicht absichtlich an einen Anwendungsserver. Geben Sie dennoch keine echten Produktionsgeheimnisse in browserbasierte Tools ein.'] },
      { id: 'sources', title: 'Standards und Quellen', paragraphs: ['Technische Leitfäden bevorzugen Primärquellen von NIST, IETF, W3C, ISO, PCI SSC, EMVCo, ASC X9 und relevanten Herstellern. Referenzen auf den Leitfadenseiten ermöglichen eine unabhängige Prüfung.'] },
      { id: 'open-source', title: 'Open-Source-Entwicklung', paragraphs: ['Quellcode, Tests und Issue-Verlauf sind im öffentlichen GitHub-Repository verfügbar. Korrekturen können über Issues und Pull Requests vorgeschlagen werden.'], bullets: ['Repository: github.com/hsm-kit/hsmkit', 'Quellcode unter MIT-Lizenz', 'Automatisierte Unit-, Seiten-, Dokumentations- und Prerender-Prüfungen'] },
      { id: 'limitations', title: 'Umfang und Grenzen', paragraphs: ['HSM Kit ist kein zertifiziertes HSM, kein PCI-zugelassenes Gerät, kein Schlüsselzeremonie-System und kein Ersatz für Hersteller- oder Normdokumentation. Beispiele dienen nur Entwicklung, Lehre und Testdaten.'] },
      { id: 'contact', title: 'Kontakt und Korrekturen', paragraphs: ['Melden Sie sachliche Fehler, Sicherheitsbedenken oder Interoperabilitätsprobleme über GitHub Issues oder contact@hsmkit.com. Wesentliche Korrekturen werden geprüft und im Revisionsdatum der Seite vermerkt.'] },
    ],
  },
  fr: {
    title: 'À propos de HSM Kit',
    seoTitle: 'À propos de HSM Kit - Outils cryptographiques open source',
    description: 'Découvrez comment HSM Kit développe, révise et maintient ses outils côté client pour la cryptographie, la gestion de clés HSM, la sécurité des paiements et la PKI.',
    keywords: 'HSM Kit, outils cryptographiques open source, sécurité côté client, tests HSM',
    updatedLabel: 'Dernière révision',
    updatedDate: '23 septembre 2026',
    sections: [
      { id: 'purpose', title: 'Objectif et public', paragraphs: ['HSM Kit est une boîte à outils open source destinée aux développeurs, testeurs, étudiants et ingénieurs sécurité travaillant sur la cryptographie, la gestion de clés HSM, la sécurité des paiements, la PKI et l’encodage. Le projet privilégie l’apprentissage transparent et les tests d’interopérabilité, non la conservation de clés de production.'] },
      { id: 'privacy', title: 'Traitement côté client', paragraphs: ['Les calculs sont exécutés dans le navigateur. HSM Kit ne transmet pas intentionnellement les entrées de formulaire, clés cryptographiques, PIN, certificats ou résultats à un serveur applicatif. Évitez néanmoins de saisir de vrais secrets de production dans tout outil web.'] },
      { id: 'sources', title: 'Normes et sources', paragraphs: ['Les guides techniques privilégient les sources primaires de NIST, IETF, W3C, ISO, PCI SSC, EMVCo, ASC X9 et les documentations officielles des fournisseurs. Les références sont indiquées afin que les affirmations puissent être vérifiées indépendamment.'] },
      { id: 'open-source', title: 'Développement open source', paragraphs: ['Le code source, les tests et l’historique des problèmes sont disponibles dans le dépôt GitHub public. Les corrections peuvent être proposées par Issues et Pull Requests.'], bullets: ['Dépôt : github.com/hsm-kit/hsmkit', 'Code source sous licence MIT', 'Contrôles automatisés des unités, pages, documents et prérendus'] },
      { id: 'limitations', title: 'Portée et limites', paragraphs: ['HSM Kit n’est ni un HSM certifié, ni un appareil approuvé PCI, ni un système de cérémonie de clés, ni un substitut aux normes et documentations fournisseurs. Les exemples sont réservés au développement, à l’enseignement et aux données de test.'] },
      { id: 'contact', title: 'Contact et corrections', paragraphs: ['Signalez les erreurs factuelles, problèmes de sécurité ou d’interopérabilité via GitHub Issues ou contact@hsmkit.com. Les corrections importantes sont révisées et reflétées dans la date de révision de la page.'] },
    ],
  },
};

export const editorialContent: Record<Language, AuthorityContent> = {
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
  ja: {
    title: '編集方針',
    seoTitle: 'HSM Kit 編集・技術レビュー方針',
    description: 'HSM Kitが暗号技術と決済セキュリティのコンテンツを調査、テスト、レビュー、訂正、更新する方法を説明します。',
    keywords: 'HSM Kit 編集方針, 技術レビュー, 暗号資料, 訂正方針',
    updatedLabel: '施行日',
    updatedDate: '2026年9月23日',
    sections: [
      { id: 'principles', title: '編集原則', paragraphs: ['コンテンツは技術的に有用で、独立して検証でき、制限を明示し、実際の開発・テスト作業に役立つものでなければなりません。検索上の露出が正確性や利用者の安全より優先されることはありません。'] },
      { id: 'sources', title: '情報源の優先順位', paragraphs: ['一次標準と規範仕様を優先します。二次資料は実装上の背景を補足する場合にのみ使用し、権威ある要件の代替にはしません。'], bullets: ['標準とRFC', '公式プラットフォーム・ベンダー文書', '公開テストベクトルと参照実装', '明示されたプロジェクト分析'] },
      { id: 'review', title: '技術レビュー', paragraphs: ['重要な変更では、アルゴリズムパラメータ、バイトとエンコーディングの前提、用語、安全上の警告、参照リンク、対応するツールとの整合性を確認します。自動テストはレビューを支援しますが、技術的判断の代わりにはなりません。'] },
      { id: 'examples', title: '例とテストベクトル', paragraphs: ['例には合成データ、公開データ、または標準由来のデータを使用します。期待値はプロジェクトコードで再現し、可能な場合は別のプラットフォームや公開ベクトルと比較します。本番秘密や実際の決済データは禁止です。'] },
      { id: 'automation', title: '自動化に関する開示', paragraphs: ['自動化およびAI支援ツールは、草稿、翻訳、コード変更、整合性確認を支援する場合があります。公開内容はリポジトリレビュー、自動検証、情報源確認、オープンソースの訂正手順の対象です。'] },
      { id: 'corrections', title: '訂正と更新', paragraphs: ['確認された事実誤認やセキュリティ上の誤りは速やかに訂正します。重要な変更では最終レビュー日を更新し、新鮮さを装う目的だけで日付を変更しません。'] },
    ],
  },
  ko: {
    title: '편집 정책',
    seoTitle: 'HSM Kit 편집 및 기술 검토 정책',
    description: 'HSM Kit가 암호화 및 결제 보안 콘텐츠를 조사, 테스트, 검토, 정정하고 업데이트하는 방법입니다.',
    keywords: 'HSM Kit 편집 정책, 기술 검토, 암호화 출처, 정정 정책',
    updatedLabel: '시행일',
    updatedDate: '2026년 9월 23일',
    sections: [
      { id: 'principles', title: '편집 원칙', paragraphs: ['콘텐츠는 기술적으로 유용하고 독립적으로 검증 가능하며 제한 사항을 명확히 밝히고 실제 개발 및 테스트 작업을 위해 작성되어야 합니다. 검색 노출이 정확성이나 사용자 안전보다 우선하지 않습니다.'] },
      { id: 'sources', title: '출처 우선순위', paragraphs: ['1차 표준과 규범 사양을 우선합니다. 2차 설명은 구현 맥락을 추가할 때만 사용하며 권위 있는 요구 사항을 대체하지 않습니다.'], bullets: ['표준 및 RFC', '공식 플랫폼 및 공급업체 문서', '공개 테스트 벡터와 참조 구현', '명확히 표시된 프로젝트 분석'] },
      { id: 'review', title: '기술 검토', paragraphs: ['중요 변경은 알고리즘 매개변수, 바이트와 인코딩 가정, 용어, 보안 경고, 출처 링크 및 해당 도구와의 일관성을 확인합니다. 자동 테스트는 검토를 지원하지만 기술적 판단을 대신하지 않습니다.'] },
      { id: 'examples', title: '예제와 테스트 벡터', paragraphs: ['예제는 합성, 공개 또는 표준 기반 데이터를 사용합니다. 예상 결과는 프로젝트 코드로 재현하고 가능한 경우 독립 플랫폼이나 공개 벡터와 비교합니다. 운영 비밀 및 실제 결제 데이터는 금지됩니다.'] },
      { id: 'automation', title: '자동화 공개', paragraphs: ['자동화 및 AI 보조 도구는 초안, 번역, 코드 변경 및 일관성 검사를 지원할 수 있습니다. 게시물은 저장소 검토, 자동 검증, 출처 확인 및 오픈 소스 정정 절차를 거칩니다.'] },
      { id: 'corrections', title: '정정과 업데이트', paragraphs: ['확인된 사실 또는 보안 오류는 신속히 정정합니다. 중요한 변경은 최종 검토일을 갱신하며 새로워 보이게 할 목적으로만 날짜를 변경하지 않습니다.'] },
    ],
  },
  de: {
    title: 'Redaktionsrichtlinie',
    seoTitle: 'HSM Kit Redaktions- und technische Prüfrichtlinie',
    description: 'So recherchiert, testet, prüft, korrigiert und aktualisiert HSM Kit Inhalte zu Kryptographie und Zahlungssicherheit.',
    keywords: 'HSM Kit Redaktionsrichtlinie, technische Prüfung, Kryptographie-Quellen, Korrekturrichtlinie',
    updatedLabel: 'Gültig seit',
    updatedDate: '23. September 2026',
    sections: [
      { id: 'principles', title: 'Redaktionelle Grundsätze', paragraphs: ['Inhalte sollen technisch nützlich, unabhängig überprüfbar, transparent über ihre Grenzen und für reale Entwicklungs- und Testaufgaben geschrieben sein. Sichtbarkeit in Suchmaschinen steht niemals über Korrektheit oder Nutzersicherheit.'] },
      { id: 'sources', title: 'Quellenhierarchie', paragraphs: ['Primärnormen und normative Spezifikationen werden bevorzugt. Sekundärquellen dienen nur zusätzlichem Implementierungskontext und ersetzen keine verbindlichen Anforderungen.'], bullets: ['Normen und RFCs', 'Offizielle Plattform- und Herstellerdokumentation', 'Veröffentlichte Testvektoren und Referenzimplementierungen', 'Klar gekennzeichnete Projektanalyse'] },
      { id: 'review', title: 'Technische Prüfung', paragraphs: ['Wesentliche Änderungen werden auf Algorithmusparameter, Byte- und Kodierungsannahmen, Terminologie, Sicherheitshinweise, Quellenlinks und Konsistenz mit dem jeweiligen Tool geprüft. Automatisierte Tests unterstützen, ersetzen aber kein technisches Urteil.'] },
      { id: 'examples', title: 'Beispiele und Testvektoren', paragraphs: ['Beispiele verwenden synthetische, öffentliche oder aus Standards abgeleitete Daten. Erwartete Ergebnisse werden mit Projektcode reproduziert und, soweit möglich, mit einer unabhängigen Plattform oder einem veröffentlichten Vektor verglichen. Produktive Geheimnisse und echte Zahlungsdaten sind untersagt.'] },
      { id: 'automation', title: 'Offenlegung der Automatisierung', paragraphs: ['Automatisierung und KI-gestützte Werkzeuge können Entwürfe, Übersetzungen, Codeänderungen und Konsistenzprüfungen unterstützen. Veröffentlichte Inhalte unterliegen weiterhin Repository-Review, automatischer Validierung, Quellenprüfung und dem Open-Source-Korrekturprozess.'] },
      { id: 'corrections', title: 'Korrekturen und Aktualisierungen', paragraphs: ['Bestätigte sachliche oder sicherheitsrelevante Fehler werden zeitnah korrigiert. Wesentliche Änderungen aktualisieren das Prüfdatum. Datumsangaben werden nicht allein geändert, um Aktualität vorzutäuschen.'] },
    ],
  },
  fr: {
    title: 'Politique éditoriale',
    seoTitle: 'Politique éditoriale et de révision technique de HSM Kit',
    description: 'Méthode utilisée par HSM Kit pour rechercher, tester, réviser, corriger et actualiser ses contenus cryptographiques et de sécurité des paiements.',
    keywords: 'politique éditoriale HSM Kit, révision technique, sources cryptographiques, politique de correction',
    updatedLabel: 'Date d’effet',
    updatedDate: '23 septembre 2026',
    sections: [
      { id: 'principles', title: 'Principes éditoriaux', paragraphs: ['Le contenu doit être utile techniquement, vérifiable de façon indépendante, explicite sur ses limites et rédigé pour de véritables tâches de développement et de test. La visibilité dans les moteurs de recherche ne prime jamais sur l’exactitude ou la sécurité des utilisateurs.'] },
      { id: 'sources', title: 'Hiérarchie des sources', paragraphs: ['Les normes primaires et spécifications normatives sont privilégiées. Les sources secondaires ne servent qu’à fournir un contexte d’implémentation et ne remplacent pas les exigences officielles.'], bullets: ['Normes et RFC', 'Documentation officielle des plateformes et fournisseurs', 'Vecteurs de test publiés et implémentations de référence', 'Analyses du projet clairement identifiées'] },
      { id: 'review', title: 'Révision technique', paragraphs: ['Les modifications importantes sont vérifiées quant aux paramètres d’algorithme, hypothèses de bytes et d’encodage, terminologie, avertissements de sécurité, liens de sources et cohérence avec l’outil correspondant. Les tests automatisés assistent la révision sans remplacer le jugement technique.'] },
      { id: 'examples', title: 'Exemples et vecteurs de test', paragraphs: ['Les exemples utilisent des données synthétiques, publiques ou issues de normes. Les résultats attendus sont reproduits avec le code du projet et, lorsque possible, comparés à une plateforme indépendante ou à un vecteur publié. Les secrets de production et données de paiement réelles sont interdits.'] },
      { id: 'automation', title: 'Transparence sur l’automatisation', paragraphs: ['Des outils automatisés et assistés par IA peuvent contribuer à la rédaction, traduction, modification du code et vérification de cohérence. Le contenu publié reste soumis à la revue du dépôt, aux validations automatiques, à la vérification des sources et au processus open source de correction.'] },
      { id: 'corrections', title: 'Corrections et mises à jour', paragraphs: ['Les erreurs factuelles ou de sécurité confirmées sont corrigées rapidement. Les changements importants mettent à jour la date de dernière révision. Les dates ne sont pas modifiées uniquement pour donner une apparence de fraîcheur.'] },
    ],
  },
};

export const teamContent: Record<Language, AuthorityContent> = {
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
  ja: {
    title: 'HSM Kit 編集チーム',
    seoTitle: 'HSM Kit 編集・セキュリティレビューチーム',
    description: 'HSM Kitの技術コンテンツを担当するプロジェクトレベルの編集・セキュリティレビューの役割をご紹介します。',
    keywords: 'HSM Kit 編集チーム, セキュリティレビュー, 暗号技術ライター',
    updatedLabel: 'プロフィール確認日',
    updatedDate: '2026年9月23日',
    sections: [
      { id: 'editorial-role', title: '編集の役割', paragraphs: ['HSM Kit編集チームは、技術解説、例、メタデータ、相互リンクを作成する貢献者を示すプロジェクトレベルの表記です。個人の専門資格や認定を示すものではありません。'] },
      { id: 'security-review', title: 'セキュリティレビューの役割', paragraphs: ['セキュリティレビューチームという表記は、標準の参照、不安全な推奨、暗号上の前提、相互運用性の注記、ガイドとツールの整合性を確認するプロジェクトのレビュー機能を表します。'] },
      { id: 'method', title: 'レビュー方法', paragraphs: ['一次資料、再現可能な例、自動テスト、静的ページチェック、公開されたソース履歴を組み合わせます。独自HSMの挙動に依存する主張はベンダー固有と明示し、可能な場合は公式文書へリンクします。'] },
      { id: 'accountability', title: '説明責任と訂正', paragraphs: ['公開リポジトリには変更履歴とIssue窓口があります。読者は主張への異議、反例、訂正案を提出できます。採用された重要な変更は対象ページとレビュー日に反映されます。'] },
      { id: 'contact', title: '連絡先', paragraphs: ['技術的な訂正: github.com/hsm-kit/hsmkit/issues。非公開の連絡: contact@hsmkit.com。本番鍵、PIN、認証情報、機密の決済データは送信しないでください。'] },
    ],
  },
  ko: {
    title: 'HSM Kit 편집팀',
    seoTitle: 'HSM Kit 편집 및 보안 검토팀',
    description: 'HSM Kit 기술 콘텐츠를 담당하는 프로젝트 수준의 편집 및 보안 검토 역할을 소개합니다.',
    keywords: 'HSM Kit 편집팀, 보안 검토, 암호화 기술 작성자',
    updatedLabel: '프로필 검토일',
    updatedDate: '2026년 9월 23일',
    sections: [
      { id: 'editorial-role', title: '편집 역할', paragraphs: ['HSM Kit 편집팀은 기술 설명, 예제, 메타데이터 및 교차 링크를 준비하는 기여자를 나타내는 프로젝트 수준의 명칭입니다. 개인의 전문 자격이나 인증으로 제시되지 않습니다.'] },
      { id: 'security-review', title: '보안 검토 역할', paragraphs: ['보안 검토팀은 표준 참조, 안전하지 않은 권고, 암호화 가정, 상호 운용성 설명 및 가이드와 도구 간 일관성을 확인하는 프로젝트 검토 기능을 의미합니다.'] },
      { id: 'method', title: '검토 방법', paragraphs: ['1차 출처, 재현 가능한 예제, 자동 테스트, 정적 페이지 검사 및 공개 소스 기록을 함께 사용합니다. 독점 HSM 동작에 의존하는 주장은 공급업체별 내용으로 표시하고 가능한 경우 공식 문서에 연결합니다.'] },
      { id: 'accountability', title: '책임과 정정', paragraphs: ['공개 저장소는 변경 기록과 이슈 채널을 제공합니다. 독자는 주장에 이의를 제기하거나 반례 및 정정을 제안할 수 있습니다. 승인된 중요 변경은 해당 페이지와 검토일에 반영됩니다.'] },
      { id: 'contact', title: '연락처', paragraphs: ['기술 정정: github.com/hsm-kit/hsmkit/issues. 비공개 연락: contact@hsmkit.com. 운영 키, PIN, 자격 증명 또는 기밀 결제 데이터를 보내지 마십시오.'] },
    ],
  },
  de: {
    title: 'HSM Kit Redaktionsteam',
    seoTitle: 'HSM Kit Redaktion und Sicherheitsprüfung',
    description: 'Lernen Sie die projektweiten Redaktions- und Sicherheitsprüfungsrollen kennen, die für technische Inhalte von HSM Kit verantwortlich sind.',
    keywords: 'HSM Kit Redaktionsteam, Sicherheitsprüfung, technische Kryptographie-Autoren',
    updatedLabel: 'Profil geprüft',
    updatedDate: '23. September 2026',
    sections: [
      { id: 'editorial-role', title: 'Redaktionelle Rolle', paragraphs: ['Das HSM Kit Redaktionsteam ist eine projektweite Zuschreibung für Mitwirkende, die technische Erklärungen, Beispiele, Metadaten und Querverweise erstellen. Sie wird nicht als persönliche Berufsqualifikation oder Zertifizierung dargestellt.'] },
      { id: 'security-review', title: 'Rolle der Sicherheitsprüfung', paragraphs: ['Die Bezeichnung Sicherheitsprüfung kennzeichnet die Projektfunktion, die Normenverweise, unsichere Empfehlungen, kryptographische Annahmen, Interoperabilitätshinweise und die Konsistenz zwischen Leitfäden und Tools prüft.'] },
      { id: 'method', title: 'Prüfmethode', paragraphs: ['Die Prüfung kombiniert Primärquellen, reproduzierbare Beispiele, automatisierte Tests, statische Seitenprüfungen und den öffentlichen Quellverlauf. Aussagen zu proprietärem HSM-Verhalten werden als herstellerspezifisch gekennzeichnet und nach Möglichkeit mit Herstellerdokumentation verlinkt.'] },
      { id: 'accountability', title: 'Verantwortung und Korrekturen', paragraphs: ['Das öffentliche Repository bietet Änderungshistorie und Issue-Kanal. Leser können Aussagen hinterfragen, Gegenbeispiele liefern oder Korrekturen vorschlagen. Angenommene wesentliche Änderungen aktualisieren die betroffene Seite und ihr Prüfdatum.'] },
      { id: 'contact', title: 'Kontakt', paragraphs: ['Technische Korrekturen: github.com/hsm-kit/hsmkit/issues. Vertraulicher Kontakt: contact@hsmkit.com. Senden Sie keine Produktionsschlüssel, PINs, Zugangsdaten oder vertrauliche Zahlungsdaten.'] },
    ],
  },
  fr: {
    title: 'Équipe éditoriale HSM Kit',
    seoTitle: 'Équipe éditoriale et de révision sécurité HSM Kit',
    description: 'Découvrez les rôles éditoriaux et de révision sécurité du projet responsables du contenu technique de HSM Kit.',
    keywords: 'équipe éditoriale HSM Kit, révision sécurité, rédaction technique cryptographique',
    updatedLabel: 'Profil révisé',
    updatedDate: '23 septembre 2026',
    sections: [
      { id: 'editorial-role', title: 'Rôle éditorial', paragraphs: ['L’équipe éditoriale HSM Kit est une attribution au niveau du projet pour les contributeurs préparant explications techniques, exemples, métadonnées et liens croisés. Elle n’est pas présentée comme une qualification ou certification professionnelle individuelle.'] },
      { id: 'security-review', title: 'Rôle de révision sécurité', paragraphs: ['La mention Équipe de révision sécurité désigne la fonction du projet qui vérifie les références aux normes, recommandations dangereuses, hypothèses cryptographiques, notes d’interopérabilité et la cohérence entre guides et outils.'] },
      { id: 'method', title: 'Méthode de révision', paragraphs: ['La révision combine sources primaires, exemples reproductibles, tests automatisés, contrôles de pages statiques et historique public du code. Les affirmations dépendant d’un comportement HSM propriétaire sont identifiées comme propres au fournisseur et liées à sa documentation lorsque possible.'] },
      { id: 'accountability', title: 'Responsabilité et corrections', paragraphs: ['Le dépôt public fournit un historique des changements et un canal d’Issues. Les lecteurs peuvent contester une affirmation, fournir un contre-exemple ou proposer une correction. Les modifications importantes acceptées mettent à jour la page concernée et sa date de révision.'] },
      { id: 'contact', title: 'Contact', paragraphs: ['Corrections techniques : github.com/hsm-kit/hsmkit/issues. Contact privé : contact@hsmkit.com. N’envoyez pas de clés de production, PIN, identifiants ou données de paiement confidentielles.'] },
    ],
  },
};