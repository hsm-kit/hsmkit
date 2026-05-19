import React from 'react';
import { ToolPage } from '../../components/common';
import { CVVTool } from '../../components/payment';

const CVVPage: React.FC = () => (
  <ToolPage
    seoKey="cvv"
    canonical="https://hsmkit.com/cvv-calculator"
    toolName="CVV/CVC Calculator and Validator"
    toolCategory="FinanceApplication"
  >
    <CVVTool />
  </ToolPage>
);

export default CVVPage;
