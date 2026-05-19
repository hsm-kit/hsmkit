import React from 'react';
import { ToolPage } from '../../components/common';
import { KeyGenerator } from '../../components/keys';

const KeyGeneratorPage: React.FC = () => (
  <ToolPage
    seoKey="keyGenerator"
    canonical="https://hsmkit.com/key-generator"
    toolName="Cryptographic Key Generator"
    toolCategory="SecurityApplication"
  >
    <KeyGenerator />
  </ToolPage>
);

export default KeyGeneratorPage;
