import React from 'react';
import { ToolPage } from '../../components/common';
import AtallaKeysTool from '../../components/keys/AtallaKeysTool';

const AtallaKeysPage: React.FC = () => (
  <ToolPage
    seoKey="atallaKeys"
    canonical="https://hsmkit.com/atalla-keys"
    toolName="Atalla Keys (AKB)"
    toolCategory="SecurityApplication"
  >
    <AtallaKeysTool />
  </ToolPage>
);

export default AtallaKeysPage;
