import React from 'react';
import { ToolPage } from '../../components/common';
import { MessageParserTool } from '../../components/generic';

const MessageParserPage: React.FC = () => (
  <ToolPage
    seoKey="messageParser"
    canonical="https://hsmkit.com/message-parser"
    toolName="Message Parser"
    toolCategory="DeveloperApplication"
  >
    <MessageParserTool />
  </ToolPage>
);

export default MessageParserPage;
