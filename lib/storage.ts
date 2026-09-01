import { ResumeDocument } from '@/types/resume';

const STORAGE_KEY = 'ai-studio-resumes';

export function getResumes(): ResumeDocument[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function getResume(id: string): ResumeDocument | undefined {
  const resumes = getResumes();
  return resumes.find(r => r.id === id);
}

export function saveResume(resume: ResumeDocument) {
  if (typeof window === 'undefined') return;
  const resumes = getResumes();
  const index = resumes.findIndex(r => r.id === resume.id);
  
  if (index >= 0) {
    resumes[index] = { ...resume, updatedAt: new Date().toISOString() };
  } else {
    resumes.push({ ...resume, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(resumes));
}

export function deleteResume(id: string) {
  if (typeof window === 'undefined') return;
  const resumes = getResumes();
  const filtered = resumes.filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}
