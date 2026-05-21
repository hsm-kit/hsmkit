AES-DUKPT 是 DUKPT 密钥管理方案的现代演进，用 AES 加密取代了传统的基于 3DES 的方法。本指南涵盖 AES-DUKPT 派生过程及其相对于 TDEA-DUKPT 的优势。

## 什么是 AES-DUKPT？

AES-DUKPT（高级加密标准 - 每笔交易唯一密钥派生）在 ANSI X9.24-3 中定义，提供与传统 DUKPT 相同的每笔交易密钥唯一性，但使用 [AES](/guides/aes-encryption-explained) 而非 [3DES](/guides/des-3des-legacy-encryption)。

NIST 于 2023 年弃用 3DES，使得 AES-DUKPT 成为新支付终端部署的推荐方案。

## AES-DUKPT 与 TDEA-DUKPT 对比

| 特性 | TDEA-DUKPT | AES-DUKPT |
|------|------------|-----------|
| 加密算法 | 三重 DES | AES-128/192/256 |
| 密钥大小 | 16 字节（双密钥） | 16、24 或 32 字节 |
| 计数器空间 | 2¹ 笔交易 | 2²⁴ 笔交易 |
| 派生方法 | 基于 XOR | 基于 CMAC（NIST SP 800-108） |
| PIN 块格式 | 格式 0/3 | 格式 4（AES） |
| 标准 | ANSI X9.24-1 | ANSI X9.24-3 |
| 安全级别 | 传统 | 现代 |

## 关键组件

### 基础派生密钥（BDK）

收单方或支付处理商持有的主密钥：

- 以 [LMK](/guides/thales-lmk-key-encryption) 加密形式存储在 [HSM](/guides/hsm-key-management-overview) 中
- 用于为设备派生初始密钥
- 永远不会离开安全密钥管理系统
- 在 [TR-31 格式](/guides/what-is-tr31-key-block) 中，密钥用途代码为 `B0`

### 初始密钥（IK）

AES-DUKPT 中等同于 TDEA-DUKPT 中 IPEK 的概念：

- 从 BDK 和设备的初始密钥序列号（IKSN）派生
- 注入到 PIN 键盘或终端中
- 注入后，设备不再需要 BDK

### 初始密钥序列号（IKSN）

80 位标识符，包含：

- **密钥集 ID**：标识使用了哪个 BDK
- **设备 ID**：每台终端/设备唯一
- **交易计数器**：从 0 开始递增

IKSN 与 TDEA-DUKPT 中的 KSN 用途相同，但具有更大的计数器空间。

### 未来密钥

AES-DUKPT 在初始化期间预计算一组未来密钥：

- 存储在设备的密钥寄存器中
- 随着交易计数器推进而使用
- 提供前向保密性——当前密钥的泄露不会暴露未来密钥

## 密钥派生过程

### 步骤 1：派生初始密钥

IK 使用基于 CMAC 的派生从 BDK 派生：

```
IK = KDF(BDK, IKSN_data)
```

其中 KDF 是 NIST SP 800-108 密钥派生函数，使用计数器模式下的 CMAC。

### 步骤 2：派生交易密钥

对于每笔交易，工作密钥从 IK 和当前计数器派生：

```
交易密钥 = DeriveKey(IK, 计数器)
```

派生使用基于树的方法：
- 计数器中的每个位位置对应一个密钥派生步骤
- 通过在每个置位的位位置应用 KDF 来派生密钥
- 最终结果是唯一的交易密钥

### 步骤 3：派生工作密钥

从交易密钥派生用于不同目的的特定工作密钥：

- **PIN 加密密钥**：用于加密 [PIN 块（格式 4）](/guides/pin-block-formats-iso9564)
- **MAC 密钥**：用于计算[消息认证码](/guides/mac-algorithms-payment-security)
- **数据加密密钥**：用于加密敏感数据

每个工作密钥通过使用不同的上下文/标签应用 KDF 来派生。

## 基于 CMAC 的派生

与 TDEA-DUKPT 基于 XOR 的方法不同，AES-DUKPT 使用 CMAC（基于密码的消息认证码）：

```
派生密钥 = AES-CMAC(派生密钥, 输入数据)
```

这提供了：
- 更强的密码学特性
- 输入变化的更好扩散性
- 与 NIST 建议的一致性

## 实际示例

给定：
- BDK：`0123456789ABCDEFFEDCBA98765432100123456789ABCDEF`
- IKSN：`FFFF9876543210E00000`

**步骤 1：派生 IK**
```
IK：（使用基于 CMAC 的 KDF 派生）
```

**步骤 2：为计数器 1 派生交易密钥**
```
交易密钥：（从 IK 和计数器派生）
```

**步骤 3：派生 PIN 加密密钥**
```
PEK：（使用 PIN 特定上下文派生）
```

## 安全特性

### 前向保密性

AES-DUKPT 通过密钥派生树提供前向保密性：

- 交易密钥 N 的泄露不会暴露交易密钥 N+1
- 未来密钥使用单向函数派生
- 每个交易密钥在密码学上是独立的

### 更大的计数器空间

AES-DUKPT 每台设备支持 2²⁴（约 1,670 万）笔交易，而 TDEA-DUKPT 为 2¹（约 200 万）。

### 算法强度

AES-128 比双密钥 3DES 提供更强的安全性：

- 没有已知的实用攻击方法针对 AES-128
- 3DES 有已知的中间相遇攻击，降低了有效密钥大小
- AES 是当前的 NIST 标准

## PIN 块格式 4

AES-DUKPT 与 [PIN 块格式 4](/guides/pin-block-formats-iso9564) 配合使用，这是基于 AES 的 PIN 块格式：

- 16 字节而非 8 字节
- AES-128 加密而非 3DES
- 包含 PAN 哈希以确保完整性
- 随机填充提供额外安全性

格式 4 是支付系统从 3DES 迁移到 AES 的更广泛计划的一部分。

## 从 TDEA-DUKPT 迁移

对于从 TDEA-DUKPT 迁移到 AES-DUKPT 的组织：

1. **HSM 支持**：确保您的 [HSM](/guides/hsm-key-management-overview) 支持 AES-DUKPT（Thales、SafeNet 等）
2. **终端更新**：部署支持 AES-DUKPT 的新终端
3. **密钥注入**：使用 AES BDK 执行新的密钥注入仪式
4. **双支持**：在过渡期间并行运行两个系统
5. **TR-31 版本 D**：使用 [TR-31 版本 D](/guides/what-is-tr31-key-block) 密钥块进行 AES 密钥传输

## 亲自尝试

使用我们的 AES-DUKPT 工具理解和验证密钥派生：

- [DUKPT AES 工具](/payments-dukpt-aes) —— 从 BDK 派生初始密钥，生成交易密钥，计算用于 PIN、MAC 和数据加密的工作密钥

所有处理在您的浏览器本地完成——您的 BDK 不会离开您的设备。
