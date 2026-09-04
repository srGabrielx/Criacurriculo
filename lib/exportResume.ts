import { ResumeDocument } from '@/types/resume';

interface ExportOptions {
  fitOnePage?: boolean;
  onProgress?: (status: string) => void;
}

function prepareCleanClone(originalElement: HTMLElement): HTMLElement {
  const clone = originalElement.cloneNode(true) as HTMLElement;
  clone.style.transform = 'none';
  clone.style.webkitTransform = 'none';
  clone.style.transformOrigin = 'top left';
  clone.style.position = 'absolute';
  clone.style.top = '-9999px';
  clone.style.left = '-9999px';
  clone.style.width = '794px';
  clone.style.minHeight = '1123px';
  clone.style.boxShadow = 'none';
  clone.style.margin = '0';
  clone.style.padding = '0';
  clone.style.zIndex = '-9999';
  clone.style.visibility = 'visible';

  // Strip all edit-mode ring outlines, hover tints, and contenteditable properties
  const allElements = clone.querySelectorAll('*');
  allElements.forEach((el) => {
    el.removeAttribute('contenteditable');
    el.removeAttribute('tabindex');
    el.classList.remove(
      'ring-2', 'ring-1', 'ring-blue-500', 'hover:ring-1', 'hover:ring-gray-300', 
      'hover:ring-blue-300', 'bg-blue-50/5', 'bg-blue-50/10', 'hover:bg-gray-50/30', 
      'hover:bg-black/5', 'cursor-pointer'
    );
  });

  return clone;
}

export async function exportToPdf(
  document: ResumeDocument,
  elementId = 'resume-print-document',
  options: ExportOptions = {}
): Promise<void> {
  const { onProgress, fitOnePage = true } = options;

  if (typeof window === 'undefined') return;

  onProgress?.('Preparando documento...');

  const originalElement = window.document.getElementById(elementId);
  if (!originalElement) {
    throw new Error('Elemento do currículo não encontrado na página.');
  }

  // Dynamic import of html2canvas and jspdf so server-side rendering is unaffected
  onProgress?.('Carregando motor de PDF...');
  const [html2canvasModule, jsPdfModule] = await Promise.all([
    import('html2canvas'),
    import('jspdf')
  ]);
  const html2canvas = html2canvasModule.default;
  const { jsPDF } = jsPdfModule;

  onProgress?.('Processando alta resolução (300 DPI)...');

  // Clone element offscreen with exact standard A4 proportions (794px width) and NO zoom scale
  const clone = prepareCleanClone(originalElement);
  clone.id = 'resume-pdf-render-clone';
  window.document.body.appendChild(clone);

  try {
    const bgColor = (document.settings as any)?.background || 
      (document.settings?.theme as any)?.background || 
      '#ffffff';

    const canvas = await html2canvas(clone, {
      scale: 2, // 2x gives crystal clear sharp rendering matching exportToImage
      useCORS: true,
      logging: false,
      backgroundColor: bgColor,
      windowWidth: 794,
    });

    onProgress?.('Gerando páginas do PDF...');

    // Standard A4 dimensions in mm
    const pdfPageWidthMm = 210;
    const pdfPageHeightMm = 297;

    // The exact height in canvas pixels that matches 210mm x 297mm A4 aspect ratio (297 / 210 = 1.4142857...)
    const a4PageHeightPx = Math.round((canvas.width * pdfPageHeightMm) / pdfPageWidthMm);

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: false
    });

    const addCanvasToPdf = (targetCanvas: HTMLCanvasElement) => {
      try {
        // Alta qualidade visual sem distorção ou perda de proporção de fotos
        const imgData = targetCanvas.toDataURL('image/jpeg', 0.98);
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfPageWidthMm, pdfPageHeightMm, undefined, 'FAST');
      } catch {
        // Fallback caso JPEG falhe em algum navegador específico
        const imgData = targetCanvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 0, 0, pdfPageWidthMm, pdfPageHeightMm, undefined, 'FAST');
      }
    };

    if (fitOnePage) {
      // Formato Folha Única A4 (Padrão e Recomendado):
      // Garante que todo o currículo fique em 1 página sem distorcer fotos ou textos
      const pageCanvas = window.document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = a4PageHeightPx;
      const ctx = pageCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

        if (canvas.height <= a4PageHeightPx) {
          // O conteúdo já cabe na página A4: desenha na escala 1:1 sem redimensionar
          ctx.drawImage(
            canvas,
            0, 0, canvas.width, canvas.height,
            0, 0, canvas.width, canvas.height
          );
        } else {
          // O conteúdo ultrapassa ligeiramente: escala largura e altura com a MESMA proporção exata
          // Isso garante que fotos continuem perfeitamente quadradas/circulares e o texto nítido
          const scale = a4PageHeightPx / canvas.height;
          const targetWidth = canvas.width * scale;
          const targetHeight = a4PageHeightPx;
          const offsetX = (canvas.width - targetWidth) / 2;

          ctx.drawImage(
            canvas,
            0, 0, canvas.width, canvas.height,
            offsetX, 0, targetWidth, targetHeight
          );
        }
      }

      addCanvasToPdf(pageCanvas);
    } else {
      // Modo Múltiplas Páginas:
      // Se a sobra além de 1 página for irrelevante (<= 8%, margem de segurança),
      // mantém em 1 página para não gerar uma folha quase em branco
      const minorOverflowThreshold = a4PageHeightPx * 0.08;

      if (canvas.height <= a4PageHeightPx + minorOverflowThreshold) {
        const pageCanvas = window.document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = a4PageHeightPx;
        const ctx = pageCanvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
          if (canvas.height <= a4PageHeightPx) {
            ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
          } else {
            const scale = a4PageHeightPx / canvas.height;
            const targetWidth = canvas.width * scale;
            const offsetX = (canvas.width - targetWidth) / 2;
            ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, offsetX, 0, targetWidth, a4PageHeightPx);
          }
        }
        addCanvasToPdf(pageCanvas);
      } else {
        // Conteúdo genuinamente longo: divide em fatias exatas A4 (210mm x 297mm)
        let totalPages = Math.ceil(canvas.height / a4PageHeightPx);
        const lastPageSliceHeight = canvas.height - ((totalPages - 1) * a4PageHeightPx);
        if (totalPages > 1 && lastPageSliceHeight < 60) {
          totalPages -= 1;
        }

        for (let page = 0; page < totalPages; page++) {
          const sourceY = page * a4PageHeightPx;
          const sourceHeight = Math.min(a4PageHeightPx, canvas.height - sourceY);

          if (sourceHeight <= 0) break;

          const pageCanvas = window.document.createElement('canvas');
          pageCanvas.width = canvas.width;
          pageCanvas.height = a4PageHeightPx;
          const ctx = pageCanvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
            // Desenha a fatura A4 correspondente
            ctx.drawImage(
              canvas,
              0, sourceY, canvas.width, sourceHeight,
              0, 0, canvas.width, sourceHeight
            );
          }

          if (page > 0) {
            pdf.addPage();
          }

          addCanvasToPdf(pageCanvas);
        }
      }
    }

    const cleanName = (document.personalInfo?.name || document.title || 'Curriculo')
      .trim()
      .replace(/[^a-zA-Z0-9\u00C0-\u00FF_-]/g, '_');
    
    pdf.save(`${cleanName}-Curriculo.pdf`);
    onProgress?.('Download concluído!');
  } finally {
    // Clean up temporary DOM clone
    if (clone.parentNode) {
      clone.parentNode.removeChild(clone);
    }
  }
}

