import React from 'react';
import { ToolPage } from '../../components/common';
import { UUIDTool } from '../../components/generic';

const UUIDPage: React.FC = () => (
  <ToolPage
    seoKey="uuid"
    canonical="https://hsmkit.com/uuid"
    toolName="UUID Generator"
    toolCategory="DeveloperApplication"
  >
    <UUIDTool />
  </ToolPage>
);

export default UUIDPage;
