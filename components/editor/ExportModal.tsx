'use client';
import { useState } from 'react';
import { ResumeDocument } from '@/types/resume';
import { 
  exportToPdf, 
  exportToImage, 
  exportToJson, 
  printResumeNative 
} from '@/lib/exportResume';
import { 
  Download, Printer, Image as ImageIcon, FileCode, X, 
  CheckCircle2, Sparkles, Loader2, AlertCircle, FileCheck, HelpCircle,
  FileText, Copy
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: ResumeDocument;
}

export function ExportModal({ isOpen, onClose, document }: ExportModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStatus, setProgressStatus] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fitOnePage, setFitOnePage] = useState<boolean>(true);

  if (!isOpen) return null;

  const handleDownloadPdf = async () => {
    try {
      setIsProcessing(true);
      setErrorMessage(null);
      await exportToPdf(document, 'resume-print-document', {
        fitOnePage,
        onProgress: (status) => setProgressStatus(status)
      });
      setTimeout(() => {
        setIsProcessing(false);
        setProgressStatus('');
        onClose();
      }, 700);
    } catch (err: any) {
      console.error('Erro ao gerar PDF:', err);
      setErrorMessage(err?.message || 'Ocorreu um erro ao gerar o arquivo PDF. Tente a opção de impressão nativa.');
      setIsProcessing(false);
    }
  };

  const handleNativePrint = () => {
    setIsProcessing(true);
    setProgressStatus('Preparando diálogo de impressão A4...');
    setTimeout(() => {
      printResumeNative({ fitOnePage });
      setIsProcessing(false);
      setProgressStatus('');
      onClose();
    }, 200);
  };

  const handleDownloadImage = async () => {
    try {
      setIsProcessing(true);
      setErrorMessage(null);
      await exportToImage(document, 'resume-print-document', (status) => {
        setProgressStatus(status);
      });
      setTimeout(() => {
        setIsProcessing(false);
        setProgressStatus('');
        onClose();
      }, 700);
    } catch (err: any) {
      console.error('Erro ao gerar imagem:', err);
      setErrorMessage(err?.message || 'Ocorreu um erro ao gerar a imagem PNG.');
      setIsProcessing(false);
    }
  };

  const handleDownloadJson = () => {
    exportToJson(document);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92dvh] overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between shrink-0 bg-gray-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Download size={20} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
                Exportar Currículo
              </h2>
              <p className="text-xs text-gray-500">
                Formato padrão ISO A4 (210mm x 297mm)
              </p>
            </div>
          </div>

          <button 
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Status / Loading Bar */}
        {isProcessing && (
          <div className="bg-blue-50 border-b border-blue-100 px-4 py-2.5 flex items-center gap-2.5 text-xs text-blue-700 font-medium animate-pulse">
            <Loader2 size={16} className="animate-spin text-blue-600 shrink-0" />
            <span>{progressStatus || 'Processando arquivo...'}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="bg-red-50 border-b border-red-100 px-4 py-2.5 flex items-start gap-2 text-xs text-red-700">
            <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* Opção 1: Baixar PDF Direto (Principal) */}
          <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/50 border-2 border-blue-500/40 rounded-2xl p-4 sm:p-5 relative transition-all hover:border-blue-600 shadow-xs">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900 text-sm sm:text-base">
                  Baixar Arquivo PDF (A4)
                </span>
              </div>
              <span className="inline-flex items-center gap-1 bg-blue-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-2xs">
                <Sparkles size={11} /> Recomendado
              </span>
            </div>

            <p className="text-xs text-gray-600 mb-3 leading-relaxed">
              Gera o arquivo <strong className="text-gray-800">.pdf</strong> com nitidez profissional (300 DPI) e proporção exata para não achatar fotos nem distorcer textos.
            </p>

            {/* Seletor de Páginas: 1 Página vs Múltiplas */}
            <div className="mb-3.5 bg-white/95 border border-blue-200/90 rounded-xl p-2.5 flex flex-col gap-1.5 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-950">
                Formato de Páginas
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFitOnePage(true)}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    fitOnePage 
                      ? 'bg-blue-600 text-white shadow-xs' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FileText size={14} />
                  <span>1 Página (Padrão)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFitOnePage(false)}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    !fitOnePage 
                      ? 'bg-blue-600 text-white shadow-xs' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Copy size={14} />
                  <span>Múltiplas Páginas</span>
                </button>
              </div>
              <p className="text-[11px] text-gray-500 leading-tight mt-0.5">
                {fitOnePage 
                  ? 'Garante que todo o currículo caiba exatamente em 1 folha A4 sem deformar fotos.' 
                  : 'Permite que o currículo se estenda por 2 ou mais páginas se o conteúdo for longo.'}
              </p>
            </div>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isProcessing}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow active:scale-[0.99] disabled:opacity-60"
            >
              {isProcessing && progressStatus.includes('PDF') ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>{progressStatus}</span>
                </>
              ) : (
                <>
                  <FileCheck size={17} />
                  <span>Baixar PDF Agora {fitOnePage ? '(1 Página)' : ''}</span>
                </>
              )}
            </button>
          </div>

          {/* Opção 2: Impressão Nativa do Sistema */}
          <div className="border border-gray-200 rounded-2xl p-4 hover:border-gray-300 transition-all bg-white">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2 font-bold text-gray-900 text-sm">
                <Printer size={16} className="text-gray-600" />
                <span>Imprimir / Salvar pelo Navegador</span>
              </div>
            </div>

            <p className="text-xs text-gray-500 mb-3 leading-relaxed">
              Abre o diálogo nativo do Android, Chrome ou Safari configurado em A4 Retrato sem cortes.
            </p>

            {/* Switch de ajuste de 1 página */}
            <label className="flex items-center gap-2 mb-3.5 cursor-pointer bg-gray-50 p-2.5 rounded-xl border border-gray-100 hover:bg-gray-100/70 transition-colors">
              <input 
                type="checkbox" 
                checked={fitOnePage} 
                onChange={(e) => setFitOnePage(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-xs text-gray-700 font-medium">
                Ajustar proporção para caber em 1 página
              </span>
            </label>

            <button
              type="button"
              onClick={handleNativePrint}
              disabled={isProcessing}
              className="w-full py-2.5 px-4 bg-gray-900 hover:bg-black text-white font-medium text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-60"
            >
              <Printer size={15} />
              <span>Abrir Painel de Impressão</span>
            </button>
          </div>

          {/* Opções Secundárias em Grid */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleDownloadImage}
              disabled={isProcessing}
              className="p-3 border border-gray-200 rounded-xl hover:bg-gray-50 text-left transition-colors flex flex-col gap-1 disabled:opacity-50"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
                <ImageIcon size={14} className="text-purple-600" />
                <span>Imagem (PNG)</span>
              </div>
              <span className="text-[11px] text-gray-500">
                Alta resolução (300 DPI)
              </span>
            </button>

            <button
              type="button"
              onClick={handleDownloadJson}
              disabled={isProcessing}
              className="p-3 border border-gray-200 rounded-xl hover:bg-gray-50 text-left transition-colors flex flex-col gap-1 disabled:opacity-50"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
                <FileCode size={14} className="text-emerald-600" />
                <span>Backup (JSON)</span>
              </div>
              <span className="text-[11px] text-gray-500">
                Salvar dados do currículo
              </span>
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 shrink-0">
          <div className="flex items-center gap-1">
            <CheckCircle2 size={13} className="text-emerald-500" />
            <span>Formatado para tamanho de folha A4</span>
          </div>
          <span className="text-gray-400">Dimensões: 210 x 297 mm</span>
        </div>
      </div>
    </div>
  );
}
