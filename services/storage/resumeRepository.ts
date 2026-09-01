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

function getCachedAll(): ResumeDocument[] {
  if (typeof window === 'undefined') return EMPTY_SNAPSHOT;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== lastRawData) {
      lastRawData = raw;
      cachedResumes = raw ? JSON.parse(raw) : EMPTY_SNAPSHOT;
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
