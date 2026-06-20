import { useState } from 'react';
import { useGameStore } from '../state/store';
import { useRewardedAd } from './useRewardedAd';
import CraftingPanel from './CraftingPanel';
import ObjectivesPanel from './ObjectivesPanel';
import RosterPanel from './RosterPanel';
import BuildMenu from './BuildMenu';
import EraPanel from './EraPanel';
import SocietyPanel from './SocietyPanel';
import { ADS } from '../config/gameConfig';
import { ITEM_ORDER, ITEMS, invCount, type NeedLevels } from '../sim';

const NEED_META: { key: keyof NeedLevels; label: string; icon: string }[] = [
  { key: 'health', label: 'Health', icon: '❤️' },
  { key: 'hunger', label: 'Hunger', icon: '🍖' },
  { key: 'thirst', label: 'Thirst', icon: '💧' },
  { key: 'energy', label: 'Energy', icon: '⚡' },
];

function barColor(value: number): string {
  if (value > 60) return '#7bd88f';
  if (value > 30) return '#e6c14b';
  return '#e0584f';
}

function NeedBar({ icon, label, value }: { icon: string; label: string; value: number }) {
  return (
    <div className="need" title={`${label}: ${Math.round(value)}`}>
      <span className="need__icon" aria-hidden>
        {icon}
      </span>
      <span className="need__track">
        <span
          className="need__fill"
          style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: barColor(value) }}
        />
      </span>
    </div>
  );
}

/** Heads-up overlay: world clock, survival needs, inventory, and actions. */
export default function Hud() {
  const snapshot = useGameStore((s) => s.snapshot);
  const dispatch = useGameStore((s) => s.dispatch);
  const { watchForReward, adBusy } = useRewardedAd();
  const [craftOpen, setCraftOpen] = useState(false);
  const [tasksOpen, setTasksOpen] = useState(false);
  const [rosterOpen, setRosterOpen] = useState(false);
  const [buildOpen, setBuildOpen] = useState(false);
  const [eraOpen, setEraOpen] = useState(false);
  const [societyOpen, setSocietyOpen] = useState(false);
  if (!snapshot) return null;

  const { player, inventory } = snapshot;
  const alive = player.status === 'alive';
  const { day, hour, minute } = snapshot.time;
  const clock = `Day ${day} · ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  const owned = ITEM_ORDER.filter((id) => invCount(inventory, id) > 0);
  const latestMessage = snapshot.messages[snapshot.messages.length - 1];
  const openTasks = snapshot.objectives.filter((o) => !o.completed).length;
  const recruited = snapshot.npcs.filter((n) => n.recruited).length;
  const threatCount = snapshot.threats.length;

  return (
    <div className="hud">
      <header className="hud__bar hud__bar--top">
        <span className="hud__title">The World We Live In</span>
        <span className="hud__era" title="Civilization era">
          🏛️ {snapshot.era.name}
          {snapshot.canAdvanceEra ? ' ⬆' : ''}
        </span>
        <span className="hud__clock">
          {snapshot.isNight ? '🌙' : '☀️'} {clock}
        </span>
      </header>

      {latestMessage && (
        <div className="assistant" key={latestMessage.id}>
          {latestMessage.text}
        </div>
      )}

      {threatCount > 0 && (
        <div className="threat-alert">
          ⚠️ {threatCount} threat{threatCount > 1 ? 's' : ''} — tap them to fight back
        </div>
      )}

      <div className="hud__needs">
        {NEED_META.map(({ key, label, icon }) => (
          <NeedBar key={key} icon={icon} label={label} value={player.needs[key]} />
        ))}
      </div>

      {craftOpen && <CraftingPanel onClose={() => setCraftOpen(false)} />}
      {tasksOpen && <ObjectivesPanel onClose={() => setTasksOpen(false)} />}
      {rosterOpen && <RosterPanel onClose={() => setRosterOpen(false)} />}
      {buildOpen && <BuildMenu onClose={() => setBuildOpen(false)} />}
      {eraOpen && <EraPanel onClose={() => setEraOpen(false)} />}
      {societyOpen && <SocietyPanel onClose={() => setSocietyOpen(false)} />}

      <footer className="hud__bar hud__bar--bottom">
        <div className="hud__inv">
          {owned.length === 0 && <span className="hud__inv-empty">Gather resources to begin…</span>}
          {owned.map((id) => (
            <span key={id} className="inv-item" title={ITEMS[id].name}>
              {ITEMS[id].icon} <b>{invCount(inventory, id)}</b>
            </span>
          ))}
        </div>

        <div className="hud__actions">
          <button
            className="hud__btn"
            disabled={!alive || invCount(inventory, 'food') < 1}
            onClick={() => dispatch({ type: 'eat' })}
          >
            🍖 Eat
          </button>
          <button
            className="hud__btn"
            disabled={!alive || !player.nearWater}
            onClick={() => dispatch({ type: 'drink' })}
            title={player.nearWater ? 'Drink from the water' : 'Move to the shore to drink'}
          >
            💧 Drink
          </button>
          <button
            className={`hud__btn ${rosterOpen ? 'hud__btn--active' : ''}`}
            onClick={() => setRosterOpen((v) => !v)}
          >
            👥 People{recruited > 0 ? ` (${recruited})` : ''}
          </button>
          <button
            className={`hud__btn ${tasksOpen ? 'hud__btn--active' : ''}`}
            onClick={() => setTasksOpen((v) => !v)}
          >
            🎯 Tasks{openTasks > 0 ? ` (${openTasks})` : ''}
          </button>
          <button
            className={`hud__btn ${craftOpen ? 'hud__btn--active' : ''}`}
            disabled={!alive}
            onClick={() => setCraftOpen((v) => !v)}
          >
            🔨 Craft
          </button>
          <button
            className={`hud__btn ${buildOpen ? 'hud__btn--active' : ''}`}
            disabled={!alive}
            onClick={() => setBuildOpen((v) => !v)}
          >
            🏗️ Build
          </button>
          <button
            className={`hud__btn ${societyOpen ? 'hud__btn--active' : ''}`}
            onClick={() => setSocietyOpen((v) => !v)}
          >
            🌐 Society{snapshot.society.groups.length > 0 ? ` (${snapshot.society.groups.length})` : ''}
          </button>
          <button
            className={`hud__btn ${eraOpen ? 'hud__btn--active' : ''} ${snapshot.canAdvanceEra ? 'hud__btn--alert' : ''}`}
            onClick={() => setEraOpen((v) => !v)}
          >
            🏛️ Era
          </button>
          {threatCount > 0 ? (
            <button
              className="hud__btn hud__btn--ad"
              disabled={adBusy}
              onClick={() => watchForReward('reward_defense', { type: 'repelThreats' })}
            >
              {adBusy ? 'Loading…' : '🛡️ Repel (ad)'}
            </button>
          ) : (
            <button
              className="hud__btn hud__btn--ad"
              disabled={adBusy || !alive}
              onClick={() =>
                watchForReward('reward_cache', {
                  type: 'grantCache',
                  kind: 'wood',
                  amount: ADS.rewardCacheAmount,
                })
              }
            >
              {adBusy ? 'Loading…' : `🎁 +${ADS.rewardCacheAmount} wood`}
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
