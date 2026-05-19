import React from 'react';
import { ToolPage } from '../../components/common';
import PinOffsetTool from '../../components/payment/PinOffsetTool';

const PinOffsetPage: React.FC = () => (
  <ToolPage
    seoKey="pinOffset"
    canonical="https://hsmkit.com/payments-pin-offset"
    toolName="PIN Offset Calculator (IBM 3624 Method)"
    toolCategory="FinanceApplication"
  >
    <PinOffsetTool />
  </ToolPage>
);

export default PinOffsetPage;
