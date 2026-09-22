type ToolEventName =
  | 'tool_view'
  | 'example_load'
  | 'calculation_success'
  | 'calculation_error'
  | 'result_copy'
  | 'next_tool_click'
  | 'guide_click'
  | 'favorite_add'
  | 'favorite_remove'
  | 'tool_share';

interface ToolEventDetail {
  toolId: string;
  source?: string;
  targetId?: string;
}

type CloudflareAnalytics = {
  track?: (eventName: string, properties?: Record<string, string>) => void;
};

type GoogleTag = (command: 'event', eventName: string, properties: Record<string, string>) => void;

declare global {
  interface Window {
    zaraz?: CloudflareAnalytics;
    gtag?: GoogleTag;
  }
}

export function trackToolEvent(eventName: ToolEventName, detail: ToolEventDetail): void {
  const properties = {
    tool_id: detail.toolId,
    ...(detail.source ? { source: detail.source } : {}),
    ...(detail.targetId ? { target_id: detail.targetId } : {}),
  };

  window.dispatchEvent(new CustomEvent('hsmkit:tool-event', {
    detail: { eventName, ...properties },
  }));
  window.zaraz?.track?.(eventName, properties);
  window.gtag?.('event', eventName, properties);
}
