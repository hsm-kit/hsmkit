SSL/TLS 证书是安全互联网通信的基础。它们验证服务器身份、启用加密，并在各方之间建立信任。本文解释 X.509 证书结构、证书链、自签名证书、CSR 以及您需要了解的证书相关知识。

## 什么是 SSL/TLS 证书？

SSL/TLS 证书是一种数字文档，用于：

1. **标识**服务器（或组织）
2. **包含**用于加密的公钥
3. **由可信机构签名**（或自签名）
4. **启用** HTTPS 连接

当您访问 `https://example.com` 时，浏览器会检查站点的证书以验证其合法性并建立加密连接。

## X.509 证书结构

X.509 是公钥证书的标准格式。证书包含：

### 版本

```
版本: v3（最常见）
```

V3 是当前版本，支持主题备用名称等扩展。

### 序列号

由证书颁发机构（CA）分配的唯一标识符：

```
序列号: 0x04e5c8d9f2a1b3c4d5e6f7a8b9c0d1e2
```

### 签名算法

用于签署证书的算法：

```
签名算法: sha256WithRSAEncryption
```

常见算法：
- `sha256WithRSAEncryption` — SHA-256 with RSA（标准）
- `sha384WithRSAEncryption` — SHA-384 with RSA（更高安全性）
- `ecdsa-with-SHA256` — ECDSA with P-256 曲线

### 颁发者

颁发证书的 CA：

```
颁发者: CN=DigiCert SHA2 Extended Validation Server CA
        O=DigiCert Inc
        C=US
```

### 有效期

```
生效日期: Jan  1 00:00:00 2024 GMT
失效日期: Jan 31 23:59:59 2025 GMT
```

### 主题

证书标识的实体：

```
主题: CN=www.example.com
      O=Example Inc
      L=San Francisco
      ST=California
      C=US
```

### 主题公钥信息

用于加密的公钥：

```
公钥算法: rsaEncryption
    RSA 公钥: (2048 位)
    模数: 00:b0:12:34:...
    指数: 65537 (0x10001)
```

### 扩展（v3）

关键的附加信息：

| 扩展 | 用途 |
|------|------|
| 主题备用名称（SAN） | 附加域名 |
| 密钥用法 | 允许的密钥操作 |
| 扩展密钥用法 | 特定用途（服务器认证、客户端认证） |
| 基本约束 | CA 证书或终端实体 |
| CRL 分发点 | 证书吊销列表位置 |
| 机构信息访问 | OCSP 响应器 URL |

### 签名

CA 对证书内容的数字签名。

## 证书链

证书形成信任链：

```
根 CA 证书（自签名，受信任）
    ↓ 签名
中间 CA 证书
    ↓ 签名
终端实体证书（您的服务器）
```

### 根证书

- 由 CA 自签名
- 预装在浏览器和操作系统中
- 通常有效期 15-25 年
- 存储在"受信任的根证书存储"中

### 中间证书

- 由根 CA 或另一个中间机构签名
- 作为根和终端实体证书之间的缓冲
- 根 CA 私钥保持离线
- 通常有效期 5-10 年

### 终端实体证书

- 由中间 CA 签名
- 安装在您的服务器上
- 通常有效期 1-2 年（Let's Encrypt 为 90 天）

### 链验证

浏览器验证证书链：
1. 检查终端实体证书签名
2. 跟踪链到中间机构
3. 跟踪到根
4. 验证根在受信任存储中
5. 检查有效期、吊销状态和域名匹配

## 自签名证书

自签名证书由自己的私钥签名，而不是由 CA 签名：

```
证书:
    数据:
        颁发者: CN=My Server
        主题: CN=My Server
    签名算法: sha256WithRSAEncryption
    签名: （由同一密钥签名）
```

### 何时使用自签名证书

- **开发和测试**：无成本，即时生成
- **内部服务**：您控制信任的地方
- **IoT 设备**：设备间通信
- **个人项目**：可以接受浏览器警告的地方

### 何时不使用自签名证书

- **生产网站**：用户会看到浏览器警告
- **公共 API**：客户端无法验证身份
- **电子商务**：失去客户信任

### 创建自签名证书

```bash
# 生成私钥
openssl genrsa -out server.key 2048

# 生成自签名证书
openssl req -new -x509 -key server.key -out server.crt -days 365 \
  -subj "/CN=example.com"
```

## 证书签名请求（CSR）

CSR 是发送给 CA 请求证书的消息：

### CSR 内容

