PIN 块是金融系统中加密和传输个人识别码（PIN）的标准格式。本指南涵盖所有 ISO 9564 格式。

## 什么是 PIN 块？

PIN 块是一种格式化的数据块，以特定格式包含 PIN，设计用于安全加密和传输。该格式结合了：

- PIN 本身
- "填充"模式（随机或固定数据）
- 通常还包括主账号（PAN）

PIN 块使用 PIN 加密密钥（PEK）加密，PEK 是 [HSM 密钥层次结构](/guides/hsm-key-management-overview) 中的工作密钥。在高交易量部署中，PEK 通常是 [DUKPT](/guides/dukpt-key-derivation-tutorial) 派生密钥，每笔交易唯一。

## ISO 9564 PIN 块格式

### 格式 0（ISO-0）

最广泛使用的格式，编码需要 PAN：

```
PIN 块 = PIN 字段 XOR PAN 字段
```

**PIN 字段结构：**
- 字节 0：`0x0`（格式标识符）| PIN 长度（4 位）
- 字节 1-7：PIN 数字后跟 `0xF` 填充

**PAN 字段结构：**
- 前 4 个半字节：`0x0000`
- 接下来 12 个半字节：PAN 最右侧 12 位数字（不含校验位）

**加密方式**：通常使用 [3DES](/guides/des-3des-legacy-encryption) ECB 模式

### 格式 1（ISO-1）

不需要 PAN，使用随机填充：

- 字节 0：`0x1` | PIN 长度
- PIN 数字后跟随机填充

优点：无需 PAN，随机填充更安全  
缺点：不解密无法验证 PIN 块完整性

### 格式 2（ISO-2）

ICC（芯片卡）格式，从不传输：

- 字节 0：`0x2` | PIN 长度
- PIN 数字后跟 `0xF` 填充
- 仅用于芯片卡内部 PIN 验证

### 格式 3（ISO-3）

类似格式 0，但使用随机填充：

- 字节 0：`0x3` | PIN 长度
- PIN 数字后跟随机填充（0xA-0xE 范围）
- 与 PAN 字段 XOR

由于随机性，比格式 0 更安全。

### 格式 4（ISO-4）

最新、最安全的格式，专为 [AES 加密](/guides/aes-encryption-explained) 设计：

- 16 字节（128 位）而非 8 字节
- 使用 AES-128 加密
- 包含额外安全特性

结构：
- 带格式标识符的控制字段
- PIN 长度
- PIN 数字
- 随机填充
- PAN 哈希

格式 4 是支付系统从 3DES 迁移到 AES 的一部分，与 [DUKPT AES](/payments-dukpt-aes) 和 [TR-31 Version D](/guides/what-is-tr31-key-block) 一起使用。

## 安全对比

| 格式 | 需要 PAN | 填充类型 | 块大小 | 推荐程度 |
|------|---------|---------|--------|---------|
| 0 | 是 | 固定（0xF） | 8 字节 | 遗留 |
| 1 | 否 | 随机 | 8 字节 | 良好 |
| 2 | 不适用 | 固定 | 8 字节 | 仅芯片 |
| 3 | 是 | 随机 | 8 字节 | 较好 |
| 4 | 是 | 随机 | 16 字节 | 最佳 |

## 各格式使用场景

- **格式 0**：遗留系统、ATM 网络（当今最常见）
- **格式 1**：无法访问 PAN 的系统
- **格式 3**：现代 TDES 系统
- **格式 4**：新的 AES 实现

## PIN 块在交易流程中的应用

1. 客户在 ATM/POS 输入 PIN
2. 终端将 PIN 格式化为 PIN 块（格式 0 或 3）
3. 使用 PEK（或 DUKPT 派生密钥）加密 PIN 块
4. 加密的 PIN 块放入 [ISO 8583](/guides/iso8583-payment-messages) 字段 52
5. 带 MAC 的消息发送到收单方
6. 收单方在交换密钥下重新加密 PIN 块
7. 发卡方解密并验证 PIN

ISO 8583 消息中的 [MAC](/guides/mac-algorithms-payment-security) 保护整个交易免受篡改。

## PIN 验证方法

### IBM 3624（PIN 偏移量）
- 发卡方使用 PIN 派生密钥从 PAN 派生"自然 PIN"
- PIN 偏移量 = 客户 PIN - 自然 PIN（mod 10）
- 偏移量存储在卡上或数据库中
- 使用 [PIN 偏移量计算器](/payments-pin-offset)

### VISA PVV（PIN 验证值）
- 从 PIN、PAN 和 PVK 派生的 4 位值
- 存储在磁条上
- 使用 [PIN PVV 计算器](/payments-pin-pvv)

## 亲自尝试

使用我们的 PIN 块工具以所有格式编码和解码 PIN 块：

- [PIN 块通用工具](/payments-pin-blocks-general) —— 所有 ISO 9564 格式（0、1、2、3）
- [PIN 块 AES 工具](/payments-pin-blocks-aes) —— 格式 4（基于 AES）
- [PIN 偏移量计算器](/payments-pin-offset) —— IBM 3624 PIN 偏移量
- [PIN PVV 计算器](/payments-pin-pvv) —— VISA PIN 验证值

包含编码/解码过程的逐步可视化。
