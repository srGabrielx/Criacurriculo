'use client';
import { useState } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { 
  ArrowLeft, Save, Undo, Redo, Download, Minus, Plus, 
  LayoutTemplate, Layers, FileText, Eye, EyeOff, Trash2, 
  AlertTriangle, X, Edit3, Maximize2, ZoomIn, ZoomOut
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { resumeRepository } from '@/services/storage/resumeRepository';
import { ResumeCanvas } from '../resume/ResumeCanvas';
import { PropertiesPanel } from './PropertiesPanel';
import { SectionPanel } from './SectionPanel';
import { DesignPanel } from './DesignPanel';
import { ExportModal } from './ExportModal';
import { useAutosave } from '@/hooks/useAutosave';
import { useHistoryShortcuts } from '@/hooks/useHistoryShortcuts';

export function EditorShell() {
  const { 
    document, 
    updateDocumentTitle, 
    zoom, 
    isAutoFit,
    requestFitToScreen,
    setZoom, 
    mobileTab, 
    setMobileTab, 
    selectedSectionId, 
    selectedBlockId, 
    selectSection, 
    previewMode, 
    togglePreviewMode, 
    saveStatus, 
    undo, 
    redo, 
    past, 
    future 
  } = useEditorStore();
  
  const [rightTab, setRightTab] = useState<'properties' | 'design'>('properties');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const router = useRouter();

  useAutosave();
  useHistoryShortcuts();

  if (!document) return null;

  const handleZoomIn = () => setZoom(Math.min(zoom + 20, 200));
  const handleZoomOut = () => setZoom(Math.max(zoom - 20, 35));

  const handleDeleteDocument = () => {
    resumeRepository.delete(document.id);
    setShowDeleteModal(false);
    router.push('/dashboard');
  };
  
  const isSheetOpen = selectedSectionId !== null || selectedBlockId !== null;

  return (
    <div className="h-[100dvh] w-full bg-[#f1f3f6] flex flex-col overflow-hidden text-sm print:bg-white print:h-auto print:overflow-visible font-sans antialiased">
      {/* Topbar Superior */}
      <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-2 md:px-4 shrink-0 shadow-xs z-30 print:hidden">
        <div className="flex items-center gap-1 md:gap-3 min-w-0">
          <Link 
            href="/dashboard" 
            className="p-2 text-gray-500 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-colors" 
            title="Voltar aos Currículos"
          >
            <ArrowLeft size={18} />
          </Link>
          
          <input 
            type="text" 
            value={document.title} 
            onChange={(e) => updateDocumentTitle(e.target.value)}
            className="font-semibold text-gray-900 bg-transparent border-transparent hover:border-gray-300 focus:border-blue-500 focus:bg-white border rounded-lg px-2 py-1 text-sm md:text-base w-36 sm:w-56 md:w-auto truncate outline-none transition-all"
            title="Clique para renomear"
          />

          <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium shrink-0">
            {saveStatus === 'saving' && <span className="text-gray-400">Salvando...</span>}
            {saveStatus === 'saved' && <span className="flex items-center gap-1 text-emerald-600"><Save size={13}/> Salvo</span>}
            {saveStatus === 'error' && <span className="text-red-500">Erro ao salvar</span>}
          </div>
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          {/* Zoom controls no desktop */}
          <div className="hidden lg:flex items-center bg-gray-100/80 rounded-xl p-0.5 border border-gray-200">
             <button 
               type="button"
               onClick={handleZoomOut} 
               className="p-1.5 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-white shadow-xs transition-all"
               title="Reduzir zoom"
             >
               <Minus size={13}/>
             </button>
             <button
               type="button"
               onClick={requestFitToScreen}
               className={`px-2 py-0.5 text-xs font-semibold text-center rounded-lg transition-all ${
                 isAutoFit ? 'bg-blue-600 text-white shadow-xs' : 'text-gray-700 hover:text-blue-600'
               }`}
               title="Clique para ajustar à largura da tela"
             >
               {zoom}%
             </button>
             <button 
               type="button"
               onClick={handleZoomIn} 
               className="p-1.5 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-white shadow-xs transition-all"
               title="Aumentar zoom"
             >
               <Plus size={13}/>
             </button>
          </div>

          <div className="hidden md:block w-px h-5 bg-gray-200 mx-1"></div>
          
          {/* Desfazer e Refazer */}
          <button 
            type="button"
            onClick={undo}
            disabled={past.length === 0}
            className="hidden sm:flex p-2 text-gray-500 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
            title="Desfazer (Ctrl+Z)"
          >
            <Undo size={16}/>
          </button>
          <button 
            type="button"
            onClick={redo}
            disabled={future.length === 0}
            className="hidden sm:flex p-2 text-gray-500 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
            title="Refazer (Ctrl+Shift+Z)"
          >
            <Redo size={16}/>
          </button>

          <div className="hidden sm:block w-px h-5 bg-gray-200 mx-1"></div>
          
          {/* Alternar Modo Leitura (Oculta bordas de edição) */}
          <button 
            type="button"
            onClick={togglePreviewMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium text-xs md:text-sm transition-all ${previewMode ? 'bg-blue-600 text-white shadow-xs' : 'text-gray-700 hover:bg-gray-100'}`}
            title={previewMode ? 'Voltar para o modo de edição com guias' : 'Ocultar caixas e linhas de edição para leitura limpa'}
          >
            {previewMode ? <Eye size={15}/> : <EyeOff size={15}/>}
            <span className="hidden md:inline">{previewMode ? 'Modo Leitura' : 'Modo Leitura'}</span>
          </button>
          
          {/* Botão Exportar com Modal A4 */}
          <button 
            type="button"
            onClick={() => setShowExportModal(true)} 
            className="flex items-center gap-1.5 px-3 md:px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-xs md:text-sm shadow-sm active:scale-95 transition-all"
            title="Exportar para PDF, Imprimir ou Imagem"
          >
            <Download size={15}/>
            <span>Exportar</span>
          </button>

          {/* Botão Excluir Currículo */}
          <button 
            type="button"
            onClick={() => setShowDeleteModal(true)} 
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors ml-0.5"
            title="Excluir currículo"
          >
            <Trash2 size={16}/>
          </button>
        </div>
      </header>

      {/* Área Principal de Trabalho */}
      <div className="flex flex-1 overflow-hidden relative print:overflow-visible">
        {/* Painel Esquerdo - Estrutura de Seções (Desktop >= 1024px) */}
        <aside className="hidden lg:flex w-[270px] bg-white border-r border-gray-200 shrink-0 z-10 transition-all print:hidden flex-col">
          <SectionPanel />
        </aside>

        {/* Canvas Central */}
        <main className="flex-1 overflow-hidden flex flex-col relative z-0 print:overflow-visible bg-[#f1f3f6]">
           <ResumeCanvas />
           
           {/* Barra de Controles Rápidos de Visualização Flutuante no Canvas */}
           <div 
             className="absolute bottom-20 right-3 sm:right-6 lg:bottom-8 lg:right-8 z-30 flex items-center bg-white/95 backdrop-blur-md border border-gray-300/80 shadow-xl rounded-2xl p-1 gap-1 print:hidden"
           >
             <button
               type="button"
               onClick={handleZoomOut}
               className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
               title="Diminuir Zoom (-)"
             >
               <ZoomOut size={16} />
             </button>

             <button
               type="button"
               onClick={requestFitToScreen}
               className={`px-2.5 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
                 isAutoFit 
                   ? 'bg-blue-600 text-white shadow-xs' 
                   : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
               }`}
               title="Ajustar automaticamente à largura da tela"
             >
               <Maximize2 size={13} />
               <span>{isAutoFit ? `Ajustado (${zoom}%)` : `Ajustar (${zoom}%)`}</span>
             </button>

             {zoom !== 100 && (
               <button
                 type="button"
                 onClick={() => setZoom(100)}
                 className="hidden sm:inline-flex px-2 py-1.5 text-xs font-semibold text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-xl transition-colors"
                 title="Restaurar tamanho real (100%)"
               >
                 100%
               </button>
             )}

             <button
               type="button"
               onClick={handleZoomIn}
               className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
               title="Aumentar Zoom (+)"
             >
               <ZoomIn size={16} />
             </button>
           </div>
        </main>

        {/* Painel Direito - Propriedades & Design (Desktop >= 1024px) */}
        <aside className="hidden lg:flex w-[330px] bg-white border-l border-gray-200 flex-col shrink-0 overflow-hidden z-10 shadow-xs print:hidden">
          <div className="flex border-b border-gray-200 shrink-0 bg-gray-50/50">
            <button 
              type="button"
              onClick={() => setRightTab('properties')} 
              className={`flex-1 py-3 px-4 font-semibold text-xs uppercase tracking-wider transition-all border-b-2 ${rightTab === 'properties' ? 'text-blue-600 border-blue-600 bg-white' : 'text-gray-500 border-transparent hover:text-gray-800'}`}
            >
              Propriedades
            </button>
            <button 
              type="button"
              onClick={() => setRightTab('design')} 
              className={`flex-1 py-3 px-4 font-semibold text-xs uppercase tracking-wider transition-all border-b-2 ${rightTab === 'design' ? 'text-blue-600 border-blue-600 bg-white' : 'text-gray-500 border-transparent hover:text-gray-800'}`}
            >
              Design & Cores
            </button>
          </div>
          <div className="p-4 flex flex-col flex-1 overflow-y-auto">
             {rightTab === 'properties' ? <PropertiesPanel /> : <DesignPanel />}
          </div>
        </aside>

        {/* Painel Mobile / Tablet de Edição (Seções / Design / Propriedades) */}
        {mobileTab !== 'canvas' && (
          <div className="lg:hidden absolute inset-0 bottom-[60px] bg-white z-40 flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-150 print:hidden">
            <div className="h-12 border-b border-gray-200 px-3 flex items-center justify-between bg-gray-50 shrink-0">
              <div className="flex items-center gap-2">
                {mobileTab === 'properties' && (
                  <button
                    type="button"
                    onClick={() => {
                      selectSection(null);
                      setMobileTab('sections');
                    }}
                    className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded-md transition-colors"
                  >
                    <ArrowLeft size={13} />
                    <span>Seções</span>
                  </button>
                )}
                <span className="font-bold text-gray-900 text-xs uppercase tracking-wider truncate max-w-[180px]">
                  {mobileTab === 'sections' 
                    ? 'Estrutura do Currículo' 
                    : mobileTab === 'design' 
                    ? 'Design & Cores' 
                    : selectedSectionId === 'personalInfo' 
                    ? 'Dados Pessoais' 
                    : 'Editar Seção'}
                </span>
              </div>

              <button 
                type="button"
                onClick={() => {
                  setMobileTab('canvas');
                  requestFitToScreen();
                }}
                className="px-2.5 py-1 bg-white border border-gray-300 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-100 flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Eye size={13} />
                <span>Ver Currículo</span>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {mobileTab === 'sections' && <SectionPanel />}
              {mobileTab === 'design' && <DesignPanel />}
              {mobileTab === 'properties' && (
                selectedSectionId ? <PropertiesPanel /> : <SectionPanel />
              )}
            </div>
          </div>
        )}

        {/* Barra de Navegação Inferior Móvel / Tablet - SEMPRE FIXA */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-[60px] bg-white/98 backdrop-blur-md border-t border-gray-200 flex items-center justify-around z-50 px-2 pb-safe shadow-[0_-4px_16px_rgba(0,0,0,0.06)] print:hidden">
          <button 
            type="button"
            onClick={() => {
              setMobileTab('canvas');
              requestFitToScreen();
            }}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${mobileTab === 'canvas' ? 'text-blue-600 font-bold' : 'text-gray-500 hover:text-gray-900'}`}
          >
            <FileText size={19} />
            <span className="text-[11px]">Currículo</span>
          </button>
          
          <button 
            type="button"
            onClick={() => setMobileTab(selectedSectionId ? 'properties' : 'sections')}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${mobileTab === 'sections' || mobileTab === 'properties' ? 'text-blue-600 font-bold' : 'text-gray-500 hover:text-gray-900'}`}
          >
            <Layers size={19} />
            <span className="text-[11px]">Seções & Dados</span>
          </button>

          <button 
            type="button"
            onClick={() => setMobileTab('design')}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${mobileTab === 'design' ? 'text-blue-600 font-bold' : 'text-gray-500 hover:text-gray-900'}`}
          >
            <LayoutTemplate size={19} />
            <span className="text-[11px]">Design & Cores</span>
          </button>
        </nav>
      </div>

      {/* Modal de Confirmação de Exclusão do Currículo */}
      {showDeleteModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowDeleteModal(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle size={24} />
              </div>
              <button 
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900">Excluir currículo?</h3>
              <p className="text-sm text-gray-500 mt-1">
                Tem certeza que deseja apagar <span className="font-semibold text-gray-800">&ldquo;{document.title}&rdquo;</span>? Você será redirecionado para a página inicial e todas as informações deste currículo serão apagadas permanentemente.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteDocument}
                className="px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors flex items-center gap-2 shadow-sm"
              >
                <Trash2 size={16} />
                Sim, excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Exportação Profissional A4 */}
      <ExportModal 
        isOpen={showExportModal} 
        onClose={() => setShowExportModal(false)} 
        document={document} 
      />
    </div>
  );
}
