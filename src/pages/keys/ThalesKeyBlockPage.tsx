import React from 'react';
import { ToolPage } from '../../components/common';
import ThalesKeyBlockTool from '../../components/keys/ThalesKeyBlockTool';

const ThalesKeyBlockPage: React.FC = () => (
  <ToolPage
    seoKey="thalesKeyBlock"
    canonical="https://hsmkit.com/thales-key-block"
    toolName="Thales Key Block Tool"
    toolCategory="SecurityApplication"
  >
    <ThalesKeyBlockTool />
  </ToolPage>
);

export default ThalesKeyBlockPage;
