import React from 'react';
import { ToolPage } from '../../components/common';
import { CharacterEncodingTool } from '../../components/generic';

const CharacterEncodingPage: React.FC = () => (
  <ToolPage
    seoKey="encoding"
    canonical="https://hsmkit.com/character-encoding"
    toolName="Character Encoding Converter"
    toolCategory="DeveloperApplication"
  >
    <CharacterEncodingTool />
  </ToolPage>
);

export default CharacterEncodingPage;
