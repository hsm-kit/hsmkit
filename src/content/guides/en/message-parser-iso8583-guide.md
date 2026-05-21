ISO 8583 is the global standard for financial transaction messaging. It's the protocol behind card payments, ATM transactions, and inter-bank communications. This guide explains the message structure, MTI, bitmap, data elements, and how to parse these messages in practice.

## What is ISO 8583?

ISO 8583 defines a message format for exchanging financial transaction information between systems. It's used by:

- Payment card networks (Visa, Mastercard)
- ATM networks
- Point-of-sale systems
- Bank switches
- Payment processors

### Why ISO 8583 Matters

Every time you use a card:
1. Terminal sends ISO 8583 message to acquirer
2. Acquirer routes to card network
3. Network sends to issuer
4. Issuer responds with ISO 8583 message
5. Response flows back to terminal

This happens in milliseconds, billions of times daily worldwide.

## Message Structure

An ISO 8583 message consists of:

```
+------------------+
| MTI              |  Message Type Indicator (4 digits)
+------------------+
| Bitmap           |  8 or 16 bytes indicating present fields
+------------------+
| Data Elements    |  Variable number of fields
+------------------+
```

## Message Type Indicator (MTI)

The MTI identifies the message type and version.

### MTI Structure

The MTI is a 4-digit number:

```
Position 1: Version
Position 2: Message Class
Position 3: Message Function
Position 4: Message Origin
```

### Version Codes

| Code | Version |
|------|---------|
| 0 | ISO 8583:1987 |
| 1 | ISO 8583:1993 |
| 2 | ISO 8583:2003 |

### Message Classes

| Code | Class | Description |
|------|-------|-------------|
| 1 | Authorization | Card authorization requests |
| 2 | Financial | Financial transactions |
| 3 | File Actions | Batch processing |
| 4 | Reversal | Transaction reversals |
| 5 | Reconciliation | Settlement |
| 8 | Network Management | System messages |

### Message Functions

| Code | Function | Description |
|------|----------|-------------|
| 0 | Request | Initial request |
| 1 | Request Response | Response to request |
| 2 | Advice | Notification (no response expected) |
| 3 | Advice Response | Response to advice |
| 4 | Notification | Informational |
| 8 | Reserved | Reserved for ISO use |

### Message Origins

| Code | Origin | Description |
|------|--------|-------------|
| 0 | Acquirer | From acquiring bank |
| 1 | Acquirer Repeat | Repeat of acquirer message |
| 2 | Issuer | From issuing bank |
| 3 | Issuer Repeat | Repeat of issuer message |

### Common MTIs

| MTI | Description |
|-----|-------------|
| 0100 | Authorization Request |
| 0110 | Authorization Response |
| 0200 | Financial Transaction Request |
| 0210 | Financial Transaction Response |
| 0220 | Financial Transaction Advice |
| 0230 | Financial Transaction Advice Response |
| 0400 | Reversal Request |
| 0410 | Reversal Response |
| 0800 | Network Management Request |
| 0810 | Network Management Response |

## Bitmap

The bitmap indicates which data elements are present in the message.

### Primary Bitmap

8 bytes (64 bits) — each bit represents one data element:

```
Bit 1: Data Element 1
Bit 2: Data Element 2
...
Bit 64: Data Element 64
```

If bit is set to 1, that data element is present.

### Secondary Bitmap

If bit 1 is set, a secondary bitmap follows:

```
Bit 1 set → Secondary bitmap present
Secondary bitmap covers elements 65-128
```

### Reading the Bitmap

Example bitmap: `723C048000000000`

Convert to binary:
```
7 = 0111
2 = 0010
3 = 0011
C = 1100
...
```

Each '1' indicates the corresponding field is present.

## Data Elements

ISO 8583 defines up to 128 data elements.

### Common Data Elements

