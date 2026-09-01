import { TemplateDefinition } from '@/types/resume';

export const templates: TemplateDefinition[] = [
  {
    id: 'minimal-pro',
    name: 'Minimal Pro',
    category: 'Minimalista',
    isPremium: false,
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80',
    pageSettings: {
      format: 'A4',
      orientation: 'portrait',
      background: '#fafafa',
      padding: 48
    },
    theme: {
      fontFamily: 'Roboto, sans-serif',
      primary: '#111827',
      secondary: '#4b5563',
      text: '#1f2937',
      muted: '#6b7280',
      border: '#d1d5db',
      radius: 4
    },
    layout: {
      type: 'single-column',
      regions: {
        main: ['personalInfo', 'summary', 'experience', 'education', 'projects', 'skills', 'languages']
      }
    }
  },
  {
    id: 'modern-impact',
    name: 'Modern Impact',
    category: 'Moderno',
    isPremium: false,
    thumbnail: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&q=80',
    pageSettings: {
      format: 'A4',
      orientation: 'portrait',
      background: '#ffffff',
      padding: 42
    },
    theme: {
      fontFamily: 'Inter, sans-serif',
      primary: '#0866E8',
      secondary: '#16B978',
      text: '#071533',
      muted: '#667085',
      border: '#E5E7EB',
      radius: 18
    },
    layout: {
      type: 'two-column-right',
      sidebarWidth: '32%',
      regions: {
        main: ['personalInfo', 'summary', 'experience', 'education', 'projects'],
        sidebar: ['skills', 'languages', 'certifications']
      }
    }
  },
  {
    id: 'clean-focus',
    name: 'Clean Focus (Sem Foto)',
    category: 'Minimalista',
    isPremium: false,
    thumbnail: 'https://images.unsplash.com/photo-1512314889357-e157c22f938d?w=400&q=80',
    pageSettings: {
      format: 'A4',
      orientation: 'portrait',
      background: '#ffffff',
      padding: 48
    },
    theme: {
      fontFamily: 'Inter, sans-serif',
      primary: '#2563eb',
      secondary: '#64748b',
      text: '#0f172a',
      muted: '#475569',
      border: '#e2e8f0',
      radius: 8
    },
    layout: {
      type: 'single-column',
      hidePhoto: true,
      regions: {
        main: ['personalInfo', 'summary', 'experience', 'education', 'projects', 'skills']
      }
    }
  },
  {
    id: 'executive-dark',
    name: 'Executive Dark',
    category: 'Profissional',
    isPremium: true,
    thumbnail: 'https://images.unsplash.com/photo-1626245136892-0b1aeb066aee?w=400&q=80',
    pageSettings: {
      format: 'A4',
      orientation: 'portrait',
      background: '#0f172a',
      padding: 32
    },
    theme: {
      fontFamily: 'Inter, sans-serif',
      primary: '#38bdf8',
      secondary: '#94a3b8',
      text: '#f8fafc',
      muted: '#cbd5e1',
      border: '#334155',
      radius: 12
    },
    layout: {
      type: 'two-column-left',
      sidebarWidth: '35%',
      regions: {
        sidebar: ['personalInfo', 'skills', 'languages'],
        main: ['summary', 'experience', 'education', 'projects']
      }
    }
  },
  {
    id: 'creative-split',
    name: 'Creative Split',
    category: 'Criativo',
    isPremium: false,
    thumbnail: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=400&q=80',
    pageSettings: {
      format: 'A4',
      orientation: 'portrait',
      background: '#ffffff',
      padding: 36
    },
    theme: {
      fontFamily: 'system-ui, sans-serif',
      primary: '#8b5cf6',
      secondary: '#f43f5e',
      text: '#1e293b',
      muted: '#64748b',
      border: '#e2e8f0',
      radius: 24
    },
    layout: {
      type: 'two-column-left',
      sidebarWidth: '32%',
      regions: {
        sidebar: ['personalInfo', 'skills', 'languages', 'hobbies'],
        main: ['summary', 'experience', 'projects', 'education']
      }
    }
  },
  {
    id: 'corporate-standard',
    name: 'Padrão Corporativo',
    category: 'Profissional',
    isPremium: false,
    thumbnail: 'https://images.unsplash.com/photo-1579389083046-d3ce19614084?w=400&q=80',
    pageSettings: {
      format: 'A4',
      orientation: 'portrait',
      background: '#ffffff',
      padding: 48
    },
    theme: {
      fontFamily: '"Playfair Display", serif',
      primary: '#1f2937',
      secondary: '#4b5563',
      text: '#111827',
      muted: '#6b7280',
      border: '#e5e7eb',
      radius: 0
    },
    layout: {
      type: 'single-column',
      hidePhoto: true,
      regions: {
        main: ['personalInfo', 'summary', 'experience', 'education', 'projects', 'skills', 'languages']
      }
    }
  }
];

export function getTemplate(id: string): TemplateDefinition | undefined {
  return templates.find(t => t.id === id);
}
