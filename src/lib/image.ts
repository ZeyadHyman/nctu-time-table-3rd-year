import { toPng } from "html-to-image";

export async function exportNodePng(node: HTMLElement, filename: string): Promise<void> {
  const dataUrl = await toPng(node, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: getComputedStyle(document.body).backgroundColor || "#0e0e0f",
    filter: (el) => {
      if (!(el instanceof HTMLElement)) return true;
      return !(
        el.classList.contains("cls-actions") ||
        el.classList.contains("drag-handle") ||
        el.dataset.exportIgnore === "true"
      );
    },
  });
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
}