| Field | Name | Format | Length |
|-------|------|--------|--------|
| 2 | Primary Account Number (PAN) | LLVAR | up to 19 |
| 3 | Processing Code | N | 6 |
| 4 | Transaction Amount | N | 12 |
| 7 | Transmission Date/Time | N | 10 |
| 11 | System Trace Audit Number | N | 6 |
| 12 | Local Transaction Time | N | 6 |
| 13 | Local Transaction Date | N | 4 |
| 14 | Expiration Date | N | 4 |
| 22 | POS Entry Mode | N | 3 |
| 25 | POS Condition Code | N | 2 |
| 35 | Track 2 Data | LLVAR | up to 37 |
| 37 | Retrieval Reference Number | AN | 12 |
| 38 | Authorization Identification Response | AN | 6 |
| 39 | Response Code | AN | 2 |
| 41 | Card Acceptor Terminal ID | ANS | 8 |
| 42 | Card Acceptor ID Code | ANS | 15 |
| 43 | Card Acceptor Name/Location | ANS | 40 |
| 52 | PIN Block | B | 8 |
| 53 | Security Related Control Info | N | 16 |
| 55 | ICC System Related Data | LLVAR | up to 999 |
| 64 | Message Authentication Code | B | 8 |

### Data Formats

| Code | Format | Description |
|------|--------|-------------|
| N | Numeric | Digits only (0-9) |
| AN | Alphanumeric | Letters and numbers |
| ANS | Alphanumeric + Special | Letters, numbers, special chars |
| B | Binary | Raw binary data |
| Z | Track 2 | Track 2 data format |

### Length Encoding

| Type | Encoding | Example |
|------|----------|---------|
| Fixed | No length prefix | "HELLO" always 5 chars |
| LLVAR | 2-digit length prefix | "05HELLO" |
| LLLVAR | 3-digit length prefix | "005HELLO" |

## Practical Examples

### Authorization Request (0100)

```
MTI: 0100
Bitmap: 723C048000000000

Fields present:
- 2: PAN (4123456789012345)
- 3: Processing Code (000000)
- 4: Amount (000000010000)
- 7: Date/Time (0115103000)
- 11: STAN (123456)
- 14: Expiry (2512)
- 22: POS Entry Mode (051)
- 41: Terminal ID (TERM0001)
- 42: Merchant ID (MERCH0001)
```

### Authorization Response (0110)

```
MTI: 0110
Bitmap: 7230000002000000

Fields present:
- 2: PAN (echo)
- 3: Processing Code (echo)
- 4: Amount (echo)
- 7: Date/Time (echo)
- 11: STAN (echo)
- 38: Auth Code (ABC123)
- 39: Response Code (00)
```

## ATM NDC Format

NDC (NCR Diebold Compatible) is a subset of ISO 8583 used by ATMs.

### NDC-Specific Elements

| Field | NDC Usage |
|-------|-----------|
| 52 | PIN Block (ISO 9564) |
| 53 | Key Management Info |
| 55 | EMV Chip Data |
| 61 | ATM Terminal Data |
| 62 | ATM Financial Data |
| 63 | ATM Network Data |

## Wincor Format

Wincor (now Diebold Nixdorf) ATMs use a similar but distinct format.

### Wincor Differences

- Different field assignments for some elements
- Proprietary extensions in fields 60-63
- Different message routing conventions

## Parsing ISO 8583 Messages

### Step-by-Step Parsing

1. Read MTI (first 4 bytes or characters)
2. Read bitmap (next 8 or 16 bytes)
3. For each set bit in bitmap:
   - Read data element according to format
   - Handle length prefix if LLVAR/LLLVAR
4. Validate all required fields present

### Common Parsing Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Wrong field count | Bitmap misread | Verify bitmap parsing |
| Truncated message | Length calculation error | Check LLVAR/LLLVAR handling |
| Invalid characters | Format mismatch | Verify N/AN/ANS format |
| Binary data issues | BCD vs binary | Confirm encoding |

## Best Practices

1. **Always parse bitmap first** — it determines which fields exist
2. **Handle both primary and secondary bitmaps** — check bit 1
3. **Respect length prefixes** — LLVAR/LLLVAR must be parsed correctly
4. **Validate field formats** — numeric fields should only contain digits
5. **Log raw messages** — essential for debugging

## Try It Yourself

Use our [Message Parser tool](/message-parser) to:

- Parse ISO 8583 messages
- Extract MTI and bitmap
- Decode individual data elements
- Understand message structure

The tool supports various formats including ATM NDC and Wincor.

The tool runs entirely in your browser — no data leaves your device.
