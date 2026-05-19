import React from 'react';
import { ToolPage } from '../../components/common';
import { DUKPTAESTool } from '../../components/payment';

const DUKPTAESPage: React.FC = () => (
  <ToolPage
    seoKey="dukptAes"
    canonical="https://hsmkit.com/dukpt-aes-calculator"
    toolName="DUKPT AES Calculator"
    toolCategory="FinanceApplication"
  >
    <DUKPTAESTool />
  </ToolPage>
);

export default DUKPTAESPage;
