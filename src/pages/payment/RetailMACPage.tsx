import React from 'react';
import { ToolPage } from '../../components/common';
import { RetailMACTool } from '../../components/payment';

const RetailMACPage: React.FC = () => (
  <ToolPage
    seoKey="retailMac"
    canonical="https://hsmkit.com/payments-mac-retail"
    toolName="Retail MAC Calculator"
    toolCategory="FinanceApplication"
  >
    <RetailMACTool />
  </ToolPage>
);

export default RetailMACPage;
