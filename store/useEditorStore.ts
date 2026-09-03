import { create } from 'zustand';
import { ResumeDocument, Section, SectionItem, PersonalInfo, Theme } from '@/types/resume';
import { resumeRepository } from '@/services/storage/resumeRepository';

interface EditorState {
  document: ResumeDocument | null;
  selectedSectionId: string | null;
  selectedBlockId: string | null;
  zoom: number;
  mobileTab: 'canvas' | 'sections' | 'properties' | 'design';
  previewMode: boolean;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  
  past: string[];
  future: string[];
  
  loadDocument: (id: string) => void;
  setSaveStatus: (status: 'idle' | 'saving' | 'saved' | 'error') => void;
  undo: () => void;
  redo: () => void;
  
  updateDocumentTitle: (title: string) => void;
  updatePersonalInfo: (field: keyof PersonalInfo, value: string) => void;
  updateSection: (sectionId: string, updates: Partial<Section>) => void;
  addSection: (section: Section) => void;
  removeSection: (sectionId: string) => void;
  addSectionItem: (sectionId: string, item: SectionItem) => void;
  updateSectionItem: (sectionId: string, itemId: string, itemUpdates: Partial<SectionItem>) => void;
  removeSectionItem: (sectionId: string, itemId: string) => void;
  reorderSectionItems: (sectionId: string, sourceId: string, targetId: string) => void;
  reorderSections: (sourceId: string, targetId: string) => void;
  
  selectSection: (id: string | null) => void;
  selectBlock: (id: string | null) => void;
  
  changeTemplate: (templateId: string) => void;
  updateTheme: (theme: Partial<Theme>) => void;
  setZoom: (zoom: number) => void;
  setMobileTab: (tab: 'canvas' | 'sections' | 'properties' | 'design') => void;
  togglePreviewMode: () => void;
}

let historyTimer: any = null;

const updateWithHistory = (set: any, get: any, updater: (doc: ResumeDocument) => ResumeDocument) => {
  const doc = get().document;
  if (!doc) return;
  
  const currentDocStr = JSON.stringify(doc);
  const newDoc = updater(doc);
  
  set({ document: newDoc });
  
  if (historyTimer) clearTimeout(historyTimer);
  historyTimer = setTimeout(() => {
    const currentState = get();
    const lastPast = currentState.past[currentState.past.length - 1];
    if (lastPast !== currentDocStr) {
      set((state: any) => ({
        past: [...state.past, currentDocStr],
        future: []
      }));
    }
  }, 500); 
};

