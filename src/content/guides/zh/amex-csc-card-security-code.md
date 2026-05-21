美国运通（AMEX）使用的卡安全码（CSC）算法与 Visa 和 Mastercard 使用的标准 CVV/CVC 不同。本指南解释 AMEX 卡特有的 CSC3、CSC4 和 CSC5 计算方法。

## 什么是 AMEX CSC？

AMEX 卡上的安全码与 Visa/Mastercard 的 CVV 用途相同——验证进行交易的人是否实际持有该卡。然而，AMEX 使用了独特的密码学方法，包含多个 CSC 值。

### CSC 类型

- **CSC3**：3 位代码，功能类似于 Visa 的 CVV2。印刷在卡片上，但未编码在磁条上。
- **CSC4**：4 位代码，印刷在卡片正面。这是 AMEX"无卡"交易的主要安全码。
- **CSC5**：5 位代码，用于特定的 AMEX 安全场景。

## CSC 与 CVV 的区别

Visa 和 Mastercard 使用单一的 CVK 对（CVK-A 和 CVK-B）进行所有卡验证，而 AMEX CSC 使用不同的方法：

| 特性 | Visa/MC CVV | AMEX CSC |
|------|-------------|----------|
| 代码数量 | 1 个（CVV1/CVV2） | 多个（CSC3/4/5） |
| 位数 | 3 | 3、4 或 5 |
| 正面/背面 | 背面 | 正面（CSC4）+ 背面（CSC3） |
| 算法 | 基于 DES 的单一算法 | 多个变体 |
| 服务码 | 按类型不同 | 按类型特定 |

## CSC 算法概述

AMEX CSC 计算与标准 [CVV 计算](/guides/cvv-cvc-calculation-methods) 有一些相似之处，但使用不同的密钥管理和处理步骤。

### 输入数据

- **PAN**：主账号（AMEX 为 15 位）
- **有效期**：YYMM 格式
- **服务码**：3 位数字（因 CSC 类型而异）
- **CSC 密钥 A 和 CSC 密钥 B**：AMEX 特定的卡验证密钥

### CSC3 计算

CSC3 使用 3 位输出，遵循以下流程：

1. 从 PAN、有效期和服务码构造数据块
2. 使用 CSC 密钥 A 进行 [3DES](/guides/des-3des-legacy-encryption) 加密
3. 与剩余 PAN 数据进行 XOR
4. 再次加密
5. 通过十进制化过程提取 3 位十进制数字

### CSC4 计算

CSC4 产生 4 位代码，使用修改后的算法：

1. 使用 PAN（AMEX 为 15 位）、有效期和服务码构造数据块
2. 通过 CSC4 特定的加密链进行处理
3. 应用 CSC4 十进制化以提取 4 位数字

4 位输出提供更大的密钥空间（10,000 个可能值，而 3 位代码为 1,000 个），为在线交易提供更强的验证。

### CSC5 计算

CSC5 是 5 位代码，用于特定的 AMEX 安全应用。它遵循类似的密码学过程，但产生 5 位输出，提供 100,000 个可能值。

## AMEX 卡特点

AMEX 卡有几个影响 CSC 计算的独特特征：

- **15 位 PAN**：AMEX 卡使用 15 位 PAN（以 34 或 37 开头），不同于 Visa/Mastercard 使用的 16 位 PAN
- **某些计算中无校验位**：Luhn 校验位的处理可能不同
- **正面印刷安全码**：CSC4 印刷在正面，在持卡交易时可见
- **多个验证码**：一张卡上可以同时有 CSC3、CSC4 和 CSC5

## 实际应用场景

### 在线交易验证

当 AMEX 卡用于在线购物时：

1. 商户请求 CSC4（4 位正面代码）
2. AMEX 在授权消息中接收 CSC4 值
3. HSM 使用存储的 CSC 密钥重新计算预期的 CSC4
4. 如果提交的 CSC4 匹配，交易继续进行

### 欺诈检测

多个 CSC 值使 AMEX 能够实施分层安全：

- CSC4 用于主要在线验证
- CSC3 用于次要验证渠道
- CSC5 用于专门的安全应用

## CSC 密钥管理

AMEX CSC 密钥遵循与其他卡验证密钥相同的安全原则：

- 在 [HSM](/guides/hsm-key-management-overview) 内部生成
- 以 [LMK](/guides/thales-lmk-key-encryption) 加密形式存储
- 分成组件加载（参见[密钥分片指南](/guides/understanding-key-splitting-kcv)）
- 永远不会在 HSM 外以明文形式暴露
- 按照 AMEX 安全策略定期轮换

## 安全特性

1. **单向函数**：无法从已知 CSC 值推导出 CSC 密钥
2. **密钥分离**：不同的 CSC 类型可能使用不同的密钥
3. **输入敏感性**：PAN 或有效期的任何变化都会产生完全不同的 CSC
4. **更大密钥空间**：CSC4（10,000 个值）和 CSC5（100,000 个值）比 3 位代码提供更强的验证

## 常见问题

### 为什么 AMEX 使用多个 CSC 值？

多个 CSC 值使 AMEX 能够区分交易类型和渠道，提供分层安全。每个 CSC 类型可以独立验证，一个渠道中被泄露的值不会影响其他渠道。

### 为什么 AMEX CSC 在卡片正面？

AMEX 将 4 位 CSC4 放在正面是出于历史和实际原因。它也使 AMEX 卡在视觉上与 Visa/Mastercard 区分开来，后者将验证码放在背面。

### 没有 HSM 可以计算 CSC 值吗？

CSC 密钥是保密的，仅在 HSM 内部可用。虽然算法是已知的，但没有密钥就无法计算有效的 CSC 值。我们的工具允许您使用测试密钥体验算法。

## 亲自尝试

使用我们的 AMEX CSC 工具理解和验证卡安全码计算：

- [Amex CSC 计算器](/payments-card-validation-amex-cscs) —— 使用测试密钥计算 CSC3、CSC4 和 CSC5 值

所有计算在您的浏览器中运行——您的 CSC 密钥不会离开您的设备。
