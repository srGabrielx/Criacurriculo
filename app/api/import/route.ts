import { GoogleGenAI, Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import mammoth from "mammoth";

// Workaround for pdf-parse import issue
const pdfParse = require("pdf-parse");

export const maxDuration = 60; // Allow more time for AI processing

interface ExtractedResume {
  personalInfo: {
    name: string;
    headline?: string;
    headlineAccent?: string;
    description?: string;
    location?: string;
    email?: string;
    phone?: string;
    linkedin?: string;
    github?: string;
    website?: string;
    birthDate?: string;
    nationality?: string;
    drivingLicense?: string;
  };
  sections: Array<{
    type: 'experience' | 'education' | 'skills' | 'projects' | 'languages' | 'certifications' | 'courses' | 'volunteering' | 'awards' | 'references' | 'hobbies' | 'custom';
    title: string;
    items: Array<{
      title?: string;
      subtitle?: string;
      date?: string;
      location?: string;
      url?: string;
      description?: string;
      tags?: string;
    }>;
  }>;
}

/**
 * Parser heurístico offline de contingência caso a IA esteja indisponível
 */
function heuristicFallbackParse(rawText: string, fileName: string): ExtractedResume {
  const lines = rawText
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0);

  const personalInfo: ExtractedResume['personalInfo'] = {
    name: '',
    headline: '',
    description: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    website: ''
  };

  const sections: ExtractedResume['sections'] = [];

  // 1. Extrair contatos e links com Regex
  const emailMatch = rawText.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
  if (emailMatch) personalInfo.email = emailMatch[1];

  const phoneMatch = rawText.match(/(\+?\d{1,3}[\s-]?)?(\(?\d{2,3}\)?[\s-]?)?\d{4,5}[\s-]?\d{4}/);
  if (phoneMatch) personalInfo.phone = phoneMatch[0];

  const linkedinMatch = rawText.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i);
  if (linkedinMatch) personalInfo.linkedin = linkedinMatch[0];

  const githubMatch = rawText.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)/i);
  if (githubMatch) personalInfo.github = githubMatch[0];

  // 2. Extrair Nome e Cargo (geralmente primeiras linhas)
  if (lines.length > 0) {
    personalInfo.name = lines[0].replace(/[|•,].*$/, '').trim() || fileName.replace(/\.[^/.]+$/, "");
  }
  if (lines.length > 1 && lines[1].length < 80 && !lines[1].includes('@') && !lines[1].match(/\d{4}/)) {
    personalInfo.headline = lines[1];
  }

  // 3. Detectar seções por palavras-chave
  const sectionKeywords: Record<string, { type: ExtractedResume['sections'][0]['type']; title: string }> = {
    'experiência': { type: 'experience', title: 'Experiência Profissional' },
    'experiencia': { type: 'experience', title: 'Experiência Profissional' },
    'experience': { type: 'experience', title: 'Experiência Profissional' },
    'histórico': { type: 'experience', title: 'Histórico Profissional' },
    'formação': { type: 'education', title: 'Formação Acadêmica' },
    'formacao': { type: 'education', title: 'Formação Acadêmica' },
    'educação': { type: 'education', title: 'Formação Acadêmica' },
    'educacao': { type: 'education', title: 'Formação Acadêmica' },
    'education': { type: 'education', title: 'Formação Acadêmica' },
    'acadêmico': { type: 'education', title: 'Formação Acadêmica' },
    'habilidade': { type: 'skills', title: 'Habilidades' },
    'skills': { type: 'skills', title: 'Habilidades' },
    'competência': { type: 'skills', title: 'Competências' },
    'idioma': { type: 'languages', title: 'Idiomas' },
    'languages': { type: 'languages', title: 'Idiomas' },
    'projeto': { type: 'projects', title: 'Projetos' },
    'projects': { type: 'projects', title: 'Projetos' },
    'curso': { type: 'courses', title: 'Cursos Extras' },
    'certificad': { type: 'certifications', title: 'Certificações' },
    'certifications': { type: 'certifications', title: 'Certificações' },
    'volunt': { type: 'volunteering', title: 'Trabalho Voluntário' },
    'referência': { type: 'references', title: 'Referências' },
    'references': { type: 'references', title: 'Referências' },
    'prêmio': { type: 'awards', title: 'Prêmios e Conquistas' },
    'awards': { type: 'awards', title: 'Prêmios' },
    'hobbies': { type: 'hobbies', title: 'Hobbies e Interesses' },
    'interesse': { type: 'hobbies', title: 'Interesses' },
    'resumo': { type: 'custom', title: 'Sobre Mim' },
    'sobre': { type: 'custom', title: 'Sobre Mim' },
    'summary': { type: 'custom', title: 'Resumo Profissional' }
  };

  let currentSection: ExtractedResume['sections'][0] | null = null;
  let currentItemLines: string[] = [];

  const flushItem = () => {
    if (!currentSection || currentItemLines.length === 0) return;
    const text = currentItemLines.join('\n');
    const firstLine = currentItemLines[0];
    
    if (currentSection.type === 'skills') {
      const skillsList = text.split(/[,•|\n]/).map(s => s.trim()).filter(Boolean);
      skillsList.forEach(skill => {
        currentSection?.items.push({ title: skill });
      });
    } else {
      const dateMatch = text.match(/((?:19|20)\d{2}\s*[-–—/]\s*(?:(?:19|20)\d{2}|atual|presente|hoje)?|(?:Jan|Fev|Mar|Abr|Mai|Jun|Jul|Ago|Set|Out|Nov|Dez)[a-z]*\.?\s*(?:19|20)\d{2})/i);
      
      currentSection.items.push({
        title: firstLine.slice(0, 100),
        subtitle: currentItemLines.length > 1 && currentItemLines[1].length < 80 ? currentItemLines[1] : '',
        date: dateMatch ? dateMatch[0] : '',
        description: currentItemLines.slice(currentItemLines.length > 1 && currentItemLines[1].length < 80 ? 2 : 1).join('\n') || text
      });
    }
    currentItemLines = [];
  };

  for (let i = 2; i < lines.length; i++) {
    const line = lines[i];
    const lower = line.toLowerCase();
    
    // Verificar se a linha é um cabeçalho de seção
    let matchedKey: string | null = null;
    for (const key of Object.keys(sectionKeywords)) {
      if (lower.startsWith(key) || lower === key || (line.length < 35 && lower.includes(key))) {
        matchedKey = key;
        break;
      }
    }

    if (matchedKey && line.length < 40) {
      flushItem();
      const meta = sectionKeywords[matchedKey];
      currentSection = {
        type: meta.type,
        title: meta.title,
        items: []
      };
      sections.push(currentSection);
    } else if (currentSection) {
      if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || (line.length < 80 && line.match(/\d{4}/))) {
        flushItem();
      }
      currentItemLines.push(line);
    } else if (!personalInfo.description && line.length > 40) {
      personalInfo.description += (personalInfo.description ? ' ' : '') + line;
    }
  }
  flushItem();

  // Se nenhuma seção foi detectada, criar seções básicas com o conteúdo
  if (sections.length === 0 && lines.length > 2) {
    sections.push({
      type: 'experience',
      title: 'Experiência & Histórico',
      items: [
        {
          title: 'Histórico Profissional',
          description: lines.slice(2).join('\n')
        }
      ]
    });
  }

  return { personalInfo, sections };
}

