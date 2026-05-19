import React from 'react';
import { ToolPage } from '../../components/common';
import { HMACTool } from '../../components/payment';

const HMACPage: React.FC = () => (
  <ToolPage
    seoKey="hmac"
    canonical="https://hsmkit.com/payments-mac-hmac"
    toolName="HMAC Calculator"
    toolCategory="Payment MAC"
  >
    <HMACTool />
  </ToolPage>
);

export default HMACPage;
