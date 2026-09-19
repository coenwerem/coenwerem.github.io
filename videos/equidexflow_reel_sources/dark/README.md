# Dark EquiDexFlow presentation assets

The video uses the existing charcoal stage (`#171a1d`) and neutral-gray grasp
panels (`#b0b0b0`). Hardware footage retains its original appearance.

## Pipeline figure

`teaser/teaser_integrated_dark.pdf` is a presentation variant of the original
TikZ figure. Its editable TeX, source PNGs, CMU fonts, and provenance are included.
The source hand and prediction images retain their white backgrounds in small
light panels; no thresholding or color replacement was applied to their pixels.

Run `bash scripts/build_home_edf_teaser.sh` from the repository or packaged asset
root to compile it with XeLaTeX. Then run `python3 scripts/build_home_edf_demo.py`
to rebuild the video. The original white paper PDF is retained separately.

## Transparent grasp renders

`renders/` contains true RGBA renders of the same saved grasps and cameras as the
original six hardware-object illustrations. These use the private dexman_render
legacy OpenGL two-pass renderer with 4x supersampling. The white fingertip pads,
black hand meshes, and steel-blue objects retain their original lighting. Camera
settings, saved-record hashes, and crops are recorded in `renders/provenance.json`.

To regenerate them, use the private renderer environment:

```bash
PYTHONDONTWRITEBYTECODE=1 xvfb-run -a \
  ~/ResearchProjects/dexman_render/.venv/bin/python scripts/render_home_edf_cutouts.py
```

This optional rendering step requires the saved source records referenced in the
provenance. Rebuilding the composed video only needs the supplied RGBA PNGs.
