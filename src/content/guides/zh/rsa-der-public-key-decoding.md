RSA 公钥有不同的格式——PEM、DER、PKCS#1、PKCS#8、SPKI——理解它们的结构对于密码学工作至关重要。本文解释 DER 编码格式、RSA 公钥如何使用 ASN.1 结构化，以及如何从 DER 编码的密钥中提取模数和指数。

## RSA 公钥格式

RSA 公钥可以用多种格式表示：

### PEM（隐私增强邮件）

PEM 是一种文本格式，将 DER 字节进行 Base64 编码并用头部包装：

```
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0Z3VS5JJcds3xfn/ygWe
...
-----END PUBLIC KEY-----
```

PEM 只是带有可读头部的 Base64 编码 DER。要获取原始字节，需去除头部并进行 Base64 解码。

### DER（可辨别编码规则）

DER 是二进制格式——无编码开销的原始字节。用于：
- 证书文件（.cer、.der）
- 嵌入式系统
- 协议级通信
- 二进制密钥存储

DER 比 PEM 更紧凑（无 Base64 开销），但不是人类可读的。

### 格式间转换

```
PEM → DER:  去除头部，Base64 解码
DER → PEM:  Base64 编码，添加头部
```

## ASN.1 结构

RSA 密钥使用 **ASN.1**（抽象语法标记法一）定义，一种描述数据结构的标准。DER 是 ASN.1 的编码规则之一。

### PKCS#1 格式（RSAPublicKey）

原始的 RSA 特定格式。仅包含 RSA 密钥组件：

```
RSAPublicKey ::= SEQUENCE {
    modulus           INTEGER,    -- n
    publicExponent    INTEGER     -- e
}
```

这是最简单的 RSA 公钥结构。模数是大素数乘积，公钥指数通常为 65537（0x10001）。

### PKCS#8 格式（PublicKey）

通用格式，将算法特定密钥包装在算法标识符中：

```
PublicKeyInfo ::= SEQUENCE {
    algorithm         AlgorithmIdentifier,
    publicKey         BIT STRING
}

AlgorithmIdentifier ::= SEQUENCE {
    algorithm         OBJECT IDENTIFIER,  -- rsaEncryption (1.2.840.113549.1.1.1)
    parameters        ANY DEFINED BY algorithm OPTIONAL
}
```

`publicKey` 字段包含作为位字符串的 PKCS#1 RSAPublicKey。

### SubjectPublicKeyInfo（SPKI）

这是大多数人所说的"DER 公钥"。它是 X.509 证书中使用的 PKCS#8 结构：

```
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
-----END PUBLIC KEY-----
```

当您看到 `-----BEGIN PUBLIC KEY-----` 时，就是 SPKI 格式。

## 提取模数和指数

### 从 SPKI/PKCS#8 DER

结构是嵌套的：

```
SEQUENCE {                          -- SubjectPublicKeyInfo
  SEQUENCE {                        -- AlgorithmIdentifier
    OID 1.2.840.113549.1.1.1       -- rsaEncryption
    NULL
  }
  BIT STRING {                      -- publicKey
    SEQUENCE {                      -- RSAPublicKey (PKCS#1)
      INTEGER                       -- modulus (n)
      INTEGER                       -- publicExponent (e)
    }
  }
}
```

提取步骤：
1. 解析外部 SEQUENCE
2. 验证 OID 为 `1.2.840.113549.1.1.1`（rsaEncryption）
3. 提取 BIT STRING
4. 从位字符串中解析内部 SEQUENCE
5. 读取 INTEGER 值（模数和指数）

### 从 PKCS#1 DER

更简单的结构：

```
SEQUENCE {                          -- RSAPublicKey
  INTEGER                           -- modulus (n)
  INTEGER                           -- publicExponent (e)
}
```

提取步骤：
1. 解析 SEQUENCE
2. 读取两个 INTEGER 值

## PKCS#1 vs PKCS#8 vs SPKI

| 格式 | 头部 | 包含内容 | 算法信息 |
|------|------|---------|---------|
| PKCS#1 | `-----BEGIN RSA PUBLIC KEY-----` | 仅 n 和 e | 无 |
| PKCS#8/SPKI | `-----BEGIN PUBLIC KEY-----` | 算法 OID + n 和 e | 有 |

