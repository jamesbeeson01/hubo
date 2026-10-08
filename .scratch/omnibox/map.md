# Map: Omnibox improvements

## Destination

An Omnibox whose Results list reflects what is typed (open mode vs prompt mode), is driven by keyboard and click consistently, and has its remaining open decisions (labels, opening an AI, look, Pinned AI choice) resolved.

## Notes

- Vocabulary lives in `GLOSSARY.md` (Omnibox, App, Result, Results list, Pinned AI, Header). "Chat" is deliberately undefined.
- Principles: `docs/PRINCIPLES.md` (one input, no modes; Esc goes back one layer; ephemeral chrome).
- Tracker: local markdown (`.scratch/omnibox/`).
- Immediate scope (settled, ready to implement, not a ticket): slices 1 and 2 below under Decisions so far.

## Decisions so far

- **Open mode**: text matching any registry item's name (any type, AIs included) shows only those matches, best match first (name prefix, then name substring). First Result is highlighted.
- **Prompt mode**: text matching no name shows the AIs only (utility Apps excluded), Pinned AI first. Enter sends the text to the highlighted AI.
- **Same text, different interpretation**: the program infers open vs prompt from the text; the user never selects a mode.
- **Name-only matching**: description matching is fuzzy matching, a later effort. Matching stays swappable.
- **Selection**: Up/Down move the highlight; Enter and click behave identically (both infer from the text). Ctrl+Enter is removed.
- **Esc**: hide the Results list (hidden whenever the Omnibox is unfocused), then clear the text, then close the window.
- **Empty input**: no Results.
- **Title**: "Hubo" gets one "o" plus one per character typed.
- **Pinned AI**: hardcoded to No Memory AI as one named constant for now; the real choice is ticket 03.

## Not yet specified

- Fuzzy matching (including description matching) once the app list grows.
- Whether Results ever mix open and prompt rows.

## Out of scope

- Chat UI / conversation view.
