// Verify every corpus's vendored copy of the contract against the canonical
// one here — for the corpora this checkout can actually reach.
//
// WHAT EACH SIDE CAN AND CANNOT CHECK. A corpus verifies its own vendored
// copy against its own pinned digest. That catches a local edit. It cannot
// catch DIVERGENCE: two corpora carrying different contracts, each
// internally consistent, both green. Only something that can see more than
// one tree can catch that, which is what this is.
//
// AN UNREACHABLE CORPUS IS NOT AGREEMENT. A sibling that is not checked out
// is reported as unreachable and counted separately. Treating "I could not
// look" as "it matched" is the vacuous pass this ecosystem has filed before,
// and it is exactly the failure a divergence check must not have.
import { createHash } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const canonicalPath = join(here, 'contract.json');
const canonical = readFileSync(canonicalPath);
const canonicalDigest = createHash('sha256').update(canonical).digest('hex');

/**
 * Where each corpus vendors its copy, relative to a root holding the
 * sibling checkouts. Names match `implementations` in the contract itself,
 * and the check below asserts that rather than trusting this list.
 */
const CORPORA = {
  'payload-terminal': {
    dir: 'Notations-OSIRIS-Overwatch-Engine',
    vendored: 'src/lib/corpus/contract.json',
    pinnedIn: 'src/lib/corpus/contract.ts',
  },
  'data-acquisition-fabric': {
    dir: 'data-acquisition-channel',
    vendored: 'epistemics/corpus/contract.json',
    pinnedIn: 'epistemics/corpus/contract.py',
  },
};

const siblingRoot = resolve(process.env.NOTATION_CORPORA_ROOT ?? join(here, '..', '..'));

const declared = JSON.parse(canonical.toString('utf8')).implementations;
const undeclared = Object.keys(CORPORA).filter((k) => !(k in declared));
const unlisted = Object.keys(declared).filter((k) => !(k in CORPORA));
if (undeclared.length || unlisted.length) {
  console.error('CONTRACT/CHECKER DISAGREE about which corpora exist:');
  if (undeclared.length) console.error(`  checked but not declared: ${undeclared.join(', ')}`);
  if (unlisted.length) console.error(`  declared but not checked:  ${unlisted.join(', ')}`);
  process.exit(2);
}

const matched = [];
const diverged = [];
const unreachable = [];

for (const [name, spec] of Object.entries(CORPORA)) {
  const path = join(siblingRoot, spec.dir, spec.vendored);
  if (!existsSync(path)) {
    unreachable.push(`${name} (${path})`);
    continue;
  }
  const bytes = readFileSync(path);
  const digest = createHash('sha256').update(bytes).digest('hex');
  if (digest !== canonicalDigest) {
    diverged.push(`${name}: ${digest}`);
    continue;
  }
  // The copy matches. Does the corpus PIN that digest, or is it carrying the
  // right file with the wrong pin — green locally, wrong about itself?
  const pin = join(siblingRoot, spec.dir, spec.pinnedIn);
  if (existsSync(pin) && !readFileSync(pin, 'utf8').includes(canonicalDigest)) {
    diverged.push(`${name}: copy matches but ${spec.pinnedIn} pins a different digest`);
    continue;
  }
  matched.push(name);
}

console.log(`canonical ${canonicalDigest}`);
console.log(`matched     ${matched.length}: ${matched.join(', ') || '—'}`);
console.log(`diverged    ${diverged.length}: ${diverged.join('; ') || '—'}`);
console.log(`unreachable ${unreachable.length}: ${unreachable.join('; ') || '—'}`);
if (unreachable.length) {
  console.log('An unreachable corpus is NOT a match. Set NOTATION_CORPORA_ROOT, or check it out, to include it.');
}

/**
 * THREE EXIT CODES, because there are three outcomes and two of them are
 * not success.
 *
 * Found by planting: the first version of this file exited 0 when EVERY
 * corpus was unreachable — it reported `matched 0, diverged 0` and called
 * that a pass. A CI job pointed at the wrong root would have gone green
 * having checked nothing, which is precisely the vacuous pass the header
 * above warns about, committed in the file doing the warning.
 *
 *   0  every reachable corpus matched, and at least one was reachable
 *   1  a corpus diverged
 *   3  nothing was checked — not a pass, and not the same failure as 1
 */
if (diverged.length > 0) process.exit(1);
if (matched.length === 0) {
  console.error('CHECKED NOTHING: no corpus was reachable, so this run establishes nothing.');
  process.exit(3);
}
process.exit(0);
