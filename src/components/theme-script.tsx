/**
 * The theme is resolved before the first paint. Reading it from a React
 * effect would flash the dark ground at a visitor who chose light, which is
 * far more noticeable on a palette this contrasted than it sounds.
 */
const script = `
(function () {
  try {
    var stored = localStorage.getItem("theme");
    var prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
    document.documentElement.dataset.theme = stored || (prefersLight ? "light" : "dark");
  } catch (error) {
    document.documentElement.dataset.theme = "dark";
  }
})();
`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
