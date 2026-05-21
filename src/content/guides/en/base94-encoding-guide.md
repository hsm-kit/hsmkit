Base94 is a binary-to-text encoding that uses all 94 printable ASCII characters (excluding space). It achieves higher data density than Base64, making it useful when you need to encode binary data as compactly as possible while staying within printable ASCII. This guide explains how Base94 works and when to use it.

## What is Base94?

Base94 uses the 94 printable ASCII characters from `!` (0x21) to `~` (0x7E), excluding space. This is the maximum number of printable, non-whitespace ASCII characters available:

```
!"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_`abcdefghijklmnopqrstuvwxyz{|}~
```

Each Base94 character represents approximately **6.55 bits** of data (log₂(94) ≈ 6.55), compared to 6 bits for Base64. This gives Base94 roughly **22% better density** than Base64.

## How Base94 Encoding Works

Base94 treats the input as a large integer and converts it to base 94:

### Encoding Process

1. Convert input bytes to a big integer
2. Repeatedly divide by 94, recording remainders
3. Map each remainder to a Base94 character
4. The remainders (in reverse order) form the encoded string

```
Input bytes: [0x48, 0x65, 0x6C] ("Hel")
As integer: 4,610,412

4610412 ÷ 94 = 49047 remainder 14 → '6'  (position 14)
49047 ÷ 94 = 521 remainder 73 → 'o'      (position 73)
521 ÷ 94 = 5 remainder 51 → '7'          (position 51)
5 ÷ 94 = 0 remainder 5 → '%'             (position 5)

Result: "%7o6" (reversed remainders)
```

Note: The exact character mapping varies by implementation. The example above uses the standard printable ASCII range starting from `!`.

## Base94 vs Base64 vs Hex

| Encoding | Characters | Bits per char | Overhead | Use case |
|----------|-----------|---------------|----------|----------|
| Hex | 16 | 4 | 100% | Cryptographic values, debugging |
| Base64 | 64 | 6 | 33% | General binary-to-text |
| Base94 | 94 | ~6.55 | ~22% | Maximum density text encoding |

### Density Comparison

Encoding 32 bytes (256 bits) of data:

| Encoding | Output Length | Characters |
|----------|--------------|------------|
| Hex | 64 | 64 |
| Base64 | 44 (with padding) | 44 |
| Base94 | ~39 | ~39 |

Base94 saves about 5 characters per 32 bytes compared to Base64. For larger data, the savings accumulate.

## The Character Set

Base94 uses printable ASCII characters, but the exact range can vary:

### Standard Range (0x21 - 0x7E)
- Characters: `!` through `~`
- Excludes: space (0x20)
- Most common implementation

### Custom Ranges
Some implementations exclude characters that cause problems in specific contexts:
- URL-unsafe characters: `<`, `>`, `"`, `{`, `}`, `|`, `\`, `^`, `` ` ``
- Shell-special characters: `$`, `` ` ``, `\`, `"`, `'`
- Markup characters: `<`, `>`, `&`

Always check which character set your specific Base94 implementation uses.

## Comparison with Other Encodings

### Base64

- **Pros**: Standardized (RFC 4648), widely supported, URL-safe variant available
- **Cons**: 33% overhead
- **Use when**: Compatibility matters, standard encoding needed

### Base94

- **Pros**: ~22% overhead, maximum density
- **Cons**: Not standardized, fewer implementations, potential character set issues
- **Use when**: Density is critical, controlled environment

### Base85 (Ascii85)

- **Pros**: 25% overhead, better than Base64
- **Cons**: Different character sets in different implementations (btoa, RFC 1924)
- **Use when**: Need better density than Base64 but standard Base94 not available

### Hex

- **Pros**: Universal, simple, debuggable
- **Cons**: 100% overhead
- **Use when**: Cryptographic values, debugging, human readability

## Practical Applications

### Data Serialization

When serializing binary data for systems that only accept printable text:
- Configuration files
- Database text fields
- Log entries
- API responses with size constraints

### Compact Tokens

Generate compact tokens for:
- Session identifiers
- API keys
- Short URLs
- QR code payloads

### Embedded Systems

In memory-constrained environments where every byte matters:
- Firmware update payloads
- Serial communication protocols
- IoT device messages

### Cryptographic Material

Encode cryptographic values more compactly:
- Key material in configuration files
- Nonce/IV values
- Hash digests

## Implementation Considerations

### Padding

Unlike Base64, Base94 doesn't have a standard padding mechanism. Implementations handle this differently:

- **No padding**: Some implementations simply omit padding
- **Length prefix**: Include the original length in the output
- **Terminator**: Use a specific character to mark the end

### Leading Zeroes

The integer conversion approach can lose leading zero bytes. Common solutions:

- Prefix the output with the count of leading zeroes
- Add a bias to the integer before conversion
- Use a different algorithm that preserves byte boundaries

### Big Integer Arithmetic

Base94 encoding requires arbitrary-precision arithmetic. Most implementations use:
- Built-in BigInt types (JavaScript, Python, Java)
- Custom big integer libraries
- Streaming algorithms that avoid full big integer representation

### Character Mapping

The mapping from values 0-93 to characters can be:
- Direct: value + 0x21 (starting from `!`)
- Lookup table: custom mapping for specific needs
- Standard: specific published character set

## Base94 in Practice

### JavaScript Example

```javascript
const CHARS = '!\"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~';

function base94Encode(buffer) {
  let num = BigInt('0x' + buffer.toString('hex'));
  if (num === 0n) return CHARS[0];
  
  let result = '';
  while (num > 0n) {
    result = CHARS[Number(num % 94n)] + result;
    num = num / 94n;
  }
  return result;
}
```

### Python Example

```python
CHARS = '!"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~'

def base94_encode(data):
    num = int.from_bytes(data, 'big')
    if num == 0:
        return CHARS[0]
    result = []
    while num > 0:
        result.append(CHARS[num % 94])
        num //= 94
    return ''.join(reversed(result))
```

## Limitations

### Not Standardized

Base94 doesn't have an official RFC like Base64 (RFC 4648). Different implementations may:
- Use different character sets
- Handle padding differently
- Have different byte boundary handling

### Limited Tooling

Fewer libraries and tools support Base94 compared to Base64:
- No built-in browser/OS support
- Fewer language standard libraries
- Less community documentation

### URL Safety

The standard Base94 character set includes URL-unsafe characters (`<`, `>`, `"`, etc.). For URL contexts:
- Use URL-safe Base64 instead
- URL-encode the Base94 output
- Use a custom character set excluding URL-unsafe characters

## When to Use Base94

**Use Base94 when**:
- Maximum density is critical
- You control both encoding and decoding
- The transport supports all printable ASCII characters
- You need more density than Base64 can provide

**Use Base64 when**:
- Compatibility with existing systems is needed
- Standard tooling is important
- URL-safe encoding is needed
- You're working with APIs that expect Base64

**Use Hex when**:
- Debugging cryptographic values
- Working with HSM tools
- Human readability is important
- Maximum compatibility is needed

## Try It Yourself

Use our [Base94 Encoder](/base94) to:

- Encode binary data to Base94 format
- Decode Base94 back to binary
- Compare output size with Base64 and Hex
- Test with different input data

All processing happens in your browser — your data never leaves your device.
