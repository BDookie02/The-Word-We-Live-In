import type { Intent } from '../intents/intents';
import type { SaveBlob } from '../persistence/saveSchema';

/**
 * Multiplayer wire protocol (Phase 14) — INTERFACES + ENCODING ONLY. Nothing here opens a
 * connection; the game stays fully offline-first. This formalizes the seam so friend-based MP is
 * a later drop-in built on the deterministic, intent-driven sim core.
 *
 * Model: the World is the deterministic authority. Each player's actions are already `Intent`s;
 * a `NetCommand` wraps an intent with the tick it applies at, an author, and a per-author
 * sequence number. The host orders all peers' commands per tick and applies them to the
 * authoritative World; because the sim is deterministic, peers can re-simulate from the same
 * commands (a joining peer is bootstrapped with a full `sync` SaveBlob first).
 */
export const NET_PROTOCOL_VERSION = 1;

export type PlayerId = string;

export interface Peer {
  id: PlayerId;
  name: string;
  isHost: boolean;
}

export interface NetCommand {
  /** Sim tick at which this command should apply (host-scheduled). */
  tick: number;
  /** Per-author monotonic sequence number (ordering + dedupe). */
  seq: number;
  playerId: PlayerId;
  intent: Intent;
}

export type NetMessage =
  | { type: 'hello'; peer: Peer }
  | { type: 'bye'; peerId: PlayerId }
  | { type: 'command'; command: NetCommand }
  /** Host → joining peer: full authoritative state to start from. */
  | { type: 'sync'; blob: SaveBlob };

/** Encode a message for transport. Intents/SaveBlob are already JSON-safe plain data. */
export function encodeMessage(msg: NetMessage): string {
  return JSON.stringify({ v: NET_PROTOCOL_VERSION, msg });
}

/** Decode a transport payload, or null if absent/corrupt/version-mismatched. */
export function decodeMessage(raw: string): NetMessage | null {
  try {
    const parsed = JSON.parse(raw) as { v?: number; msg?: NetMessage };
    if (parsed && parsed.v === NET_PROTOCOL_VERSION && parsed.msg) return parsed.msg;
    return null;
  } catch {
    return null;
  }
}
