/**
 * Lightweight boot menu. "Continue" appears only when a save exists; "New Game" starts a fresh
 * procedurally-generated world (clearing the previous save). Kept minimal and touch-friendly.
 */
export default function MainMenu({
  hasSave,
  onNewGame,
  onContinue,
}: {
  hasSave: boolean;
  onNewGame: () => void;
  onContinue: () => void;
}) {
  return (
    <div className="menu">
      <div className="menu__card">
        <h1 className="menu__title">The World We Live In</h1>
        <p className="menu__tagline">Crash-land. Survive. Build a civilization.</p>
        <div className="menu__buttons">
          {hasSave && (
            <button className="menu__btn menu__btn--primary" onClick={onContinue}>
              ▶ Continue
            </button>
          )}
          <button
            className={`menu__btn ${hasSave ? '' : 'menu__btn--primary'}`}
            onClick={onNewGame}
          >
            ✦ New Game
          </button>
        </div>
        {hasSave && <p className="menu__note">New Game replaces your current save.</p>}
      </div>
    </div>
  );
}
