'use client';
import { ResumeDocument } from '@/types/resume';
import { getTemplate } from '@/domain/template/registry';
import { HeaderRenderer } from './HeaderRenderer';
import { SectionRenderer } from './SectionRenderer';
import { useEditorStore } from '@/store/useEditorStore';

interface Props {
  document: ResumeDocument;
  previewMode?: boolean;
}

export function ResumeRenderer({ document, previewMode: propPreviewMode }: Props) {
  const storePreviewMode = useEditorStore((state) => state.previewMode);
  const previewMode = propPreviewMode !== undefined ? propPreviewMode : storePreviewMode;
  const template = getTemplate(document.selectedTemplateId) || getTemplate('modern-impact');
  
  if (!template) return <div>Template não encontrado</div>;

  const { theme: templateTheme, pageSettings, layout } = template;
  const theme = { ...templateTheme, ...(document.settings?.theme || {}) };
  const padding = document.settings?.padding ?? pageSettings.padding;
  const bg = (document.settings as any)?.background || (document.settings?.theme as any)?.background || templateTheme.background || pageSettings.background || '#ffffff';

  const styleVariables = {
    '--resume-primary': theme.primary,
    '--resume-secondary': theme.secondary,
    '--resume-text': theme.text,
    '--resume-muted': theme.muted,
    '--resume-border': theme.border,
    '--resume-radius': `${theme.radius ?? 8}px`,
    '--resume-bg': bg,
    fontFamily: theme.fontFamily,
    backgroundColor: bg,
    color: theme.text
  } as React.CSSProperties;

  const renderRegion = (regionSections: string[], isSidebar = false) => {
    const elements: React.ReactNode[] = [];
    
    if (regionSections.includes('personalInfo')) {
      elements.push(<HeaderRenderer key="personalInfo" personalInfo={document.personalInfo} template={template} isSidebar={isSidebar} previewMode={previewMode} />);
    }

    const sectionsToRender = document.sections.filter(s => {
      if (!s.visible) return false;
      
      if (isSidebar) {
        return regionSections.includes(s.type);
      }
      
      const isAssignedToSidebar = template.layout.regions.sidebar?.includes(s.type);
      return regionSections.includes(s.type) || !isAssignedToSidebar;
    });
    
    sectionsToRender.forEach(section => {
      elements.push(<SectionRenderer key={section.id} section={section} template={template} previewMode={previewMode} />);
    });
    
    return elements;
  };

  return (
    <div 
      className="w-full h-full flex flex-col flex-1"
      style={styleVariables}
    >
      <div 
         className="flex-1 flex flex-col w-full h-full"
         style={{ padding: `${padding}px` }}
      >
        {layout.type === 'single-column' && (
          <div className="flex flex-col gap-6 w-full">
            {renderRegion(layout.regions.main)}
          </div>
        )}

        {layout.type === 'two-column-left' && (
          <div className="flex gap-8 w-full h-full min-h-full flex-1">
            <div 
              className="flex flex-col gap-6 shrink-0 h-full"
              style={{ width: layout.sidebarWidth || '32%' }}
            >
              {layout.regions.sidebar && renderRegion(layout.regions.sidebar, true)}
            </div>
            <div className="w-px bg-gray-200" style={{ backgroundColor: 'var(--resume-border)' }}></div>
            <div className="flex flex-col gap-6 flex-1">
              {renderRegion(layout.regions.main)}
            </div>
          </div>
        )}

        {layout.type === 'two-column-right' && (
          <div className="flex gap-8 w-full h-full min-h-full flex-1">
            <div className="flex flex-col gap-6 flex-1">
              {renderRegion(layout.regions.main)}
            </div>
            <div className="w-px bg-gray-200" style={{ backgroundColor: 'var(--resume-border)' }}></div>
            <div 
              className="flex flex-col gap-6 shrink-0 h-full"
              style={{ width: layout.sidebarWidth || '32%' }}
            >
              {layout.regions.sidebar && renderRegion(layout.regions.sidebar, true)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
