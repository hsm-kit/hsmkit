UUIDs (Universally Unique Identifiers) are 128-bit identifiers used to uniquely identify information in distributed systems. They're everywhere — in databases, APIs, filenames, and transaction IDs. This guide covers UUID versions, their randomness properties, collision probability, and how to choose the right version for your application.

## What is a UUID?

A UUID is a 128-bit number, typically displayed as 32 hexadecimal characters in 5 groups separated by hyphens:

```
550e8400-e29b-41d4-a716-446655440000
xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx
                 ↑    ↑
                 M = Version (4)
                 N = Variant (10xx)
```

The total number of possible UUIDs is 2^128 ≈ 3.4 × 10^38 — a number so large that collisions are practically impossible.

## UUID Versions

### Version 1 (Timestamp + MAC Address)

```
d9b7e3a0-1f8c-11ee-95c4-0242ac120002
         ↑
         Version 1
```

**Structure:**
- 60-bit timestamp (100-nanosecond intervals since October 15, 1582)
- 48-bit MAC address of the generating computer
- 14-bit clock sequence (handles timestamp collisions)

**Properties:**
- **Time-ordered**: Sortable by generation time
- **Unique**: MAC address ensures uniqueness across machines
- **Privacy concern**: Reveals MAC address and generation time

**Use when:**
- You need time-ordered UUIDs
- You need uniqueness across distributed systems
- Privacy is not a concern

### Version 4 (Random)

```
a1b2c3d4-e5f6-4789-abcd-ef0123456789
                 ↑
                 Version 4
```

**Structure:**
- 122 bits of random data
- 4 bits for version (0100)
- 2 bits for variant (10)

**Properties:**
- **Random**: No embedded information
- **No coordination needed**: Generated independently
- **Privacy-safe**: No information leakage
- **Not sortable**: Random order

**Use when:**
- You need simple, random identifiers
- Privacy matters
- No time ordering needed
- Most common choice for general use

### Version 5 (SHA-1 Name-Based)

```
6ba7b810-9dad-11d1-80b4-00c04fd430c8
                 ↑
                 Version 5
```

**Structure:**
- Takes a namespace UUID and a name as input
- Computes SHA-1 hash of the combination
- Produces deterministic output (same input = same UUID)

**Properties:**
- **Deterministic**: Same namespace + name always produces the same UUID
- **No randomness**: Reproducible
- **Collision-resistant**: SHA-1 provides good distribution

**Use when:**
- You need deterministic UUIDs from known inputs
- Multiple systems must generate the same UUID for the same entity
- Example: UUID from URL, UUID from domain name

### Version 3 (MD5 Name-Based)

Same concept as Version 5 but uses MD5 instead of SHA-1:

- Less collision-resistant than Version 5
- Use Version 5 instead for new systems

## UUID Format Details

### Structure

```
Octet:  0                   1                   2                   3
        0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
        +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
    0   |                        time_low                               |
        +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
    4   |          time_mid             |  time_hi_and_version          |
        +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
    8   |clk_seq_hi_res |  clk_seq_low  |         node (0-1)           |
        +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   12   |                         node (2-5)                            |
        +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

### Version and Variant Bits

| Version | Bits (M position) | Variant | Bits (N position) |
|---------|------------------|---------|------------------|
| 1 | 0001 | 1 | 10xx |
| 3 | 0011 | 1 | 10xx |
| 4 | 0100 | 1 | 10xx |
| 5 | 0101 | 1 | 10xx |

## Collision Probability

For Version 4 (random) UUIDs:

| Number of UUIDs | Collision Probability |
|----------------|----------------------|
| 1 billion | 1 in 10^18 |
| 1 trillion | 1 in 10^12 |
| 10^18 | ~50% chance |

To have a 50% chance of at least one collision, you'd need to generate approximately **2.71 × 10^18** UUIDs. That's 2.71 quintillion UUIDs.

For practical purposes, Version 4 UUIDs are collision-free for any real-world application.

### The Birthday Problem

The birthday problem explains why collisions become likely sooner than intuition suggests. With n possible values, you need approximately √n items to have a 50% collision chance.

For UUIDs: √(2^128) ≈ 1.8 × 10^19

## Version 1 vs Version 4

| Aspect | Version 1 | Version 4 |
|--------|-----------|-----------|
| Ordering | Time-ordered | Random |
| Uniqueness source | MAC + timestamp | Randomness |
| Privacy | Reveals MAC/time | No info leakage |
| Database performance | Good (ordered inserts) | OK (random inserts) |
| Coordination needed | None | None |
| Common use | Legacy systems | Modern applications |

### Database Considerations

**Version 1 advantages:**
- Time-ordered: better for clustered indexes
- Sequential inserts reduce page splits in B-tree indexes

**Version 4 disadvantages:**
- Random: causes index fragmentation in clustered indexes
- Can be mitigated with UUID v7 (time-ordered random) or ULID

**Version 7 (draft):**
- Time-ordered random UUIDs
- Best of both worlds
- Not yet standardized

## UUIDs as Database Primary Keys

### Advantages

- **Globally unique**: Safe for distributed databases
- **No coordination**: No need for auto-increment sequences
- **Merge-safe**: Can merge databases without conflicts
- **Opaque**: Doesn't reveal record count

### Disadvantages

- **Size**: 16 bytes vs 4 bytes (int) or 8 bytes (bigint)
- **Index fragmentation**: Random UUIDs cause page splits
- **Human-unfriendly**: Hard to debug with

### Best Practices

```sql
-- Use Version 1 or ULID for clustered indexes
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  -- Version 4
    -- or
    id UUID PRIMARY KEY DEFAULT uuid_generate_v1(), -- Version 1
    ...
);

