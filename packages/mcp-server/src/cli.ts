#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/server/stdio';
import { createServer } from './server.js';

const server = createServer();
const transport = new StdioServerTransport();

server.connect(transport).catch(error => {
  console.error('HSM Kit MCP server failed:', error);
  process.exitCode = 1;
});
