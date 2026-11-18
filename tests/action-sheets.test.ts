import { describe, expect, it } from 'vitest';
import enemiesJson from '../public/assets/data/enemies.json';
import { ACTION_SHEETS } from '../src/systems/animation/actionSheets.generated';

const enemies = (enemiesJson as unknown as { enemies: { id: string; spriteKey: string }[] })
  .enemies;

describe('action frames (attack, hurt, death)', () => {
  it('cover every enemy and boss sprite (the 16 px twin stars excepted)', () => {
    const missing = [...new Set(enemies.map((e) => e.spriteKey))].filter(
      (k) => k !== 'enemy_twin_star' && !(k in ACTION_SHEETS),
    );
    expect(missing).toEqual([]);
  });

  it('cover Peter in all three costume stages', () => {
    for (const k of ['peter', 'peter_s2', 'peter_s3']) expect(ACTION_SHEETS[k]).toBe(64);
  });
});
