
import "./styles.css";
import { computeAll, computeProResults } from "./geometry";
import { renderResults, readInputs, setError, getUnit, setUnit, getProMode, setProMode } from "./ui";
import type { UnitSystem } from "./types";

const FT_PER_M = 3.28084;

function applyURLParams(): void {
  const p = new URLSearchParams(location.search);
  // Unit must be applied first so range label and placeholder are correct
  if (p.has("unit")) setUnit(p.get("unit") as UnitSystem);
  if (p.has("pro")) setProMode(p.get("pro") === "1");
  const setIf = (id: string, key: string) => {
    const el = document.getElementById(id) as HTMLInputElement | HTMLSelectElement | null;
    if (el && p.has(key)) el.value = String(p.get(key));
  };
  setIf("width_px", "w");
  setIf("height_px", "h");
  setIf("dfov_deg", "dfov");
  setIf("projection", "proj");
  setIf("range_m", "range");
  setIf("pixel_size_um", "pixel");
}

function shareURL(): void {
  const { width_px, height_px, dfov_deg, projection } = readInputs();
  const unit = getUnit();
  const rangeRaw = (document.getElementById("range_m") as HTMLInputElement)?.value;
  const pixelRaw = (document.getElementById("pixel_size_um") as HTMLInputElement)?.value;
  const url = new URL(location.href);
  const q = url.searchParams;
  q.set("w", String(width_px));
  q.set("h", String(height_px));
  q.set("dfov", String(dfov_deg));
  q.set("proj", String(projection));
  q.set("unit", unit);
  q.set("pro", getProMode() ? "1" : "0");
  if (rangeRaw) q.set("range", rangeRaw);
  else q.delete("range");
  if (pixelRaw) q.set("pixel", pixelRaw);
  else q.delete("pixel");

  const s = url.toString();
  navigator.clipboard?.writeText(s).catch(() => {});
  alert(`Sharable URL copied to clipboard:\n\n${s}`);
}

function computeAndRender(): void {
  try {
    setError("");
    const inputs = readInputs();
    const res = computeAll(inputs);
    const unit = getUnit();
    const proRes = (getProMode() && inputs.pixel_size_um && inputs.pixel_size_um > 0)
      ? computeProResults(inputs.width_px, inputs.height_px, inputs.dfov_deg, inputs.pixel_size_um)
      : undefined;
    const resultsNode = document.getElementById("results") as HTMLElement | null;
    if (!resultsNode) throw new Error("Results node not found.");
    renderResults(resultsNode, res, unit, proRes);
  } catch (e: unknown) {
    console.error(e);
    const msg = e instanceof Error ? e.message : "Invalid inputs.";
    setError(msg);
  }
}

function onUnitToggle(newUnit: UnitSystem): void {
  const current = getUnit();
  if (current === newUnit) return;
  // Convert the range input value to the new unit
  const rangeEl = document.getElementById("range_m") as HTMLInputElement | null;
  if (rangeEl?.value) {
    const val = Number(rangeEl.value);
    if (val > 0) {
      const converted = newUnit === "imperial" ? val * FT_PER_M : val / FT_PER_M;
      rangeEl.value = String(+converted.toFixed(1));
    }
  }
  setUnit(newUnit);
  computeAndRender();
}

export function init(): void {
  applyURLParams();

  const computeBtn = document.getElementById("compute_btn");
  const shareBtn = document.getElementById("share_btn");
  computeBtn?.addEventListener("click", computeAndRender);
  shareBtn?.addEventListener("click", shareURL);

  document.getElementById("unit_metric")?.addEventListener("click", () => onUnitToggle("metric"));
  document.getElementById("unit_imperial")?.addEventListener("click", () => onUnitToggle("imperial"));

  document.getElementById("mode_standard")?.addEventListener("click", () => { setProMode(false); computeAndRender(); });
  document.getElementById("mode_pro")?.addEventListener("click", () => { setProMode(true); computeAndRender(); });

  ["width_px","height_px","dfov_deg","projection","range_m","pixel_size_um"].forEach(id => {
    const el = document.getElementById(id);
    el?.addEventListener("input", computeAndRender);
  });

  computeAndRender();
}
