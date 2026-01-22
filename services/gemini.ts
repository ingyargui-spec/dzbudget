
import { GoogleGenAI } from "@google/genai";
import { Transaction, Category, Language } from "../types";

export const getBudgetInsights = async (
  transactions: Transaction[],
  categories: Category[],
  language: Language
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  
  const summary = transactions.map(t => ({
    desc: t.description,
    amount: t.amount,
    cat: categories.find(c => c.id === t.categoryId)?.nameFr,
    type: t.type
  }));

  const prompt = `
    Agis comme un expert en finance personnelle algérien. Analyse les transactions suivantes en DZD:
    ${JSON.stringify(summary)}
    
    Les limites par catégorie sont:
    ${JSON.stringify(categories.map(c => ({ name: c.nameFr, limit: c.limit })))}
    
    Donne des conseils courts et précis sur comment économiser et si des limites sont dépassées.
    Réponds en ${language === 'fr' ? 'français' : 'arabe'}.
    Formatte la réponse en texte clair avec des points clés.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || (language === 'fr' ? "Impossible de générer des analyses." : "تعذر إنشاء التحليلات.");
  } catch (error) {
    console.error("Gemini Error:", error);
    return language === 'fr' ? "Erreur de connexion avec l'IA." : "خطأ في الاتصال بالذكاء الاصطناعي.";
  }
};
