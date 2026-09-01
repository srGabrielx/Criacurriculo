'use client';
import { useEffect, useState } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { Image as ImageIcon, Link as LinkIcon, Trash2, Plus, GripVertical, ArrowLeft } from 'lucide-react';
import { generateId } from '@/lib/utils';
import { SectionItem } from '@/types/resume';
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

export function PropertiesPanel() {
  const { 
    document, 
    selectedSectionId, 
    selectedBlockId, 
    selectSection,
    updatePersonalInfo, 
    updateSection,
    removeSection,
    updateSectionItem,
    addSectionItem,
    removeSectionItem,
    reorderSectionItems
  } = useEditorStore();
  
  const mounted = useMounted();

  if (!document || !selectedSectionId || !mounted) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6 text-center">
        <p className="text-sm">Selecione um elemento no currículo para editar suas propriedades.</p>
      </div>
    );
  }

  if (selectedSectionId === 'personalInfo') {
    const info = document.personalInfo;
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="font-bold text-gray-900">Informações Pessoais</h3>
            <button
              type="button"
              onClick={() => {
                selectSection(null);
                useEditorStore.getState().setMobileTab('sections');
              }}
              className="lg:hidden text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-md"
            >
              <ArrowLeft size={13} />
              <span>Voltar</span>
            </button>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-500 uppercase">Nome Completo</label>
            <input type="text" value={info.name} onChange={e => updatePersonalInfo('name', e.target.value)} className="w-full border rounded-lg p-2 text-sm" />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-500 uppercase">Título Profissional</label>
            <input type="text" value={info.headline} onChange={e => updatePersonalInfo('headline', e.target.value)} className="w-full border rounded-lg p-2 text-sm" />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-500 uppercase">Destaque do Título</label>
            <input type="text" value={info.headlineAccent || ''} onChange={e => updatePersonalInfo('headlineAccent', e.target.value)} className="w-full border rounded-lg p-2 text-sm" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-500 uppercase">Resumo Profissional</label>
            <textarea value={info.description} onChange={e => updatePersonalInfo('description', e.target.value)} className="w-full border rounded-lg p-2 text-sm min-h-[100px]" />
          </div>

          <div className="flex flex-col gap-2 mt-2">
            <label className="text-xs font-semibold text-gray-500 uppercase">Foto do Perfil</label>
            
            <div className="flex flex-col gap-3 p-3 bg-gray-50 border rounded-lg">
              {info.photo && (
                <div className="flex items-center gap-3 p-2 bg-white rounded-lg border">
                  <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 border bg-gray-100 shadow-2xs">
                    <img 
                      src={info.photo} 
                      alt="Preview" 
                      className="w-full h-full object-cover object-center" 
                    />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-xs font-semibold text-gray-700">Foto selecionada</span>
                    <span className="text-[11px] text-emerald-600 font-medium">Ativa no currículo</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => updatePersonalInfo('photo', '')}
                    className="text-xs text-red-600 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-md font-medium transition-colors"
                    title="Remover foto do perfil"
                  >
                    Remover
                  </button>
                </div>
              )}

              <label className="flex items-center justify-center gap-2 cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-700 bg-white hover:bg-blue-50/50 py-2 px-3 rounded-lg border border-dashed border-blue-300 transition-colors">
                <ImageIcon size={16}/>
                <span>Carregar imagem do dispositivo</span>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        updatePersonalInfo('photo', reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
              
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <div className="h-px bg-gray-200 flex-1"></div>
                OU
                <div className="h-px bg-gray-200 flex-1"></div>
              </div>

              <div className="flex items-center gap-2">
                <LinkIcon size={16} className="text-gray-400 shrink-0"/>
                <input 
                  type="text" 
                  value={info.photo} 
                  onChange={e => updatePersonalInfo('photo', e.target.value)} 
                  placeholder="Endereço da imagem (URL)"
                  className="flex-1 bg-transparent border-b border-gray-300 focus:border-blue-500 text-sm outline-none px-1 py-1" 
                />
              </div>
            </div>
          </div>
          
          <h4 className="font-bold text-gray-900 border-b pb-2 mt-4">Contato</h4>
          
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-500 uppercase">E-mail</label>
            <input type="text" value={info.email} onChange={e => updatePersonalInfo('email', e.target.value)} className="w-full border rounded-lg p-2 text-sm" />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-500 uppercase">Telefone</label>
            <input type="text" value={info.phone} onChange={e => updatePersonalInfo('phone', e.target.value)} className="w-full border rounded-lg p-2 text-sm" />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-500 uppercase">Localização</label>
            <input type="text" value={info.location} onChange={e => updatePersonalInfo('location', e.target.value)} className="w-full border rounded-lg p-2 text-sm" />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-500 uppercase">Website</label>
            <input type="text" value={info.website || ''} onChange={e => updatePersonalInfo('website', e.target.value)} className="w-full border rounded-lg p-2 text-sm" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-500 uppercase">LinkedIn (URL)</label>
            <input type="text" value={info.linkedin || ''} onChange={e => updatePersonalInfo('linkedin', e.target.value)} className="w-full border rounded-lg p-2 text-sm" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-500 uppercase">GitHub (URL)</label>
            <input type="text" value={info.github || ''} onChange={e => updatePersonalInfo('github', e.target.value)} className="w-full border rounded-lg p-2 text-sm" />
          </div>

          <h4 className="font-bold text-gray-900 border-b pb-2 mt-4">Informações Adicionais</h4>
          
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-500 uppercase">Data de Nascimento / Idade</label>
            <input type="text" value={info.birthDate || ''} onChange={e => updatePersonalInfo('birthDate', e.target.value)} className="w-full border rounded-lg p-2 text-sm" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-500 uppercase">Nacionalidade</label>
            <input type="text" value={info.nationality || ''} onChange={e => updatePersonalInfo('nationality', e.target.value)} className="w-full border rounded-lg p-2 text-sm" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-500 uppercase">CNH (Carteira de Motorista)</label>
            <input type="text" value={info.drivingLicense || ''} onChange={e => updatePersonalInfo('drivingLicense', e.target.value)} className="w-full border rounded-lg p-2 text-sm" />
          </div>
        </div>
      </div>
    );
  }

  const section = document.sections.find(s => s.id === selectedSectionId);
  if (!section) return null;

  if (selectedBlockId) {
    const item = section.items.find(i => i.id === selectedBlockId);
    if (!item) return null;

    const renderFieldsByType = (type: string, item: SectionItem) => {
      if (type === 'skills' || type === 'hobbies') {
        return (
          <>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-500 uppercase">{type === 'hobbies' ? 'Hobby / Interesse' : 'Habilidade'}</label>
              <input type="text" value={item.title || ''} onChange={e => updateSectionItem(section.id, item.id, { title: e.target.value })} className="w-full border rounded-lg p-2 text-sm" />
            </div>
          </>
        );
      }
      
      if (type === 'languages') {
        return (
          <>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-500 uppercase">Idioma</label>
              <input type="text" value={item.title || ''} onChange={e => updateSectionItem(section.id, item.id, { title: e.target.value })} className="w-full border rounded-lg p-2 text-sm" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-500 uppercase">Nível (ex: Fluente, Nativo)</label>
              <input type="text" value={item.subtitle || ''} onChange={e => updateSectionItem(section.id, item.id, { subtitle: e.target.value })} className="w-full border rounded-lg p-2 text-sm" />
            </div>
          </>
        );
      }

      // Default for experience, education, projects, custom, certifications, volunteering, etc
      return (
        <>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-500 uppercase">Título (Cargo, Curso, Certificado, etc)</label>
            <input type="text" value={item.title || ''} onChange={e => updateSectionItem(section.id, item.id, { title: e.target.value })} className="w-full border rounded-lg p-2 text-sm" />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-500 uppercase">Subtítulo (Instituição, Empresa, etc)</label>
            <input type="text" value={item.subtitle || ''} onChange={e => updateSectionItem(section.id, item.id, { subtitle: e.target.value })} className="w-full border rounded-lg p-2 text-sm" />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-500 uppercase">Período (Início - Fim)</label>
            <input type="text" value={item.date || ''} onChange={e => updateSectionItem(section.id, item.id, { date: e.target.value })} className="w-full border rounded-lg p-2 text-sm" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-500 uppercase">Localização (Cidade/UF)</label>
            <input type="text" value={item.location || ''} onChange={e => updateSectionItem(section.id, item.id, { location: e.target.value })} className="w-full border rounded-lg p-2 text-sm" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-500 uppercase">URL (Link do Projeto/Curso)</label>
            <input type="text" value={item.url || ''} onChange={e => updateSectionItem(section.id, item.id, { url: e.target.value })} className="w-full border rounded-lg p-2 text-sm" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-500 uppercase">Tags/Competências (Separadas por vírgula)</label>
            <input type="text" value={item.tags || ''} onChange={e => updateSectionItem(section.id, item.id, { tags: e.target.value })} placeholder="Ex: React, Node.js, Liderança" className="w-full border rounded-lg p-2 text-sm" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-500 uppercase">Descrição</label>
            <textarea value={item.description || ''} onChange={e => updateSectionItem(section.id, item.id, { description: e.target.value })} className="w-full border rounded-lg p-2 text-sm min-h-[120px]" />
          </div>
        </>
      );
    };

    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b pb-2">
             <div className="flex items-center gap-2">
               <button
                 type="button"
                 onClick={() => useEditorStore.getState().selectBlock(null)}
                 className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-md"
               >
                 <ArrowLeft size={13} />
                 <span>Lista</span>
               </button>
               <h3 className="font-bold text-gray-900">Editar Item</h3>
             </div>
             <button 
               onClick={() => {
                 removeSectionItem(section.id, item.id);
                 useEditorStore.getState().selectBlock(null);
               }}
               className="text-red-500 p-1 hover:bg-red-50 rounded"
             >
               <Trash2 size={16}/>
             </button>
          </div>
          
          {renderFieldsByType(section.type, item)}
          
        </div>
      </div>
    );
  }

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    if (sourceIndex === destinationIndex) return;

    reorderSectionItems(
      section.id,
      section.items[sourceIndex].id,
      section.items[destinationIndex].id
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between border-b pb-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                selectSection(null);
                useEditorStore.getState().setMobileTab('sections');
              }}
              className="lg:hidden text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-md"
            >
              <ArrowLeft size={13} />
              <span>Voltar</span>
            </button>
            <h3 className="font-bold text-gray-900">Seção: {section.title}</h3>
          </div>
          <button 
            type="button"
            onClick={() => {
              removeSection(section.id);
              selectSection(null);
            }}
            className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
            title="Excluir esta seção"
          >
            <Trash2 size={14} />
            <span className="hidden sm:inline">Excluir</span>
          </button>
        </div>
        
        <div className="flex flex-col gap-2 mb-4">
          <label className="text-xs font-semibold text-gray-500 uppercase">Título da Seção</label>
          <input type="text" value={section.title} onChange={e => updateSection(section.id, { title: e.target.value })} className="w-full border rounded-lg p-2 text-sm" />
        </div>

        <div className="flex flex-col gap-2">
           <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-500 uppercase">Itens da Seção ({section.items.length})</label>
              <button 
                type="button"
                onClick={() => addSectionItem(section.id, { id: generateId(), title: getDefaultItemTitle(section.type) })}
                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                title="Adicionar entrada"
              >
                <Plus size={16}/>
              </button>
           </div>
           
           <div className="flex flex-col gap-2">
             <DragDropContext onDragEnd={onDragEnd}>
               <Droppable droppableId={`items-${section.id}`}>
                 {(provided) => (
                   <div {...provided.droppableProps} ref={provided.innerRef} className="flex flex-col gap-2">
                     {section.items.map((item, index) => (
                       <Draggable key={item.id} draggableId={item.id} index={index}>
                         {(provided) => (
                           <div 
                             ref={provided.innerRef}
                             {...provided.draggableProps}
                             className="flex items-center justify-between p-2 border rounded-lg hover:border-blue-300 bg-gray-50 group"
                           >
                              <div {...provided.dragHandleProps} className="text-gray-400 cursor-grab active:cursor-grabbing px-1 hover:text-gray-600">
                                <GripVertical size={14} />
                              </div>
                              <span className="text-sm truncate flex-1 font-medium text-gray-700 ml-1">{item.title || 'Sem título'}</span>
                              <div className="flex items-center gap-1">
                                <button 
                                  type="button"
                                  onClick={() => {
                                    useEditorStore.getState().selectBlock(item.id);
                                  }} 
                                  className="text-blue-600 text-xs font-medium px-2 py-1 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                                >
                                  Editar
                                </button>
                                <button 
                                  type="button"
                                  onClick={() => removeSectionItem(section.id, item.id)}
                                  className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                  title="Excluir item"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                           </div>
                         )}
                       </Draggable>
                     ))}
                     {provided.placeholder}
                   </div>
                 )}
               </Droppable>
             </DragDropContext>
             
             {section.items.length === 0 && (
               <div className="text-xs text-gray-400 text-center py-4 border border-dashed rounded-lg">Nenhum item nesta seção</div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
}
