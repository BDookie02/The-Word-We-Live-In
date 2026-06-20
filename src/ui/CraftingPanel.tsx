import { useGameStore } from '../state/store';
import { eraDef, invCount, invHas, ITEMS, RECIPES, type ItemId } from '../sim';

/**
 * Crafting panel. Lists data-driven recipes, shows their inputs (highlighting any the player
 * can't afford), and dispatches a `craft` intent. Craftability is derived from the live
 * inventory snapshot — the sim core remains the single source of truth (it re-checks on craft).
 */
export default function CraftingPanel({ onClose }: { onClose: () => void }) {
  const inventory = useGameStore((s) => s.snapshot?.inventory ?? {});
  const eraIndex = useGameStore((s) => s.snapshot?.era.index ?? 0);
  const dispatch = useGameStore((s) => s.dispatch);

  return (
    <div className="craft">
      <div className="craft__head">
        <span>Crafting</span>
        <button className="craft__close" onClick={onClose} aria-label="Close crafting">
          ✕
        </button>
      </div>
      <div className="craft__list">
        {RECIPES.map((recipe) => {
          const locked = recipe.minEra > eraIndex;
          const hasTool = !recipe.requiresTool || invCount(inventory, recipe.requiresTool) >= 1;
          const canCraft = !locked && hasTool && invHas(inventory, recipe.inputs);
          return (
            <div key={recipe.id} className="recipe">
              <div className="recipe__main">
                <span className="recipe__out">
                  {ITEMS[recipe.output.item].icon} {recipe.name}
                </span>
                <span className="recipe__inputs">
                  {(Object.entries(recipe.inputs) as [ItemId, number][]).map(([id, qty]) => (
                    <span
                      key={id}
                      className={invCount(inventory, id) >= qty ? 'cost' : 'cost cost--missing'}
                    >
                      {ITEMS[id].icon}
                      {qty}
                    </span>
                  ))}
                </span>
              </div>
              <button
                className="recipe__btn"
                disabled={!canCraft}
                onClick={() => dispatch({ type: 'craft', recipeId: recipe.id })}
                title={locked ? `Unlocks in the ${eraDef(recipe.minEra).name} era` : undefined}
              >
                {locked ? `🔒 ${eraDef(recipe.minEra).name}` : 'Craft'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
