# Historical project artifacts

`screenshots/` contains the eleven historical `screenshot_*.png` captures formerly at the repository root. They predate the LPC-scale Peter, chapter 0-5 LPC environments and VT323 presentation refresh. They are preserved as history, not current release acceptance evidence.

The root images were ignored, untracked test outputs. They were explicitly staged and then relocated with `git mv`; consequently Git records them as new archived files rather than renames from an earlier commit. Test scripts may recreate ignored root captures on future runs.

Root document comparison for T-95:

- `ART_GUIDE.md` is a short pointer to `docs/art/ART_GUIDE.md`, not a duplicate of its content; retained.
- `PETER_DESIGN.md` is a short pointer to `docs/art/PETER_DESIGN.md`, not a duplicate of its content; retained.
- `ASSET_REGISTRY.md` is the active root asset ledger; no corresponding `docs/art/ASSET_REGISTRY.md` exists, so it is retained.

No Markdown links to the former root screenshot filenames were found during the refresh.
