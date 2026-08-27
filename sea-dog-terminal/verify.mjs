// Verify the mirror against its own MANIFEST (paths are relative to the
// mirrored tree root, i.e. sea-dog-terminal/).
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = dirname(fileURLToPath(import.meta.url));
const manifest = JSON.parse(readFileSync(join(root, 'data-archive/MANIFEST.json'), 'utf8'));
let bad = 0;
for (const f of manifest.files) {
  const bytes = readFileSync(join(root, f.path));
  const h = createHash('sha256').update(bytes).digest('hex');
  if (h !== f.sha256) { console.error(`MISMATCH ${f.path}`); bad++; }
}
console.log(bad === 0 ? `OK: ${manifest.files.length} files verified` : `FAILED: ${bad} mismatches`);
process.exit(bad === 0 ? 0 : 1);
