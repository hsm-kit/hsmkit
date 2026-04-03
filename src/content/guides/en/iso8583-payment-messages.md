ISO 8583 is the international standard for financial transaction messages — every time you swipe a card at an ATM or POS terminal, an ISO 8583 message is generated. This guide explains the format and how to parse it.

## What is ISO 8583?

ISO 8583 defines the format for electronic financial transaction messages between:
- ATMs and banks
- POS terminals and acquirers
- Acquirers and card networks (Visa, Mastercard)
- Interbank systems

It's been in use since 1987 and remains the backbone of global payment processing.

## Message Structure

An ISO 8583 message consists of:

```
[MTI] [Bitmap] [Data Elements]
```

### 1. Message Type Indicator (MTI)
A 4-digit code identifying the message type:

| MTI | Description |
|-----|-------------|
| 0100 | Authorization Request |
| 0110 | Authorization Response |
| 0200 | Financial Transaction Request |
| 0210 | Financial Transaction Response |
| 0400 | Reversal Request |
| 0420 | Reversal Advice |
| 0800 | Network Management Request |
| 0810 | Network Management Response |

The MTI has four components:
- **Version**: 0 (1987), 1 (1993), 2 (2003)
- **Message Class**: 1=Authorization, 2=Financial, 4=Reversal, 8=Network
- **Message Function**: 0=Request, 1=Response, 2=Advice, 3=Advice Response
- **Message Origin**: 0=Acquirer, 2=Issuer, 4=Other

### 2. Bitmap

The bitmap is a 64-bit (8-byte) field that indicates which data elements are present in the message.

- **Primary Bitmap**: Always present (64 bits = fields 1-64)
- **Secondary Bitmap**: Present if field 1 is set (fields 65-128)
- **Tertiary Bitmap**: Present if field 65 is set (fields 129-192)

Each bit corresponds to a field number:
- Bit 1 (MSB of first byte) = Field 1 (Secondary Bitmap)
- Bit 2 = Field 2
- ...
- Bit 64 = Field 64

Example: Bitmap `F230040102C00000` means fields 1,2,3,4,7,11,12,13,22,25,41,42 are present.

Use our [ISO 8583 Bitmap Parser](/payments-bitmap) to decode any bitmap instantly.

### 3. Data Elements

ISO 8583 defines up to 192 data elements (fields). Common ones:

| Field | Name | Type | Length |
|-------|------|------|--------|
| 2 | Primary Account Number (PAN) | LLVAR | Up to 19 |
| 3 | Processing Code | Fixed | 6 |
| 4 | Transaction Amount | Fixed | 12 |
| 7 | Transmission Date/Time | Fixed | 10 |
| 11 | System Trace Audit Number (STAN) | Fixed | 6 |
| 12 | Local Transaction Time | Fixed | 6 |
| 13 | Local Transaction Date | Fixed | 4 |
| 22 | Point of Service Entry Mode | Fixed | 3 |
| 25 | Point of Service Condition Code | Fixed | 2 |
| 35 | Track 2 Data | LLVAR | Up to 37 |
| 37 | Retrieval Reference Number | Fixed | 12 |
| 38 | Authorization ID Response | Fixed | 6 |
| 39 | Response Code | Fixed | 2 |
| 41 | Card Acceptor Terminal ID | Fixed | 8 |
| 42 | Card Acceptor ID Code | Fixed | 15 |
| 49 | Currency Code | Fixed | 3 |
| 52 | PIN Data (encrypted) | Fixed | 16 |
| 55 | ICC Data (EMV) | LLLVAR | Up to 255 |
| 64 | MAC (Primary) | Fixed | 16 |
| 128 | MAC (Secondary) | Fixed | 16 |

### Field Types
- **Fixed**: Exact length, no length prefix
- **LLVAR**: 2-digit length prefix + variable data
- **LLLVAR**: 3-digit length prefix + variable data

## Response Codes

Field 39 contains the response code:

| Code | Meaning |
|------|---------|
| 00 | Approved |
| 01 | Refer to card issuer |
| 05 | Do not honor |
| 12 | Invalid transaction |
| 13 | Invalid amount |
| 14 | Invalid card number |
| 51 | Insufficient funds |
| 54 | Expired card |
| 55 | Incorrect PIN |
| 57 | Transaction not permitted |
| 61 | Exceeds withdrawal limit |
| 91 | Issuer unavailable |
| 96 | System malfunction |

## PIN in ISO 8583

Field 52 contains the encrypted PIN block (typically 8 bytes / 16 hex characters). The PIN is encrypted using the PIN Encryption Key (PEK) before being placed in this field.

The PIN block format (usually ISO 9564 Format 0) combines the PIN with the PAN. See our [PIN Block guide](/guides/pin-block-formats-iso9564) for details.

## MAC in ISO 8583

Fields 64 and 128 contain Message Authentication Codes to verify message integrity. The MAC is calculated over specific fields using the MAC key.

See our [MAC guide](/guides/mac-algorithms-payment-security) for MAC algorithm details.

## AS2805 — Australian EFTPOS

AS2805 is the Australian standard based on ISO 8583. It has some differences in field definitions and MAC calculation.

Use our [AS2805 Message Parser](/payments-as2805) for AS2805-specific parsing.

## ATM NDC and Wincor Protocols

ATMs often use vendor-specific protocols:

- **NCR NDC (Neat Display Commands)**: Used by NCR ATMs
- **Wincor/Diebold**: Used by Wincor Nixdorf ATMs

These are higher-level protocols that wrap ISO 8583 messages. Our [Message Parser](/message-parser) supports both NDC and Wincor formats.

## Practical: Parsing a Transaction

Given a raw ISO 8583 message:
```
0200F230040102C000000000000000001600412345678901234500000000010000...
```

1. First 4 chars: MTI = `0200` (Financial Transaction Request)
2. Next 16 chars: Primary Bitmap = `F230040102C00000`
3. Parse bitmap to find which fields are present
4. Read each field in order

Use our [ISO 8583 Bitmap Parser](/payments-bitmap) to decode the bitmap, then trace each field manually.

## Try It Yourself

- [ISO 8583 Bitmap Parser](/payments-bitmap) — Decode any ISO 8583 bitmap
- [AS2805 Message Parser](/payments-as2805) — Parse AS2805 messages
- [Message Parser](/message-parser) — Parse ATM NDC and Wincor messages
- [PIN Block Tool](/payments-pin-blocks-general) — Encode/decode PIN blocks (Field 52)
- [HMAC Calculator](/payments-mac-hmac) — Calculate MAC values (Fields 64/128)
