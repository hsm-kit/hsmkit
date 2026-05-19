import React from 'react';
import { ToolPage } from '../../components/common';
import { ANSIMACTool } from '../../components/payment';

const ANSIMACPage: React.FC = () => (
  <ToolPage
    seoKey="ansiMac"
    canonical="https://hsmkit.com/payments-mac-ansix9"
    toolName="ANSI MAC Tools"
    toolCategory="PaymentSecurity"
  >
    <ANSIMACTool />
  </ToolPage>
);

export default ANSIMACPage;
