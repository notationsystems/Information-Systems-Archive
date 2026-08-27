# Information Systems Archive

## sea-dog-terminal/ — archive mirror (shipping order S-2)

Off-repository mirror of Sea Dog Terminal's data archive
(`notationsystems/Sea-Dog-OSIRIS-Terminal-V0`, formerly
Notations-OSIRIS-Overwatch-Engine). The files that matter here are the
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
4. In the main repository: `npx vitest run src/lib/economy/archiveManifest.test.ts`
   — green means the restore is byte-identical.

## Update cadence

Mirror after every archival (any new day-directory under
`data-archive/comtrade/`). The main repository's CI verifies its own
manifest; this mirror is refreshed manually or by the operator's
automation. Two equally stale copies pass every check either side has —
byte identity is coverage for divergence, not currency.
