export const $ = (q, ctx = document) => ctx.querySelector(q);

/* ------------------- Date helpers ------------------- */
export const isoToUi = (iso) => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
};

export const uiToIso = (ui) => {
  const [d, m, y] = ui.split(".");
  return `${y}-${m}-${d}`;
};

/* ------------------- Toast helper ------------------- */
let toastDiv;
export function toast(msg, ms = 3000) {
  if (!toastDiv) {
    toastDiv = document.createElement("div");
    toastDiv.className = "toast";
    document.body.appendChild(toastDiv);
  }
  toastDiv.textContent = msg;
  toastDiv.classList.add("show");
  setTimeout(() => toastDiv.classList.remove("show"), ms);
}
