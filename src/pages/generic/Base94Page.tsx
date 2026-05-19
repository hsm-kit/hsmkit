import React from 'react';
import { ToolPage } from '../../components/common';
import { Base94Tool } from '../../components/generic';

const Base94Page: React.FC = () => (
  <ToolPage
    seoKey="base94"
    canonical="https://hsmkit.com/base94"
    toolName="Base94 Encoder/Decoder"
    toolCategory="DeveloperApplication"
  >
    <Base94Tool />
  </ToolPage>
);

export default Base94Page;
