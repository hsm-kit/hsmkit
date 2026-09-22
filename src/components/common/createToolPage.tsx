import React from 'react';
import { ToolPage } from './ToolPage';

export interface ToolPageMeta {
  seoKey: string;
  canonical: string;
  toolName: string;
  toolCategory: string;
}

/**
 * 工具页工厂函数：消除各工具页面完全相同的模板代码。
 * 每个页面仍保持独立文件，以配合 routes.tsx 中的 React.lazy 按路由代码分割。
 * 注意：组件参数在前（与 memo/forwardRef 一致），以配合 react-refresh 的 HOC 检测。
 */
export function createToolPage(Tool: React.ComponentType, meta: ToolPageMeta): React.FC {
  const Page: React.FC = () => (
    <ToolPage {...meta}>
      <Tool />
    </ToolPage>
  );
  Page.displayName = `ToolPage(${meta.seoKey})`;
  return Page;
}
