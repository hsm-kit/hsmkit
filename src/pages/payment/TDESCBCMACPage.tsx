import React from 'react';
import { ToolPage } from '../../components/common';
import { TDESCBCMACTool } from '../../components/payment';

const TDESCBCMACPage: React.FC = () => (
  <ToolPage
    seoKey="tdesCbcMac"
    canonical="https://hsmkit.com/payments-mac-tdes-cbc-mac"
    toolName="TDES CBC-MAC Calculator"
    toolCategory="PaymentSecurity"
  >
    <TDESCBCMACTool />
  </ToolPage>
);

export default TDESCBCMACPage;
