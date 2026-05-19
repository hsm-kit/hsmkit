import React from 'react';
import { ToolPage } from '../../components/common';
import { ISO9797Tool } from '../../components/payment';

const ISO9797Page: React.FC = () => (
  <ToolPage
    seoKey="iso9797Mac"
    canonical="https://hsmkit.com/payments-mac-iso9797-1"
    toolName="ISO 9797-1 MAC Calculator"
    toolCategory="SecurityApplication"
  >
    <ISO9797Tool />
  </ToolPage>
);

export default ISO9797Page;
