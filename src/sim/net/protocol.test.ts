import { describe, expect, it } from 'vitest';
import {
  decodeMessage,
  encodeMessage,
  NET_PROTOCOL_VERSION,
  type NetMessage,
} from './protocol';

describe('net protocol', () => {
  it('round-trips a command message', () => {
    const msg: NetMessage = {
      type: 'command',
      command: { tick: 42, seq: 1, playerId: 'p1', intent: { type: 'gather', nodeId: 'node-3' } },
    };
    const decoded = decodeMessage(encodeMessage(msg));
    expect(decoded).toEqual(msg);
  });

  it('round-trips a hello message', () => {
    const msg: NetMessage = { type: 'hello', peer: { id: 'p2', name: 'Friend', isHost: false } };
    expect(decodeMessage(encodeMessage(msg))).toEqual(msg);
  });

  it('returns null for corrupt payloads', () => {
    expect(decodeMessage('not json')).toBeNull();
    expect(decodeMessage(JSON.stringify({ nope: true }))).toBeNull();
  });

  it('rejects mismatched protocol versions', () => {
    const raw = JSON.stringify({ v: NET_PROTOCOL_VERSION + 99, msg: { type: 'bye', peerId: 'x' } });
    expect(decodeMessage(raw)).toBeNull();
  });
});
