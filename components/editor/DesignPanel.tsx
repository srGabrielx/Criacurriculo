'use client';
import { useEditorStore } from '@/store/useEditorStore';
import { templates, getTemplate } from '@/domain/template/registry';
import { TemplatePreview } from '../resume/TemplatePreview';
import { Palette, Type, Sliders, RotateCcw, Check, Sparkles, Eye } from 'lucide-react';

const PRESET_PALETTES = [
  {
    name: 'Azul Executivo',
    primary: '#0866E8',
    secondary: '#16B978',
    text: '#071533',
    muted: '#667085',
    border: '#E5E7EB',
    background: '#ffffff'
  },
  {
    name: 'Esmeralda Tech',
    primary: '#059669',
    secondary: '#0284c7',
    text: '#111827',
    muted: '#6b7280',
    border: '#e5e7eb',
    background: '#ffffff'
  },
  {
    name: 'Roxo Moderno',
    primary: '#7c3aed',
    secondary: '#db2777',
    text: '#18181b',
    muted: '#71717a',
    border: '#e4e4e7',
    background: '#ffffff'
  },
  {
    name: 'Noturno Executivo',
    primary: '#38bdf8',
    secondary: '#94a3b8',
    text: '#f8fafc',
    muted: '#cbd5e1',
    border: '#334155',
    background: '#0f172a'
  },
  {
    name: 'Grafite & Chumbo',
    primary: '#1e293b',
    secondary: '#475569',
    text: '#0f172a',
    muted: '#64748b',
    border: '#cbd5e1',
    background: '#ffffff'
  },
  {
    name: 'Carmim & Vinho',
    primary: '#be123c',
    secondary: '#d97706',
    text: '#1c1917',
    muted: '#78716c',
    border: '#e7e5e4',
    background: '#ffffff'
  },
  {
    name: 'Laranja Solar',
    primary: '#ea580c',
    secondary: '#0284c7',
    text: '#1c1917',
    muted: '#78716c',
    border: '#e7e5e4',
    background: '#ffffff'
  },
  {
    name: 'Minimal Monocromático',
    primary: '#000000',
    secondary: '#525252',
    text: '#171717',
    muted: '#737373',
    border: '#d4d4d4',
    background: '#ffffff'
  }
];

const FONTS = [
  { name: 'Inter (Moderna e Limpa)', value: 'Inter, sans-serif' },
  { name: 'Roboto (Geométrica e Neutra)', value: 'Roboto, sans-serif' },
  { name: 'Playfair Display (Elegante com Serifa)', value: '"Playfair Display", serif' },
  { name: 'Lora (Editorial e Refinada)', value: 'Lora, serif' },
  { name: 'Fira Code (Técnica / Monospace)', value: '"Fira Code", monospace' },
];

const BACKGROUND_OPTIONS = [
  { name: 'Branco Puro', value: '#ffffff' },
  { name: 'Off-White', value: '#fafafa' },
  { name: 'Papel Creme', value: '#fdfbf7' },
  { name: 'Cinza Suave', value: '#f8fafc' },
  { name: 'Dark / Noturno', value: '#0f172a' }
];

