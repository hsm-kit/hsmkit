import React from 'react';
import { Typography } from 'antd';
import PageLayout from '../../components/common/PageLayout';
import ZKATool from '../../components/payment/ZKATool';

const { Paragraph } = Typography;

const ZKAPage: React.FC = () => {
  return (
    <PageLayout
      seoTitle="ZKA - German Banking Standard Cryptographic Operations"
      seoDescription="Perform ZKA cryptographic operations including session key derivation, PIN encryption/decryption, and MAC calculation for German banking systems."
      seoKeywords="ZKA, German banking, session key derivation, PIN encryption, MAC calculation, TDES, cryptographic operations"
      canonical="https://hsmkit.com/payments-zka"
      faqTitle="Frequently Asked Questions"
      faqs={[
        {
          question: "What is ZKA?",
          answer: "ZKA (Zentraler Kreditausschuss) is a German banking standard that defines cryptographic operations for secure payment processing, including key derivation, PIN handling, and message authentication."
        },
        {
          question: "What is SK derivation?",
          answer: "Session Key (SK) derivation is the process of generating a temporary session key from a master key, command data, and a random number. This ensures each transaction uses a unique key."
        },
        {
          question: "How does ZKA PIN encryption work?",
          answer: "ZKA uses Triple DES (3DES) in ECB mode to encrypt PIN blocks using the derived session key (SK-pac). The PIN block must be 8 bytes (16 hex characters)."
        },
        {
          question: "What MAC algorithm does ZKA use?",
          answer: "ZKA uses Triple DES CBC-MAC for message authentication. The MAC is calculated by processing data blocks in CBC mode and taking the final encrypted block as the MAC value."
        }
      ]}
      usageTitle="How to Use"
      usageContent={
        <div>
          <Paragraph style={{ marginBottom: 8 }}>
            • <strong>SK Derivation:</strong> Enter the Master Key (MK), Command Data (CM), and Random Number (Rnd) to derive a session key.
          </Paragraph>
          <Paragraph style={{ marginBottom: 8 }}>
            • <strong>PIN Operations:</strong> Use the derived session key (SK-pac) to encrypt or decrypt PIN blocks.
          </Paragraph>
          <Paragraph style={{ marginBottom: 8 }}>
            • <strong>MAC Calculation:</strong> Calculate message authentication codes using the MAC key and data.
          </Paragraph>
          <Paragraph style={{ marginBottom: 0 }}>
            • All inputs must be in hexadecimal format. Keys are 16 bytes (32 hex characters), PIN blocks are 8 bytes (16 hex characters).
          </Paragraph>
        </div>
      }
      toolName="ZKA Cryptographic Tool"
      toolCategory="SecurityApplication"
    >
      <ZKATool />
    </PageLayout>
  );
};

export default ZKAPage;
