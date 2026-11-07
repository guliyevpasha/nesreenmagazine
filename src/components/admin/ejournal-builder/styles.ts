/**
 * Yaradıcının CSS-i. Ekranda və çapda eyni mm/pt ölçüləri istifadə olunur ki,
 * PDF ekrandakı görüntü ilə üst-üstə düşsün.
 */
export const BUILDER_CSS = `
.ej-page { width: 210mm; height: 297mm; position: relative; overflow: hidden; box-sizing: border-box; }
.ej-page * { box-sizing: border-box; }
.ej-page img { display: block; max-width: none; }
.ej-text p, .ej-text div { margin: 0 0 0.6em; }
.ej-text ul { list-style: disc; padding-inline-start: 1.3em; margin: 0 0 0.6em; }
.ej-text ol { list-style: decimal; padding-inline-start: 1.3em; margin: 0 0 0.6em; }
.ej-text li { margin: 0; }
.ej-text a { text-decoration: underline; }
.ej-text b, .ej-text strong { font-weight: 600; }
.ej-editable:focus { outline: none; }
.ej-editable:empty::before { content: attr(data-placeholder); opacity: 0.4; }
#ej-print-root { display: none; }
@media print {
  @page { size: A4; margin: 0; }
  html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
  body > *:not(#ej-print-root) { display: none !important; }
  #ej-print-root { display: block !important; }
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  #ej-print-root .ej-page { page-break-after: always; break-after: page; }
  #ej-print-root .ej-page:last-child { page-break-after: auto; break-after: auto; }
}
`;
