import React from 'react';
import { ToolPage } from '../../components/common';
import { AS2805Tool } from '../../components/payment';

const AS2805Page: React.FC = () => (
  <ToolPage
    seoKey="as2805"
    canonical="https://hsmkit.com/payments-as2805"
    toolName="AS2805 Tools"
    toolCategory="FinanceApplication"
  >
    <AS2805Tool />
  </ToolPage>
);

export default AS2805Page;
