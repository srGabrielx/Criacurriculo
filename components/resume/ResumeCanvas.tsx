'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { ResumeRenderer } from './ResumeRenderer';
import { getTemplate } from '@/domain/template/registry';
import { Maximize2, ZoomIn, ZoomOut } from 'lucide-react';

import { useMounted } from '@/lib/useMounted';

export function ResumeCanvas() {
  const { document, zoom, setZoom, selectSection } = useEditorStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const resumeRef = useRef<HTMLDivElement>(null);
  const mounted = useMounted();
  const [resumeHeight, setResumeHeight] = useState(1123);

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

  const fitToScreen = useCallback(() => {
    const containerWidth = containerRef.current?.clientWidth || (typeof window !== 'undefined' ? window.innerWidth : 794);
    const resumeWidth = 794;
    
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const isTablet = typeof window !== 'undefined' && window.innerWidth >= 768 && window.innerWidth < 1024;
    
    // Margem de respiro horizontal
    const padding = isMobile ? 16 : isTablet ? 32 : 64;
    const availableWidth = Math.max(containerWidth - padding, 280);
    
    let calculatedZoom = Math.floor((availableWidth / resumeWidth) * 100);
    
    // Limites confortáveis de leitura
    if (calculatedZoom > 105) calculatedZoom = 100;
    if (calculatedZoom < 25) calculatedZoom = 25;

    setZoom(calculatedZoom);
  }, [setZoom]);

  useEffect(() => {
    if (!mounted) return;
    // Auto-ajusta o zoom ao abrir para caber na tela no mobile, ou 100% no desktop
    fitToScreen();
  }, [mounted, fitToScreen]);

  const toggleZoomFit = useCallback(() => {
    if (zoom >= 95 && zoom <= 105) {
      fitToScreen();
    } else {
      setZoom(100);
    }
  }, [zoom, fitToScreen, setZoom]);

  if (!document || !mounted) return null;

  const template = getTemplate(document.selectedTemplateId) || getTemplate('modern-impact');
  const bg = (document.settings as any)?.background || (document.settings?.theme as any)?.background || template?.theme.background || template?.pageSettings.background || '#ffffff';

  const scaledWidth = 794 * (zoom / 100);
  const scaledHeight = resumeHeight * (zoom / 100);

  return (
    <div 
      ref={containerRef}
      className="flex-1 w-full h-full overflow-y-auto overflow-x-auto bg-[#f1f3f6] relative select-none print:overflow-visible print:bg-white print:p-0 print:m-0 print:!block"
      onClick={() => selectSection(null)}
    >
      {/* Container de Centralização com scroll natural e espaço no fundo */}
      <div className="min-h-full w-full py-6 md:py-10 flex flex-col items-center justify-start pb-32 lg:pb-20 print:p-0 print:!block">
        
        {/* Wrapper que reserva o espaço real do currículo escalado */}
        <div 
          style={{ 
            width: `${scaledWidth}px`, 
            height: `${scaledHeight}px`, 
            position: 'relative',
            flexShrink: 0
          }}
          className="transition-all duration-150 ease-out print:!w-full print:!h-auto"
        >
          <div 
            ref={resumeRef}
            className="resume-print-content absolute top-0 left-0 shadow-2xl transition-transform duration-150 ease-out flex flex-col print:shadow-none print:transform-none print:!scale-100 print:m-0 print:relative"
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