-- Store as UUID type (not varchar)
-- PostgreSQL has native UUID type
-- MySQL stores as BINARY(16) or CHAR(36)
```

## UUID in APIs

### URL Parameters

```
GET /users/550e8400-e29b-41d4-a716-446655440000
```

### JSON Responses

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe"
}
```

### Request IDs

UUIDs are commonly used as request/correlation IDs in distributed systems to trace requests across services.

## UUID Alternatives

| Format | Size | Time-Ordered | Example |
|--------|------|--------------|---------|
| UUID v4 | 16 bytes | No | `550e8400-e29b-41d4-...` |
| UUID v1 | 16 bytes | Yes | `d9b7e3a0-1f8c-11ee-...` |
| ULID | 16 bytes | Yes | `01ARZ3NDEKTSV4RRFFQ69G5FAV` |
| NanoID | Variable | No | `V1StGXR8_Z5jdHi6B-myT` |
| Snowflake | 8 bytes | Yes | `492474761028608` |
| CUID | 25 chars | Yes | `cjld2cyuq0000t3rmniod1foy` |

### ULID (Universally Unique Lexicographically Sortable Identifier)

- 128-bit, like UUID
- Time-ordered (sortable lexicographically)
- Encoded as 26-character Crockford Base32
- Better for databases than random UUIDs

### NanoID

- Variable length (default 21 chars)
- URL-safe
- Smaller than UUID
- Good for short identifiers

## Generating UUIDs

### JavaScript

```javascript
// Version 4 (random)
const uuid = crypto.randomUUID();
// "550e8400-e29b-41d4-a716-446655440000"

// With specific version
import { v4 as uuidv4 } from 'uuid';
const id = uuidv4();
```

### Python

```python
import uuid

# Version 4 (random)
id_v4 = uuid.uuid4()

# Version 1 (timestamp + MAC)
id_v1 = uuid.uuid1()

# Version 5 (name-based)
id_v5 = uuid.uuid5(uuid.NAMESPACE_URL, 'https://example.com')
```

### Command Line

```bash
# Using uuidgen (macOS/Linux)
uuidgen

# Using Python
python -c "import uuid; print(uuid.uuid4())"

# Using OpenSSL
openssl rand -hex 16 | sed 's/\(.\{8\}\)\(.\{4\}\)\(.\{4\}\)\(.\{4\}\)\(.\{12\}\)/\1-\2-\3-\4-\5/'
```

## Common Mistakes

| Mistake | Problem | Solution |
|---------|---------|----------|
| Using UUID v4 for primary keys | Index fragmentation | Use v1, v7, or ULID |
| Storing as VARCHAR(36) | Wastes space | Use native UUID type or BINARY(16) |
| Assuming sortability | UUID v4 is random | Use v1 or ULID for sorting |
| Not indexing UUID columns | Slow lookups | Always index UUID columns |
| Using Version 3 (MD5) | Weaker than Version 5 | Use Version 5 for name-based UUIDs |

## UUIDs in Payment Systems

UUIDs are used in payment systems for:
- **Transaction IDs**: Unique identifiers for each transaction
- **Correlation IDs**: Tracing requests across services
- **Terminal IDs**: Identifying POS terminals
- **Batch IDs**: Grouping related transactions

## Try It Yourself

Use our [UUID Generator](/uuid) to:

- Generate UUIDs of different versions (v1, v4, v5)
- Understand the structure and components of each version
- Generate batch UUIDs for testing
- Validate existing UUIDs

All processing happens in your browser — your data never leaves your device.
