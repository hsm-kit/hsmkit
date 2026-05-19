import React from 'react';
import { ToolPage } from '../../components/common';
import { Base64Tool } from '../../components/generic';

const Base64Page: React.FC = () => (
  <ToolPage
    seoKey="base64"
    canonical="https://hsmkit.com/base64"
    toolName="Base64 Encoder/Decoder"
    toolCategory="DeveloperApplication"
  >
    <Base64Tool />
  </ToolPage>
);

export default Base64Page;