export const useEditorStore = create<EditorState>((set, get) => ({
  document: null,
  selectedSectionId: null,
  selectedBlockId: null,
  zoom: 100,
  mobileTab: 'canvas',
  previewMode: false,
  saveStatus: 'idle',
  past: [],
  future: [],

  loadDocument: (id) => {
    let doc = resumeRepository.getById(id);
    if (!doc) {
      doc = resumeRepository.createDefaultDocument(id);
    }
    set({ 
      document: doc, 
      zoom: 100, 
      past: [], 
      future: [], 
      saveStatus: 'idle',
      selectedSectionId: 'personalInfo'
    });
  },
  
  setSaveStatus: (status) => set({ saveStatus: status }),

  undo: () => {
    set((state) => {
      if (state.past.length === 0 || !state.document) return state;
      const previousStr = state.past[state.past.length - 1];
      const newPast = state.past.slice(0, -1);
      return {
        past: newPast,
        future: [JSON.stringify(state.document), ...state.future],
        document: JSON.parse(previousStr)
      };
    });
  },

  redo: () => {
    set((state) => {
      if (state.future.length === 0 || !state.document) return state;
      const nextStr = state.future[0];
      const newFuture = state.future.slice(1);
      return {
        past: [...state.past, JSON.stringify(state.document)],
        future: newFuture,
        document: JSON.parse(nextStr)
      };
    });
  },

  updateDocumentTitle: (title) => updateWithHistory(set, get, (doc) => ({ ...doc, title })),
  
  updatePersonalInfo: (field, value) => updateWithHistory(set, get, (doc) => ({
    ...doc,
    personalInfo: { ...doc.personalInfo, [field]: value }
  })),

  updateSection: (sectionId, updates) => updateWithHistory(set, get, (doc) => ({
    ...doc,
    sections: doc.sections.map(s => s.id === sectionId ? { ...s, ...updates } : s)
  })),

  addSection: (section) => updateWithHistory(set, get, (doc) => ({
    ...doc,
    sections: [...doc.sections, section]
  })),

  removeSection: (sectionId) => updateWithHistory(set, get, (doc) => ({
    ...doc,
    sections: doc.sections.filter(s => s.id !== sectionId)
  })),

  addSectionItem: (sectionId, item) => updateWithHistory(set, get, (doc) => ({
    ...doc,
    sections: doc.sections.map(s => s.id === sectionId ? { ...s, items: [...s.items, item] } : s)
  })),

  updateSectionItem: (sectionId, itemId, itemUpdates) => updateWithHistory(set, get, (doc) => ({
    ...doc,
    sections: doc.sections.map(s => s.id === sectionId ? {
      ...s,
      items: s.items.map(i => i.id === itemId ? { ...i, ...itemUpdates } : i)
    } : s)
  })),

  removeSectionItem: (sectionId, itemId) => updateWithHistory(set, get, (doc) => ({
    ...doc,
    sections: doc.sections.map(s => s.id === sectionId ? { ...s, items: s.items.filter(i => i.id !== itemId) } : s)
  })),

  reorderSectionItems: (sectionId, sourceId, targetId) => updateWithHistory(set, get, (doc) => ({
    ...doc,
    sections: doc.sections.map(s => {
      if (s.id === sectionId) {
        const items = [...s.items];
        const sourceIndex = items.findIndex(i => i.id === sourceId);
        const targetIndex = items.findIndex(i => i.id === targetId);
        if (sourceIndex === -1 || targetIndex === -1) return s;
        const [moved] = items.splice(sourceIndex, 1);
        items.splice(targetIndex, 0, moved);
        return { ...s, items };
      }
      return s;
    })
  })),

  reorderSections: (sourceId, targetId) => updateWithHistory(set, get, (doc) => {
    const sections = [...doc.sections];
    const sourceIndex = sections.findIndex(s => s.id === sourceId);
    const targetIndex = sections.findIndex(s => s.id === targetId);
    if (sourceIndex === -1 || targetIndex === -1) return doc;
    const [moved] = sections.splice(sourceIndex, 1);
    sections.splice(targetIndex, 0, moved);
    return { ...doc, sections };
  }),

  selectSection: (id) => set((state) => ({ 
    selectedSectionId: id, 
    selectedBlockId: null, 
    mobileTab: id ? 'properties' : state.mobileTab 
  })),
  selectBlock: (id) => set((state) => ({ 
    selectedBlockId: id, 
    mobileTab: id ? 'properties' : state.mobileTab 
  })),

  changeTemplate: (templateId) => updateWithHistory(set, get, (doc) => ({
    ...doc, selectedTemplateId: templateId
  })),

  updateTheme: (themeUpdates: any) => updateWithHistory(set, get, (doc) => {
    const { padding, background, ...restTheme } = themeUpdates;
    const newSettings = {
      ...doc.settings,
      padding: padding !== undefined ? padding : doc.settings?.padding,
      background: background !== undefined ? background : (doc.settings as any)?.background,
      theme: {
        ...(doc.settings?.theme || {}),
        ...restTheme,
        ...(background !== undefined ? { background } : {})
      }
    };
    return { ...doc, settings: newSettings };
  }),
  
  setZoom: (zoom) => set({ zoom }),
  setMobileTab: (tab) => set({ mobileTab: tab }),
  togglePreviewMode: () => set(state => ({ previewMode: !state.previewMode }))
}));
