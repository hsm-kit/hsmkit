import React from 'react';
import { ToolPage } from '../../components/common';
import { KeyshareGenerator } from '../../components/keys';

const KeysharePage: React.FC = () => (
  <ToolPage
    seoKey="keyshare"
    canonical="https://hsmkit.com/keyshare-generator"
    toolName="Keyshare Generator"
    toolCategory="SecurityApplication"
  >
    <KeyshareGenerator />
  </ToolPage>
);

export default KeysharePage;
