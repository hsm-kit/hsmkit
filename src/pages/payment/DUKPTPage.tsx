import React from 'react';
import { ToolPage } from '../../components/common';
import { DUKPTTool } from '../../components/payment';

const DUKPTPage: React.FC = () => (
  <ToolPage
    seoKey="dukpt"
    canonical="https://hsmkit.com/dukpt-calculator"
    toolName="DUKPT Calculator"
    toolCategory="FinanceApplication"
  >
    <DUKPTTool />
  </ToolPage>
);

export default DUKPTPage;
