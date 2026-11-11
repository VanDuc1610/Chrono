# CHRONO – COMBAT SPECIFICATION

**Module:** Combat Math, Formulas & Initiative Engine  
**Implementation Source:** `src/systems/combat/CombatSystem.ts`, `public/assets/data/player.json`

---

## 1. Speed Initiative & Turn Queue

- **Queue Generation:** Combatants are sorted descending by effective `speed`. Ties are resolved deterministically by player priority.
- **Round Advancement:** After all alive combatants act, `advanceTurn()` increments `turnCount` and decrements active status durations (e.g., `defending`).

## 2. Damage Formulas

- **Physical Attack (`attack`):**
  $$\text{Damage} = \max\left(1, \text{Attack}_{\text{source}} - \lfloor \text{Defense}_{\text{target}} \times 0.5 \rfloor\right)$$
  - If the target is in `defending` stance:
    $$\text{Damage}_{\text{mitigated}} = \max\left(1, \lfloor \text{Damage} \times 0.5 \rfloor\right)$$
- **Skill Attack (`skill` - Temporal Strike):**
  - Requires **6 MP** (`skillMpCost`). Short MP aborts action without losing turn.
  - Multiplier: $\times 1.6$ base attack power:
    $$\text{Damage} = \max\left(1, \lfloor \text{Attack}_{\text{source}} \times 1.6 \rfloor - \lfloor \text{Defense}_{\text{target}} \times 0.5 \rfloor\right)$$
    (Mitigated by 50% if target is defending).

## 3. Healing Formula (`item` - Minor Chrono Shard)

- Consumes 1 shard from Satchel.
- HP restored: $30\text{ HP}$ (defined in `items.json` `effects.healAmount`).
- Clamped: $\min(\text{CurrentHP} + 30, \text{MaxHP})$.
- If count is 0 or HP is already full, action fails without consuming turn.

## 4. Escape Formula (`escape`)

- Escape probability $P$:
  $$P = \text{clamp}\left(0.3 + \frac{\text{Speed}_{\text{player}} - \text{Speed}_{\text{enemy}}}{100}, 0.1, 0.95\right)$$
- A random roll $R \in [0, 1)$ succeeds if $R < P$.
- Failed escape consumes the player's turn.