### 为什么有多种格式？

- **PKCS#1**：简单、RSA 特定、紧凑
- **PKCS#8/SPKI**：通用、支持任何算法、用于证书和标准工具

大多数工具输出 SPKI 格式。PKCS#1 用于某些遗留系统和特定协议。

## 常见 RSA 公钥指数

| 指数 | 十六进制值 | 使用情况 |
|------|-----------|---------|
| 3 | 0x03 | 快速，但有些人认为较弱 |
| 17 | 0x11 | 不太常见 |
| 65537 | 0x10001 | **标准，推荐** |

选择指数 65537（0x10001）是因为：
- 它是费马素数（2^16 + 1）
- 它只有两个置位位，使模幂运算高效
- 它足够大以避免小指数攻击
- 它是事实上的行业标准

## 理解模数

RSA 模数 `n` 是两个大素数的乘积：`n = p × q`

- 典型大小：1024、2048、3072 或 4096 位
- 2048 位是当前最低推荐
- 3072 位推荐用于长期安全
- 4096 位用于最高安全需求

模数决定密钥大小。2048 位 RSA 密钥有 2048 位模数。

## OID（对象标识符）参考

常见 OID：

| OID | 含义 |
|-----|------|
| 1.2.840.113549.1.1.1 | RSA 加密 |
| 1.2.840.113549.1.1.11 | SHA256 with RSA |
| 1.2.840.10045.2.1 | EC 公钥 |
| 1.2.840.10045.3.1.7 | P-256 曲线 |

解析 DER 密钥时，始终验证 OID 与预期算法匹配。

## 实际示例

给定 Base64 编码的 SPKI 公钥：

```
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0Z3VS5JJcds3xfn/ygWe
...
```

1. Base64 解码得到 DER 字节
2. 解析 ASN.1 结构
3. 验证 OID 为 RSA（1.2.840.113549.1.1.1）
4. 提取模数（大整数，2048 位密钥通常为 256 字节）
5. 提取指数（通常为 65537 = 3 字节：01 00 01）

## 调试 DER 密钥

处理 DER 密钥时可能遇到：

### 常见问题

| 问题 | 原因 | 解决方案 |
|------|------|---------|
| 解析错误 | 格式错误 | 检查是 PKCS#1 还是 SPKI |
| OID 错误 | 算法不匹配 | 验证密钥算法 |
| 数据截断 | 复制不完整 | 检查文件长度 |
| 编码错误 | PEM 行换行 | 用正确的换行重新编码 |

### 检查工具

- **OpenSSL 命令行**：`openssl rsa -pubin -in key.pem -text -noout`
- **ASN.1 转储**：`openssl asn1parse -in key.der -inform DER`
- **在线工具**：我们的 RSA DER 解码器提供即时解析

## 密钥格式转换

### PEM 转 DER

```bash
openssl rsa -pubin -in key.pem -out key.der -outform DER
```

### DER 转 PEM

```bash
openssl rsa -pubin -in key.der -inform DER -out key.pem -outform PEM
```

### PKCS#1 转 SPKI

```bash
openssl rsa -RSAPublicKey_in -in pkcs1.pem -pubout -out spki.pem
```

### 提取组件

```bash
openssl rsa -pubin -in key.pem -text -noout
```

这会以人类可读形式输出模数和指数。

## DER 密钥的使用场景

### 证书解析

X.509 证书在证书结构中包含 SPKI DER 格式的公钥。我们的 [SSL 证书解析器](/ssl-certificates) 自动提取此信息。

### API 认证

某些 API 要求 DER 格式的公钥用于签名验证或加密。

### 嵌入式系统

DER 的紧凑二进制格式在资源受限的环境中是首选。

### 密钥固定

公钥固定通常使用 DER 编码公钥的哈希（SPKI 固定）。

## 在线工具

使用 [RSA DER 公钥解码器](/rsa-der-public-key)：

- 解析 DER 编码的 RSA 公钥（SPKI 和 PKCS#1 格式）
- 提取模数和指数
- 查看完整的 ASN.1 结构
- 解码 PEM 公钥查看其 DER 内容

所有处理都在浏览器中进行——您的密钥永远不会离开您的设备。
