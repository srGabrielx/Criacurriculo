import { ResumeDocument } from '@/types/resume';

const STORAGE_KEY = 'ai-studio-resumes';

const EMPTY_SNAPSHOT: ResumeDocument[] = [];

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((listener) => listener());
}

let cachedResumes: ResumeDocument[] = EMPTY_SNAPSHOT;
let lastRawData: string | null = null;

export function createDefaultResume(id?: string, templateId = 'modern-impact'): ResumeDocument {
  const docId = id || 'curriculo-demo';
  const now = new Date().toISOString();
  return {
    id: docId,
    title: 'Meu Currículo Profissional',
    selectedTemplateId: templateId,
    createdAt: now,
    updatedAt: now,
    personalInfo: {
      name: 'Gabriel Silva',
      headline: 'Desenvolvedor Full Stack Sênior',
      headlineAccent: '',
      description: 'Engenheiro de Software com sólida experiência em React, Next.js, Node.js e arquiteturas de nuvem. Foco em soluções escaláveis, design centrado no usuário e alta performance.',
      photo: '/perfil.jpg',
      location: 'São Paulo, SP - Brasil',
      email: 'gabriel.silva@email.com',
      website: 'gabrielsilva.dev',
      phone: '(11) 98765-4321',
      linkedin: 'linkedin.com/in/gabrielsilva',
      github: 'github.com/gabrielsilva',
      birthDate: '15/04/1994',
      nationality: 'Brasileira',
      drivingLicense: 'B'
    },
    sections: [
      {
        id: 'sec-exp',
        type: 'experience',
        title: 'Experiência Profissional',
        visible: true,
        order: 0,
        items: [
          {
            id: 'exp-1',
            title: 'Desenvolvedor Full Stack Sênior',
            subtitle: 'TechSolutions Cloud S.A.',
            date: 'Mar 2021 - Presente',
            location: 'São Paulo, SP',
            description: '• Liderou a construção de microsserviços modernos com Next.js, TypeScript e Docker.\n• Otimizou a performance de carregamento web em 45% com Core Web Vitals.\n• Mentoria técnica e acompanhamento de boas práticas para a equipe ágil.'
          },
          {
            id: 'exp-2',
            title: 'Desenvolvedor Front-end Pleno',
            subtitle: 'Inovação Digital Web',
            date: 'Jan 2018 - Fev 2021',
            location: 'Campinas, SP',
            description: '• Desenvolveu painéis SaaS e interfaces responsivas com foco em acessibilidade e UX.\n• Reduziu bugs de produção integrando tipagem estrita e testes automatizados.'
          }
        ]
      },
      {
        id: 'sec-edu',
        type: 'education',
        title: 'Formação Acadêmica',
        visible: true,
        order: 1,
        items: [
          {
            id: 'edu-1',
            title: 'Bacharelado em Ciência da Computação',
            subtitle: 'Universidade de São Paulo (USP)',
            date: '2014 - 2018',
            location: 'São Paulo, SP',
            description: 'Ênfase em Engenharia de Software e Sistemas Distribuídos.'
          }
        ]
      },
      {
        id: 'sec-skills',
        type: 'skills',
        title: 'Habilidades & Tecnologias',
        visible: true,
        order: 2,
        items: [
          { id: 'sk-1', title: 'React / Next.js / TypeScript' },
          { id: 'sk-2', title: 'Node.js / Express / REST APIs' },
          { id: 'sk-3', title: 'Tailwind CSS / UI & UX Design' },
          { id: 'sk-4', title: 'Docker / Cloud Computing / Git' }
        ]
      },
      {
        id: 'sec-lang',
        type: 'languages',
        title: 'Idiomas',
        visible: true,
        order: 3,
        items: [
          { id: 'lg-1', title: 'Português', subtitle: 'Nativo' },
          { id: 'lg-2', title: 'Inglês', subtitle: 'Avançado / Fluente' }
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
}

function getCachedAll(): ResumeDocument[] {
  if (typeof window === 'undefined') return EMPTY_SNAPSHOT;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== lastRawData) {
      lastRawData = raw;
      if (raw) {
        cachedResumes = JSON.parse(raw);
      } else {
        // Inicializa com um currículo padrão pronto para visualização e edição imediata
        const defaultDoc = createDefaultResume();
        cachedResumes = [defaultDoc];
        const serialized = JSON.stringify(cachedResumes);
        localStorage.setItem(STORAGE_KEY, serialized);
        lastRawData = serialized;
      }
    }
    return cachedResumes;
  } catch {
    return EMPTY_SNAPSHOT;
  }
}

export const resumeRepository = {
  subscribe: (listener: Listener) => {
    listeners.add(listener);
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        listener();
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', onStorage);
    }
    return () => {
      listeners.delete(listener);
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', onStorage);
      }
    };
  },

  getSnapshot: (): ResumeDocument[] => {
    return getCachedAll();
  },

  getServerSnapshot: (): ResumeDocument[] => {
    return EMPTY_SNAPSHOT;
  },

  getAll: (): ResumeDocument[] => {
    return getCachedAll();
  },
  
  getById: (id: string): ResumeDocument | undefined => {
    return getCachedAll().find(r => r.id === id);
  },
  
  createDefaultDocument: (id?: string, templateId?: string): ResumeDocument => {
    const doc = createDefaultResume(id, templateId);
    resumeRepository.save(doc);
    return doc;
  },
  
  save: (resume: ResumeDocument): void => {
    if (typeof window === 'undefined') return;
    const resumes = [...getCachedAll()];
    const index = resumes.findIndex(r => r.id === resume.id);
    
    const now = new Date().toISOString();
    if (index >= 0) {
      resumes[index] = { ...resume, updatedAt: now };
    } else {
      resumes.push({ ...resume, createdAt: now, updatedAt: now });
    }
    
    const serialized = JSON.stringify(resumes);
    localStorage.setItem(STORAGE_KEY, serialized);
    lastRawData = serialized;
    cachedResumes = resumes;
    notify();
  },
  
  delete: (id: string): void => {
    if (typeof window === 'undefined') return;
    const resumes = getCachedAll().filter(r => r.id !== id);
    const serialized = JSON.stringify(resumes);
    localStorage.setItem(STORAGE_KEY, serialized);
    lastRawData = serialized;
    cachedResumes = resumes;
    notify();
  }
};
