import { describe, expect, it, vi } from 'vitest';
import { LoopbackTransport, NullTransport } from './NetTransport';
import { getSession, OfflineSession } from './Session';
import type { NetMessage } from '../../sim';

const hello: NetMessage = { type: 'hello', peer: { id: 'p1', name: 'A', isHost: true } };

describe('LoopbackTransport', () => {
  it('delivers sent messages to handlers and supports unsubscribe', async () => {
    const t = new LoopbackTransport();
    await t.connect();
    const handler = vi.fn();
    const off = t.onMessage(handler);
    t.send(hello);
    expect(handler).toHaveBeenCalledWith(hello);

    off();
    t.send(hello);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('drops messages while disconnected', () => {
    const t = new LoopbackTransport();
    const handler = vi.fn();
    t.onMessage(handler);
    t.send(hello); // not connected
    expect(handler).not.toHaveBeenCalled();
  });
});

describe('NullTransport', () => {
  it('is a black hole but reports connection state', async () => {
    const t = new NullTransport();
    expect(t.isConnected()).toBe(false);
    await t.connect();
    expect(t.isConnected()).toBe(true);
    expect(() => t.send(hello)).not.toThrow();
  });
});

describe('OfflineSession', () => {
  it('is a no-op single-player session', async () => {
    const s = new OfflineSession();
    await s.start();
    expect(s.isHost).toBe(true);
    expect(s.peers()).toEqual([]);
    expect(() => s.submitIntent({ type: 'noop' }, 0)).not.toThrow();
    const off = s.onRemoteCommand(() => {});
    expect(typeof off).toBe('function');
    s.stop();
  });

  it('getSession returns a stable instance', () => {
    expect(getSession()).toBe(getSession());
  });
});
