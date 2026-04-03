DUKPT（每笔交易唯一密钥派生）是一种为每笔交易生成唯一加密密钥的密钥管理方案。本教程解释完整的派生过程。

## 什么是 DUKPT？

DUKPT 提供了一种方法：

1. 从单个基础密钥派生唯一的交易密钥
2. 确保一个交易密钥的泄露不会暴露其他密钥
3. 支持数百万笔交易而不耗尽密钥

DUKPT 用于 ATM、POS 终端以及任何需要加密 PIN 或数据而无需每次交易都连接 [HSM](/guides/hsm-key-management-overview) 的设备。

## 关键组件

### 基础派生密钥（BDK）
收单方/处理方持有的主密钥。永不离开安全密钥管理系统，在 HSM 中以 LMK 加密形式存储。在 [TR-31 格式](/guides/what-is-tr31-key-block) 中，BDK 的密钥用途代码为 `B0`。

### 初始 PIN 加密密钥（IPEK）
从 BDK 和初始 KSN 派生。注入到 PIN 键盘设备中。注入后，设备不再需要 BDK。

### 密钥序列号（KSN）
包含以下内容的唯一标识符：
- 密钥集 ID（KSI）：标识 BDK
- 设备 ID：每台设备唯一
- 交易计数器：每笔交易递增

格式：`KKKKKKKKKKTTTTTTTTTT`（80 位）
- K：密钥集 ID + 设备 ID
- T：交易计数器（21 位）

### 当前交易密钥
使用 KSN 的计数器部分从 IPEK 派生。

## 派生过程

### 步骤 1：计算 IPEK

```
IPEK = TDES_Encrypt(BDK, 计数器清零的 KSN) 
     || TDES_Encrypt(BDK XOR C0C0..., 计数器清零的 KSN)
```

### 步骤 2：未来密钥派生

对于每笔交易：

1. 从 IPEK（或当前密钥寄存器）开始
2. 对计数器中每个置位的位（从左到右）：
   - 应用"黑盒"函数
   - XOR 并加密以派生中间密钥
3. 最终结果是当前密钥

### 步骤 3：工作密钥派生

从当前密钥派生特定工作密钥：

- **PIN 加密密钥（PEK）**：与掩码 `0x00000000000000FF00000000000000FF` XOR
- **MAC 密钥**：与掩码 `0x000000000000FF00000000000000FF00` XOR
- **数据加密密钥**：与掩码 `0x0000000000FF00000000000000FF0000` XOR

PEK 用于加密 [PIN 块](/guides/pin-block-formats-iso9564)，MAC 密钥用于计算 [交易 MAC](/guides/mac-algorithms-payment-security)。

## 实际示例

给定：
- BDK：`0123456789ABCDEFFEDCBA9876543210`
- KSN：`FFFF9876543210E00001`

**步骤 1：提取初始 KSN（清零计数器）**
```
初始 KSN: FFFF9876543210E00000
```

**步骤 2：计算 IPEK**
```
IPEK: 6AC292FAA1315B4D858AB3A3D7D5933A
```

**步骤 3：为计数器 1 派生密钥**
```
当前密钥: 042666B49184CFA368DE9628D0397BC9
```

**步骤 4：派生 PEK**
```
PEK: 042666B49184CF5C68DE962BD0397B36
```

## 安全注意事项

1. **计数器耗尽**：约 2²¹（约 200 万）笔交易后，设备需要重新注入密钥
2. **未来密钥保密性**：即使当前密钥被泄露，也无法推导出未来密钥
3. **BDK 保护**：BDK 绝不能暴露；所有安全性都依赖于它——将其存储在 [HSM](/guides/hsm-key-management-overview) 中

## AES DUKPT

现代实现使用 [AES](/guides/aes-encryption-explained) 替代 [3DES](/guides/des-3des-legacy-encryption)：

- 128/192/256 位密钥大小
- 增强的安全性
- 更大的计数器空间
- 不同的派生算法（NIST SP 800-108）
- 与 [PIN 块格式 4](/guides/pin-block-formats-iso9564)（AES 加密的 PIN 块）配合使用

NIST 于 2023 年弃用 3DES，新部署应使用 AES DUKPT。

## DUKPT 在支付生态系统中的位置

DUKPT 密钥使用 [TR-31 密钥块](/guides/what-is-tr31-key-block) 传输到设备（BDK 的用途代码为 `B0`）。BDK 存储在 HSM 中，IPEK 在密钥注入仪式期间派生并注入设备。

关于密钥如何在支付系统中流转的完整图景，参见 [HSM 密钥管理概述](/guides/hsm-key-management-overview)。

## 亲自尝试

使用我们的 DUKPT 工具：

- [DUKPT 工具（3DES/ISO 9797）](/payments-dukpt-iso9797) —— 从 BDK 和 KSN 计算 IPEK，逐步派生交易密钥，生成 PIN、MAC 和数据加密密钥
- [DUKPT AES 工具](/payments-dukpt-aes) —— 基于 AES 的 DUKPT 派生

所有处理在您的浏览器本地完成——您的 BDK 不会离开您的设备。
