import React from 'react';
import { ToolPage } from '../../components/common';
import { AmexCSCTool } from '../../components/payment';

const AmexCSCPage: React.FC = () => (
  <ToolPage
    seoKey="amexCsc"
    canonical="https://hsmkit.com/amex-csc-calculator"
    toolName="AMEX CSC Calculator and Validator"
    toolCategory="FinanceApplication"
  >
    <AmexCSCTool />
  </ToolPage>
);

export default AmexCSCPage;
