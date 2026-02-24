
import type { GeometryInputs, GeometryResults, Projection } from "./types";

function toRad(deg: number): number { return (deg * Math.PI) / 180; }
function toDeg(rad: number): number { return (rad * 180) / Math.PI; }

export function hvFovFromDiagonal(
  dfov_deg: number,
  width_px: number,
  height_px: number,
  projection: Projection = "rectilinear"
): { hfov_deg: number; vfov_deg: number } {
  // MVP: rectilinear-only derivation. Other projections will need proper mappings.
  if (projection !== "rectilinear") {
    // Placeholder: keep rectilinear mapping for hfov/vfov until real models are added.
  }

  const a = width_px / height_px;
  if (!Number.isFinite(a) || a <= 0) {
    throw new Error("Invalid aspect ratio (width/height).");
  }

  const td = Math.tan(toRad(dfov_deg) / 2);
  const k = Math.sqrt(a * a + 1);
  const th2 = Math.atan((a / k) * td);
  const tv2 = Math.atan((1 / k) * td);

  return {
    hfov_deg: toDeg(2 * th2),
    vfov_deg: toDeg(2 * tv2),
  };
}

export function ppdFromFovs(
  hfov_deg: number,
  vfov_deg: number,
  dfov_deg: number,
  width_px: number,
  height_px: number
): { ppd_h: number; ppd_v: number; ppd_d: number } {
  const diag_px = Math.hypot(width_px, height_px);
  return {
    ppd_h: width_px / hfov_deg,
    ppd_v: height_px / vfov_deg,
    ppd_d: diag_px / dfov_deg,
  };
}

export function ifovDegPerPx(
  hfov_deg: number,
  vfov_deg: number,
  width_px: number,
  height_px: number
): { ifov_h_deg_px: number; ifov_v_deg_px: number } {
  return {
    ifov_h_deg_px: hfov_deg / width_px,
    ifov_v_deg_px: vfov_deg / height_px,
  };
}

export function pixelFootprintAtRange(
  hfov_deg: number,
  vfov_deg: number,
  width_px: number,
  height_px: number,
  range_m?: number
): { footprint_h_m_px: number; footprint_v_m_px: number } | null {
  if (!range_m || range_m <= 0) return null;
  const half_h = toRad(hfov_deg / 2);
  const half_v = toRad(vfov_deg / 2);
  // Exact small-slice using half-angle per pixel
  const footprint_h = 2 * range_m * Math.tan((half_h / width_px) * 2);
  const footprint_v = 2 * range_m * Math.tan((half_v / height_px) * 2);
  return { footprint_h_m_px: footprint_h, footprint_v_m_px: footprint_v };
}

export function computeAll(inputs: GeometryInputs): GeometryResults {
  const { width_px, height_px, dfov_deg, projection = "rectilinear", range_m } = inputs;

  if (!(width_px > 0 && Number.isFinite(width_px))) {
    throw new Error("Width must be a positive number.");
  }
  if (!(height_px > 0 && Number.isFinite(height_px))) {
    throw new Error("Height must be a positive number.");
  }
  if (!(dfov_deg > 0 && dfov_deg < 180 && Number.isFinite(dfov_deg))) {
    throw new Error("Diagonal FOV must be between 0 and 180 degrees.");
  }

  const diag_px = Math.hypot(width_px, height_px);
  const { hfov_deg, vfov_deg } = hvFovFromDiagonal(dfov_deg, width_px, height_px, projection);
  const { ppd_h, ppd_v, ppd_d } = ppdFromFovs(hfov_deg, vfov_deg, dfov_deg, width_px, height_px);
  const { ifov_h_deg_px, ifov_v_deg_px } = ifovDegPerPx(hfov_deg, vfov_deg, width_px, height_px);
  const ifov_d_deg_px = dfov_deg / diag_px;
  const footprints = pixelFootprintAtRange(hfov_deg, vfov_deg, width_px, height_px, range_m);
  const frame = range_m && range_m > 0
    ? { frame_h_m: 2 * range_m * Math.tan(toRad(hfov_deg / 2)),
        frame_v_m: 2 * range_m * Math.tan(toRad(vfov_deg / 2)) }
    : {};

  return {
    hfov_deg,
    vfov_deg,
    dfov_deg,
    ppd_h,
    ppd_v,
    ppd_d,
    ifov_h_deg_px,
    ifov_v_deg_px,
    ifov_d_deg_px,
    width_px,
    height_px,
    diag_px,
    ...(footprints ?? {}),
    ...frame,
  };
}
