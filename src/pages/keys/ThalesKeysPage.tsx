import React from 'react';
import { ToolPage } from '../../components/common';
import ThalesKeysTool from '../../components/keys/ThalesKeysTool';

const ThalesKeysPage: React.FC = () => (
  <ToolPage
    seoKey="thalesKeys"
    canonical="https://hsmkit.com/thales-keys"
    toolName="Thales Keys (LMK) Tool"
    toolCategory="SecurityApplication"
  >
    <ThalesKeysTool />
  </ToolPage>
);

export default ThalesKeysPage;
