import React from 'react';
import { ToolPage } from '../../components/common';
import { CheckDigitsTool } from '../../components/generic';

const CheckDigitsPage: React.FC = () => (
  <ToolPage
    seoKey="checkDigits"
    canonical="https://hsmkit.com/check-digits"
    toolName="Check Digits Calculator"
    toolCategory="DeveloperApplication"
  >
    <CheckDigitsTool />
  </ToolPage>
);

export default CheckDigitsPage;
