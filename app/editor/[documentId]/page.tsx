'use client';
import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useEditorStore } from '@/store/useEditorStore';
import { EditorShell } from '@/components/editor/EditorShell';
import { useMounted } from '@/lib/useMounted';

export default function EditorPage() {
  const params = useParams();
  const documentId = params?.documentId as string | undefined;
  const loadDocument = useEditorStore((state) => state.loadDocument);
  const document = useEditorStore((state) => state.document);
  const mounted = useMounted();

  useEffect(() => {
    if (documentId) {
      loadDocument(documentId);
    }
  }, [documentId, loadDocument]);

  if (!mounted || !document) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-medium text-gray-500">Carregando currículo...</span>
      </div>
    );
  }

  return <EditorShell />;
}