export async function exportToImage(
  document: ResumeDocument,
  elementId = 'resume-print-document',
  onProgress?: (status: string) => void
): Promise<void> {
  if (typeof window === 'undefined') return;

  onProgress?.('Preparando imagem...');
  const originalElement = window.document.getElementById(elementId);
  if (!originalElement) {
    throw new Error('Elemento do currículo não encontrado.');
  }

  const html2canvasModule = await import('html2canvas');
  const html2canvas = html2canvasModule.default;

  const clone = prepareCleanClone(originalElement);
  clone.id = 'resume-img-render-clone';
  window.document.body.appendChild(clone);

  try {
    onProgress?.('Renderizando imagem...');
    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: (document.settings as any)?.background || '#ffffff',
      windowWidth: 794
    });

    const dataUrl = canvas.toDataURL('image/png');
    const cleanName = (document.personalInfo?.name || document.title || 'Curriculo')
      .trim()
      .replace(/[^a-zA-Z0-9\u00C0-\u00FF_-]/g, '_');

    const link = window.document.createElement('a');
    link.download = `${cleanName}-Curriculo.png`;
    link.href = dataUrl;
    link.click();
    onProgress?.('Imagem baixada!');
  } finally {
    if (clone.parentNode) {
      clone.parentNode.removeChild(clone);
    }
  }
}

export function exportToJson(document: ResumeDocument): void {
  if (typeof window === 'undefined') return;
  const jsonStr = JSON.stringify(document, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const cleanName = (document.personalInfo?.name || document.title || 'Curriculo')
    .trim()
    .replace(/[^a-zA-Z0-9\u00C0-\u00FF_-]/g, '_');

  const link = window.document.createElement('a');
  link.download = `${cleanName}-backup.json`;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}

export function printResumeNative(options: { fitOnePage?: boolean } = {}): void {
  if (typeof window === 'undefined') return;

  const { fitOnePage = true } = options;
  const resumeEl = window.document.getElementById('resume-print-document') 
    || window.document.querySelector('.resume-print-content') as HTMLElement;

  if (!resumeEl) {
    window.print();
    return;
  }

  // Store original inline transforms to prevent screen zoom from corrupting the print spooler
  const originalTransform = resumeEl.style.transform;
  const originalTransformOrigin = resumeEl.style.transformOrigin;

  if (fitOnePage) {
    const currentHeight = resumeEl.scrollHeight;
    const targetA4Height = 1122; // 96 DPI pixel height for 297mm
    if (currentHeight > targetA4Height) {
      const scale = Math.max((targetA4Height / currentHeight) * 0.98, 0.75);
      window.document.documentElement.style.setProperty('--print-scale-auto', scale.toString());
      window.document.body.classList.add('print-auto-fit');
    }
  }

  // Force clean unscaled rendering for the print engine
  resumeEl.style.transform = 'none';
  resumeEl.style.transformOrigin = 'top center';
  window.document.body.classList.add('is-printing-resume');

  let cleanedUp = false;
  const cleanup = () => {
    if (cleanedUp) return;
    cleanedUp = true;
    resumeEl.style.transform = originalTransform;
    resumeEl.style.transformOrigin = originalTransformOrigin;
    window.document.body.classList.remove('print-auto-fit', 'is-printing-resume');
    window.document.documentElement.style.removeProperty('--print-scale-auto');
    window.removeEventListener('afterprint', cleanup);
  };

  window.addEventListener('afterprint', cleanup);

  // Slight delay allows the browser to recompute layout without the zoom scale before invoking the spooler
  setTimeout(() => {
    window.print();
    // Safety cleanup after 3 seconds in case mobile browser does not trigger afterprint
    setTimeout(cleanup, 3000);
  }, 120);
}
