import React from 'react';
import { ToolPage } from '../../components/common';
import SafeNetKeysTool from '../../components/keys/SafeNetKeysTool';

const SafeNetKeysPage: React.FC = () => (
  <ToolPage
    seoKey="safenetKeys"
    canonical="https://hsmkit.com/safenet-keys"
    toolName="SafeNet Keys Encryption/Decryption"
    toolCategory="SecurityApplication"
  >
    <SafeNetKeysTool />
  </ToolPage>
);

export default SafeNetKeysPage;