/**
 * Converte schemas JSON conhecidos (como JSON Resume padrão)
 */
function parseJsonResume(jsonObj: any): ExtractedResume | null {
  if (!jsonObj || typeof jsonObj !== 'object') return null;

  // Formato do nosso próprio App
  if (jsonObj.personalInfo && Array.isArray(jsonObj.sections)) {
    return {
      personalInfo: {
        name: jsonObj.personalInfo.name || 'Sem Nome',
        headline: jsonObj.personalInfo.headline || '',
        headlineAccent: jsonObj.personalInfo.headlineAccent || '',
        description: jsonObj.personalInfo.description || '',
        location: jsonObj.personalInfo.location || '',
        email: jsonObj.personalInfo.email || '',
        phone: jsonObj.personalInfo.phone || '',
        linkedin: jsonObj.personalInfo.linkedin || '',
        github: jsonObj.personalInfo.github || '',
        website: jsonObj.personalInfo.website || '',
        birthDate: jsonObj.personalInfo.birthDate || '',
        nationality: jsonObj.personalInfo.nationality || '',
        drivingLicense: jsonObj.personalInfo.drivingLicense || ''
      },
      sections: jsonObj.sections.map((s: any) => ({
        type: s.type || 'custom',
        title: s.title || 'Seção',
        items: Array.isArray(s.items) ? s.items : []
      }))
    };
  }

  // Padrão JSON Resume (standard schema: basics, work, education, skills, projects, languages)
  if (jsonObj.basics) {
    const b = jsonObj.basics;
    const sections: ExtractedResume['sections'] = [];

    if (Array.isArray(jsonObj.work) && jsonObj.work.length > 0) {
      sections.push({
        type: 'experience',
        title: 'Experiência Profissional',
        items: jsonObj.work.map((w: any) => ({
          title: w.position || w.title || '',
          subtitle: w.name || w.company || '',
          date: `${w.startDate || ''} - ${w.endDate || 'Atual'}`,
          location: w.location || '',
          url: w.url || w.website || '',
          description: w.summary || (Array.isArray(w.highlights) ? w.highlights.join('\n• ') : '') || ''
        }))
      });
    }

    if (Array.isArray(jsonObj.education) && jsonObj.education.length > 0) {
      sections.push({
        type: 'education',
        title: 'Formação Acadêmica',
        items: jsonObj.education.map((e: any) => ({
          title: `${e.studyType || ''} ${e.area || ''}`.trim() || 'Curso',
          subtitle: e.institution || '',
          date: `${e.startDate || ''} - ${e.endDate || ''}`,
          location: e.location || '',
          description: Array.isArray(e.courses) ? e.courses.join(', ') : (e.description || '')
        }))
      });
    }

    if (Array.isArray(jsonObj.skills) && jsonObj.skills.length > 0) {
      sections.push({
        type: 'skills',
        title: 'Habilidades',
        items: jsonObj.skills.map((s: any) => ({
          title: typeof s === 'string' ? s : (s.name || ''),
          tags: Array.isArray(s.keywords) ? s.keywords.join(', ') : ''
        }))
      });
    }

    if (Array.isArray(jsonObj.projects) && jsonObj.projects.length > 0) {
      sections.push({
        type: 'projects',
        title: 'Projetos',
        items: jsonObj.projects.map((p: any) => ({
          title: p.name || 'Projeto',
          subtitle: p.description || '',
          url: p.url || '',
          description: Array.isArray(p.highlights) ? p.highlights.join('\n• ') : (p.summary || '')
        }))
      });
    }

    if (Array.isArray(jsonObj.languages) && jsonObj.languages.length > 0) {
      sections.push({
        type: 'languages',
        title: 'Idiomas',
        items: jsonObj.languages.map((l: any) => ({
          title: l.language || l.name || '',
          subtitle: l.fluency || l.level || ''
        }))
      });
    }

    return {
      personalInfo: {
        name: b.name || 'Sem Nome',
        headline: b.label || '',
        description: b.summary || '',
        email: b.email || '',
        phone: b.phone || '',
        location: b.location ? `${b.location.city || ''}, ${b.location.region || b.location.countryCode || ''}`.replace(/^,\s*|,\s*$/g, '') : '',
        website: b.url || b.website || '',
        linkedin: (b.profiles || []).find((p: any) => p.network?.toLowerCase().includes('linkedin'))?.url || '',
        github: (b.profiles || []).find((p: any) => p.network?.toLowerCase().includes('github'))?.url || ''
      },
      sections
    };
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    
    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    const fileName = file.name.toLowerCase();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Tratamento para arquivos JSON
    if (fileName.endsWith('.json') || file.type === 'application/json') {
      try {
        const textContent = buffer.toString('utf-8');
        const parsedJson = JSON.parse(textContent);
        const structuredResume = parseJsonResume(parsedJson);
        if (structuredResume) {
          return NextResponse.json(structuredResume);
        }
      } catch (jsonErr) {
        console.warn("JSON parsing failed, falling back to AI:", jsonErr);
      }
    }

    // 2. Extração de texto de DOCX/DOC e PDF
    let extractedRawText = "";
    let isDocx = fileName.endsWith('.docx') || fileName.endsWith('.doc') || file.type.includes('wordprocessingml') || file.type.includes('msword');
    let isPdf = fileName.endsWith('.pdf') || file.type === 'application/pdf';
    let isText = fileName.endsWith('.txt') || fileName.endsWith('.rtf') || fileName.endsWith('.md') || fileName.endsWith('.csv') || fileName.endsWith('.xml') || fileName.endsWith('.html') || fileName.endsWith('.odt') || file.type.startsWith('text/');
    let isImage = fileName.endsWith('.png') || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.webp') || file.type.startsWith('image/');

    if (isDocx) {
      try {
        const mammothResult = await mammoth.extractRawText({ buffer });
        extractedRawText = mammothResult.value;
      } catch (e) {
        console.warn("Mammoth text extraction error:", e);
      }
    } else if (isPdf && !process.env.GEMINI_API_KEY) {
      // Se não tivermos o Gemini, usamos o pdf-parse como quebra-galho para fallback heurístico
      try {
        const pdfResult = await pdfParse(buffer);
        extractedRawText = pdfResult.text;
      } catch (e) {
        console.warn("PDF-parse text extraction error:", e);
      }
    } else if (isText) {
      extractedRawText = buffer.toString('utf-8');
    }

    // 3. Processamento com Google Gemini se a chave estiver configurada
    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({ 
          apiKey: process.env.GEMINI_API_KEY,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });

        // Determinar conteúdo para a IA:
        // - Se temos texto extraído de docx/txt/pdf, enviar como texto limpo (mais rápido e 100% preciso)
        // - Se for PDF binário puro ou imagem, enviar via inlineData com mimeType correto
        let contents: any[] = [];
        
        if (extractedRawText && extractedRawText.length > 30) {
          contents = [
            `Analise o texto deste currículo a seguir e estruture todas as informações de acordo com o esquema JSON solicitado.
Mantenha a fidelidade total aos dados existentes, sem inventar informações.
Agrupe as seções nos tipos apropriados: 'experience' (experiência), 'education' (formação acadêmica), 'skills' (habilidades), 'languages' (idiomas), 'courses' (cursos extras), 'certifications' (certificados), 'projects' (projetos), 'volunteering' (voluntariado), 'awards' (prêmios), 'references' (referências), 'hobbies' (hobbies e interesses) ou 'custom' (outras seções).

--- CONTEÚDO DO CURRÍCULO ---
${extractedRawText}
--- FIM DO CONTEÚDO ---`
          ];
        } else if (isPdf) {
          contents = [
            {
              inlineData: {
                mimeType: "application/pdf",
                data: buffer.toString("base64"),
              },
            },
            "Extraia rigorosamente TODAS as informações deste currículo em PDF e estruture de acordo com o esquema JSON solicitado. IMPORTANTE: Analise cuidadosamente o layout visual (como colunas duplas), interprete ícones visuais (telefone, linkedin, email) e recupere informações de todos os blocos especiais. Mantenha a fidelidade total aos dados existentes e agrupe as seções em: experience, education, skills, languages, courses, certifications, projects, volunteering, awards, references, hobbies, custom."
          ];
        } else if (isImage) {
          const imageMime = fileName.endsWith('.png') ? 'image/png' : fileName.endsWith('.webp') ? 'image/webp' : 'image/jpeg';
          contents = [
            {
              inlineData: {
                mimeType: imageMime,
                data: buffer.toString("base64"),
              },
            },
            "Leia este currículo em imagem, faça o OCR completo e estruture rigorosamente de acordo com o esquema JSON. Agrupe as seções em: experience, education, skills, languages, courses, certifications, projects, volunteering, awards, references, hobbies, custom."
          ];
        } else {
          // Fallback para buffer de texto
          contents = [
            `Analise e estruture este currículo:\n${buffer.toString('utf-8')}`
          ];
        }

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                personalInfo: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    headline: { type: Type.STRING },
                    headlineAccent: { type: Type.STRING },
                    description: { type: Type.STRING },
                    location: { type: Type.STRING },
                    email: { type: Type.STRING },
                    phone: { type: Type.STRING },
                    linkedin: { type: Type.STRING },
                    github: { type: Type.STRING },
                    website: { type: Type.STRING },
                    birthDate: { type: Type.STRING },
                    nationality: { type: Type.STRING },
                    drivingLicense: { type: Type.STRING },
                  },
                  required: ["name"]
                },
                sections: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      type: { type: Type.STRING, description: "Must be one of: experience, education, skills, projects, languages, custom" },
                      title: { type: Type.STRING },
                      items: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            title: { type: Type.STRING },
                            subtitle: { type: Type.STRING },
                            date: { type: Type.STRING },
                            location: { type: Type.STRING },
                            url: { type: Type.STRING },
                            description: { type: Type.STRING },
                            tags: { type: Type.STRING, description: "Lista de tags ou palavras-chave" }
                          }
                        }
                      }
                    },
                    required: ["type", "title", "items"]
                  }
                }
              },
              required: ["personalInfo", "sections"]
            },
            temperature: 0.1,
          },
        });

        if (response.text) {
          const aiData = JSON.parse(response.text);
          if (aiData && aiData.personalInfo) {
            return NextResponse.json(aiData);
          }
        }
      } catch (geminiError: any) {
        console.warn("Gemini AI extraction error, triggering heuristic fallback:", geminiError);
      }
    }

    // 4. Fallback Heurístico Robusto (garante que NUNCA quebra mesmo sem internet/IA)
    // Para PDFs, evitamos usar buffer binário como fallback
    let fallbackText = extractedRawText;
    if (!fallbackText && !isPdf && !isImage) {
      fallbackText = buffer.toString('utf-8', 0, Math.min(buffer.length, 50000));
    }
    const parsedData = heuristicFallbackParse(fallbackText, file.name);

    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error("Critical import error:", error);
    return NextResponse.json({ 
      error: error?.message || "Não foi possível processar o arquivo." 
    }, { status: 500 });
  }
}
