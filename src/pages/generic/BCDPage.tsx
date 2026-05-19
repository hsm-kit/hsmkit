import React from 'react';
import { ToolPage } from '../../components/common';
import { BCDTool } from '../../components/generic';

const BCDPage: React.FC = () => (
  <ToolPage
    seoKey="bcd"
    canonical="https://hsmkit.com/bcd"
    toolName="BCD Encoder/Decoder"
    toolCategory="DeveloperApplication"
  >
    <BCDTool />
  </ToolPage>
);

export default BCDPage;
