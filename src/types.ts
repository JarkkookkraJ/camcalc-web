
export type UnitSystem = "metric" | "imperial";

export type Projection =
  | "rectilinear"
  | "equidistant"
  | "equisolid"
  | "orthographic"
  | "stereographic";

export interface GeometryInputs {
  width_px: number;
  height_px: number;
  dfov_deg: number;
  projection?: Projection;
  range_m?: number;
}

export interface GeometryResults {
  hfov_deg: number;
  vfov_deg: number;
  dfov_deg: number;

  ppd_h: number;
  ppd_v: number;
  ppd_d: number;

  ifov_h_deg_px: number;
  ifov_v_deg_px: number;
  ifov_d_deg_px: number;

  width_px: number;
  height_px: number;
  diag_px: number;

  footprint_h_m_px?: number;
  footprint_v_m_px?: number;

  frame_h_m?: number;
  frame_v_m?: number;
}
