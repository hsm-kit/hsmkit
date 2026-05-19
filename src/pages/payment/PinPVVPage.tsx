import React from 'react';
import { ToolPage } from '../../components/common';
import { PinPVVTool } from '../../components/payment';

const PinPVVPage: React.FC = () => (
  <ToolPage
    seoKey="pinPvv"
    canonical="https://hsmkit.com/payments-pin-pvv"
    toolName="PIN PVV Calculator"
    toolCategory="FinanceApplication"
  >
    <PinPVVTool />
  </ToolPage>
);

export default PinPVVPage;
