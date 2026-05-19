import React from 'react';
import { ToolPage } from '../../components/common';
import { MastercardCVC3Tool } from '../../components/payment';

const MastercardCVC3Page: React.FC = () => (
  <ToolPage
    seoKey="mastercardCvc3"
    canonical="https://hsmkit.com/mastercard-cvc3-calculator"
    toolName="Mastercard CVC3 Calculator"
    toolCategory="FinanceApplication"
  >
    <MastercardCVC3Tool />
  </ToolPage>
);

export default MastercardCVC3Page;
