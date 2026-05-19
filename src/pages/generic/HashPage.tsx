import React from 'react';
import { ToolPage } from '../../components/common';
import { HashCalculator } from '../../components/generic';

const HashPage: React.FC = () => (
  <ToolPage
    seoKey="hash"
    canonical="https://hsmkit.com/hashes"
    toolName="Hash Calculator"
    toolCategory="DeveloperApplication"
  >
    <HashCalculator />
  </ToolPage>
);

export default HashPage;
