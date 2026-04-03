DES 和 3DES（三重 DES）在银行和支付系统中作为主流加密标准使用了数十年。虽然已被 AES 大量替代，但它们在遗留支付基础设施中仍然广泛存在。本文解释它们的工作原理以及您仍会遇到它们的场景。

## 什么是 DES？

DES（数据加密标准）于 1977 年被 NIST 采用。它是一种**分组密码**，使用 56 位密钥对 64 位（8 字节）数据块进行加密。

基本参数：
- 分组大小：**64 位**（8 字节）
- 密钥大小：**56 位**（存储为 64 位，含奇偶校验位）
- 结构：Feistel 网络，16 轮
- 状态：**已被破解**——56 位密钥对现代硬件来说太小了

## 为什么 DES 已被破解

56 位密钥意味着 2⁵⁶ ≈ 72 千万亿种可能的密钥。1998 年，EFF 的"Deep Crack"机器花费 22 小时、25 万美元破解了 DES。如今，类似硬件只需几千美元，几小时内即可破解 DES。

**新系统绝不使用单 DES。**

## 什么是 3DES（三重 DES）？

3DES 将 DES 应用三次以提高安全性：

```
加密: C = DES_Encrypt(K3, DES_Decrypt(K2, DES_Encrypt(K1, P)))
解密: P = DES_Decrypt(K1, DES_Encrypt(K2, DES_Decrypt(K3, C)))
```

这种 EDE（加密-解密-加密）结构是为了向后兼容——如果 K1=K2=K3，它退化为单 DES。

### 3DES 密钥选项

| 选项 | 密钥 | 有效密钥位数 | 说明 |
|------|------|------------|------|
| 3 密钥 3DES | K1≠K2≠K3 | 112 位 | 使用 3DES 时推荐 |
| 2 密钥 3DES | K1≠K2，K3=K1 | 80 位 | 较弱，避免使用 |
| 1 密钥 3DES | K1=K2=K3 | 56 位 | 与 DES 相同，无意义 |

3DES 密钥通常为 16 字节（2 密钥）或 24 字节（3 密钥）。

## DES 密钥奇偶校验

DES 密钥有一个特殊属性：每个字节包含 7 位密钥数据和 1 位**奇偶校验位**。奇偶校验位的设置使每个字节有**奇数个 1 位**。

```
密钥字节: 0101 010[P]
          ↑ 7 位密钥数据  ↑ 奇偶校验位
```

XOR 运算（如密钥分片）后，奇偶校验可能丢失，必须恢复。[密钥分片生成器](/keyshare-generator) 在合并密钥组件时自动调整奇偶校验。

## 3DES 在支付系统中的应用

3DES 在支付基础设施中根深蒂固：

### PIN 加密
- ATM PIN 键盘使用 3DES 加密 PIN（ISO 9564 格式 0/1/3）
- PIN 加密密钥（PEK）是 3DES 密钥
- 参见 [PIN 块指南](/guides/pin-block-formats-iso9564) 和 [PIN 块工具](/payments-pin-blocks-general)

### DUKPT（ISO 9797）
- 原始 DUKPT 使用 3DES 进行密钥派生
- BDK 和 IPEK 是 3DES 密钥
- 参见 [DUKPT 指南](/guides/dukpt-key-derivation-tutorial) 和 [DUKPT 工具](/payments-dukpt-iso9797)

### MAC 算法
- ISO 9797-1 算法使用 DES/3DES
- 零售 MAC（ANSI X9.19）使用 3DES
- 参见 [MAC 指南](/guides/mac-algorithms-payment-security)

### HSM 密钥存储
- Thales、Futurex 和 Atalla HSM 将密钥存储为 3DES LMK 加密形式
- TR-31 版本 A、B、C 使用 3DES 密钥封装
- 参见 [HSM 概述](/guides/hsm-key-management-overview)

### CVV/CVC 计算
- CVV 使用 3DES 加密
- 参见 [CVV 指南](/guides/cvv-cvc-calculation-methods)

## 3DES 与 AES 对比

| 属性 | 3DES | AES |
|------|------|-----|
| 分组大小 | 64 位 | 128 位 |
| 密钥大小 | 112/168 位 | 128/192/256 位 |
| 速度 | 比 DES 慢约 3 倍 | 快得多 |
| 安全性 | 尚可（约至 2030 年） | 强 |
| 状态 | 遗留，正在淘汰 | 当前标准 |
| 支付使用 | 广泛遗留 | 增长中 |

NIST 于 2023 年弃用 3DES，2030 年后将禁止使用。新支付系统应使用 AES。

## 从 3DES 迁移到 AES

支付行业正在积极迁移：

- **TR-31 Version D**：基于 AES 的密钥块（替代版本 A/B/C）
- **DUKPT AES**：基于 AES 的每笔交易密钥（替代 3DES DUKPT）
- **PIN 块格式 4**：AES 加密的 PIN 块（替代格式 0/1/3）
- **AES-CMAC**：替代 ISO 9797-1 MAC 算法

## 3DES 密钥的 KCV

3DES 密钥的密钥校验值：
1. 使用 3DES 密钥在 ECB 模式下加密 8 字节 `0x00`
2. 取前 3 字节（6 个十六进制字符）

示例：密钥 `0123456789ABCDEFFEDCBA9876543210` → KCV `08D7B4`

使用 [密钥生成器](/keys-dea) 生成带 KCV 的 3DES 密钥，或使用 [密钥分片生成器](/keyshare-generator) 将其分成组件。

## 在线工具

- [DES/3DES 加密工具](/des-encryption) —— 使用 DES/3DES 加密和解密
- [密钥生成器](/keys-dea) —— 生成带 KCV 的 3DES 密钥
- [密钥分片生成器](/keyshare-generator) —— 将 3DES 密钥分成组件
- [PIN 块工具](/payments-pin-blocks-general) —— 3DES PIN 块编码/解码
- [DUKPT 工具](/payments-dukpt-iso9797) —— 3DES DUKPT 密钥派生
- [零售 MAC 工具](/payments-mac-retail) —— 基于 3DES 的 MAC 计算
