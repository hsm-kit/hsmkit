import React from 'react';
import { ToolPage } from '../../components/common';
import { ASN1Parser } from '../../components/pki';

const ASN1Page: React.FC = () => (
  <ToolPage
    seoKey="asn1"
    canonical="https://hsmkit.com/asn1-parser"
    toolName="ASN.1 Parser & DER/BER Decoder"
    toolCategory="DeveloperApplication"
  >
    <ASN1Parser />
  </ToolPage>
);

export default ASN1Page;
