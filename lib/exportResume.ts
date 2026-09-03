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
    const canvas = await html2canvas(clone, {
      scale: 2, // 2x gives crystal clear sharp rendering without excessive memory
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: (document.settings as any)?.background || '#ffffff',
      windowWidth: 794,
    });

    onProgress?.('Gerando arquivo PDF...');

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const pdfPageWidth = 210;
    const pdfPageHeight = 297;

    // Calculate height in mm corresponding to canvas aspect ratio
    const contentHeightMm = (canvas.height * pdfPageWidth) / canvas.width;

    if (fitOnePage || contentHeightMm <= pdfPageHeight + 2) {
      // Fit neatly in 1 single A4 page
      let renderWidth = pdfPageWidth;
      let renderHeight = contentHeightMm;
      
      if (contentHeightMm > pdfPageHeight) {
        const scale = pdfPageHeight / contentHeightMm;
        renderWidth = pdfPageWidth * scale;
        renderHeight = pdfPageHeight;
      }
      
      const posX = (pdfPageWidth - renderWidth) / 2;
      pdf.addImage(imgData, 'JPEG', posX, 0, renderWidth, renderHeight, undefined, 'FAST');
    } else {
      // Multi-page document
      let remainingHeight = contentHeightMm;
      let positionY = 0;

      pdf.addImage(imgData, 'JPEG', 0, positionY, pdfPageWidth, contentHeightMm, undefined, 'FAST');
      remainingHeight -= pdfPageHeight;

      while (remainingHeight > 3) {
        positionY -= pdfPageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, positionY, pdfPageWidth, contentHeightMm, undefined, 'FAST');
        remainingHeight -= pdfPageHeight;
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
