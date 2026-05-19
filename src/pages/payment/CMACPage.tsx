import React from 'react';
import { ToolPage } from '../../components/common';
import { CMACTool } from '../../components/payment';

const CMACPage: React.FC = () => (
  <ToolPage
    seoKey="cmac"
    canonical="https://hsmkit.com/payments-mac-cmac"
    toolName="CMAC Calculator"
    toolCategory="FinanceApplication"
  >
    <CMACTool />
  </ToolPage>
);

export default CMACPage;
