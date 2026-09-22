Web Crypto API 通过 `crypto.subtle` 提供浏览器原生密码学能力。AES-GCM 同时提供加密和完整性保护，是 Web Crypto 中首选的通用对称加密模式。正确实现仍然依赖唯一 Nonce、明确的密钥管理和稳定的密文封装格式。

## 浏览器加密适用场景

Web Crypto 适合数据必须在离开浏览器前完成加密的场景，例如：

- 导出文件下载前先加密；
- 保护浏览器本地保存的应用数据；
- 实现服务器永远接触不到明文的端到端加密；
- 与已经定义 AES-GCM 封装格式的服务互操作。

浏览器加密无法防御运行在同一页面中的恶意脚本。XSS、被入侵的依赖或恶意浏览器扩展，可能在加密前或解密后获取明文。内容安全策略、依赖治理与应用安全仍不可缺少。

## 生成 AES-GCM 密钥

使用 Web Crypto 生成密钥，不要使用 `Math.random()` 或自行拼接随机字符串：

```js
const key = await crypto.subtle.generateKey(
  { name: 'AES-GCM', length: 256 },
  true,
  ['encrypt', 'decrypt'],
);
```

示例中 `extractable` 参数为 `true`，便于演示导出。若密钥不应离开当前环境，应设为 `false`，生成不可导出的 `CryptoKey`。

AES-128 与 AES-256 在正确使用时都足够安全。密钥保存方式和 Nonce 唯一性通常比选择更长密钥更重要。

## 加密 UTF-8 文本

Web Crypto 接收字节而不是 JavaScript 字符串。使用 `TextEncoder` 编码文本，并为每次加密生成新的 12 字节 Nonce：

```js
const encoder = new TextEncoder();
const nonce = crypto.getRandomValues(new Uint8Array(12));
const plaintext = encoder.encode('用于测试的敏感消息');
const aad = encoder.encode('hsmkit:v1:message');

const encrypted = await crypto.subtle.encrypt(
  {
    name: 'AES-GCM',
    iv: nonce,
    additionalData: aad,
    tagLength: 128,
  },
  key,
  plaintext,
);

const ciphertextAndTag = new Uint8Array(encrypted);
```

Web Crypto 返回的缓冲区由密文和尾部认证标签组成。其他密码库可能把密文与标签作为两个字段返回，因此互操作前必须明确格式。

## 解密与认证

解密必须提供相同密钥、Nonce、AAD 和标签长度：

```js
const decrypted = await crypto.subtle.decrypt(
  {
    name: 'AES-GCM',
    iv: nonce,
    additionalData: aad,
    tagLength: 128,
  },
  key,
  ciphertextAndTag,
);

const message = new TextDecoder().decode(decrypted);
```

如果密文、标签、Nonce、AAD 或密钥不一致，Promise 会被拒绝。应将其统一视为认证失败，绝不能使用未认证明文或忽略标签错误。

## 封装密文

系统必须保存未来解密所需的全部元数据。一个简单 JSON 封装可以是：

```json
{
  "v": 1,
  "alg": "A256GCM",
  "kid": "2026-09-primary",
  "iv": "Base64url编码的Nonce",
  "ct": "Base64url编码的密文与标签"
}
```

算法、版本与 Nonce 都可以公开，只有密钥必须保密。二进制字段应按照明确规则编码成 Base64url 或 Base64，不能把任意密文字节直接转换为 JavaScript 字符串。

版本、记录 ID、租户 ID 或内容类型等不可篡改字段可以放入 `additionalData`。AAD 会被认证但不会加密，因此不要在其中保存秘密。

## Nonce 管理

GCM 推荐使用 12 字节 Nonce。同一密钥下每次加密都必须生成新值：

```js
const nonce = crypto.getRandomValues(new Uint8Array(12));
```

切勿用相同密钥和 Nonce 加密不同明文。设计时需要考虑请求重试、多个标签页、Service Worker、状态恢复与账户共享。高吞吐系统应建立持久化分配机制，而不是假设随机生成可以永久解决协同问题。

设计长生命周期或共享密钥前，请先阅读 [AES IV 与 Nonce 重用](/zh/guides/aes-iv-nonce-reuse/)。

## 导出与导入密钥

只有应用具备安全封装或存储方案时，才应导出原始密钥：

```js
const rawKey = await crypto.subtle.exportKey('raw', key);

const importedKey = await crypto.subtle.importKey(
  'raw',
  rawKey,
  { name: 'AES-GCM' },
  false,
  ['encrypt', 'decrypt'],
);
```

不要把原始 AES 密钥保存在 localStorage，任何同源脚本都能读取它。支持的浏览器可以在 IndexedDB 中存储不可导出的 `CryptoKey`，但同源恶意脚本仍可能调用该密钥。强用户认证或跨设备恢复需要经过审查的密钥管理设计。

## 密码不能直接作为 AES 密钥

用户密码必须经过密码型密钥派生函数（KDF）。不要直接对密码进行 UTF-8 编码并截取 16/32 字节，也不要只哈希一次就作为密钥。

Web Crypto 原生支持 PBKDF2。基于密码的密文封装必须保存随机 Salt 和 KDF 参数。迭代次数应根据当前设备性能和安全策略测量决定。如果新系统需要抗 GPU 的内存困难派生，可以采用经过审查的 Argon2 实现，但它目前不是 Web Crypto 原生算法。

## 常见错误

| 错误 | 风险 | 正确方案 |
|---|---|---|
| 重用固定 Nonce | 破坏 GCM 安全性 | 生成或分配唯一 12 字节 Nonce |
| 使用 `Math.random()` | 不具备密码学安全性 | 使用 `crypto.getRandomValues()` |
| 密文不带版本 | 无法安全迁移 | 保存明确版本和算法 |
| 原始密钥保存到 localStorage | 同源脚本可读取 | 使用不可导出密钥或外部密钥管理 |
| 丢失 AAD | 解密认证失败 | 定义并持久保存 AAD 输入 |
| 错误拆分 Web Crypto 输出 | 认证标签丢失或损坏 | 明确定义密文/标签布局 |
| 忽略 XSS 防护 | 恶意脚本可窃取明文 | 强化应用与 CSP |

## 跨语言互操作

与 Java、.NET、OpenSSL、Node.js 或其他服务交换 AES-GCM 数据前，应统一：

- 密钥长度和原始密钥字节；
- 12 字节 Nonce 的表示方式；
- 128 位标签长度；
- 密文与标签是合并还是分开；
- AAD 的精确字节；
- Base64 或 Base64url 及补位规则；
- 封装版本与字节序。

上线前应使用已知测试向量验证。可以使用 [AES 加密工具](/aes-encryption)检查非敏感数据的编码；模式选型可参考 [AES-GCM 与 AES-CBC 对比](/zh/guides/aes-gcm-vs-cbc/)。
