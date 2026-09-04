'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { ResumeRenderer } from './ResumeRenderer';
import { getTemplate } from '@/domain/template/registry';
import { useMounted } from '@/lib/useMounted';

export function ResumeCanvas() {
  const { document, zoom, isAutoFit, fitToScreenRequested, setZoom, selectSection } = useEditorStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const resumeRef = useRef<HTMLDivElement>(null);
  const mounted = useMounted();
  const [resumeHeight, setResumeHeight] = useState(1123);

  const touchStartDistRef = useRef<number | null>(null);
  const touchStartZoomRef = useRef<number>(zoom);

  // Monitora altura real do documento A4
  useEffect(() => {
    if (!mounted || !resumeRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.target === resumeRef.current) {
          setResumeHeight(entry.target.clientHeight);
        }
      }
    });
    observer.observe(resumeRef.current);
    return () => observer.disconnect();
  }, [mounted, document]);

  // Calcula o zoom ideal para preencher a largura útil disponível
  const fitToScreen = useCallback(() => {
    const container = containerRef.current;
    const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 794;
    const containerWidth = (container && container.clientWidth > 0) ? container.clientWidth : windowWidth;
    
    const resumeWidth = 794;
    const isMobile = windowWidth < 768;
    const isTablet = windowWidth >= 768 && windowWidth < 1024;
    
    // Margens laterais confortáveis
    const padding = isMobile ? 24 : isTablet ? 36 : 56;
    const availableWidth = Math.max(containerWidth - padding, 240);
    
    let calculatedZoom = Math.floor((availableWidth / resumeWidth) * 100);
    
    // Limites de visualização
    if (isMobile) {
      calculatedZoom = Math.min(Math.max(calculatedZoom, 30), 85);
    } else if (isTablet) {
      calculatedZoom = Math.min(Math.max(calculatedZoom, 40), 95);
    } else {
      if (calculatedZoom > 105) calculatedZoom = 100;
      if (calculatedZoom < 35) calculatedZoom = 35;
    }

    setZoom(calculatedZoom, false);
  }, [setZoom]);

  // Re-ajusta quando o tamanho do container muda (resize de tela ou painéis)
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          if (useEditorStore.getState().isAutoFit) {
            fitToScreen();
          }
        }
      }
    });

    observer.observe(container);

    if (container.clientWidth > 0 && useEditorStore.getState().isAutoFit) {
      fitToScreen();
    }

    return () => observer.disconnect();
  }, [fitToScreen]);

  // Executa auto-fit ao carregar documento ou quando explicitamente solicitado
  useEffect(() => {
    if (containerRef.current && containerRef.current.clientWidth > 0) {
      fitToScreen();
    } else {
      const raf = requestAnimationFrame(() => {
        if (containerRef.current && containerRef.current.clientWidth > 0) {
          fitToScreen();
        }
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [document?.id, fitToScreenRequested, fitToScreen]);

  // Gestos de pinch-to-zoom em telas touch
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartDistRef.current = dist;
      touchStartZoomRef.current = zoom;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStartDistRef.current !== null) {
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = currentDist / touchStartDistRef.current;
      const newZoom = Math.round(touchStartZoomRef.current * ratio);
      setZoom(newZoom, true);
    }
  };

  const handleTouchEnd = () => {
    touchStartDistRef.current = null;
  };

  if (!document || !mounted) return null;

  const template = getTemplate(document.selectedTemplateId) || getTemplate('modern-impact');
  const bg = (document.settings as any)?.background || (document.settings?.theme as any)?.background || template?.theme.background || template?.pageSettings.background || '#ffffff';

  const scaledWidth = 794 * (zoom / 100);
  const scaledHeight = resumeHeight * (zoom / 100);

  return (
    <div 
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="editor-canvas-scroll flex-1 w-full h-full overflow-y-auto overflow-x-auto bg-[#eaecf0] relative select-none print:overflow-visible print:bg-white print:p-0 print:m-0 print:!block touch-pan-x touch-pan-y"
    >
      {/* Container de Centralização com largura adaptável (sem recorte à esquerda) */}
      <div className="editor-canvas-inner min-h-full min-w-full w-fit mx-auto py-5 sm:py-8 px-2 sm:px-4 flex flex-col items-center justify-start pb-36 lg:pb-24 print:p-0 print:m-0 print:!block">
        
        {/* Wrapper que reserva o espaço real do currículo escalado */}
        <div 
          style={{ 
            width: `${scaledWidth}px`, 
            height: `${scaledHeight}px`, 
            position: 'relative',
            flexShrink: 0
          }}
          className="editor-scale-wrapper transition-all duration-150 ease-out print:!w-full print:!h-auto print:!m-0 print:!p-0 print:!static shadow-2xl rounded-sm"
        >
          <div 
            ref={resumeRef}
            id="resume-print-document"
            className="resume-print-content absolute top-0 left-0 transition-transform duration-150 ease-out flex flex-col select-text cursor-default"
            style={{ 
              width: '794px', 
              minHeight: '1123px', 
              backgroundColor: bg,
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top left',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <ResumeRenderer document={document} />
          </div>
        </div>

      </div>
    </div>
  );
}
