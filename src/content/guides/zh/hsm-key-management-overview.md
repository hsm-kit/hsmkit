硬件安全模块（HSM）是企业密码密钥管理的核心基础设施。本文介绍 HSM 的功能、主要厂商的差异，以及使用 HSM 密钥格式时需要了解的关键概念。

## 什么是 HSM？

硬件安全模块是一种**防篡改硬件设备**，它：

- 使用经过认证的随机数生成器生成密码密钥
- 在安全、防篡改的内存中存储密钥
- 在硬件内部执行加密操作（加密、解密、签名）
- 检测到物理篡改时销毁密钥
- 强制执行访问控制和审计日志

HSM 内部生成的密钥**永远不会以明文形式存在于设备之外**——这是 HSM 的根本安全保证。

## 为什么使用 HSM？

| 需求 | 软件方案 | HSM 方案 |
|------|---------|---------|
| 密钥存储 | 文件系统/数据库 | 防篡改硬件 |
| 密钥生成 | 操作系统随机数生成器 | FIPS 140-2 认证 TRNG |
| 合规性 | 困难 | PCI HSM、FIPS 140-2/3 认证 |
| 密钥导出 | 可能明文导出 | 仅在 LMK/ZMK 加密下导出 |
| 审计 | 应用程序日志 | 硬件审计跟踪 |

**PCI DSS**、**PCI PIN** 和许多银行法规要求使用 HSM 保护 PIN 加密密钥、卡验证密钥和主密钥。

## HSM 密钥层次结构

大多数 HSM 使用分层密钥结构：

```
本地主密钥（LMK）—— 存储在 HSM 硬件中
    └── 区域主密钥（ZMK）—— HSM 之间交换
            └── 区域加密密钥（ZEK）/ 区域 PIN 密钥（ZPK）
                    └── 工作密钥（PIN 密钥、MAC 密钥等）
```

### 本地主密钥（LMK）
- 根密钥，永不离开 HSM
- 用于加密所有其他密钥以便存储
- 在 HSM 初始化期间通过密钥仪式加载
- 分成多个组件（参见 [密钥分片指南](/guides/understanding-key-splitting-kcv)）

### 区域主密钥（ZMK）
- 在两个 HSM 之间交换以建立安全通道
- 用于在站点之间传输工作密钥
- 也称为密钥交换密钥（KEK）

### 工作密钥
- PIN 加密密钥（PEK/ZPK）：在 ATM/POS 加密 PIN
- MAC 密钥：生成消息认证码
- 数据加密密钥（DEK）：加密持卡人数据

## 主要 HSM 厂商

### Thales（原 nCipher + SafeNet）

Thales 是市场领导者，由 nCipher 和 SafeNet 合并而成。

**Thales payShield**（支付 HSM）：
- 支付处理行业标准
- 支持 Thales LMK 密钥格式
- 密钥以"Thales 密钥块"（专有格式）存储
- 使用 [Thales 密钥工具](/thales-keys) 处理 Thales 加密密钥
- 使用 [Thales 密钥块工具](/thales-key-block) 处理 Thales 密钥块格式

### Futurex

Futurex HSM 在美国银行和支付处理领域广泛使用。

**主要特点**：
- 使用"Futurex 密钥格式"存储密钥
- 支持 TR-31 密钥块（参见 [TR-31 指南](/guides/what-is-tr31-key-block)）
- 在 ATM 和 POS 网络中占有重要地位

使用 [Futurex 密钥工具](/futurex-keys) 处理 Futurex 格式的密钥。

### Atalla（HP/Utimaco）

最初是 HP Atalla，现由 Utimaco 拥有。

**主要特点**：
- 使用 AKB（Atalla 密钥块）格式
- 常见于较旧的银行基础设施
- 在 PIN 处理领域占有重要地位

使用 [Atalla 密钥工具](/atalla-keys) 解码和处理 AKB 格式密钥。

### SafeNet（Thales）

SafeNet HSM（现为 Thales 旗下）用于通用 PKI 和加密。

使用 [SafeNet 密钥工具](/safenet-keys) 进行 SafeNet 密钥格式操作。

## 密钥传输标准

在 HSM 或系统之间移动密钥时，使用标准化格式：

### TR-31（ANSI X9.143）
现代密钥传输标准。将密钥属性（用途、算法、可导出性）与密钥材料密码学绑定。

→ 参见完整的 [TR-31 密钥块指南](/guides/what-is-tr31-key-block) 和 [TR-31 工具](/tr31-key-block)

### 密钥组件（手动交换）
初始密钥加载时，密钥被分成组件，由多个保管人手动输入。

→ 参见 [密钥分片与 KCV 指南](/guides/understanding-key-splitting-kcv) 和 [密钥分片生成器](/keyshare-generator)

## DUKPT——基于 HSM 的每笔交易密钥

对于高交易量环境（ATM、POS 终端），DUKPT 为每笔交易提供唯一密钥，而无需每次都调用 HSM。

→ 参见 [DUKPT 指南](/guides/dukpt-key-derivation-tutorial) 和 [DUKPT 工具](/payments-dukpt-iso9797)

## 密钥仪式

**密钥仪式**是在 HSM 中生成和加载主密钥的正式流程：

1. 多名保管人在场（双重控制）
2. 每名保管人持有一个密钥组件
3. 依次输入组件——没有单个人看到完整密钥
4. 加载后验证 KCV
5. 记录并审计整个过程

这满足了 PCI DSS 对分离知识和双重控制的要求。

## HSM 合规认证

| 认证 | 含义 |
|------|------|
| FIPS 140-2 Level 3 | 美国政府标准，物理防篡改保护 |
| FIPS 140-2 Level 4 | 最高 FIPS 级别，全面环境保护 |
| FIPS 140-3 | 更新标准（替代 140-2） |
| PCI HSM | 支付卡行业 HSM 标准 |
| Common Criteria EAL4+ | 国际安全评估 |

大多数支付 HSM 通过 **FIPS 140-2 Level 3** 和 **PCI HSM** 认证。

## 在线工具

探索 HSM 密钥格式：

- [密钥生成器](/keys-dea) —— 生成带 KCV 的 AES/DES/3DES 密钥
- [密钥分片生成器](/keyshare-generator) —— 将密钥分成组件
- [TR-31 密钥块工具](/tr31-key-block) —— 编码/解码 TR-31 密钥块
- [Thales 密钥工具](/thales-keys) —— 处理 Thales LMK 加密密钥
- [Futurex 密钥工具](/futurex-keys) —— 处理 Futurex 密钥格式
- [Atalla 密钥工具](/atalla-keys) —— 处理 Atalla AKB 格式

所有工具完全在浏览器中运行，可安全离线使用。
