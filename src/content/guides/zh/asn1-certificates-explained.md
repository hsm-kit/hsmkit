ASN.1（抽象语法标记一）是 X.509 证书、RSA 密钥和大多数密码学数据结构的底层数据格式。理解它有助于您调试证书问题、解析密钥文件，以及了解 TLS 证书内部的内容。

## 什么是 ASN.1？

ASN.1 是一种以平台无关方式描述数据结构的标准符号。可以将其理解为二进制数据的类型系统。它在 1980 年代开发，至今仍是以下内容的基础：

- X.509 证书（TLS/SSL）
- RSA、ECC、DSA 密钥格式
- PKCS 标准（#1、#7、#8、#10、#12）
- SNMP、LDAP、Kerberos 协议
- EMV 支付卡数据

## DER vs BER vs PEM

ASN.1 定义结构；编码规则定义二进制格式：

### DER（可辨别编码规则）
- **规范**编码——每个值只有一种编码方式
- 用于证书、密钥、签名
- 密码学操作所必需（签名是对 DER 编码数据的签名）

### BER（基本编码规则）
- 比 DER 更灵活
- 同一数据有多种有效编码
- 用于某些协议（SNMP、LDAP）

### PEM（隐私增强邮件）
- 不是 ASN.1 编码——它是以 **Base64** 编码的 DER，带有页眉/页脚
- 人类可读，易于复制粘贴
- 您随处可见的 `-----BEGIN CERTIFICATE-----` 格式

```
-----BEGIN CERTIFICATE-----     ← 页眉
MIIDXTCCAkWgAwIBAgIJAJC1HiIAZAiIMA0GCSqGSIb3DQEBCwUAMEUxCzAJBgNV
...                              ← Base64 编码的 DER
-----END CERTIFICATE-----       ← 页脚
```

## TLV 结构

ASN.1 DER 编码使用**标签-长度-值（TLV）**格式：

```
[标签] [长度] [值]
  1+    1+     N 字节
```

### 常见标签示例
| 标签（十六进制） | 类型 |
|-----------------|------|
| 02 | INTEGER（整数） |
| 03 | BIT STRING（位串） |
| 04 | OCTET STRING（字节串） |
| 06 | OBJECT IDENTIFIER（对象标识符 OID） |
| 0C | UTF8String |
| 17 | UTCTime |
| 30 | SEQUENCE（序列） |
| 31 | SET（集合） |

## X.509 证书结构

X.509 证书是一个包含以下内容的 ASN.1 SEQUENCE：

```
Certificate ::= SEQUENCE {
    tbsCertificate    TBSCertificate,
    signatureAlgorithm AlgorithmIdentifier,
    signatureValue    BIT STRING
}

TBSCertificate ::= SEQUENCE {
    version           [0] EXPLICIT INTEGER,
    serialNumber      INTEGER,
    signature         AlgorithmIdentifier,
    issuer            Name,
    validity          Validity,
    subject           Name,
    subjectPublicKeyInfo SubjectPublicKeyInfo,
    extensions        [3] EXPLICIT Extensions OPTIONAL
}
```

### 关键证书字段

| 字段 | 描述 |
|------|------|
| Version | v1(0)、v2(1)、v3(2)——现代证书为 v3 |
| Serial Number | CA 分配的唯一编号 |
| Issuer | 签署此证书的机构（CA 名称） |
| Validity | 有效期开始/结束日期 |
| Subject | 此证书的所有者 |
| Public Key | 公钥及其算法 |
| Extensions | SAN、密钥用途、CRL 分发点等 |
| Signature | CA 对 TBSCertificate 的签名 |

## 常见 OID

对象标识符（OID）用于标识算法和属性：

| OID | 含义 |
|-----|------|
| 1.2.840.113549.1.1.1 | rsaEncryption |
| 1.2.840.113549.1.1.11 | sha256WithRSAEncryption |
| 1.2.840.10045.2.1 | ecPublicKey |
| 1.2.840.10045.4.3.2 | ecdsa-with-SHA256 |
| 2.5.4.3 | commonName (CN) |
| 2.5.4.10 | organizationName (O) |
| 2.5.4.6 | countryName (C) |
| 2.5.29.17 | subjectAltName |
| 2.5.29.19 | basicConstraints |

## RSA 公钥结构

PKCS#1 格式的 RSA 公钥：

```
RSAPublicKey ::= SEQUENCE {
    modulus           INTEGER,  -- n（模数）
    publicExponent    INTEGER   -- e（通常为 65537）
}
```

使用 [RSA DER 公钥解码器](/rsa-der-public-key) 从 RSA 公钥中提取模数和指数。

## 证书链与信任

TLS 使用证书链：

```
根 CA 证书（自签名，在浏览器信任库中）
    └── 中间 CA 证书（由根 CA 签名）
            └── 服务器证书（由中间 CA 签名）
```

每个证书的签名都通过颁发者的公钥验证。这条信任链最终锚定到浏览器和操作系统信任的根 CA。

## 常见证书问题

| 错误 | 原因 | 修复方案 |
|------|------|---------|
| 证书已过期 | 超过 Not After 日期 | 续签证书 |
| 主机名不匹配 | CN/SAN 与域名不符 | 获取包含正确 SAN 的证书 |
| 不受信任的根 | 根 CA 不在信任库中 | 安装 CA 证书 |
| 证书链不完整 | 缺少中间证书 | 包含完整证书链 |
| 弱签名 | SHA-1 签名 | 重新颁发 SHA-256 证书 |

## 实践：读取证书

使用 [ASN.1 解析器](/asn1-parser) 解码任何 DER/PEM 结构。如需带有人类可读字段名的完整证书解析，使用 [SSL 证书解析器](/ssl-certificates)。

### 示例：解码 PEM 证书
1. 复制 PEM 证书（包括 `-----BEGIN CERTIFICATE-----` 行）
2. 粘贴到 [SSL 证书解析器](/ssl-certificates)
3. 查看所有字段：主题、颁发者、有效期、公钥、扩展、SAN

### 示例：检查原始密钥
1. 复制 DER 字节（十六进制或 Base64）
2. 粘贴到 [ASN.1 解析器](/asn1-parser)
3. 浏览 TLV 树查看每个字段

## 在线工具

- [ASN.1 解析器](/asn1-parser) —— 解析任何 DER/BER/PEM 结构
- [SSL 证书解析器](/ssl-certificates) —— 完整 X.509 证书分析
- [RSA DER 公钥解码器](/rsa-der-public-key) —— 提取 RSA 密钥参数
- [ECC 工具](/ecc-encryption) —— 处理 ECC 密钥和签名
