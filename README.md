# Information Systems Archive

Notation Systems builds and operates provenance-bearing computational
corpora. This repository holds what has to survive independently of any
one of them: the evidence that cannot be re-fetched, and the contract that
says what provenance means across all of them.

## corpus-contract/ — the shared provenance vocabulary

One declaration of the two axes of provenance, the terms on each, the rule
for combining them, and the terms whose translation across a corpus
boundary is REFUSED. Each corpus vendors a copy and pins its digest;
`verify-vendored.mjs` is the only thing that can see more than one tree at
once and so the only thing that can catch divergence. See
`corpus-contract/README.md`.

## sea-dog-terminal/ — archive mirror (shipping order S-2)

Off-repository mirror of the physical-economy instrument's data archive.

**The instrument is `notationsystems/Payload-Terminal-V0`.** It has been
renamed twice: `Notations-OSIRIS-Overwatch-Engine` → `Sea-Dog-OSIRIS-
Terminal-V0` → `Payload-Terminal-V0`. This README named the middle one as
current and the first as former, so BOTH names in the restore path were
stale — a restore path that resolves only through a GitHub redirect, and
that a reader could not check against the organisation's repository list.
The git remote in a local checkout may still carry an older name; the
redirect keeps it working and does not make it the name.

**The `sea-dog-terminal/` directory keeps its name deliberately.** It is
the mirror's path, it appears in `MANIFEST.json` on every one of its
entries, and the restore procedure below copies FROM it. Renaming a
directory to match a brand would rewrite the manifest and break byte
identity with the archived tree — which is the one property this
repository exists to hold. The directory is an identifier; the sentence
above is the display name.

The files that matter here are the
UNRECONSTRUCTABLE class: UN Comtrade captures. Comtrade keeps one
version per dataset and revises in place — a lost capture is a
knowledge state that cannot be recovered from anywhere, including from
UNSD. Everything else in the mirror is labelled in
`sea-dog-terminal/data-archive/MANIFEST.json` (sha256 per file,
durability class per file).

## Restore path (executed once at mirror creation; ledger phase 36)

1. `git clone <this repo>`
2. Verify: every file in `sea-dog-terminal/**` hashes to its MANIFEST
   entry (`node sea-dog-terminal/verify.mjs` from the repo root).
3. Copy `sea-dog-terminal/data-archive/` and
   `sea-dog-terminal/src/data/economy/snapshots/` over the same paths in
   a checkout of the main repository.
4. In the instrument's repository: `npx vitest run src/lib/economy/archiveManifest.test.ts`
   — green means the restore is byte-identical.
5. Verify the shared vocabulary has not diverged while the corpora were
   apart: `node corpus-contract/verify-vendored.mjs` from this repo's root,
   with the sibling checkouts beside it (or `NOTATION_CORPORA_ROOT` set).
   It exits 3, not 0, when it could reach nothing — a run that checked
   nothing is not a pass.

## Update cadence

Mirror after every archival (any new day-directory under
`data-archive/comtrade/`). The main repository's CI verifies its own
manifest; this mirror is refreshed manually or by the operator's
automation. Two equally stale copies pass every check either side has —
byte identity is coverage for divergence, not currency.
