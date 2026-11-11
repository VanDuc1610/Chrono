/**
 * Skills have ONE source: .agents/skills/ (read by Antigravity). Claude Code reads .claude/skills/,
 * which is a generated copy. Edit only .agents/skills/, then run:
 *
 *   node scripts/sync-skills.js          # copy .agents/skills -> .claude/skills (mirror)
 *   node scripts/sync-skills.js --check  # exit 1 if the copies differ (also run by `npm test`)
 */
import fs from 'fs';
import path from 'path';

const SRC = '.agents/skills';
const DST = '.claude/skills';

function listFiles(root) {
  if (!fs.existsSync(root)) return [];
  const out = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(p);
      else out.push(path.relative(root, p).split(path.sep).join('/'));
    }
  };
  walk(root);
  return out.sort();
}

export function diffSkills(src = SRC, dst = DST) {
  const a = listFiles(src);
  const b = listFiles(dst);
  const problems = [];
  for (const f of a) {
    if (!b.includes(f)) problems.push(`missing in ${dst}: ${f}`);
    else if (!fs.readFileSync(path.join(src, f)).equals(fs.readFileSync(path.join(dst, f))))
      problems.push(`differs: ${f}`);
  }
  for (const f of b) if (!a.includes(f)) problems.push(`extra in ${dst}: ${f}`);
  return problems;
}

function sync() {
  fs.rmSync(DST, { recursive: true, force: true });
  for (const f of listFiles(SRC)) {
    const to = path.join(DST, f);
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.copyFileSync(path.join(SRC, f), to);
  }
  console.log(`synced ${listFiles(DST).length} files ${SRC} -> ${DST}`);
}

const isMain =
  process.argv[1] && path.resolve(process.argv[1]) === path.resolve('scripts/sync-skills.js');
if (isMain) {
  if (process.argv.includes('--check')) {
    const problems = diffSkills();
    if (problems.length) {
      console.error(problems.join('\n') + '\nRun: node scripts/sync-skills.js');
      process.exit(1);
    }
    console.log('skills in sync');
  } else {
    sync();
  }
}
