消息认证码（MAC）是支付系统验证交易数据未被篡改的方式。本文介绍银行和支付处理中使用的 MAC 算法。

## 什么是 MAC？

MAC（消息认证码）是一段用于验证消息**完整性**和**真实性**的短数据。与哈希不同，MAC 需要**密钥**——只有拥有密钥的人才能生成或验证它。

```
MAC = MAC算法(密钥, 消息)
```

特性：
- **完整性**：消息的任何变化都会产生不同的 MAC
- **认证性**：只有拥有密钥的各方才能生成有效的 MAC
- **不可否认性**（非对称方案）：证明消息的发送者

## MAC vs 哈希 vs 数字签名

| 属性 | 哈希 | MAC | 数字签名 |
|------|------|-----|---------|
| 需要密钥 | 否 | 是（对称） | 是（非对称） |
| 完整性 | 是 | 是 | 是 |
| 认证性 | 否 | 是 | 是 |
| 不可否认性 | 否 | 否 | 是 |
| 速度 | 快 | 快 | 慢 |
| 支付用途 | KCV | 交易认证 | 证书签名 |

## ISO 9797-1 MAC 算法

ISO 9797-1 定义了基于分组密码（通常是 DES/3DES）的 MAC 算法，是支付消息认证的基础。

### 算法 1（CBC-MAC）
最简单的形式：以 CBC 模式加密消息，使用最后一个分组作为 MAC。

```
MAC = DES_Encrypt(密钥, CBC 链的最后一个分组)
```

- 简单但对可变长度消息存在已知弱点
- 仍在遗留系统中使用

### 算法 3（零售 MAC / ANSI X9.19）
最常见的支付 MAC 算法：

1. 用单 DES 处理除最后一个分组外的所有分组
2. 对最后一个分组应用 3DES

```
中间值 = DES_Encrypt(左密钥, 数据分组)
MAC = 3DES_Encrypt(密钥, 最后一个中间分组)
```

这就是整个支付行业使用的**零售 MAC**。参见 [零售 MAC 工具](/payments-mac-retail) 和 [ANSI X9.9/X9.19 工具](/payments-mac-ansix9)。

使用我们的 [ISO 9797-1 MAC 工具](/payments-mac-iso9797-1) 计算所有算法和填充组合的 MAC。

## AS2805 MAC（澳大利亚 EFTPOS）

AS2805 是澳大利亚 EFTPOS 交易标准，基于 ISO 8583，使用特定的 MAC 算法进行交易认证。

使用 [AS2805 MAC 工具](/payments-mac-as2805) 进行 AS2805 专用 MAC 计算。

## 3DES CBC-MAC

直接的基于 3DES 的 CBC-MAC：

```
MAC = 3DES_Encrypt(密钥, 3DES-CBC 链的最后一个分组)
```

用于各种遗留支付和银行协议。参见 [3DES CBC-MAC 工具](/payments-mac-tdes-cbc-mac)。

## HMAC——现代标准

HMAC（基于哈希的 MAC）使用密码学哈希函数而非分组密码：

```
HMAC(K, m) = Hash((K ⊕ opad) || Hash((K ⊕ ipad) || m))
```

### HMAC-SHA256
- 最广泛使用的现代 MAC
- 用于：TLS、JWT、REST API 认证、AWS 签名
- 256 位输出，截断到所需长度

使用 [HMAC 计算器](/payments-mac-hmac) 计算 HMAC-SHA256 和 HMAC-SHA512。

## AES-CMAC——现代支付 MAC

CMAC（基于密码的 MAC）使用 AES 的特殊模式生成 MAC：

```
CMAC = 带子密钥派生的 AES-CBC-MAC
```

相比 CBC-MAC 的优势：
- 对可变长度消息安全
- 无填充预言机漏洞
- 用于现代支付标准（EMV、DUKPT AES）

使用 [CMAC 工具](/payments-mac-cmac) 计算 AES-CMAC 和 3DES-CMAC。

## MAC 在交易流程中的应用

以下是 MAC 如何保护典型 ATM 交易：

```
1. ATM 构建 ISO 8583 消息
2. ATM 使用 MAC 密钥对消息字段计算 MAC
3. MAC 附加到消息（字段 64 或 128）
4. 消息发送到主机

5. 主机接收消息
6. 主机使用相同 MAC 密钥对相同字段计算 MAC
7. 主机比较计算的 MAC 与接收到的 MAC
8. 如果匹配：消息真实。如果不匹配：拒绝交易。
```

MAC 密钥本身通常是 DUKPT 派生密钥（每笔交易唯一）——参见 [DUKPT 指南](/guides/dukpt-key-derivation-tutorial)。

## MAC 密钥管理

MAC 密钥是 HSM 密钥层次结构中的工作密钥：
- 从区域 MAC 密钥（ZMK）派生或通过 DUKPT 派生
- 定期轮换（每日、每会话或通过 DUKPT 每笔交易）
- 在 HSM 中以 LMK 加密形式存储

HSM 密钥管理概述，参见 [HSM 密钥管理指南](/guides/hsm-key-management-overview)。

## 选择正确的 MAC 算法

| 场景 | 推荐 MAC |
|------|---------|
| 遗留 ATM/POS（TDES） | ISO 9797-1 算法 3（零售 MAC） |
| 现代支付（AES） | AES-CMAC |
| REST API / Web | HMAC-SHA256 |
| 澳大利亚 EFTPOS | AS2805 MAC |
| EMV 芯片交易 | AES-CMAC |

## 在线工具

- [ISO 9797-1 MAC](/payments-mac-iso9797-1) —— 所有算法和填充方法
- [ANSI X9.9/X9.19 零售 MAC](/payments-mac-ansix9) —— 经典支付 MAC
- [零售 MAC](/payments-mac-retail) —— ISO 9797-1 算法 3
- [3DES CBC-MAC](/payments-mac-tdes-cbc-mac) —— 简单 3DES MAC
- [HMAC 计算器](/payments-mac-hmac) —— HMAC-SHA256/SHA512
- [CMAC 计算器](/payments-mac-cmac) —— AES-CMAC 和 3DES-CMAC
- [AS2805 MAC](/payments-mac-as2805) —— 澳大利亚 EFTPOS MAC
