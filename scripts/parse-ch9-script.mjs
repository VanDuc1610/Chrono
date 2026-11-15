/**
 * Parses docs/story/CHAPTER_09_SCRIPT.md (Antigravity, T-81) into dialogue nodes for
 * scripts/content-ch9.mjs: `### \`id\``, `- **Speaker:**`, `- **Lines:**` (numbered, quoted),
 * `- **Responses:**` ("text" → `next`) and `- **Effects:**` (plain words, mapped by hand in
 * content-ch9.mjs). Writes scripts/data/ch9-script.json and prints dangling references.
 *
 * Usage: node scripts/parse-ch9-script.mjs
 */
import fs from 'fs';

const md = fs.readFileSync('docs/story/CHAPTER_09_SCRIPT.md', 'utf8').split(/\r?\n/);
const nodes = {};
let cur = null;
let mode = null;
const unquote = (s) => s.trim().replace(/^["“]/, '').replace(/["”]$/, '').replace(/\\\$/g, '$');
for (const raw of md) {
  const line = raw.trimEnd();
  const head = line.match(/^###\s+`(ch9_[a-z0-9_]+)`/);
  if (head) {
    cur = { id: head[1], speaker: '', lines: [], responses: [], effectsText: '' };
    nodes[cur.id] = cur;
    mode = null;
    continue;
  }
  if (/^#{1,3}\s/.test(line)) {
    cur = null;
    continue;
  }
  if (!cur) continue;
  const sp = line.match(/^- \*\*Speaker:\*\*\s*(.+)$/);
  if (sp) {
    cur.speaker = sp[1].trim();
    mode = null;
    continue;
  }
  if (/^- \*\*Lines:\*\*/.test(line)) {
    mode = 'lines';
    continue;
  }
  if (/^- \*\*Responses:\*\*/.test(line)) {
    mode = 'responses';
    const inline = line.replace(/^- \*\*Responses:\*\*\s*/, '').trim();
    if (inline && !/^không/i.test(inline)) cur.responsesNote = inline;
    continue;
  }
  const ef = line.match(/^- \*\*Effects:\*\*\s*(.*)$/);
  if (ef) {
    cur.effectsText = ef[1].trim();
    mode = 'effects';
    continue;
  }
  if (mode === 'lines') {
    const m = line.match(/^\s+\d+\.\s+(.+)$/);
    if (m) cur.lines.push(unquote(m[1]));
  } else if (mode === 'responses') {
    const m = line.match(/^\s+-\s+(.+?)\s*(?:\$\\to\$|→|->)\s*`(ch9_[a-z0-9_]+)`/);
    if (m) cur.responses.push({ text: unquote(m[1]), nextDialogueId: m[2] });
  } else if (mode === 'effects') {
    const m = line.match(/^\s+-\s+(.+)$/);
    if (m) cur.effectsText += ` ${m[1].trim()}`;
  }
}
const ids = new Set(Object.keys(nodes));
const dangling = [];
for (const n of Object.values(nodes))
  for (const r of n.responses)
    if (!ids.has(r.nextDialogueId)) dangling.push(`${n.id} → ${r.nextDialogueId}`);
const long = Object.values(nodes).flatMap((n) =>
  n.lines.filter((l) => l.length > 220).map(() => n.id),
);
fs.mkdirSync('scripts/data', { recursive: true });
fs.writeFileSync('scripts/data/ch9-script.json', JSON.stringify(nodes, null, 2) + '\n');
console.log('nodes', ids.size, 'dangling', dangling.length, 'over220', long.length);
for (const d of dangling) console.log('  dangling', d);
for (const l of long) console.log('  long', l);
const noLines = Object.values(nodes)
  .filter((n) => n.lines.length === 0)
  .map((n) => n.id);
if (noLines.length) console.log('  no lines', noLines.join(' '));
