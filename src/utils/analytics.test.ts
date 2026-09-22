import { afterEach, describe, expect, it, vi } from 'vitest';
import { trackToolEvent } from './analytics';

describe('tool analytics', () => {
  afterEach(() => {
    delete window.gtag;
    delete window.zaraz;
  });

  it('sends only allowlisted non-sensitive properties', () => {
    const gtag = vi.fn();
    const zarazTrack = vi.fn();
    window.gtag = gtag;
    window.zaraz = { track: zarazTrack };

    trackToolEvent('next_tool_click', {
      toolId: 'aes',
      source: 'internal',
      targetId: 'base64',
    });

    const properties = {
      tool_id: 'aes',
      source: 'internal',
      target_id: 'base64',
    };
    expect(gtag).toHaveBeenCalledWith('event', 'next_tool_click', properties);
    expect(zarazTrack).toHaveBeenCalledWith('next_tool_click', properties);
    expect(Object.keys(properties)).toEqual(['tool_id', 'source', 'target_id']);
  });
});
