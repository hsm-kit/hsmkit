import React from 'react';
import { ToolPage } from '../../components/common';
import PinBlockGeneralTool from '../../components/payment/PinBlockGeneralTool';

const PinBlockGeneralPage: React.FC = () => (
  <ToolPage
    seoKey="pinBlockGeneral"
    canonical="https://hsmkit.com/payments-pin-blocks-general"
    toolName="PIN Block General (ISO 9564 Formats 0-4)"
    toolCategory="FinanceApplication"
  >
    <PinBlockGeneralTool />
  </ToolPage>
);

export default PinBlockGeneralPage;
