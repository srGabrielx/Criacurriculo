import { useEffect, useRef } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { resumeRepository } from '@/services/storage/resumeRepository';

export function useAutosave() {
  const document = useEditorStore(state => state.document);
  const setSaveStatus = useEditorStore(state => state.setSaveStatus);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (!document) return;

    setSaveStatus('saving');
    
    if (timerRef.current) clearTimeout(timerRef.current);
    
    timerRef.current = setTimeout(() => {
      try {
        resumeRepository.save(document);
        setSaveStatus('saved');
      } catch(e) {
        setSaveStatus('error');
      }
    }, 1000);

    return () => clearTimeout(timerRef.current);
  }, [document, setSaveStatus]);
}
