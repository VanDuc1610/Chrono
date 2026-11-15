import type { MapDatabase, TilePoint, TileRect } from './MapTypes';
import type { DialogueDatabase } from '../systems/dialogue/DialogueTypes';

export interface LintFinding {
  mapId: string;
  rule: string;
  severity: 'error' | 'warning';
  message: string;
  x?: number;
  y?: number;
}

export interface LintTilemap {
  width: number;
  height: number;
  layers: { name: string; data?: number[] }[];
}

/** Parsed, trusted project data. Tilemaps are keyed by map.tilemap.path; no I/O here. */
export interface MapLintData {
  maps: MapDatabase;
  dialogues: DialogueDatabase;
  tilemaps: Record<string, LintTilemap>;
  /** Additional runtime flag producers, e.g. enemy finishers or chapter-start presets. */
  knownFlags?: readonly string[];
}

const key = (p: TilePoint): string => `${p.x},${p.y}`;
const distance = (p: TilePoint, r: TileRect): number =>
  Math.max(r.x - p.x, p.x - (r.x + r.w - 1), r.y - p.y, p.y - (r.y + r.h - 1), 0);

/** Static, optimistic lint: conditions and response branches are intentionally not solved. */
export function lintMaps(data: MapLintData): LintFinding[] {
  const findings: LintFinding[] = [];
  const nodes = data.dialogues.dialogues;
  const flags = new Set(data.knownFlags);
  for (const n of Object.values(nodes)) {
    for (const f of n.effects?.setFlags ?? []) flags.add(f);
    if (n.effects?.startTimer) flags.add(n.effects.startTimer.flag);
    if (n.effects?.grantOnceFlag) flags.add(n.effects.grantOnceFlag);
  }
  for (const m of Object.values(data.maps.maps)) {
    for (const t of m.triggers ?? []) {
      if (t.onceFlag) flags.add(t.onceFlag);
      for (const f of t.effects?.setFlags ?? []) flags.add(f);
      if (t.effects?.startTimer) flags.add(t.effects.startTimer.flag);
    }
    for (const e of [...(m.encounters ?? []), ...(m.roamers ?? [])]) {
      if (e.defeatedFlag) flags.add(e.defeatedFlag);
    }
    for (const r of m.roamers ?? []) if (r.group) flags.add(`cleared_${r.group}`);
    for (const d of m.dials ?? []) for (const v of d.values) flags.add(`${d.id}_${v.key}`);
    for (const b of m.beams ?? []) flags.add(b.solvedFlag);
    for (const t of m.strikeTargets ?? []) for (const f of t.setFlags ?? []) flags.add(f);
  }
  for (const m of Object.values(data.maps.maps)) {
    const add = (rule: string, message: string, p?: TilePoint): void => {
      findings.push({
        mapId: m.id,
        rule,
        severity:
          rule === 'reveal-without-refresh' || rule === 'trigger-covers-spawn'
            ? 'warning'
            : 'error',
        message,
        ...(p ? { x: p.x, y: p.y } : {}),
      });
    };
    const tm = data.tilemaps[m.tilemap.path];
    if (!tm) throw new Error(`Missing tilemap: ${m.tilemap.path}`);
    const walls = tm.layers.find((l) => l.name === m.layers.walls)?.data;
    if (!walls || walls.length !== tm.width * tm.height)
      throw new Error(`Invalid wall layer: ${m.id}`);
    const inside = (p: TilePoint): boolean =>
      p.x >= 0 && p.y >= 0 && p.x < tm.width && p.y < tm.height;
    const blocking = (gid: number): boolean =>
      gid >= m.collision.fromGid && gid <= m.collision.toGid;
    const opened = new Set<string>();
    for (const s of m.tileSwaps ?? [])
      if (s.layer === 'walls' && !blocking(s.index + 1))
        for (const p of s.tiles) opened.add(key(p));
    const walkable = (p: TilePoint): boolean =>
      inside(p) && (!blocking(walls[p.y * tm.width + p.x]) || opened.has(key(p)));
    for (const [id, p] of Object.entries(m.spawns)) {
      for (const e of m.exits ?? [])
        if (distance(p, e.area) < 2)
          add('spawn-near-exit', `spawn ${id} is within 2 tiles of exit ${e.id}`, p);
      if (!inside(p) || blocking(walls[p.y * tm.width + p.x]))
        add('spawn-blocked', `spawn ${id} is blocked before swaps`, p);
      for (const t of m.triggers ?? [])
        if (t.on === 'zone' && t.area && distance(p, t.area) === 0)
          add('trigger-covers-spawn', `trigger ${t.id} contains spawn ${id}`, p);
    }
    const start = m.spawns.default ?? Object.values(m.spawns)[0];
    const reached = new Set<string>();
    const queue: TilePoint[] = [];
    if (start && walkable(start)) {
      queue.push(start);
      reached.add(key(start));
    }
    for (let i = 0; i < queue.length; i++) {
      const p = queue[i];
      for (const q of [
        { x: p.x - 1, y: p.y },
        { x: p.x + 1, y: p.y },
        { x: p.x, y: p.y - 1 },
        { x: p.x, y: p.y + 1 },
      ])
        if (walkable(q) && !reached.has(key(q))) {
          reached.add(key(q));
          queue.push(q);
        }
    }
    const accessible = (r: TileRect): boolean => queue.some((p) => distance(p, r) <= 1);
    for (const e of m.exits ?? [])
      if (!accessible(e.area)) add('unreachable', `exit ${e.id} cannot be reached`, e.area);
    for (const e of [...(m.npcs ?? []), ...(m.interactables ?? [])])
      if (!accessible({ ...e.tile, w: 1, h: 1 }))
        add('unreachable', `object ${e.id} cannot be reached`, e.tile);
    const ref = (id: string, where: string): void => {
      if (!nodes[id]) add('dangling-ref', `${where}: unknown dialogue ${id}`);
    };
    for (const c of m.dialChecks ?? []) ref(c.dialogueId, 'dialCheck');
    for (const e of m.encounters ?? [])
      for (const r of e.victoryDialogueRules ?? [])
        ref(r.dialogueId, `encounter ${e.id} victory rule`);
    // lockedDialogueId is already checked by validateMapDatabase/content-data.test.ts.
    for (const d of m.dials ?? []) {
      for (const v of d.values)
        if (v.knownFlag && !flags.has(v.knownFlag))
          add('dangling-ref', `dial ${d.id}: unknown knownFlag ${v.knownFlag}`);
      for (const c of d.couples ?? [])
        if (!m.dials?.some((other) => other.id === c.dialId))
          add('dangling-ref', `dial ${d.id}: unknown coupled dial ${c.dialId}`);
    }
    const used = new Set<string>();
    for (const e of [
      ...(m.npcs ?? []),
      ...(m.interactables ?? []),
      ...(m.encounters ?? []),
      ...(m.roamers ?? []),
      ...(m.dials ?? []),
    ]) {
      if (e.visibleWhen?.flag) used.add(e.visibleWhen.flag);
      if (e.visibleWhen?.unlessFlag) used.add(e.visibleWhen.unlessFlag);
    }
    for (const s of m.tileSwaps ?? []) {
      if (s.when.flag) used.add(s.when.flag);
      if (s.when.unlessFlag) used.add(s.when.unlessFlag);
    }
    const roots = new Set<string>();
    for (const e of [...(m.npcs ?? []), ...(m.interactables ?? [])]) {
      roots.add(e.dialogueId);
      for (const r of e.dialogueRules ?? []) roots.add(r.dialogueId);
    }
    for (const t of m.triggers ?? []) if (t.dialogueId) roots.add(t.dialogueId);
    for (const c of m.dialChecks ?? []) roots.add(c.dialogueId);
    for (const root of roots) {
      const seen = new Set<string>();
      const pending = [root];
      const changed = new Set<string>();
      let refresh = false;
      while (pending.length) {
        const id = pending.pop()!;
        if (seen.has(id)) continue;
        seen.add(id);
        const n = nodes[id];
        if (!n) continue;
        if (n.effects?.refreshMap || n.effects?.startTimer) refresh = true;
        for (const f of n.effects?.setFlags ?? []) if (used.has(f)) changed.add(f);
        for (const r of n.responses ?? []) if (r.nextDialogueId) pending.push(r.nextDialogueId);
      }
      if (!refresh)
        for (const f of changed)
          add('reveal-without-refresh', `chain ${root} sets ${f} without refreshMap/startTimer`);
    }
  }
  return findings;
}
