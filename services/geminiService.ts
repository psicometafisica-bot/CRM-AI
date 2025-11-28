
import { GoogleGenAI, Type } from "@google/genai";
import { Contact, Deal, AILead, Sequence, SequenceStep, AILeadAnalysis } from "../types";
import { store } from "./store";

// Helper to get Client dynamically (allows key change at runtime)
const getClient = () => {
    const settings = store.getSettings();
    const key = settings.apiKey || process.env.API_KEY;
    if (!key) return null;
    return new GoogleGenAI({ apiKey: key });
};

export const GeminiService = {
  
  /**
   * Generates a personalized email draft.
   */
  async generateEmailDraft(contact: Contact, deal?: Deal, tone: string = 'profesional'): Promise<string> {
    const ai = getClient();
    if (!ai) return "Error: API Key no configurada en Ajustes.";

    const prompt = `
      Escribe un correo de ventas corto para:
      Nombre: ${contact.name}
      Empresa: ${contact.company}
      Rol: ${contact.role}
      Tono: ${tone}.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text || "No se pudo generar el correo.";
    } catch (error) {
      return "Error de conexión o clave inválida.";
    }
  },

  /**
   * ENRICHMENT (Apollo-style)
   * Uses Google Search to find Tech Stack, LinkedIn, and Location.
   * REFACTORED: Two-step process (Search -> JSON) to avoid API conflicts.
   */
  async enrichContactData(contact: Contact): Promise<Partial<Contact>> {
    const ai = getClient();
    if (!ai) return {};

    // STEP 1: Research with Google Search (No Schema allowed here)
    const searchPrompt = `
      Investiga a la empresa ${contact.company} y a la persona ${contact.name} (${contact.role}).
      
      Usa Google Search para encontrar:
      1. Tecnologías que probablemente usa la empresa (ej: AWS, Salesforce, React, SAP).
      2. Ubicación principal de la empresa.
      3. URL pública del perfil de LinkedIn de la persona (si existe).
    `;

    try {
      const searchResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: searchPrompt,
        config: {
          tools: [{googleSearch: {}}],
        }
      });
      
      // STEP 2: Extract data to JSON (No Tools allowed here)
      const extractionPrompt = `
        Analiza el siguiente texto de investigación y extrae los datos en formato JSON.
        Texto: ${searchResponse.text}
      `;

      const jsonResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: extractionPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              technologies: { type: Type.ARRAY, items: { type: Type.STRING } },
              location: { type: Type.STRING },
              linkedIn: { type: Type.STRING }
            }
          }
        }
      });

      return JSON.parse(jsonResponse.text || "{}");
    } catch (error) {
      console.error("Enrichment error:", error);
      return {};
    }
  },

  /**
   * SEQUENCE GENERATOR
   * Creates a multi-step sales sequence.
   */
  async generateSequence(targetAudience: string, goal: string): Promise<SequenceStep[]> {
    const ai = getClient();
    if (!ai) return [];

    const prompt = `
      Crea una secuencia de ventas (Sales Sequence) de 4 pasos para prospectar a: ${targetAudience}.
      Objetivo: ${goal}.
      
      La secuencia debe incluir:
      1. Un correo inicial (Día 1).
      2. Una solicitud de LinkedIn (Día 3).
      3. Un correo de seguimiento (Día 6).
      4. Una llamada (Día 8).
      
      Devuelve un JSON.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.INTEGER },
                type: { type: Type.STRING, enum: ['email', 'linkedin', 'call'] },
                subject: { type: Type.STRING },
                content: { type: Type.STRING }
              },
              required: ["day", "type", "content"]
            }
          }
        }
      });

      const steps = JSON.parse(response.text || "[]");
      return steps.map((s: any, i: number) => ({ ...s, id: `gen-${i}` }));
    } catch (error) {
      console.error("Sequence gen error:", error);
      return [];
    }
  },

  /**
   * LEAD GEN (Advanced with Technographics & Needs)
   */
  async findLeads(industry: string, location: string, technology?: string, specificNeeds?: string): Promise<AILead[]> {
    const ai = getClient();
    if (!ai) return [];

    const techQuery = technology ? `que utilicen tecnología ${technology}` : '';
    const needsQuery = specificNeeds ? `que probablemente tengan necesidad de: "${specificNeeds}"` : '';
    
    const searchPrompt = `
      Busca 5 empresas B2B reales de ${industry} en ${location} ${techQuery}.
      ${needsQuery}.
      
      Para cada empresa, busca:
      1. Nombre, Web, Descripción.
      2. Persona de contacto (Nombre, Email, Teléfono).
      3. Qué tecnologías web o software usan (Stack tecnológico).
      4. Señales de intención de compra (ej: "Contratando ventas", "Recibió inversión") o señales de necesidad sobre "${specificNeeds}".
    `;
    
    try {
      const searchResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: searchPrompt,
        config: {
          tools: [{googleSearch: {}}],
        },
      });

      const extractionPrompt = `
        Extrae los leads del texto de búsqueda en JSON.
        Texto: ${searchResponse.text}
      `;

      const structuredResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: extractionPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                companyName: { type: Type.STRING },
                website: { type: Type.STRING },
                description: { type: Type.STRING },
                potentialRole: { type: Type.STRING },
                confidence: { type: Type.NUMBER },
                contactName: { type: Type.STRING },
                email: { type: Type.STRING },
                phone: { type: Type.STRING },
                technologies: { type: Type.ARRAY, items: { type: Type.STRING } },
                intentSignal: { type: Type.STRING }
              },
              required: ["companyName", "description", "contactName"]
            }
          }
        }
      });

      const leads = JSON.parse(structuredResponse.text || "[]");
      const sources = searchResponse.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((c: any) => c.web?.uri).filter((u: any) => u) || [];
      
      return leads.map((lead: AILead, index: number) => ({
        ...lead,
        sourceUrl: sources[index] || sources[0] || ''
      }));

    } catch (error) {
      console.error("Lead Gen Error:", error);
      return [];
    }
  },

  /**
   * DEEP DIVE COMPANY ANALYSIS
   */
  async analyzeCompanyDeepDive(company: string, website: string, contextNeeds: string = ''): Promise<AILeadAnalysis | null> {
    const ai = getClient();
    if (!ai) return null;

    // STEP 1: Research with Google Search
    const searchPrompt = `
      Actúa como un consultor de estrategia empresarial experto.
      Realiza un análisis profundo de la empresa: ${company} (${website}).
      
      Si el usuario especificó un área de interés: "${contextNeeds}", enfoca el análisis en eso. Si no, haz un análisis general de debilidades operativas o tecnológicas.

      Investiga:
      1. Perfil Corporativo: Qué hacen exactamente y su modelo de negocio.
      2. Fortalezas: En qué son buenos.
      3. Puntos de Dolor, Debilidades y Vulnerabilidades: Dónde podrían estar fallando, qué les falta (ej: brechas de seguridad, falta de automatización, mala UX, etc).
      4. Necesidades Específicas: Qué servicios o productos necesitan contratar.
      5. Sales Pitch: Una frase gancho para venderles una solución a esos problemas.

      Usa Google Search para obtener información reciente.
    `;

    try {
      const searchResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: searchPrompt,
        config: {
          tools: [{googleSearch: {}}],
        }
      });
      
      // STEP 2: Structure as JSON
      const structuringPrompt = `
        Basado en la siguiente investigación, genera un reporte JSON estructurado.
        
        Investigación:
        ${searchResponse.text}
        
        Genera el JSON con: companyType, strengths, weaknesses, needs, salesPitch.
      `;

      const jsonResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: structuringPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              companyType: { type: Type.STRING, description: "Descripción detallada de qué hace la empresa" },
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lista de vulnerabilidades y puntos débiles" },
              needs: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Necesidades específicas de productos/servicios" },
              salesPitch: { type: Type.STRING, description: "Argumento de venta sugerido" }
            },
            required: ["companyType", "weaknesses", "needs", "salesPitch"]
          }
        }
      });
      
      return JSON.parse(jsonResponse.text || "null");
    } catch (error) {
      console.error("Deep Dive Error:", error);
      return null;
    }
  },

  async analyzeDeal(deal: Deal, contact: Contact): Promise<any> {
    const ai = getClient();
    if (!ai) return { analysis: "Error API Config", recommendedAction: "N/A", predictedProbability: deal.probability };
    
    const prompt = `Analiza deal: ${deal.title} (${deal.amount}), Etapa: ${deal.stage}, Cliente: ${contact.company}. Devuelve JSON con analysis, recommendedAction, predictedProbability.`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || "{}");
    } catch (e) { return { analysis: "Error", recommendedAction: "N/A", predictedProbability: 50 }; }
  },

  async generateSalesStrategy(deal: Deal, contact: Contact): Promise<string> {
      const ai = getClient();
      if (!ai) return "Error API Config";
      
      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `Estrategia corta de 3 pasos para cerrar deal: ${deal.title} con ${contact.company}.`
      });
      return response.text || "";
  },

  async chatWithCRM(query: string, context: string): Promise<string> {
      const ai = getClient();
      if (!ai) return "Configura API Key en Ajustes";
      
      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `Context: ${context}. User: ${query}.`,
          config: { systemInstruction: "Eres un asistente CRM útil."}
      });
      return response.text || "Error";
  }
};