export function DesignPanel() {
  const { document, changeTemplate, updateTheme, setMobileTab } = useEditorStore();
  
  if (!document) return null;
  
  const template = getTemplate(document.selectedTemplateId) || getTemplate('modern-impact');
  const templateTheme = template?.theme || {
    primary: '#0866E8',
    secondary: '#16B978',
    text: '#071533',
    muted: '#667085',
    border: '#E5E7EB',
    radius: 18,
    fontFamily: 'Inter, sans-serif'
  };

  const currentTheme = { ...templateTheme, ...(document.settings?.theme || {}) };
  const currentBackground = (document.settings as any)?.background || (document.settings?.theme as any)?.background || template?.pageSettings.background || '#ffffff';
  const currentPadding = document.settings?.padding ?? template?.pageSettings.padding ?? 42;

  const handleResetToTemplate = () => {
    if (!template) return;
    useEditorStore.getState().updateTheme({
      primary: template.theme.primary,
      secondary: template.theme.secondary,
      text: template.theme.text,
      muted: template.theme.muted,
      border: template.theme.border,
      radius: template.theme.radius,
      fontFamily: template.theme.fontFamily,
      background: template.pageSettings.background
    });
  };

  const applyPresetPalette = (palette: typeof PRESET_PALETTES[0]) => {
    updateTheme({
      primary: palette.primary,
      secondary: palette.secondary,
      text: palette.text,
      muted: palette.muted,
      border: palette.border,
      background: palette.background
    });
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Botão de atalho móvel para ver o Canvas */}
      <div className="lg:hidden flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900">
        <span className="text-xs font-semibold">Preview ao vivo ativado</span>
        <button 
          type="button"
          onClick={() => setMobileTab('canvas')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium shadow-sm active:scale-95 transition-transform"
        >
          <Eye size={14} />
          <span>Ver Currículo</span>
        </button>
      </div>

      {/* Seção 1: Templates de Currículo */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-blue-600" />
            <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider">Modelos de Currículo</h3>
          </div>
          <span className="text-[11px] text-gray-500">{templates.length} disponíveis</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
           {templates.map(t => {
             const isSelected = document.selectedTemplateId === t.id;
             return (
               <div
                 key={t.id}
                 onClick={() => changeTemplate(t.id)}
                 className={`border rounded-xl cursor-pointer overflow-hidden transition-all text-left group ${isSelected ? 'ring-2 ring-blue-600 border-blue-600 shadow-md' : 'hover:border-gray-400 bg-white'}`}
               >
                 <div className="w-full aspect-[1/1.414] relative overflow-hidden bg-gray-50 flex items-start justify-center border-b">
                   <TemplatePreview templateId={t.id} document={document} />
                 </div>
                 <div className={`p-2 flex items-center justify-between text-xs font-semibold ${isSelected ? 'bg-blue-50 text-blue-900' : 'text-gray-700 bg-white'}`}>
                   <span className="truncate">{t.name}</span>
                   {isSelected && <Check size={14} className="text-blue-600 shrink-0" />}
                 </div>
               </div>
             );
           })}
        </div>
      </div>

      {/* Seção 2: Paletas de Cores Harmônicas Prontas */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette size={16} className="text-blue-600" />
            <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider">Paletas Harmônicas</h3>
          </div>
          <button
            type="button"
            onClick={handleResetToTemplate}
            className="text-[11px] font-medium text-gray-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
            title="Restaurar padrão do modelo"
          >
            <RotateCcw size={12} />
            <span>Restaurar</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {PRESET_PALETTES.map((p) => {
            const isMatch = currentTheme.primary.toLowerCase() === p.primary.toLowerCase();
            return (
              <button
                key={p.name}
                type="button"
                onClick={() => applyPresetPalette(p)}
                className={`flex items-center gap-2.5 p-2 rounded-xl border text-left transition-all ${isMatch ? 'border-blue-600 bg-blue-50/60 ring-1 ring-blue-500' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
              >
                <div className="flex items-center -space-x-1.5 shrink-0">
                  <div className="w-4 h-4 rounded-full border border-white shadow-sm" style={{ backgroundColor: p.primary }} />
                  <div className="w-4 h-4 rounded-full border border-white shadow-sm" style={{ backgroundColor: p.secondary }} />
                  <div className="w-4 h-4 rounded-full border border-white shadow-sm" style={{ backgroundColor: p.background }} />
                </div>
                <span className="text-xs font-medium text-gray-800 truncate flex-1">{p.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Seção 3: Personalização Fina de Cores com Color Pickers */}
      <div className="flex flex-col gap-4 bg-gray-50/80 p-4 rounded-2xl border border-gray-200">
        <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider">Ajuste Fino de Cores</h4>
        
        {/* Cor Primária */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-800 block">Cor Primária</label>
            <span className="text-[11px] text-gray-500">Títulos, destaques e cabeçalhos</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={currentTheme.primary || '#0866E8'}
              onChange={(e) => updateTheme({ primary: e.target.value })}
              className="w-8 h-8 rounded-lg border border-gray-300 cursor-pointer p-0.5 bg-white shadow-sm"
            />
            <span className="text-xs font-mono font-medium text-gray-600 uppercase w-16 text-right">
              {currentTheme.primary}
            </span>
          </div>
        </div>

        {/* Cor Secundária */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-200/60">
          <div>
            <label className="text-xs font-semibold text-gray-800 block">Cor Secundária</label>
            <span className="text-[11px] text-gray-500">Subtítulos, datas e ícones</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={currentTheme.secondary || '#16B978'}
              onChange={(e) => updateTheme({ secondary: e.target.value })}
              className="w-8 h-8 rounded-lg border border-gray-300 cursor-pointer p-0.5 bg-white shadow-sm"
            />
            <span className="text-xs font-mono font-medium text-gray-600 uppercase w-16 text-right">
              {currentTheme.secondary}
            </span>
          </div>
        </div>

        {/* Cor do Texto Principal */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-200/60">
          <div>
            <label className="text-xs font-semibold text-gray-800 block">Cor do Texto</label>
            <span className="text-[11px] text-gray-500">Parágrafos e descrições</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={currentTheme.text || '#071533'}
              onChange={(e) => updateTheme({ text: e.target.value })}
              className="w-8 h-8 rounded-lg border border-gray-300 cursor-pointer p-0.5 bg-white shadow-sm"
            />
            <span className="text-xs font-mono font-medium text-gray-600 uppercase w-16 text-right">
              {currentTheme.text}
            </span>
          </div>
        </div>

        {/* Cor de Fundo da Folha */}
        <div className="flex flex-col gap-2 pt-2 border-t border-gray-200/60">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-gray-800">Fundo da Página</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={currentBackground || '#ffffff'}
                onChange={(e) => updateTheme({ background: e.target.value })}
                className="w-6 h-6 rounded-md border border-gray-300 cursor-pointer p-0.5 bg-white shadow-sm"
              />
              <span className="text-xs font-mono text-gray-600 uppercase">{currentBackground}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {BACKGROUND_OPTIONS.map((bg) => (
              <button
                key={bg.value}
                type="button"
                onClick={() => updateTheme({ background: bg.value })}
                className={`flex-1 py-1.5 text-[10px] font-medium rounded-lg border transition-all ${currentBackground.toLowerCase() === bg.value.toLowerCase() ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold shadow-xs' : 'border-gray-200 hover:border-gray-300 bg-white text-gray-600'}`}
                title={bg.name}
              >
                {bg.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Seção 4: Tipografia */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Type size={16} className="text-blue-600" />
          <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider">Tipografia & Fonte</h3>
        </div>
        <select
          value={currentTheme.fontFamily || ''}
          onChange={(e) => updateTheme({ fontFamily: e.target.value || undefined })}
          className="w-full bg-white border border-gray-300 rounded-xl p-3 text-xs font-medium text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-xs"
        >
          <option value="">Fonte Padrão do Modelo</option>
          {FONTS.map(f => (
            <option key={f.value} value={f.value}>{f.name}</option>
          ))}
        </select>
      </div>

      {/* Seção 5: Estrutura e Espaçamento da Página */}
      <div className="flex flex-col gap-4 bg-white p-4 rounded-2xl border border-gray-200">
        <div className="flex items-center gap-2">
          <Sliders size={16} className="text-blue-600" />
          <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider">Espaçamento & Cantos</h3>
        </div>

        {/* Margem / Padding */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs">
            <span className="font-medium text-gray-700">Margens da Página</span>
            <span className="font-semibold text-gray-900">{currentPadding}px</span>
          </div>
          <input
            type="range"
            min="20"
            max="64"
            step="4"
            value={currentPadding}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              useEditorStore.getState().updateTheme({ padding: val } as any);
            }}
            className="w-full accent-blue-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-gray-400">
            <span>Compacto (20px)</span>
            <span>Padrão (42px)</span>
            <span>Espaçoso (64px)</span>
          </div>
        </div>

        {/* Arredondamento / Radius */}
        <div className="flex flex-col gap-1.5 pt-3 border-t border-gray-100">
          <div className="flex justify-between text-xs">
            <span className="font-medium text-gray-700">Arredondamento de Tags & Elementos</span>
            <span className="font-semibold text-gray-900">{currentTheme.radius ?? 8}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="24"
            step="2"
            value={currentTheme.radius ?? 8}
            onChange={(e) => updateTheme({ radius: parseInt(e.target.value, 10) })}
            className="w-full accent-blue-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-gray-400">
            <span>Reto (0px)</span>
            <span>Sutil (8px)</span>
            <span>Pílula (24px)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
