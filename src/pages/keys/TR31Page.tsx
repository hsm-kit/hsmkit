import React from 'react';
import { ToolPage } from '../../components/common';
import TR31KeyBlockTool from '../../components/keys/TR31KeyBlockTool';

const TR31Page: React.FC = () => (
  <ToolPage
    seoKey="tr31"
    canonical="https://hsmkit.com/tr31-key-block"
    toolName="TR-31 Key Block Encoder/Decoder"
    toolCategory="FinanceApplication"
  >
    <TR31KeyBlockTool />
  </ToolPage>
);

export default TR31Page;
