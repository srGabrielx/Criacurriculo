'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Crown, ArrowRight, Sparkles } from 'lucide-react';
import { templates } from '@/domain/template/registry';
import { resumeRepository } from '@/services/storage/resumeRepository';
import { ResumeDocument } from '@/types/resume';
import { generateId } from '@/lib/utils';
import { TemplatePreview } from '@/components/resume/TemplatePreview';

export default function TemplatesPage() {
  const router = useRouter();
  const [filter, setFilter] = useState('Todos');
  const categories = ['Todos', 'Profissional', 'Moderno', 'Minimalista', 'Criativo'];
  
  const filteredTemplates = templates.filter(t => filter === 'Todos' || t.category === filter);

  const handleUseTemplate = (templateId: string) => {
    const newDoc: ResumeDocument = {
      id: generateId(),
      title: 'Currículo Profissional',
      selectedTemplateId: templateId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      personalInfo: {
        name: 'Gabriel',
        headline: 'Desenvolvedor Full Stack Sênior',
        headlineAccent: '',
        description: 'Profissional com mais de 8 anos de experiência no desenvolvimento de soluções escaláveis em nuvem e liderança técnica de equipes ágeis. Especialista em ecossistema JavaScript (React, Node.js) e arquitetura de microsserviços. Foco na entrega de produtos de alto valor agregado e melhoria contínua de performance.',
        photo: '/perfil.jpg',
        location: 'São Paulo, SP - Brasil',
        email: 'alexandre.silva@email.com',
        website: 'alexandresilva.dev',
        linkedin: 'linkedin.com/in/alexandresilva',
        github: 'github.com/alexandresilva',
        phone: '(11) 98765-4321',
        birthDate: '15/04/1992',
      },
      sections: [
        {
          id: generateId(),
          type: 'experience',
          title: 'Experiência Profissional',
          visible: true,
          order: 0,
          items: [
            {
              id: generateId(),
              title: 'Desenvolvedor Full Stack Sênior',
              subtitle: 'TechSolutions Cloud S.A.',
              date: 'Mar 2021 - Presente',
              location: 'São Paulo, SP (Híbrido)',
              description: '• Liderou a migração de um monólito legado para microsserviços usando Node.js e Docker, reduzindo o tempo de resposta médio em 40%.\n• Desenvolveu a arquitetura front-end de um novo painel SaaS com React e Next.js para mais de 10.000 usuários ativos diários.\n• Mentoria de 4 desenvolvedores juniores, implementando processos rigorosos de code review e testes automatizados.'
            },
            {
              id: generateId(),
              title: 'Engenheiro de Software Pleno',
              subtitle: 'InovaTech Startups',
              date: 'Jan 2018 - Fev 2021',
              location: 'Campinas, SP',
              description: '• Desenvolveu e manteve APIs RESTful escaláveis para um aplicativo de logística de última milha.\n• Otimizou queries de banco de dados PostgreSQL, resultando em uma redução de 30% nos custos de infraestrutura AWS.\n• Integrou múltiplos gateways de pagamento (Stripe, Pagar.me) garantindo estabilidade nas transações.'
            },
            {
              id: generateId(),
              title: 'Desenvolvedor Front-end Júnior',
              subtitle: 'Agência Digital Criativa',
              date: 'Jun 2015 - Dez 2017',
              location: 'São Paulo, SP',
              description: '• Criou interfaces responsivas e acessíveis (WCAG) para clientes de e-commerce e varejo.\n• Aumentou a taxa de conversão em 15% após reformulação completa da experiência de checkout de um grande cliente.'
            }
          ]
        },
        {
          id: generateId(),
          type: 'education',
          title: 'Formação Acadêmica',
          visible: true,
          order: 1,
          items: [
            {
              id: generateId(),
              title: 'Especialização em Arquitetura de Software',
              subtitle: 'Universidade Estadual de Campinas (UNICAMP)',
              date: 'Jan 2019 - Dez 2020',
              location: 'Campinas, SP',
              description: 'Projeto de conclusão: "Padrões de Resiliência em Microsserviços Distribuídos".'
            },
            {
              id: generateId(),
              title: 'Bacharelado em Ciência da Computação',
              subtitle: 'Universidade de São Paulo (USP)',
              date: 'Fev 2011 - Dez 2014',
              location: 'São Paulo, SP',
              description: 'Bolsista de iniciação científica no departamento de inteligência artificial.'
            }
          ]
        },
        {
          id: generateId(),
          type: 'skills',
          title: 'Principais Habilidades',
          visible: true,
          order: 2,
          items: [
            { id: generateId(), title: 'TypeScript / JavaScript' },
            { id: generateId(), title: 'React / Next.js' },
            { id: generateId(), title: 'Node.js / Express' },
            { id: generateId(), title: 'Docker / Kubernetes' },
            { id: generateId(), title: 'AWS (EC2, S3, RDS)' },
            { id: generateId(), title: 'PostgreSQL / MongoDB' },
            { id: generateId(), title: 'Arquitetura de Sistemas' },
            { id: generateId(), title: 'Metodologias Ágeis (Scrum)' }
          ]
        },
        {
          id: generateId(),
          type: 'languages',
          title: 'Idiomas',
          visible: true,
          order: 3,
          items: [
            { id: generateId(), title: 'Inglês (Avançado/Fluente)' },
            { id: generateId(), title: 'Espanhol (Intermediário)' }
          ]
        },
        {
          id: generateId(),
          type: 'projects',
          title: 'Projetos em Destaque',
          visible: true,
          order: 4,
          items: [
            {
              id: generateId(),
              title: 'Plataforma Open Source "DevMetrics"',
              subtitle: 'Criador e Mantenedor',
              date: '2022',
              location: 'GitHub',
              description: 'Criou uma ferramenta de CLI open source para análise de produtividade em repositórios Git, com mais de 1.5k estrelas no GitHub.'
            }
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
    
    resumeRepository.save(newDoc);
    router.push(`/editor/${newDoc.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 -ml-2 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="font-semibold text-gray-900">Galeria de Templates</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === cat ? 'bg-gray-900 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {filteredTemplates.map(template => (
            <div 
              key={template.id} 
              onClick={() => handleUseTemplate(template.id)}
              className="group bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-xs hover:shadow-xl hover:border-blue-300 transition-all cursor-pointer flex flex-col active:scale-[0.98]"
            >
              <div className="w-full relative overflow-hidden bg-gray-100">
                <TemplatePreview templateId={template.id} />
                
                {template.isPremium && (
                  <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm z-10">
                    <Crown size={12} /> Pro
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex items-center justify-center">
                  <span className="bg-white text-gray-900 px-5 py-2.5 rounded-xl font-semibold shadow-lg text-sm flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                    <Sparkles size={16} className="text-blue-600" />
                    Usar este modelo
                  </span>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between gap-3 bg-white border-t border-gray-100 mt-auto">
                <div className="min-w-0">
                  <h3 className="font-bold text-gray-900 truncate">{template.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{template.category}</p>
                </div>
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUseTemplate(template.id);
                  }}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <span>Usar</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
