
import type { GeometryInputs, GeometryResults, ProResults, UnitSystem } from "./types";

const FT_PER_M   = 3.28084;
const IN_PER_CM  = 0.393701;

export function fmt(n: number | undefined | null, digits = 3): string {
  if (n === undefined || n === null || Number.isNaN(n)) return "—";
  return Number(n).toLocaleString(undefined, { maximumFractionDigits: digits });
}

export function getUnit(): UnitSystem {
  return document.getElementById("unit_metric")?.classList.contains("active") ? "metric" : "imperial";
}

export function getProMode(): boolean {
  return document.getElementById("mode_pro")?.classList.contains("active") ?? false;
}

export function setProMode(on: boolean): void {
  document.getElementById("mode_standard")?.classList.toggle("active", !on);
  document.getElementById("mode_pro")?.classList.toggle("active", on);
}

export function setUnit(unit: UnitSystem): void {
  document.getElementById("unit_metric")?.classList.toggle("active", unit === "metric");
  document.getElementById("unit_imperial")?.classList.toggle("active", unit === "imperial");
  const rangeLabel = document.getElementById("range_unit_label");
  if (rangeLabel) rangeLabel.textContent = unit === "metric" ? "m" : "ft";
  const rangeInput = document.getElementById("range_m") as HTMLInputElement | null;
  if (rangeInput) rangeInput.placeholder = unit === "metric" ? "e.g., 10" : "e.g., 33";
}

function renderProSection(p: ProResults): string {
  return `
    <div class="card">
      <h3>Sensor image area</h3>
      <div class="value">${fmt(p.sensor_w_mm, 2)} mm &nbsp;×&nbsp; ${fmt(p.sensor_h_mm, 2)} mm</div>
      <small>Diagonal: ${fmt(p.sensor_d_mm, 2)} mm</small>
    </div>
    <div class="card">
      <h3>Paraxial focal length (diagonal)</h3>
      <div class="value">${fmt(p.focal_length_mm, 2)} mm</div>
    </div>
    <div class="results-table freq-table">
      <div class="rt-th">Spatial frequency</div>
      <div class="rt-th">lp/mm</div>
      <div class="rt-label">Nyquist</div>
      <div class="rt-cell">${fmt(p.freq_nyquist, 1)}</div>
      <div class="rt-label">½ Nyquist</div>
      <div class="rt-cell">${fmt(p.freq_half, 1)}</div>
      <div class="rt-label">⅓ Nyquist</div>
      <div class="rt-cell">${fmt(p.freq_third, 1)}</div>
      <div class="rt-label">¼ Nyquist</div>
      <div class="rt-cell">${fmt(p.freq_quarter, 1)}</div>
    </div>
  `;
}

export function renderResults(node: HTMLElement, res: GeometryResults, unit: UnitSystem, proRes?: ProResults): void {
  const hasFp = res.footprint_h_m_px !== undefined;
  const isImp = unit === "imperial";

  const fpLabel  = isImp ? "in/px" : "cm/px";
  const fpMult   = isImp ? 100 * IN_PER_CM : 100;
  const fpHeader = hasFp ? `<div class="rt-th">Footprint (${fpLabel})</div>` : ``;
  const fpH      = hasFp ? `<div class="rt-cell">${fmt(res.footprint_h_m_px! * fpMult, 2)} ${fpLabel}</div>` : ``;
  const fpV      = hasFp ? `<div class="rt-cell">${fmt(res.footprint_v_m_px! * fpMult, 2)} ${fpLabel}</div>` : ``;
  const fpD      = hasFp ? `<div class="rt-cell">—</div>` : ``;

  const frameUnit = isImp ? "ft" : "m";
  const frameMult = isImp ? FT_PER_M : 1;
  const frameCard = res.frame_h_m !== undefined
    ? `<div class="card">
        <h3>Frame size @ range</h3>
        <div class="value">${fmt(res.frame_h_m * frameMult, 1)} ${frameUnit} &nbsp;×&nbsp; ${fmt(res.frame_v_m! * frameMult, 1)} ${frameUnit}</div>
        <small>horizontal × vertical</small>
       </div>`
    : ``;

  node.innerHTML = `
    <div class="results-table${hasFp ? " has-footprint" : ""}">
      <div class="rt-th"></div>
      <div class="rt-th">FOV</div>
      <div class="rt-th">PPD</div>
      <div class="rt-th">IFOV</div>
      <div class="rt-th">Pixels</div>
      ${fpHeader}

      <div class="rt-label">Horizontal</div>
      <div class="rt-cell">${fmt(res.hfov_deg, 1)}°</div>
      <div class="rt-cell">${fmt(res.ppd_h, 1)} px/°</div>
      <div class="rt-cell">${fmt(res.ifov_h_deg_px, 5)}°/px</div>
      <div class="rt-cell">${fmt(res.width_px, 0)} px</div>
      ${fpH}

      <div class="rt-label">Vertical</div>
      <div class="rt-cell">${fmt(res.vfov_deg, 1)}°</div>
      <div class="rt-cell">${fmt(res.ppd_v, 1)} px/°</div>
      <div class="rt-cell">${fmt(res.ifov_v_deg_px, 5)}°/px</div>
      <div class="rt-cell">${fmt(res.height_px, 0)} px</div>
      ${fpV}

      <div class="rt-label">Diagonal</div>
      <div class="rt-cell">${fmt(res.dfov_deg, 1)}°</div>
      <div class="rt-cell">${fmt(res.ppd_d, 1)} px/°</div>
      <div class="rt-cell">${fmt(res.ifov_d_deg_px, 5)}°/px</div>
      <div class="rt-cell">${fmt(res.diag_px, 0)} px</div>
      ${fpD}
    </div>
    ${frameCard}
    ${proRes ? renderProSection(proRes) : ""}
  `;
}

function getEl<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing element: #${id}`);
  return el as T;
}

export function readInputs(): GeometryInputs {
  const width_px = Number((getEl<HTMLInputElement>("width_px")).value);
  const height_px = Number((getEl<HTMLInputElement>("height_px")).value);
  const dfov_deg = Number((getEl<HTMLInputElement>("dfov_deg")).value);
  const rangeVal = (getEl<HTMLInputElement>("range_m")).value;
  const rangeRaw = rangeVal ? Number(rangeVal) : undefined;
  const range_m = rangeRaw !== undefined
    ? (getUnit() === "imperial" ? rangeRaw / FT_PER_M : rangeRaw)
    : undefined;
  const pixelSizeVal = (getEl<HTMLInputElement>("pixel_size_um")).value;
  const pixel_size_um = pixelSizeVal ? Number(pixelSizeVal) : undefined;
  return { width_px, height_px, dfov_deg, range_m, pixel_size_um };
}

export function setError(msg?: string): void {
  (getEl<HTMLParagraphElement>("error")).textContent = msg || "";
}
