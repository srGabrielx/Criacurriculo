'use client';
import { useEffect, useState } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { Image as ImageIcon, Link as LinkIcon, Trash2, Plus, GripVertical, ArrowLeft, Check, Upload, Maximize2, Crop, Circle, Square } from 'lucide-react';
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

  if (!document || !mounted) {
    return null;
  }

  if (!selectedSectionId) {
    return (
      <div className="flex flex-col gap-4 p-2">
        <div className="text-center py-2 border-b border-gray-100">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Escolha uma seção para editar</p>
        </div>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => selectSection('personalInfo')}
            className="w-full text-left p-3 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all flex items-center justify-between group"
          >
            <div>
              <p className="font-semibold text-sm text-gray-900 group-hover:text-blue-600">Dados Pessoais</p>
              <p className="text-xs text-gray-500 mt-0.5">Nome, foto, contatos e links</p>
            </div>
            <ArrowLeft size={16} className="text-gray-400 group-hover:text-blue-600 rotate-180 transition-transform" />
          </button>
          {document.sections.map(sec => (
            <button
              key={sec.id}
              type="button"
              onClick={() => selectSection(sec.id)}
              className="w-full text-left p-3 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all flex items-center justify-between group"
            >
              <div>
                <p className="font-semibold text-sm text-gray-900 group-hover:text-blue-600">{sec.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{sec.items.length} {sec.items.length === 1 ? 'item' : 'itens'}</p>
              </div>
              <ArrowLeft size={16} className="text-gray-400 group-hover:text-blue-600 rotate-180 transition-transform" />
            </button>
          ))}
        </div>
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
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Foto do Perfil</label>
              {info.photo && (
                <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                  <Check size={12} />
                  Ativa no currículo
                </span>
              )}
            </div>
            
            <div className="flex flex-col gap-3.5 p-3.5 bg-slate-50/80 border border-slate-200 rounded-xl">
              {info.photo ? (
                <div className="flex flex-col gap-3">
                  {/* Prévia da imagem inteira sem cortes */}
                  <div className="relative w-full h-48 bg-slate-100/90 rounded-xl border border-slate-200/90 p-2 flex items-center justify-center overflow-hidden group">
                    <img 
                      src={info.photo} 
                      alt="Prévia da foto" 
                      className={`max-w-full max-h-full transition-all duration-200 shadow-2xs ${
                        info.photoShape === 'circle' 
                          ? 'rounded-full aspect-square' 
                          : info.photoShape === 'square' 
                            ? 'rounded-none' 
                            : 'rounded-lg'
                      } ${
                        info.photoFit === 'cover' 
                          ? 'w-full h-full object-cover' 
                          : 'w-auto h-auto object-contain'
                      }`} 
                    />

                    {/* Tag informativa de enquadramento */}
                    <div className="absolute top-2 left-2 bg-slate-900/70 text-white text-[10px] px-2 py-0.5 rounded-md backdrop-blur-xs flex items-center gap-1 font-medium">
                      {info.photoFit === 'cover' ? (
                        <>
                          <Maximize2 size={10} />
                          <span>Preenchendo quadro</span>
                        </>
                      ) : (
                        <>
                          <Check size={10} className="text-emerald-400" />
                          <span>Exibindo imagem inteira</span>
                        </>
                      )}
                    </div>

                    {/* Botão de remoção rápida */}
                    <button 
                      type="button"
                      onClick={() => updatePersonalInfo('photo', '')}
                      className="absolute top-2 right-2 bg-white/90 hover:bg-red-50 text-slate-500 hover:text-red-600 p-1.5 rounded-lg border border-slate-200 shadow-xs transition-colors"
                      title="Remover foto do perfil"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Controles de Enquadramento e Conflito de Espaço */}
                  <div className="grid grid-cols-1 gap-2.5 pt-1">
                    {/* Modo de ajuste (Fit): Inteira vs Preencher */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[11px] font-semibold text-slate-600">Enquadramento</span>
                      <div className="grid grid-cols-2 gap-1.5 bg-slate-200/60 p-1 rounded-lg">
                        <button
                          type="button"
                          onClick={() => updatePersonalInfo('photoFit', 'contain')}
                          className={`py-1.5 px-2 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${
                            (info.photoFit || 'contain') === 'contain'
                              ? 'bg-white text-blue-700 shadow-2xs font-semibold'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <Crop size={13} />
                          <span>Inteira (Sem cortes)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => updatePersonalInfo('photoFit', 'cover')}
                          className={`py-1.5 px-2 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${
                            info.photoFit === 'cover'
                              ? 'bg-white text-blue-700 shadow-2xs font-semibold'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <Maximize2 size={13} />
                          <span>Preencher quadro</span>
                        </button>
                      </div>
                    </div>

                    {/* Tamanho no currículo (sem conflito por espaço) */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-600">Espaço no Currículo</span>
                        <span className="text-[10px] text-slate-400">Sem encavalar com texto</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1 bg-slate-200/60 p-1 rounded-lg text-center">
                        <button
                          type="button"
                          onClick={() => updatePersonalInfo('photoSize', 'sm')}
                          className={`py-1 px-2 text-xs rounded-md transition-all ${
                            info.photoSize === 'sm'
                              ? 'bg-white text-blue-700 shadow-2xs font-semibold'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                          title="Compacto: libera o máximo de espaço para o texto"
                        >
                          Compacto
                        </button>
                        <button
                          type="button"
                          onClick={() => updatePersonalInfo('photoSize', 'md')}
                          className={`py-1 px-2 text-xs rounded-md transition-all ${
                            (info.photoSize || 'md') === 'md'
                              ? 'bg-white text-blue-700 shadow-2xs font-semibold'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                          title="Padrão: proporção harmônica ideal"
                        >
                          Padrão
                        </button>
                        <button
                          type="button"
                          onClick={() => updatePersonalInfo('photoSize', 'lg')}
                          className={`py-1 px-2 text-xs rounded-md transition-all ${
                            info.photoSize === 'lg'
                              ? 'bg-white text-blue-700 shadow-2xs font-semibold'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                          title="Grande: destaque executivo"
                        >
                          Destaque
                        </button>
                      </div>
                    </div>

                    {/* Formato da moldura */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[11px] font-semibold text-slate-600">Formato da Moldura</span>
                      <div className="grid grid-cols-3 gap-1 bg-slate-200/60 p-1 rounded-lg text-center">
                        <button
                          type="button"
                          onClick={() => updatePersonalInfo('photoShape', 'rounded')}
                          className={`py-1 px-2 text-xs rounded-md transition-all flex items-center justify-center gap-1 ${
                            (info.photoShape || 'rounded') === 'rounded'
                              ? 'bg-white text-blue-700 shadow-2xs font-semibold'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <span className="w-2.5 h-2.5 rounded-xs border border-current" />
                          <span>Arredondado</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => updatePersonalInfo('photoShape', 'circle')}
                          className={`py-1 px-2 text-xs rounded-md transition-all flex items-center justify-center gap-1 ${
                            info.photoShape === 'circle'
                              ? 'bg-white text-blue-700 shadow-2xs font-semibold'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <Circle size={11} />
                          <span>Círculo</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => updatePersonalInfo('photoShape', 'square')}
                          className={`py-1 px-2 text-xs rounded-md transition-all flex items-center justify-center gap-1 ${
                            info.photoShape === 'square'
                              ? 'bg-white text-blue-700 shadow-2xs font-semibold'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <Square size={11} />
                          <span>Reto</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Ação para trocar imagem */}
                  <label className="flex items-center justify-center gap-2 cursor-pointer text-xs font-medium text-slate-700 hover:text-blue-700 bg-white hover:bg-blue-50/50 py-2 px-3 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors shadow-2xs">
                    <Upload size={14} className="text-blue-600" />
                    <span>Substituir imagem</span>
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
                </div>
              ) : (
                /* Quando nenhuma foto está carregada */
                <label 
                  className="flex flex-col items-center justify-center gap-2.5 cursor-pointer text-center p-5 bg-white hover:bg-blue-50/40 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-400 transition-all shadow-2xs group"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        updatePersonalInfo('photo', reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                >
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <ImageIcon size={20} />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-semibold text-slate-800">Clique ou arraste sua foto aqui</span>
                    <span className="text-[11px] text-slate-500">Exibição completa sem cortes (JPG, PNG, WebP)</span>
                  </div>
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
              )}

              {/* Fotos de Exemplo rápidas */}
              <div className="flex flex-col gap-1.5 pt-1 border-t border-slate-200">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Exemplos Prontos</span>
                <div className="flex items-center gap-2">
                  {[
                    { label: 'Perfil 1', src: '/perfil.jpg' },
                    { label: 'Perfil 2', src: '/foto2.jpg' },
                    { label: 'Perfil 3', src: '/foto3.jpg' },
                  ].map((preset) => (
                    <button
                      key={preset.src}
                      type="button"
                      onClick={() => updatePersonalInfo('photo', preset.src)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1 px-1.5 text-[11px] rounded-lg border transition-all ${
                        info.photo === preset.src
                          ? 'bg-blue-50 border-blue-300 text-blue-700 font-semibold shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <img src={preset.src} alt="" className="w-4 h-4 rounded-full object-cover" />
                      <span className="truncate">{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Inserção manual por Link */}
              <div className="flex items-center gap-2 pt-1 border-t border-slate-200">
                <LinkIcon size={14} className="text-slate-400 shrink-0"/>
                <input 
                  type="text" 
                  value={info.photo} 
                  onChange={e => updatePersonalInfo('photo', e.target.value)} 
                  placeholder="Ou cole uma URL direta da foto"
                  className="flex-1 bg-transparent text-xs text-slate-700 placeholder:text-slate-400 outline-none px-1 py-1 border-b border-transparent focus:border-blue-500 transition-colors" 
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
