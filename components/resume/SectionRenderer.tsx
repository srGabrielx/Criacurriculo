'use client';
import { Section, TemplateDefinition } from '@/types/resume';
import { useEditorStore } from '@/store/useEditorStore';
import { useEffect, useRef } from 'react';

interface Props {
  section: Section;
  template: TemplateDefinition;
  previewMode?: boolean;
}

export function SectionRenderer({ section, template, previewMode }: Props) {
  const { selectSection, selectBlock, selectedSectionId, selectedBlockId, updateSection, updateSectionItem } = useEditorStore();
  const ref = useRef<HTMLDivElement>(null);
  
  const isSectionSelected = selectedSectionId === section.id;

  useEffect(() => {
    if (isSectionSelected && !selectedBlockId && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [isSectionSelected, selectedBlockId]);

  const outlineClasses = previewMode 
    ? '' 
    : isSectionSelected && !selectedBlockId 
      ? 'ring-2 ring-blue-500 rounded bg-blue-50/5 relative z-10 print:ring-0 print:bg-transparent' 
      : 'hover:ring-1 hover:ring-gray-300 rounded hover:bg-gray-50/30 cursor-pointer relative z-10 transition-all print:hover:ring-0 print:hover:bg-transparent';

  const blockOutlineClasses = (isSelected: boolean) => {
    if (previewMode) return '';
    if (isSelected) return 'ring-2 ring-blue-500 rounded bg-blue-50/10 relative z-20 print:ring-0 print:bg-transparent';
    return 'hover:ring-1 hover:ring-blue-300 rounded hover:bg-black/5 cursor-pointer relative z-20 transition-all print:hover:ring-0 print:hover:bg-transparent';
  };

  const editableProps = (type: 'section' | 'item', id: string, field: string) => previewMode ? {} : {
    contentEditable: true,
    suppressContentEditableWarning: true,
    onBlur: (e: React.FocusEvent<HTMLElement>) => {
      const val = e.currentTarget.textContent || '';
      if (type === 'section') {
        updateSection(id, { [field]: val });
      } else {
        updateSectionItem(section.id, id, { [field]: val });
      }
    },
    className: 'outline-none hover:bg-black/5 focus:bg-black/5 rounded transition-colors px-1 -mx-1 cursor-text',
    onClick: (e: React.MouseEvent) => e.stopPropagation()
  };

  return (
    <div 
      ref={ref}
      className={`flex flex-col gap-4 print:break-inside-avoid ${previewMode ? '' : 'p-3 -m-3'} ${outlineClasses}`}
      onClick={(e) => { 
        if(previewMode) return;
        e.stopPropagation(); 
        selectSection(section.id); 
      }}
    >
      <div className="flex items-center gap-4">
        <h2 
          className="text-xl font-bold uppercase tracking-wider whitespace-nowrap"
          style={{ color: 'var(--resume-primary)' }}
          {...editableProps('section', section.id, 'title')}
        >
          {section.title}
        </h2>
        <div className="h-px flex-1" style={{ backgroundColor: 'var(--resume-border)' }}></div>
      </div>
      
      <div className={`flex ${section.type === 'skills' || section.type === 'languages' || section.type === 'hobbies' ? 'flex-wrap gap-2' : 'flex-col gap-5'}`}>
        {section.items.map(item => {
          const isSelected = selectedBlockId === item.id;
          
          if (section.type === 'skills' || section.type === 'languages' || section.type === 'hobbies') {
            return (
              <div 
                key={item.id}
                onClick={(e) => { 
                  if(previewMode) return;
                  e.stopPropagation(); 
                  selectSection(section.id); 
                  selectBlock(item.id); 
                }}
                className={`px-3 py-1.5 text-sm font-medium transition-all ${template.id === 'minimal-pro' ? 'border' : ''} ${previewMode ? '' : isSelected ? 'ring-2 ring-blue-500 shadow-md cursor-pointer' : 'hover:opacity-80 cursor-pointer'}`}
                style={{ 
                  backgroundColor: template.id === 'minimal-pro' ? 'transparent' : 'var(--resume-primary)', 
                  color: template.id === 'minimal-pro' ? 'var(--resume-text)' : '#ffffff',
                  borderColor: template.id === 'minimal-pro' ? 'var(--resume-border)' : 'transparent',
                  borderRadius: 'var(--resume-radius)'
                }}
              >
                <span {...editableProps('item', item.id, 'title')}>{item.title}</span>
                {section.type === 'languages' && item.subtitle && (
                   <span className="ml-2 opacity-75 font-normal">- <span {...editableProps('item', item.id, 'subtitle')}>{item.subtitle}</span></span>
                )}
              </div>
            );
          }

          return (
            <div 
              key={item.id} 
              className={`flex flex-col gap-1 print:break-inside-avoid ${previewMode ? '' : 'p-2 -m-2'} ${blockOutlineClasses(isSelected)}`}
              onClick={(e) => { 
                if(previewMode) return;
                e.stopPropagation(); 
                selectSection(section.id); 
                selectBlock(item.id); 
              }}
            >
              <div className="flex justify-between items-baseline gap-4">
                <h3 className="text-base font-bold" style={{ color: 'var(--resume-text)' }} {...editableProps('item', item.id, 'title')}>
                  {item.title}
                </h3>
                <div className="flex flex-col items-end text-right gap-0.5">
                  {item.date && (
                    <span className="text-xs font-semibold whitespace-nowrap" style={{ color: 'var(--resume-secondary)' }} {...editableProps('item', item.id, 'date')}>
                      {item.date}
                    </span>
                  )}
                  {item.location && (
                    <span className="text-xs font-medium whitespace-nowrap" style={{ color: 'var(--resume-muted)' }} {...editableProps('item', item.id, 'location')}>
                      {item.location}
                    </span>
                  )}
                </div>
              </div>
              
              {item.subtitle && (
                <div className="text-sm font-medium inline-block" style={{ color: 'var(--resume-primary)' }} {...editableProps('item', item.id, 'subtitle')}>
                  {item.subtitle}
                </div>
              )}

              {item.url && (
                <div className="text-xs font-medium mt-0.5 inline-block">
                  <a href={item.url.startsWith('http') ? item.url : `https://${item.url}`} target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: 'var(--resume-secondary)' }} {...editableProps('item', item.id, 'url')}>
                    {item.url}
                  </a>
                </div>
              )}
              
              {item.description && (
                <p className="mt-1.5 text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--resume-text)', opacity: 0.8 }} {...editableProps('item', item.id, 'description')}>
                  {item.description}
                </p>
              )}

              {item.tags && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {item.tags.split(',').map((tag: string, idx: number) => {
                    const cleanTag = tag.trim();
                    if (!cleanTag) return null;
                    return (
                      <span key={idx} className="px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider rounded-md border" style={{ borderColor: 'var(--resume-border)', color: 'var(--resume-secondary)', backgroundColor: 'var(--resume-border)' }}>
                        {cleanTag}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
