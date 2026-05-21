Check digits are extra digits appended to numbers to detect errors in data entry or transmission. The Luhn algorithm (also called Mod 10) is the most widely used check digit method — it's built into every credit card number, many identification numbers, and IMEI codes. Understanding how it works is essential for anyone working with payment systems.

## What is a Check Digit?

A check digit is a single digit added to a number that allows validation of the entire number. If someone mistypes a digit, the check digit calculation will fail, immediately flagging the error.

Examples of numbers with check digits:
- Credit card numbers (all major networks)
- IMEI numbers (mobile device identifiers)
- ISBN numbers (book identifiers)
- UPC/EAN barcodes (product codes)
- National Provider Identifier (NPI) in healthcare

## The Luhn Algorithm (Mod 10)

The Luhn algorithm was invented by Hans Peter Luhn at IBM in 1954. It's a simple checksum formula that detects most single-digit errors and many transposition errors.

### Step-by-Step Process

Given the number `7992739871`:

**Step 1: Start from the rightmost digit (excluding check digit)**

```
Position:  1  2  3  4  5  6  7  8  9  10
Digit:     7  9  9  2  7  3  9  8  7  1
```

**Step 2: Double every second digit from right to left**

```
Position:  1  2  3  4  5  6  7  8  9  10
Original:  7  9  9  2  7  3  9  8  7  1
Doubled:   7  18 9  4  7  6  9  16 7  2
```

**Step 3: If doubling produces a two-digit number, add those digits**

```
7  18→1+8=9  9  4  7  6  9  16→1+6=7  7  2
```

**Step 4: Sum all digits**

```
7 + 9 + 9 + 4 + 7 + 6 + 9 + 7 + 7 + 2 = 67
```

**Step 5: Calculate check digit**

```
Check digit = (10 - (67 mod 10)) mod 10 = (10 - 7) mod 10 = 3
```

The complete number with check digit is `79927398713`.

### Validating a Number

To validate, perform the same calculation including the check digit. If the total mod 10 equals 0, the number is valid:

```
7 + 9 + 9 + 4 + 7 + 6 + 9 + 7 + 7 + 2 + 3 = 70
70 mod 10 = 0  ✓ Valid
```

## What Errors Does Luhn Catch?

| Error Type | Caught? | Example |
|------------|---------|---------|
| Single digit error | Yes | `1234` → `1244` |
| Transposition of adjacent digits | Most | `1234` → `1243` |
| Twin digit transposition | Some | `33` → `33` (no error) |
| Jump transposition (1st and 3rd) | No | `123` → `321` |
| Phonetic errors | No | `180` → `190` |

Luhn catches approximately **98%** of single-digit errors and a significant portion of transposition errors.

## Luhn vs Other Check Digit Methods

### Mod 10 (Luhn)

- Most common in payment systems
- Used by Visa, Mastercard, American Express, Discover
- Simple implementation
- Good error detection rate

### Mod 9

- Simplest check digit method
- Check digit = (sum of digits) mod 9
- Problem: cannot distinguish between 0 and 9 as check digit
- Less commonly used for validation

### Mod 11 (ISBN-10)

- Used in ISBN-10 numbers
- Check digit can be 0-9 or X (for 10)
- Better error detection than Mod 10
- More complex calculation

### Verhoeff Algorithm

- Based on dihedral group D5
- Catches all single-digit errors and all adjacent transposition errors
- More complex, used in some ID numbers
- Less common in payment systems

## Credit Card Number Validation

### Card Number Structure

Credit card numbers follow the **ISO/IEC 7812** standard:

```
Prefix (IIN/BIN)  +  Account Number  +  Check Digit
      6 digits         variable           1 digit
```

| Card Network | Prefix | Length |
|-------------|--------|--------|
| Visa | 4 | 16 |
| Mastercard | 51-55, 2221-2720 | 16 |
| American Express | 34, 37 | 15 |
| Discover | 6011, 65 | 16 |
| JCB | 35 | 16 |
| UnionPay | 62 | 16-19 |

### Validation Process

A complete credit card validation checks:

1. **Length**: Correct number of digits for the card network
2. **Prefix**: Valid IIN/BIN for the network
3. **Luhn**: Check digit passes Luhn validation

All three must pass for the number to be considered valid.

## IMEI Validation

IMEI (International Mobile Equipment Identity) numbers use a **Luhn variant**:

```
IMEI: 35-209900-176148-?
           ↑
     TAC (Type Allocation Code)
```

IMEI is 15 digits: 14 digits + 1 check digit. The check digit is calculated using the Luhn algorithm on the first 14 digits.

### IMEI Structure

| Part | Length | Description |
|------|--------|-------------|
| TAC | 8 | Type Allocation Code (device model) |
| Serial | 6 | Device serial number |
| Check | 1 | Luhn check digit |

## ISBN Validation

ISBN-10 uses Mod 11, not Luhn:

```
ISBN-10: 0-306-40615-?
Position: 1  2  3  4  5  6  7  8  9  10
Weight:   10 9  8  7  6  5  4  3  2  1

Sum = 0×10 + 3×9 + 0×8 + 6×7 + 4×6 + 0×5 + 6×4 + 1×3 + 5×2 = 105
Check = 105 mod 11 = 6
Check digit: (11 - 6) mod 11 = 5
```

If the check digit calculation results in 10, the character `X` is used.

## UPC/EAN Barcode Validation

UPC-A (12 digits) and EAN-13 (13 digits) use a weighted sum method:

```
UPC-A: 03600029145?
Weights alternate: 3, 1, 3, 1, ... (for UPC-A)
                    1, 3, 1, 3, ... (for EAN-13)

Check digit = (10 - (weighted_sum mod 10)) mod 10
```

## Practical Applications in Payment Systems

### POS Terminal Validation

When a card is swiped or inserted:
1. Read the PAN from the card
2. Validate length and prefix
3. Perform Luhn check
4. If all pass, proceed with authorization

### Online Payment Forms

JavaScript Luhn validation provides instant feedback:
```javascript
function luhnCheck(num) {
  let sum = 0;
  for (let i = num.length - 1; i >= 0; i--) {
    let digit = parseInt(num[i]);
    if ((num.length - i) % 2 === 0) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
}
```

### Test Card Numbers

Payment processors provide test card numbers that pass Luhn:

| Card | Number | CVV |
|------|--------|-----|
| Visa | 4111111111111111 | 123 |
| Mastercard | 5500000000000004 | 123 |
| Amex | 378282246310005 | 1234 |

## Generating Valid Numbers

To generate a valid credit card number for testing:

1. Choose a valid prefix (e.g., `4` for Visa)
2. Generate random digits for the account number
3. Calculate the Luhn check digit
4. Append the check digit

This is how payment test environments create valid but fictitious card numbers.

## Common Misconceptions

**"A valid Luhn check means the card is real"** — No. Luhn only validates the format. The card must also exist in the issuer's database.

**"Luhn provides security"** — No. Luhn is an error-detection algorithm, not a security measure. It's trivial to generate Luhn-valid numbers.

**"All card numbers use Luhn"** — Virtually all modern payment cards use Luhn, but some legacy systems may use different methods.

## Try It Yourself

Use our [Check Digits Calculator](/check-digits) to:

- Calculate and verify Luhn (Mod 10) check digits
- Validate credit card numbers, IMEI numbers, and more
- Understand the step-by-step Luhn calculation process
- Generate valid test numbers for development

All processing happens in your browser — your data never leaves your device.
