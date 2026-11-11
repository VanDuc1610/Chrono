import type Phaser from 'phaser';

/** UI text table (public/assets/data/strings.json). Game content lives in its own JSON files. */
export interface StringDatabase {
  strings: Record<string, string>;
}

export type Translate = (key: string, vars?: Record<string, string | number>) => string;

/** Looks up `key` and fills `{name}` placeholders; unknown keys return the key itself. */
export function formatString(
  table: Record<string, string>,
  key: string,
  vars?: Record<string, string | number>,
): string {
  const template = table[key] ?? key;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    vars && vars[name] !== undefined ? String(vars[name]) : match,
  );
}

export function createTranslator(db: StringDatabase | undefined): Translate {
  const table = db?.strings ?? {};
  return (key, vars) => formatString(table, key, vars);
}

/** Translator for a scene (strings.json is loaded in PreloadScene as `data_strings`). */
export function getStrings(scene: Phaser.Scene): Translate {
  return createTranslator(scene.cache.json.get('data_strings') as StringDatabase | undefined);
}
