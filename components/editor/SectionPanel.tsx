'use client';
import { useEffect, useState } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { User, Briefcase, GraduationCap, Code, Plus, GripVertical, Eye, EyeOff, Trash2 } from 'lucide-react';
import { generateId } from '@/lib/utils';
import { Section } from '@/types/resume';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

import { useMounted } from '@/lib/useMounted';

const getDefaultItemTitle = (type: string) => {
  switch (type) {
    case 'experience': return 'Nova Experiência';
    case 'education': return 'Nova Formação Acadêmica';
    case 'projects': return 'Projeto Exemplo';
    case 'skills': return 'Nova Habilidade';
    case 'languages': return 'Novo Idioma';
    case 'certifications': return 'Nova Certificação';
    case 'courses': return 'Novo Curso';
    default: return 'Nova Entrada';
  }
};

export function SectionPanel() {
  const { document, selectedSectionId, selectSection, addSection, updateSection, removeSection, reorderSections } = useEditorStore();
  const mounted = useMounted();

  if (!document || !mounted) return null;

  const handleAddSection = (type: Section['type'] = 'custom', title: string = 'Nova Seção') => {
    const newSection: Section = {
      id: generateId(),
      type,
      title,
      visible: true,
      order: document.sections.length,
      items: [
        { id: generateId(), title: getDefaultItemTitle(type) }
      ]
    };
    addSection(newSection);
    selectSection(newSection.id);
    setShowAddMenu(false);
  };

  const [showAddMenu, setShowAddMenu] = useState(false);

  const handleDeleteSection = (e: React.MouseEvent, sectionId: string) => {
    e.stopPropagation();
    removeSection(sectionId);
    if (selectedSectionId === sectionId) {
      selectSection(null);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'experience': return <Briefcase size={16} />;
      case 'education': return <GraduationCap size={16} />;
      case 'skills': return <Code size={16} />;
      case 'certifications': return <GraduationCap size={16} />;
      case 'courses': return <GraduationCap size={16} />;
      case 'languages': return <User size={16} />;
      case 'volunteering': return <User size={16} />;
      case 'hobbies': return <User size={16} />;
      case 'awards': return <Briefcase size={16} />;
      case 'references': return <User size={16} />;
      default: return <User size={16} />;
    }
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    if (sourceIndex === destinationIndex) return;

    reorderSections(
      document.sections[sourceIndex].id,
      document.sections[destinationIndex].id
    );
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b shrink-0 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">Estrutura</h2>
        <button 
          onClick={() => handleAddSection('custom', 'Nova Seção')}
          className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          title="Adicionar Seção"
        >
          <Plus size={16} />
        </button>
      </div>
      
      <div className="p-3 flex flex-col gap-1 overflow-y-auto flex-1">
        <div 
          onClick={() => selectSection('personalInfo')}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${selectedSectionId === 'personalInfo' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
        >
          <User size={16} className={selectedSectionId === 'personalInfo' ? 'text-blue-600' : 'text-gray-400'} />
          <span className="flex-1 text-sm">Dados Pessoais</span>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="sections">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="flex flex-col gap-1 mt-1">
                {document.sections.map((section, index) => (
                  <Draggable key={section.id} draggableId={section.id} index={index}>
                    {(provided) => (
                      <div 
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        onClick={() => selectSection(section.id)}
                        className={`flex items-center gap-1.5 px-2 py-2.5 rounded-lg cursor-pointer transition-colors group ${selectedSectionId === section.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                      >
                        <div {...provided.dragHandleProps} className="text-gray-400 cursor-grab active:cursor-grabbing hover:text-gray-600 p-1 rounded">
                           <GripVertical size={16} />
                        </div>
                        
                        <div className="text-gray-400">
                           {getIcon(section.type)}
                        </div>
                        
                        <span className={`flex-1 text-sm truncate ml-1 ${!section.visible ? 'opacity-50 line-through' : ''}`}>
                          {section.title}
                        </span>
                        
                        <button 
                          type="button"
                          onClick={(e) => { e.stopPropagation(); updateSection(section.id, { visible: !section.visible }); }}
                          className={`p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${section.visible ? 'text-gray-400 hover:text-gray-600' : 'text-gray-400'}`}
                          title={section.visible ? "Ocultar seção" : "Exibir seção"}
                        >
                          {section.visible ? <Eye size={14} /> : <EyeOff size={14} className="opacity-100" />}
                        </button>

                        <button 
                          type="button"
                          onClick={(e) => handleDeleteSection(e, section.id)}
                          className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Excluir seção"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
      
      <div className="p-4 border-t bg-gray-50 shrink-0 relative">
        {showAddMenu && (
          <div className="absolute bottom-full mb-2 left-4 right-4 bg-white rounded-lg shadow-xl border border-gray-200 p-2 z-10 flex flex-col gap-1">
            <h3 className="text-xs font-semibold text-gray-500 uppercase px-2 py-1">Tipos de Seção</h3>
            <button onClick={() => handleAddSection('experience', 'Experiência Profissional')} className="text-left px-2 py-1.5 text-sm hover:bg-gray-50 rounded">💼 Experiência</button>
            <button onClick={() => handleAddSection('education', 'Formação Acadêmica')} className="text-left px-2 py-1.5 text-sm hover:bg-gray-50 rounded">🎓 Formação</button>
            <button onClick={() => handleAddSection('skills', 'Habilidades')} className="text-left px-2 py-1.5 text-sm hover:bg-gray-50 rounded">💻 Habilidades</button>
            <button onClick={() => handleAddSection('languages', 'Idiomas')} className="text-left px-2 py-1.5 text-sm hover:bg-gray-50 rounded">🗣️ Idiomas</button>
            <button onClick={() => handleAddSection('certifications', 'Certificações')} className="text-left px-2 py-1.5 text-sm hover:bg-gray-50 rounded">📜 Certificações</button>
            <button onClick={() => handleAddSection('courses', 'Cursos Extra')} className="text-left px-2 py-1.5 text-sm hover:bg-gray-50 rounded">📚 Cursos</button>
            <button onClick={() => handleAddSection('projects', 'Projetos')} className="text-left px-2 py-1.5 text-sm hover:bg-gray-50 rounded">🚀 Projetos</button>
            <button onClick={() => handleAddSection('volunteering', 'Trabalho Voluntário')} className="text-left px-2 py-1.5 text-sm hover:bg-gray-50 rounded">🤝 Voluntariado</button>
            <button onClick={() => handleAddSection('custom', 'Nova Seção')} className="text-left px-2 py-1.5 text-sm hover:bg-gray-50 rounded">✨ Seção Personalizada</button>
          </div>
        )}
        <button 
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="w-full py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={16} /> Adicionar Seção
        </button>
      </div>
    </div>
  );
}
