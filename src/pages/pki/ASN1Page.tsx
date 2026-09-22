import { createToolPage } from '../../components/common';
import { ASN1Parser } from '../../components/pki';

export default createToolPage(ASN1Parser, {
  seoKey: 'asn1',
  canonical: 'https://hsmkit.com/asn1-parser',
  toolName: 'ASN.1 Parser & DER/BER Decoder',
  toolCategory: 'DeveloperApplication',
});
