'use client';
import { PersonalInfo, TemplateDefinition } from '@/types/resume';
import { useEditorStore } from '@/store/useEditorStore';
import { MapPin, Mail, Globe, Phone, Linkedin, Github, Calendar, Flag, Car } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface Props {
  personalInfo: PersonalInfo;
  template: TemplateDefinition;
  isSidebar?: boolean;
  previewMode?: boolean;
}

export function HeaderRenderer({ personalInfo, template, isSidebar, previewMode }: Props) {
  const { selectSection, selectedSectionId, updatePersonalInfo } = useEditorStore();
  const isSelected = selectedSectionId === 'personalInfo';
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (isSelected && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [isSelected]);

  const outlineClasses = previewMode 
    ? '' 
    : isSelected 
      ? 'ring-2 ring-blue-500 rounded bg-blue-50/5 relative z-10 print:ring-0 print:bg-transparent' 
      : 'hover:ring-1 hover:ring-gray-300 rounded hover:bg-gray-50/30 cursor-pointer relative z-10 transition-all print:hover:ring-0 print:hover:bg-transparent';

  const editableProps = (field: keyof PersonalInfo) => previewMode ? {} : {
    contentEditable: true,
    suppressContentEditableWarning: true,
    onBlur: (e: React.FocusEvent<HTMLElement>) => updatePersonalInfo(field, e.currentTarget.textContent || ''),
    className: 'outline-none hover:bg-black/5 focus:bg-black/5 rounded transition-colors px-1 -mx-1 cursor-text',
    onClick: (e: React.MouseEvent) => e.stopPropagation()
  };

  if (isSidebar) {
    return (
      <div 
        ref={ref}
        className={`flex flex-col items-center text-center gap-4 print:break-inside-avoid ${previewMode ? '' : 'p-2 -m-2'} ${outlineClasses}`}
        onClick={(e) => { 
          if(previewMode) return;
          e.stopPropagation(); 
          selectSection('personalInfo'); 
        }}
      >
        {!template.layout.hidePhoto && personalInfo.photo && (
          <div 
            className="relative shrink-0 overflow-hidden mb-4 mx-auto shadow-sm"
            style={{ 
              width: '100%',
              maxWidth: '180px', 
              border: '2px solid var(--resume-border)',
              backgroundColor: 'rgba(0, 0, 0, 0.02)'
            }}
          >
            <img 
              src={personalInfo.photo} 
              alt={personalInfo.name}
              className="w-full h-auto object-contain"
            />
          </div>
        )}
        <div className="flex flex-col gap-1 w-full">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--resume-primary)' }} {...editableProps('name')}>
            {personalInfo.name}
          </h1>
          <h2 className="text-sm font-medium uppercase tracking-wide" style={{ color: 'var(--resume-text)' }} {...editableProps('headline')}>
            {personalInfo.headline}
          </h2>
          {personalInfo.headlineAccent && (
            <h2 className="text-sm font-medium uppercase tracking-wide mt-1" style={{ color: 'var(--resume-primary)' }} {...editableProps('headlineAccent')}>
              {personalInfo.headlineAccent}
            </h2>
          )}
        </div>
        
        <div className="w-full h-px bg-white/10 my-2" style={{ backgroundColor: 'var(--resume-border)' }}></div>

        <div className="flex flex-col gap-3 w-full text-sm" style={{ color: 'var(--resume-muted)' }}>
          {personalInfo.email && (
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--resume-border)' }}>
                 <Mail size={14} style={{ color: 'var(--resume-primary)' }} />
              </div>
              <span className="truncate flex-1 text-left" {...editableProps('email')}>{personalInfo.email}</span>
            </div>
          )}
          {personalInfo.phone && (
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--resume-border)' }}>
                 <Phone size={14} style={{ color: 'var(--resume-primary)' }} />
              </div>
              <span className="truncate flex-1 text-left" {...editableProps('phone')}>{personalInfo.phone}</span>
            </div>
          )}
          {personalInfo.location && (
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--resume-border)' }}>
                 <MapPin size={14} style={{ color: 'var(--resume-primary)' }} />
              </div>
              <span className="truncate flex-1 text-left" {...editableProps('location')}>{personalInfo.location}</span>
            </div>
          )}
          {personalInfo.website && (
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--resume-border)' }}>
                 <Globe size={14} style={{ color: 'var(--resume-primary)' }} />
              </div>
              <span className="truncate flex-1 text-left" {...editableProps('website')}>{personalInfo.website}</span>
            </div>
          )}
          {personalInfo.linkedin && (
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--resume-border)' }}>
                 <Linkedin size={14} style={{ color: 'var(--resume-primary)' }} />
              </div>
              <span className="truncate flex-1 text-left" {...editableProps('linkedin')}>{personalInfo.linkedin}</span>
            </div>
          )}
          {personalInfo.github && (
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--resume-border)' }}>
                 <Github size={14} style={{ color: 'var(--resume-primary)' }} />
              </div>
              <span className="truncate flex-1 text-left" {...editableProps('github')}>{personalInfo.github}</span>
            </div>
          )}
          {personalInfo.birthDate && (
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--resume-border)' }}>
                 <Calendar size={14} style={{ color: 'var(--resume-primary)' }} />
              </div>
              <span className="truncate flex-1 text-left" {...editableProps('birthDate')}>{personalInfo.birthDate}</span>
            </div>
          )}
          {personalInfo.nationality && (
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--resume-border)' }}>
                 <Flag size={14} style={{ color: 'var(--resume-primary)' }} />
              </div>
              <span className="truncate flex-1 text-left" {...editableProps('nationality')}>{personalInfo.nationality}</span>
            </div>
          )}
          {personalInfo.drivingLicense && (
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--resume-border)' }}>
                 <Car size={14} style={{ color: 'var(--resume-primary)' }} />
              </div>
              <span className="truncate flex-1 text-left" {...editableProps('drivingLicense')}>{personalInfo.drivingLicense}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default Modern/Minimal renderer
  return (
    <div 
      ref={ref}
      className={`flex flex-col md:flex-row items-center gap-8 print:break-inside-avoid ${previewMode ? '' : 'p-4 -m-4'} ${outlineClasses}`}
      onClick={(e) => { 
        if(previewMode) return;
        e.stopPropagation(); 
        selectSection('personalInfo'); 
      }}
    >
      {!template.layout.hidePhoto && personalInfo.photo && (
        <div 
          className="relative shrink-0 overflow-hidden shadow-sm self-center md:self-start mt-1 rounded-md"
          style={{ 
            maxWidth: '180px', 
            border: '2px solid var(--resume-border)',
            backgroundColor: 'rgba(0, 0, 0, 0.02)'
          }}
        >
          <img 
            src={personalInfo.photo} 
            alt={personalInfo.name}
            className="w-full h-auto object-contain"
          />
        </div>
      )}
      
      <div className="flex flex-col gap-3 text-center md:text-left flex-1 md:pl-4">
        <h1 className="text-4xl font-bold break-words whitespace-pre-wrap" style={{ color: 'var(--resume-text)' }} {...editableProps('name')}>
          {personalInfo.name}
        </h1>
        
        <h2 className="text-xl flex flex-wrap gap-2 items-center justify-center md:justify-start break-words whitespace-pre-wrap">
          <span style={{ color: 'var(--resume-muted)' }} {...editableProps('headline')}>{personalInfo.headline}</span>
          {personalInfo.headlineAccent && (
            <span className="font-semibold" style={{ color: 'var(--resume-primary)' }} {...editableProps('headlineAccent')}>
              {personalInfo.headlineAccent}
            </span>
          )}
        </h2>
        
        {personalInfo.description && (
          <p className="mt-3 leading-relaxed text-sm max-w-2xl break-words whitespace-pre-wrap" style={{ color: 'var(--resume-text)' }} {...editableProps('description')}>
            {personalInfo.description}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3 pt-3 border-t" style={{ borderColor: 'var(--resume-border)' }}>
          {personalInfo.location && (
            <div className="flex items-center gap-1.5">
              <MapPin size={14} style={{ color: 'var(--resume-secondary)' }} />
              <span style={{ color: 'var(--resume-muted)' }} className="text-xs font-medium" {...editableProps('location')}>{personalInfo.location}</span>
            </div>
          )}
          {personalInfo.email && (
            <div className="flex items-center gap-1.5">
              <Mail size={14} style={{ color: 'var(--resume-secondary)' }} />
              <span style={{ color: 'var(--resume-muted)' }} className="text-xs font-medium" {...editableProps('email')}>{personalInfo.email}</span>
            </div>
          )}
          {personalInfo.website && (
            <div className="flex items-center gap-1.5">
              <Globe size={14} style={{ color: 'var(--resume-secondary)' }} />
              <span style={{ color: 'var(--resume-muted)' }} className="text-xs font-medium" {...editableProps('website')}>{personalInfo.website}</span>
            </div>
          )}
          {personalInfo.linkedin && (
            <div className="flex items-center gap-1.5">
              <Linkedin size={14} style={{ color: 'var(--resume-secondary)' }} />
              <span style={{ color: 'var(--resume-muted)' }} className="text-xs font-medium" {...editableProps('linkedin')}>{personalInfo.linkedin}</span>
            </div>
          )}
          {personalInfo.github && (
            <div className="flex items-center gap-1.5">
              <Github size={14} style={{ color: 'var(--resume-secondary)' }} />
              <span style={{ color: 'var(--resume-muted)' }} className="text-xs font-medium" {...editableProps('github')}>{personalInfo.github}</span>
            </div>
          )}
          {personalInfo.phone && (
            <div className="flex items-center gap-1.5">
              <Phone size={14} style={{ color: 'var(--resume-secondary)' }} />
              <span style={{ color: 'var(--resume-muted)' }} className="text-xs font-medium" {...editableProps('phone')}>{personalInfo.phone}</span>
            </div>
          )}
          {personalInfo.birthDate && (
            <div className="flex items-center gap-1.5">
              <Calendar size={14} style={{ color: 'var(--resume-secondary)' }} />
              <span style={{ color: 'var(--resume-muted)' }} className="text-xs font-medium" {...editableProps('birthDate')}>{personalInfo.birthDate}</span>
            </div>
          )}
          {personalInfo.nationality && (
            <div className="flex items-center gap-1.5">
              <Flag size={14} style={{ color: 'var(--resume-secondary)' }} />
              <span style={{ color: 'var(--resume-muted)' }} className="text-xs font-medium" {...editableProps('nationality')}>{personalInfo.nationality}</span>
            </div>
          )}
          {personalInfo.drivingLicense && (
            <div className="flex items-center gap-1.5">
              <Car size={14} style={{ color: 'var(--resume-secondary)' }} />
              <span style={{ color: 'var(--resume-muted)' }} className="text-xs font-medium" {...editableProps('drivingLicense')}>{personalInfo.drivingLicense}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
