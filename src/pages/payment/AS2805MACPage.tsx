import React from 'react';
import { ToolPage } from '../../components/common';
import { AS2805MACTool } from '../../components/payment';

const AS2805MACPage: React.FC = () => (
  <ToolPage
    seoKey="as2805Mac"
    canonical="https://hsmkit.com/payments-mac-as2805"
    toolName="AS2805 MAC Calculator"
    toolCategory="PaymentSecurity"
  >
    <AS2805MACTool />
  </ToolPage>
);

export default AS2805MACPage;
