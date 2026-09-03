# The corpus contract

Notation Systems builds and operates provenance-bearing computational
corpora. `contract.json` is the one declaration of what provenance *means*
across them, so that two corpora can disagree about a value without
disagreeing about what a value's evidence claim **is**.

## What was measured, 2026-08-31

Two corpora had independently built a lattice, both called it the evidence
class, and neither knew the other existed:

| | data-acquisition-fabric (Python) | Payload Terminal (TypeScript) |
|---|---|---|
| terms | `asserted` `computed` `derived` `measured` | `reported` `estimated` `representative` `derived` |
| question | how did this value **come to exist**? | how **hard** is the evidence? |
| ordered | no | yes — `reported` 3 … `derived` 0 |
| fixed | at ingest, content-addressed | at the claim, weakest-input-wins |
| absence | `unclassified`, inadmissible | none declared |

Neither is wrong. Each built one axis of a two-axis property and named it
after the whole. `attestation.ts` even states the distinction in its own
header — *"Provenance answers where a number came from; source class
answers how hard the evidence is"* — and then implements only the second,
because there was nowhere for the first to be declared.

## The collision that made this urgent

`VOCABULARY_MAP` in the acquisition fabric sends the presentation term
**`reported`** onto `asserted` — its class for *a party stated this*,
which you would trust less than `measured`.

In Payload Terminal, **`reported` is rank 3: the hardest class there is.**

A value leaving one corpus as `asserted` and arriving at the other as
`reported` is promoted from *a party claimed this* to *hardest available
evidence* by nothing but a shared spelling — with every local check green
on both sides, because each side is internally consistent.

The contract **refuses** that translation by name. `derived` is the other
shared term and it is allowed in exactly one direction: a value whose
production was derivation cannot have claim strength above `derived`,
while the converse is false.

## What each side checks, and what it cannot

Each corpus vendors a copy of `contract.json` and pins its sha256 in code:

- `Payload-Terminal-V0` → `src/lib/corpus/contract.{json,ts}`, checked by
  `src/lib/corpus/contract.test.ts` (14 pins)
- `data-acquisition-channel` → `epistemics/corpus/contract.{json,py}`,
  checked by `tests/test_corpus_contract.py` (16 pins)

Each side asserts that its own vocabulary matches the contract, that its
vendored copy hashes to its pin, and that every axis it *claims* to
implement names a symbol that exists. What no side can check is
**divergence**: two corpora carrying different contracts, each internally
consistent, both green.

`verify-vendored.mjs` is the only thing that sees more than one tree, so
it is the only thing that can. Run it from this repository's root with the
sibling checkouts beside it, or set `NOTATION_CORPORA_ROOT`:

```
node corpus-contract/verify-vendored.mjs
```

**Three exit codes, because there are three outcomes and two are not
success:**

| | |
|---|---|
| `0` | every reachable corpus matched, and at least one was reachable |
| `1` | a corpus diverged — a different copy, or the right copy with a wrong pin |
| `3` | nothing was reachable, so the run establishes nothing |

The `3` exists because the first version of this checker returned `0` in
that case. It reported `matched 0, diverged 0` and called it a pass — a CI
job pointed at the wrong root would have gone green having checked
nothing. That is the vacuous pass the file's own header warns about,
committed in the file doing the warning, and found by planting an
unreachable root rather than by reading.

## Changing the contract

The digest is pinned in two languages. A change is therefore four edits and
they must land together: `contract.json` here, both vendored copies, both
pins. `verify-vendored.mjs` fails on any partial application — including
the case where a corpus carries the new file and still pins the old digest,
which is green locally and wrong about itself.

Version it. `contract` and `version` are asserted on both sides, so a
vocabulary change that forgets to bump the version fails rather than
passing under the old name.
