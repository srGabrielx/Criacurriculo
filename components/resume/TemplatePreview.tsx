'use client';

import { useEffect, useRef, useState } from 'react';
import { ResumeRenderer } from './ResumeRenderer';
import { ResumeDocument } from '@/types/resume';

const mockDocument: ResumeDocument = {
  id: 'mock',
  title: 'Mock',
  selectedTemplateId: 'modern-impact',
  createdAt: '',
  updatedAt: '',
  personalInfo: {
    name: 'Gabriel',
    headline: 'Desenvolvedor Full Stack Sênior',
    headlineAccent: '',
    description: 'Profissional com mais de 8 anos de experiência no desenvolvimento de soluções escaláveis em nuvem e liderança técnica de equipes ágeis. Especialista em ecossistema JavaScript e arquitetura de microsserviços. Foco na entrega de produtos de alto valor agregado e melhoria contínua de performance.',
    photo: '/perfil.jpg',
    location: 'São Paulo, SP - Brasil',
    email: 'alexandre@email.com',
    website: 'alexandresilva.dev',
    phone: '(11) 98765-4321',
  },
  sections: [
    {
      id: 's1',
      type: 'experience',
      title: 'Experiência Profissional',
      visible: true,
      order: 0,
      items: [
        {
          id: 'i1',
          title: 'Desenvolvedor Full Stack Sênior',
          subtitle: 'TechSolutions Cloud',
          date: 'Mar 2021 - Atual',
          description: 'Liderou a migração de um monólito legado para microsserviços usando Node.js e Docker, reduzindo o tempo de resposta em 40%.'
        },
        {
          id: 'i1b',
          title: 'Engenheiro de Software Pleno',
          subtitle: 'InovaTech Startups',
          date: 'Jan 2018 - Fev 2021',
          description: 'Desenvolveu e manteve APIs RESTful escaláveis para um aplicativo de logística de última milha, otimizando infraestrutura AWS.'
        },
        {
          id: 'i1c',
          title: 'Desenvolvedor Front-end',
          subtitle: 'Agência Digital',
          date: 'Jun 2015 - Dez 2017',
          description: 'Criou interfaces responsivas e acessíveis (WCAG) aumentando a conversão em 15% nos e-commerces.'
        }
      ]
    },
    {
      id: 's2',
      type: 'education',
      title: 'Educação',
      visible: true,
      order: 1,
      items: [
        {
          id: 'i2',
          title: 'Especialização em Software',
          subtitle: 'Universidade Estadual de Campinas',
          date: '2019 - 2020',
        },
        {
          id: 'i2b',
          title: 'Ciência da Computação',
          subtitle: 'Universidade de São Paulo',
          date: '2011 - 2014',
        }
      ]
    },
    {
      id: 's3',
      type: 'skills',
      title: 'Principais Habilidades',
      visible: true,
      order: 2,
      items: [
        { id: 'sk1', title: 'TypeScript' },
        { id: 'sk2', title: 'React' },
        { id: 'sk3', title: 'Node.js' },
        { id: 'sk4', title: 'Docker' },
        { id: 'sk5', title: 'AWS' },
        { id: 'sk6', title: 'PostgreSQL' },
        { id: 'sk7', title: 'Scrum' }
      ]
    }
  ],
  settings: {
    format: 'A4',
    orientation: 'portrait',
    padding: 42,
    theme: {}
  }
};

interface Props {
  templateId: string;
  document?: ResumeDocument;
  scale?: number;
}

export function TemplatePreview({ templateId, document, scale }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoScale, setAutoScale] = useState(scale || 0.17);

  // Renderiza com os dados do documento mas mantendo o template específico para demonstração
  const docToRender: ResumeDocument = document 
    ? { 
        ...document, 
        selectedTemplateId: templateId, 
        settings: { 
          ...document.settings, 
          theme: { ...(document.settings?.theme || {}) } 
        } 
      } 
    : { ...mockDocument, selectedTemplateId: templateId };

  useEffect(() => {
    if (scale) return;

    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        setAutoScale(containerWidth / 794);
      }
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, [scale]);

  const currentScale = scale || autoScale;
  const height = 1123 * currentScale;

  return (
    <div ref={containerRef} className="relative w-full bg-gray-100 pointer-events-none overflow-hidden" style={{ height: `${height}px` }}>
      {/* 
        O 'zoom' afeta o layout real, diferentemente do 'transform'. 
        Como a escala é calculada exata (containerWidth / 794),
        basta aplicar o zoom direto na div de 794px ancorada no top-left. 
      */}
      <div 
        className="absolute top-0 left-0"
        style={{ 
          width: '794px', 
          height: '1123px', 
          overflow: 'hidden',
          backgroundColor: 'white',
          boxShadow: '0 0 10px rgba(0,0,0,0.05)',
          zoom: currentScale
        }}
      >
        <ResumeRenderer document={docToRender} previewMode={true} />
      </div>
    </div>
  );
}
