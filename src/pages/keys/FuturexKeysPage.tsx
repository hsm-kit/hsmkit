import React from 'react';
import { ToolPage } from '../../components/common';
import { FuturexKeysTool } from '../../components/keys';

const FuturexKeysPage: React.FC = () => (
  <ToolPage
    seoKey="futurexKeys"
    canonical="https://hsmkit.com/futurex-keys"
    toolName="Futurex Keys Encryption/Decryption"
    toolCategory="SecurityApplication"
  >
    <FuturexKeysTool />
  </ToolPage>
);

export default FuturexKeysPage;
