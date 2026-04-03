卡验证值（CVV）和卡验证码（CVC）是防止卡片欺诈的安全特性。本指南解释它们是如何通过密码学方式生成的。

## 卡验证值的类型

### CVV1（磁条）
- 编码在磁条上（磁道 1 和磁道 2）
- 用于面对面"持卡"交易
- 3 位数字

### CVV2/CVC2（印刷）
- 印刷在卡片上（Visa/MC 在背面，Amex 在正面）
- 用于"无卡"交易（网络/电话）
- 3 位数字（Visa/MC）或 4 位数字（Amex）

### iCVV（集成电路）
- 存储在芯片中
- 与 CVV1 不同，防止磁条复制攻击
- 使用不同的服务码（`999`）与 CVV1 区分

### 动态 CVV/CVC3
- 由非接触/芯片每笔交易生成
- 不断变化，提供额外安全性
- 用于 Mastercard 非接触交易

## CVV 计算过程

CVV 计算使用 [3DES 加密](/guides/des-3des-legacy-encryption) 和一对卡验证密钥（CVK）。

### 输入数据

1. **主账号（PAN）**：16 位卡号
2. **有效期**：MMYY 或 YYMM 格式
3. **服务码**：3 位数字（例如 CVV1 为 101，CVV2 为 000）
4. **CVK A 和 CVK B**：卡验证密钥（各 16 个十六进制字符）

### 算法步骤

**步骤 1：准备数据块**

连接 PAN（右对齐）+ 有效期 + 服务码，填充至 32 个十六进制字符：

```
块 A：PAN[12 位] + 有效期[4] + 服务码[3] + 填充
块 B：剩余 PAN 数字 + 填充
```

**步骤 2：加密块 A**

```
Encrypted_A = 3DES_Encrypt(CVK_A, Block_A)
```

**步骤 3：与块 B 进行 XOR**

```
XORed = Encrypted_A XOR Block_B
```

**步骤 4：再次加密**

```
Encrypted_B = 3DES_Encrypt(CVK_A, XORed)
```

**步骤 5：十进制化**

从结果中提取数字：
1. 取十六进制字符 0-9 作为数字
2. 对于 A-F，减去 10 得到 0-5
3. 取前 3 位（Amex 取 4 位）

### 示例

给定：
- PAN：`4012345678901234`
- 有效期：`2512`（2025 年 12 月）
- 服务码：`101`
- CVK：`0123456789ABCDEF FEDCBA9876543210`

结果：CVV = `123`（示例）

## CVV2 与 CVV1 的区别

| 属性 | CVV1 | CVV2 |
|------|------|------|
| 位置 | 磁条 | 印刷在卡片上 |
| 服务码 | 101 | 000 |
| 用途 | 持卡交易 | 无卡交易 |
| 可被复制 | 是 | 否（不在磁条上） |

## Amex CSC（卡安全码）

美国运通使用不同的方案，有多个 CSC 值：
- **CSC3**：背面的 3 位数字
- **CSC4**：正面的 4 位数字（主要安全码）
- **CSC5**：5 位数字

Amex CSC 使用与 Visa/Mastercard CVV 不同的算法。使用 [Amex CSC 计算器](/payments-card-validation-amex-cscs) 进行 Amex 专用计算。

## Mastercard CVC3（动态）

Mastercard 非接触卡使用 **CVC3**——每笔交易生成的动态值，使用：
- 应用交易计数器（ATC）
- 不可预测数（UN）
- 卡特定密钥（从 IMK 派生）

这使得被盗的值对未来交易毫无用处。使用 [Mastercard CVC3 计算器](/payments-card-validation-mastercard-cvc3)。

## 安全特性

1. **单向函数**：无法从 CVV 反推 CVK
2. **密钥依赖**：不同的 CVK 产生不同的 CVV
3. **输入敏感性**：PAN/有效期的任何变化都会改变 CVV

## CVK 密钥管理

CVK 是存储在 [HSM](/guides/hsm-key-management-overview) 中的敏感密钥：
- 在 HSM 内部生成
- 分成组件加载（参见 [密钥分片指南](/guides/understanding-key-splitting-kcv)）
- 以 LMK 加密形式存储
- 仅在 HSM 内部用于 CVV 生成/验证

## 为什么动态 CVV 很重要

传统 CVV 是静态的——一旦被盗，可以重复使用。动态 CVV（CVC3）每笔交易都会变化，使被盗的值对未来交易毫无用处。

这是更广泛的 EMV 芯片卡安全模型的一部分，还包括：
- [DUKPT](/guides/dukpt-key-derivation-tutorial) 用于每笔交易的唯一密钥
- [PIN 块](/guides/pin-block-formats-iso9564) 用于安全 PIN 传输
- [数字签名](/guides/ecc-digital-signatures-explained) 用于卡片认证

## 亲自尝试

- [CVV/CVV2/iCVV 计算器](/payments-card-validation-cvvs) —— 计算和验证 Visa/Mastercard CVV 值
- [Amex CSC 计算器](/payments-card-validation-amex-cscs) —— Amex 专用 CSC 计算
- [Mastercard CVC3 计算器](/payments-card-validation-mastercard-cvc3) —— 非接触动态 CVC3

所有计算在您的浏览器中运行——您的 CVK 不会离开您的设备。
