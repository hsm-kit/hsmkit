import React from 'react';
import { Typography } from 'antd';
import PageLayout from '../../components/common/PageLayout';
import VISACertificatesTool from '../../components/payment/VISACertificatesTool';

const { Paragraph } = Typography;

const VISACertificatesPage: React.FC = () => {

  return (
    <PageLayout
      seoTitle="VISA Certificates - Validate Issuer Signing Request & Signed Public Key Data"
      seoDescription="Validate VISA issuer certificate signing requests and verify signed issuer public key data using CA public keys. Essential tool for payment card certificate management."
      seoKeywords="VISA certificates, issuer signing request, certificate validation, CA public key, signed certificate, EMV certificates, payment card security"
      canonical="https://hsmkit.com/payments-visa-certificates"
      faqTitle="Frequently Asked Questions"
      faqs={[
        {
          question: "What is a VISA Issuer Certificate?",
          answer: "A VISA Issuer Certificate is a digital certificate issued by VISA that contains the issuer's public key. It is used in EMV chip card transactions to authenticate the card issuer."
        },
        {
          question: "What is an Issuer Signing Request?",
          answer: "An Issuer Signing Request (CSR) is a request sent to VISA CA to sign the issuer's public key. It contains the public key and other certificate information that needs to be certified."
        },
        {
          question: "How do I validate a signed certificate?",
          answer: "To validate a signed certificate, you need the signed issuer public key data and the corresponding VISA CA public key. This tool verifies the signature to ensure the certificate is authentic and hasn't been tampered with."
        },
        {
          question: "What CA public keys are supported?",
          answer: "This tool includes predefined VISA CA public keys (VSDC CA V92, V94, etc.). You can also load custom CA public keys if needed."
        }
      ]}
      usageTitle="How to Use"
      usageContent={
        <div>
          <Paragraph style={{ marginBottom: 8 }}>
            • <strong>Validate Issuer Signing Request:</strong> Load the certificate request file or paste hex data, then click Validate to check the structure and format.
          </Paragraph>
          <Paragraph style={{ marginBottom: 8 }}>
            • <strong>Validate Signed Certificate:</strong> Load the signed certificate data and select or load the CA public key, then click Validate to verify the signature.
          </Paragraph>
          <Paragraph style={{ marginBottom: 8 }}>
            • <strong>Debug Mode:</strong> Enable debug mode to see detailed information about the certificate structure and validation process.
          </Paragraph>
          <Paragraph style={{ marginBottom: 0 }}>
            • <strong>File Formats:</strong> Accepts text files containing hexadecimal data. All non-hex characters will be automatically removed.
          </Paragraph>
        </div>
      }
      toolName="VISA Certificates Validator"
      toolCategory="SecurityApplication"
    >
      <VISACertificatesTool />
    </PageLayout>
  );
};

export default VISACertificatesPage;