```
-----BEGIN CERTIFICATE REQUEST-----
MIICvDCCAaQCAQAwdzELMAkGA1UEBhMCVVMxETAPBgNVBAgTCENhbGlmb3JuaWEx
...
-----END CERTIFICATE REQUEST-----
```

CSR 包含：
- 主题信息（组织、域名、位置）
- 公钥
- 签名（证明拥有私钥）

### 生成 CSR

```bash
# 生成私钥
openssl genrsa -out server.key 2048

# 生成 CSR
openssl req -new -key server.key -out server.csr \
  -subj "/C=US/ST=California/L=San Francisco/O=Example Inc/CN=example.com"
```

### CSR 字段

| 字段 | 描述 | 示例 |
|------|------|------|
| CN | 通用名称（域名） | example.com |
| O | 组织 | Example Inc |
| OU | 组织单位 | IT 部门 |
| L | 地点 | San Francisco |
| ST | 州/省 | California |
| C | 国家 | US |

## 证书类型

### 域名验证（DV）

- 仅验证域名所有权
- 几分钟内颁发（自动化）
- 无组织信息
- Let's Encrypt 颁发 DV 证书

### 组织验证（OV）

- 验证域名所有权和组织存在
- 需要 1-3 天
- 证书中可见组织名称
- 比 DV 更多信任

### 扩展验证（EV）

- 最严格的验证
- 验证法律实体、实际地址、运营存在
- 需要 1-2 周
- 绿色地址栏（在旧浏览器中）
- 最高信任级别

### 通配符证书

覆盖域名的所有子域名：

```
*.example.com → 覆盖:
  - www.example.com
  - api.example.com
  - mail.example.com
  - （但不包括 example.com 本身）
```

### 多域名（SAN）证书

覆盖多个不同的域名：

```
主题备用名称:
  - example.com
  - www.example.com
  - example.org
  - api.example.net
```

## 证书有效期

| 证书类型 | 典型有效期 |
|---------|-----------|
| DV（Let's Encrypt） | 90 天 |
| DV（商业） | 1 年 |
| OV | 1-2 年 |
| EV | 1-2 年 |
| 根 CA | 15-25 年 |
| 中间 CA | 5-10 年 |

### 为什么短期有效？

- 限制受损证书的损害
- 鼓励自动化
- 确保定期重新验证
- 行业趋势向更短证书发展

## 证书吊销

证书可以在到期前被吊销：

### CRL（证书吊销列表）

- CA 发布已吊销证书序列号的列表
- 客户端定期下载
- 可能很大且过时

### OCSP（在线证书状态协议）

- 与 CA 的 OCSP 响应器实时检查
- 比 CRL 更及时
- 隐私问题（CA 看到您访问的站点）

### OCSP 装订

- 服务器获取自己的 OCSP 响应
- 在 TLS 握手中包含它
- 两全其美：及时且私密

## 常见证书问题

| 问题 | 症状 | 解决方案 |
|------|------|---------|
| 证书过期 | 浏览器警告 | 续订证书 |
| 域名不匹配 | 浏览器警告 | 为正确域名颁发证书 |
| 缺少中间证书 | 链不完整 | 安装中间证书 |
| 自签名 | 浏览器警告 | 使用 CA 签名的证书 |
| 已吊销 | 连接被阻止 | 颁发新证书 |

## PEM vs DER 格式

证书以两种格式存储：

### PEM 格式

基于文本，Base64 编码：
```
-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJAJC1HiIAZAiI...
-----END CERTIFICATE-----
```

文件扩展名：`.pem`、`.crt`、`.cer`（文本）

### DER 格式

二进制，未编码：
```
（原始二进制字节）
```

文件扩展名：`.der`、`.cer`（二进制）

### 格式间转换

```bash
# PEM 转 DER
openssl x509 -in cert.pem -out cert.der -outform DER

# DER 转 PEM
openssl x509 -in cert.der -inform DER -out cert.pem -outform PEM
```

## 证书检查工具

### OpenSSL 命令

```bash
# 查看证书详情
openssl x509 -in cert.pem -text -noout

# 检查过期时间
openssl x509 -in cert.pem -enddate -noout

# 验证证书链
openssl verify -CAfile ca-bundle.crt server.crt

# 检查远程服务器证书
openssl s_client -connect example.com:443
```

## 在线工具

使用 [SSL 证书解析器](/ssl-certificates)：

- 解析和检查 X.509 证书
- 查看所有证书字段和扩展
- 解码 PEM 和 DER 证书
- 检查证书链
- 检查有效期和颁发者信息

所有处理都在浏览器中进行——您的证书永远不会离开您的设备。
