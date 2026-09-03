'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useEditorStore } from '@/store/useEditorStore';
import { EditorShell } from '@/components/editor/EditorShell';
import { useMounted } from '@/lib/useMounted';
import { FileText, ArrowLeft } from 'lucide-react';

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const documentId = params?.documentId as string | undefined;
  const loadDocument = useEditorStore((state) => state.loadDocument);
  const document = useEditorStore((state) => state.document);
  const mounted = useMounted();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (documentId) {
      loadDocument(documentId);
    }
  }, [documentId, loadDocument]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimedOut(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted || !document) {
    if (timedOut && !document) {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileText size={32} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Currículo não encontrado</h2>
            <p className="text-sm text-gray-500 mt-1 max-w-sm">
              O currículo solicitado não pôde ser carregado. Você pode criar um novo currículo ou retornar à tela inicial.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-2xs"
            >
              <ArrowLeft size={16} />
              Voltar ao Início
            </button>
            <button
              type="button"
              onClick={() => router.push('/templates')}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-2xs"
            >
              Escolher Modelo
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-medium text-gray-500">Carregando currículo...</span>
      </div>
    );
  }

  return <EditorShell />;
}
