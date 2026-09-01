'use client';
import { useState, useRef, useSyncExternalStore, DragEvent } from 'react';
import { resumeRepository } from '@/services/storage/resumeRepository';
import { ResumeDocument } from '@/types/resume';
import Link from 'next/link';
import { 
  FileText, Plus, Trash2, Edit2, Upload, Loader2, 
  AlertTriangle, X, Sparkles, CheckCircle2, FileUp 
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { templates } from '@/domain/template/registry';
import { TemplatePreview } from '@/components/resume/TemplatePreview';
import { generateId } from '@/lib/utils';
import { useMounted } from '@/lib/useMounted';

export default function DashboardPage() {
  const documents = useSyncExternalStore(
    resumeRepository.subscribe,
    resumeRepository.getSnapshot,
    resumeRepository.getServerSnapshot
  );
  const mounted = useMounted();
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState('Processando arquivo...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<ResumeDocument | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const openDeleteModal = (e: React.MouseEvent, doc: ResumeDocument) => {
    e.stopPropagation();
    e.preventDefault();
    setDocumentToDelete(doc);
  };

  const confirmDelete = () => {
    if (!documentToDelete) return;
    resumeRepository.delete(documentToDelete.id);
    setDocumentToDelete(null);
  };

  const processFile = async (file: File) => {
    if (!file) return;

    // Se for um arquivo JSON exportado diretamente
    if (file.name.toLowerCase().endsWith('.json') || file.type === 'application/json') {
      try {
        setIsImporting(true);
        setImportStatus('Lendo arquivo de dados JSON...');
        const text = await file.text();
        const json = JSON.parse(text);
        
        // Se já for um documento estruturado completo
        if (json.personalInfo && Array.isArray(json.sections)) {
          const now = new Date().toISOString();
          const newDoc: ResumeDocument = {
            id: generateId(),
            title: json.title || `Importado: ${file.name.replace(/\.[^/.]+$/, "")}`,
            selectedTemplateId: json.selectedTemplateId || 'modern-impact',
            createdAt: now,
            updatedAt: now,
            personalInfo: {
              name: json.personalInfo?.name || 'Sem Nome',
              headline: json.personalInfo?.headline || '',
              headlineAccent: json.personalInfo?.headlineAccent || '',
              description: json.personalInfo?.description || '',
              photo: json.personalInfo?.photo || '',
              location: json.personalInfo?.location || '',
              email: json.personalInfo?.email || '',
              website: json.personalInfo?.website || '',
              phone: json.personalInfo?.phone || '',
              linkedin: json.personalInfo?.linkedin || '',
              github: json.personalInfo?.github || '',
              birthDate: json.personalInfo?.birthDate || '',
              nationality: json.personalInfo?.nationality || '',
              drivingLicense: json.personalInfo?.drivingLicense || ''
            },
            sections: json.sections.map((s: any, idx: number) => ({
              id: generateId(),
              type: s.type || 'custom',
              title: s.title || 'Seção',
              visible: s.visible !== false,
              order: typeof s.order === 'number' ? s.order : idx,
              items: (s.items || []).map((item: any) => ({
                id: generateId(),
                ...item
              }))
            })),
            settings: json.settings || {
              format: 'A4',
              orientation: 'portrait',
              padding: 48,
              theme: {}
            }
          };

          resumeRepository.save(newDoc);
          router.push(`/editor/${newDoc.id}`);
          return;
        }
      } catch (jsonErr) {
        console.warn("JSON parsing on client failed, falling back to server API:", jsonErr);
      }
    }

    // Processamento via API inteligente (PDF, DOCX, TXT, Imagens ou JSON genérico)
    setIsImporting(true);
    setImportStatus('Enviando e analisando documento...');
    try {
      const formData = new FormData();
      formData.append('file', file);

      setTimeout(() => {
        setImportStatus('Extraindo dados profissionais com IA...');
      }, 1200);

      const response = await fetch('/api/import', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        throw new Error(errorJson.error || 'Falha ao processar o arquivo.');
      }

      setImportStatus('Construindo seu novo currículo...');
      const data = await response.json();
      
      const now = new Date().toISOString();
      const newDoc: ResumeDocument = {
        id: generateId(),
        title: `Importado: ${file.name.replace(/\.[^/.]+$/, "")}`,
        selectedTemplateId: 'modern-impact',
        createdAt: now,
        updatedAt: now,
        personalInfo: {
          name: data.personalInfo?.name || 'Sem Nome',
          headline: data.personalInfo?.headline || '',
          headlineAccent: data.personalInfo?.headlineAccent || '',
          description: data.personalInfo?.description || '',
          photo: data.personalInfo?.photo || '',
          location: data.personalInfo?.location || '',
          email: data.personalInfo?.email || '',
          website: data.personalInfo?.website || '',
          phone: data.personalInfo?.phone || '',
          linkedin: data.personalInfo?.linkedin || '',
          github: data.personalInfo?.github || '',
          birthDate: data.personalInfo?.birthDate || '',
          nationality: data.personalInfo?.nationality || '',
          drivingLicense: data.personalInfo?.drivingLicense || ''
        },
        sections: (data.sections || []).map((s: any, idx: number) => ({
          id: generateId(),
          type: s.type || 'custom',
          title: s.title || 'Seção',
          visible: true,
          order: idx,
          items: (s.items || []).map((item: any) => ({
            id: generateId(),
            ...item
          }))
        })),
        settings: {
          format: 'A4',
          orientation: 'portrait',
          padding: 48,
          theme: {}
        }
      };

      resumeRepository.save(newDoc);
      router.push(`/editor/${newDoc.id}`);
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error?.message || 'Não foi possível ler o arquivo. Certifique-se de que o documento não está corrompido ou protegido por senha.');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleImportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  if (!mounted) return null;

  return (
    <div 
      className="min-h-screen bg-gray-50 p-6 md:p-12 transition-colors relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Overlay de Drag & Drop */}
      {isDragging && (
        <div className="fixed inset-0 bg-blue-600/10 backdrop-blur-xs border-4 border-dashed border-blue-500 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-3 animate-in zoom-in-95 duration-150">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
              <FileUp size={32} />
            </div>
            <p className="text-lg font-bold text-gray-900">Solte seu currículo aqui</p>
            <p className="text-xs text-gray-500">Formatos aceitos: PDF, DOCX, TXT, JSON, MD, CSV, Imagens ou outro formato de texto</p>
          </div>
        </div>
      )}

      <div className="max-w-[1280px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-1">Meus currículos</h1>
            <p className="text-gray-500">Gerencie e crie novos documentos profissionais.</p>
          </div>
          <div className="flex items-center gap-3">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImportChange} 
              className="hidden" 
            />
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 active:scale-95 transition-all shadow-2xs disabled:opacity-50"
            >
              {isImporting ? <Loader2 size={18} className="animate-spin text-blue-600" /> : <Upload size={18} />}
              <span>Importar</span>
            </button>
            <Link 
              href="/templates" 
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 active:scale-95 transition-all shadow-2xs"
            >
              <Plus size={18} />
              <span>Novo currículo</span>
            </Link>
          </div>
        </div>

        {documents.length === 0 ? (
          <div className="bg-white border border-gray-200 border-dashed rounded-3xl p-10 md:p-14 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6">
              <FileText size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Nenhum currículo encontrado</h2>
            <p className="text-gray-500 max-w-md mb-8 text-sm">
              Você pode importar seu currículo atual em PDF, Word (DOCX) ou texto para preenchimento automático inteligente, ou escolher um novo modelo.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors shadow-2xs"
              >
                <Upload size={18} />
                <span>Importar arquivo existente</span>
              </button>
              <Link 
                href="/templates" 
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors shadow-2xs"
              >
                <Plus size={18} />
                <span>Escolher Modelo</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {documents.map((doc) => {
              const template = templates.find(t => t.id === doc.selectedTemplateId);
              return (
                <div 
                  key={doc.id} 
                  onClick={() => router.push(`/editor/${doc.id}`)}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs hover:shadow-md transition-all cursor-pointer group flex flex-col relative"
                >
                  <div className="aspect-[794/1123] bg-gray-100 relative border-b overflow-hidden">
                    {template ? (
                       <TemplatePreview templateId={template.id} document={doc} />
                    ) : (
                       <div className="w-full h-full flex items-center justify-center text-gray-400"><FileText size={48} /></div>
                    )}
                    
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                       <button 
                         type="button"
                         onClick={(e) => { e.stopPropagation(); router.push(`/editor/${doc.id}`); }}
                         className="p-2.5 bg-white text-gray-900 rounded-xl hover:bg-gray-100 transition-colors shadow"
                         title="Editar Currículo"
                       >
                         <Edit2 size={18} />
                       </button>
                       <button 
                         type="button"
                         onClick={(e) => openDeleteModal(e, doc)}
                         className="p-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors shadow"
                         title="Excluir Currículo"
                       >
                         <Trash2 size={18} />
                       </button>
                    </div>
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-semibold text-gray-900 truncate" title={doc.title}>{doc.title}</h3>
                    <p className="text-xs text-gray-500 mt-1 truncate">{template?.name || 'Template Desconhecido'}</p>
                    <div className="mt-auto pt-4 flex items-center justify-between text-xs text-gray-400">
                      <span>Atualizado em {new Date(doc.updatedAt).toLocaleDateString()}</span>
                      <button 
                        type="button"
                        onClick={(e) => openDeleteModal(e, doc)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir currículo"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Progresso da Importação */}
      {isImporting && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-8 shadow-2xl flex flex-col items-center text-center gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center relative">
              <Loader2 size={32} className="animate-spin text-blue-600" />
              <Sparkles size={16} className="absolute top-2 right-2 text-amber-500 animate-pulse" />
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-gray-900">Importando Currículo</h3>
              <p className="text-xs text-gray-500 mt-1">{importStatus}</p>
            </div>

            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mt-2">
              <div className="bg-blue-600 h-full w-2/3 animate-pulse rounded-full"></div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Erro amigável */}
      {errorMessage && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          onClick={() => setErrorMessage(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <AlertTriangle size={24} />
              </div>
              <button 
                onClick={() => setErrorMessage(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900">Não foi possível importar</h3>
              <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">
                {errorMessage}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Dica: Tente salvar o documento como PDF simples, Word (.docx) ou copiar o texto em um arquivo .txt.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100 mt-2">
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="px-5 py-2.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-xl transition-colors shadow-2xs"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {documentToDelete && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          onClick={() => setDocumentToDelete(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle size={24} />
              </div>
              <button 
                onClick={() => setDocumentToDelete(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900">Excluir currículo?</h3>
              <p className="text-sm text-gray-500 mt-1">
                Tem certeza que deseja apagar <span className="font-semibold text-gray-800">&ldquo;{documentToDelete.title}&rdquo;</span>? Esta ação não pode ser desfeita e todas as informações deste currículo serão perdidas.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDocumentToDelete(null)}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors flex items-center gap-2 shadow-2xs"
              >
                <Trash2 size={16} />
                Sim, excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
