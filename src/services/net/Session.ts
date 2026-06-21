import type { Intent, NetCommand, Peer, PlayerId } from '../../sim';
import { NullTransport, type NetTransport } from './NetTransport';

/**
 * Host-authoritative multiplayer session (Phase 14 — interface + offline stub only).
 *
 * Integration seam for later: instead of the GameLoop dispatching the local player's intents
 * straight into the World, it would call `submitIntent`, which wraps them as `NetCommand`s and
 * sends them via the transport. The host gathers every peer's commands for a tick, orders them
 * deterministically, and applies them to the authoritative World; `onRemoteCommand` feeds peer
 * commands into the local sim. The deterministic World keeps all clients in lock-step.
 */
export interface MultiplayerSession {
  readonly localPlayerId: PlayerId;
  readonly isHost: boolean;
  peers(): Peer[];
  start(): Promise<void>;
  stop(): void;
  /** Wrap + transmit a local intent for application at the given sim tick. */
  submitIntent(intent: Intent, tick: number): void;
  /** Subscribe to commands arriving from remote peers. Returns an unsubscribe fn. */
  onRemoteCommand(handler: (cmd: NetCommand) => void): () => void;
}

/**
 * Single-player session. Submitting an intent does nothing networked (the GameLoop already
 * dispatches locally); there are no peers and no remote commands. This is the default, so the
 * whole game runs with zero networking until a real transport/session is wired in.
 */
export class OfflineSession implements MultiplayerSession {
  readonly localPlayerId: PlayerId = 'player';
  readonly isHost = true;
  private transport: NetTransport = new NullTransport();

  peers(): Peer[] {
    return [];
  }
  async start(): Promise<void> {
    await this.transport.connect();
  }
  stop(): void {
    this.transport.disconnect();
  }
  submitIntent(_intent: Intent, _tick: number): void {
    /* offline: intents are applied directly by the GameLoop; nothing to transmit */
  }
  onRemoteCommand(_handler: (cmd: NetCommand) => void): () => void {
    return () => {};
  }
}

let instance: MultiplayerSession | null = null;

/** Process-wide session. Offline by default; swapped for a networked session in a later phase. */
export function getSession(): MultiplayerSession {
  if (!instance) instance = new OfflineSession();
  return instance;
}
