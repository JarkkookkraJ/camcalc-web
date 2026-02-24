
# CamCalc Web (TypeScript) — Geometry MVP

Compute FOVs, PPD, IFOV, and pixel footprint at range in a fast, static web app.

## Scripts
- `npm run dev` — start Vite dev server
- `npm run build` — build production bundle
- `npm run preview` — preview prod build locally
- `npm run typecheck` — run TypeScript without emit

## Deploy (GitHub Pages)
- If deploying to `https://<user>.github.io/<repo>/`, set `base` in `vite.config.ts` to `"/<repo>/"`.
- Enable **Settings → Pages → Build and deployment → Source = GitHub Actions**.
- Push to `main` to auto-deploy (see `.github/workflows/pages.yml`).

## Math (rectilinear MVP)
Given resolution `Nh × Nv`, aspect `a = Nh/Nv`, diagonal FOV `θd`:
```
k = sqrt(a^2 + 1),  td = tan(θd/2)
θh = 2 * atan( (a/k) * td )
θv = 2 * atan( (1/k) * td )
PPD_h = Nh / θh,  PPD_v = Nv / θv,  PPD_d = hypot(Nh,Nv) / θd
IFOV_h = θh / Nh, IFOV_v = θv / Nv   (deg/pixel)
Footprint_h(R) = 2R * tan( (θh/2) / Nh * 2 ), similarly for V
```
All angles in **degrees**; internal math uses radians.

## Sanity test
Inputs: `4000 × 3000`, diagonal FOV `80°` → Expected:
- `hfov ≈ 67.745°`
- `vfov ≈ 53.447°`
- `PPD_h ≈ 59.045 px/°`
- `PPD_v ≈ 56.131 px/°`
- `PPD_d = 5000 / 80 = 62.5 px/°`

## Roadmap
- Proper fisheye projection models (equidistant/equisolid/etc.)
- Per-field PPD distribution
- Radiometry + SNR + detection range
- Simple SVG charts and localization
