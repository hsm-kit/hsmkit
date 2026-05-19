import React from 'react';
import { ToolPage } from '../../components/common';
import { BitmapTool } from '../../components/payment';

const BitmapPage: React.FC = () => (
  <ToolPage
    seoKey="bitmap"
    canonical="https://hsmkit.com/iso8583-bitmap"
    toolName="ISO8583 Bitmap Encoder/Decoder"
    toolCategory="FinanceApplication"
  >
    <BitmapTool />
  </ToolPage>
);

export default BitmapPage;
