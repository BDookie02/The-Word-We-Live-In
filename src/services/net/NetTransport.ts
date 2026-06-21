import type { NetMessage } from '../../sim';

/**
 * Transport abstraction for multiplayer (Phase 14 — interfaces + stubs only, offline-first).
 * A real implementation (WebRTC data channel / WebSocket relay for friend invites) plugs in here
 * later without touching gameplay. Returns an unsubscribe fn from `onMessage`.
 */
export type NetMessageHandler = (msg: NetMessage) => void;

export interface NetTransport {
  readonly id: string;
  connect(): Promise<void>;
  disconnect(): void;
  send(msg: NetMessage): void;
  onMessage(handler: NetMessageHandler): () => void;
  isConnected(): boolean;
}

/** Offline default: connected, but a black hole — no peers, nothing delivered. */
export class NullTransport implements NetTransport {
  readonly id = 'null';
  private connected = false;
  async connect(): Promise<void> {
    this.connected = true;
  }
  disconnect(): void {
    this.connected = false;
  }
  send(_msg: NetMessage): void {
    /* offline: dropped */
  }
  onMessage(_handler: NetMessageHandler): () => void {
    return () => {};
  }
  isConnected(): boolean {
    return this.connected;
  }
}

/**
 * In-process loopback: messages you `send` are delivered back to all registered handlers. Useful
 * for local hot-seat testing and for unit-testing the protocol/session wiring without a network.
 */
export class LoopbackTransport implements NetTransport {
  readonly id = 'loopback';
  private connected = false;
  private handlers = new Set<NetMessageHandler>();

  async connect(): Promise<void> {
    this.connected = true;
  }
  disconnect(): void {
    this.connected = false;
    this.handlers.clear();
  }
  send(msg: NetMessage): void {
    if (!this.connected) return;
    for (const h of this.handlers) h(msg);
  }
  onMessage(handler: NetMessageHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }
  isConnected(): boolean {
    return this.connected;
  }
}
