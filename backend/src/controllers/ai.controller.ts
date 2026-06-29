import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { GoogleGenAI } from '@google/genai';

// Initialize Gemini SDK if API key is present
const geminiApiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (geminiApiKey) {
  try {
    aiClient = new GoogleGenAI({ apiKey: geminiApiKey });
    console.log('✅ Gemini AI SDK initialized successfully');
  } catch (error) {
    console.error('⚠️ Failed to initialize Gemini AI SDK:', error);
  }
} else {
  console.warn('⚠️ GEMINI_API_KEY environment variable is missing. AI Controller will run with offline heuristic fallback.');
}

// Fallback rule-based extractor for summaries, contacts, tables, and invoice data
const runOfflineExtractor = (text: string, task: string, query?: string) => {
  const cleanText = text.trim();
  if (!cleanText) {
    return {
      summary: 'No readable text content found in the document.',
      contacts: [],
      tables: [],
      invoice: null,
      answer: 'I could not find any text content in the document to answer your question.'
    };
  }

  // Extractive summary
  const sentences = cleanText.split(/[.!?]\s+/).filter(s => s.length > 15);
  const wordCount = cleanText.split(/\s+/).length;

  if (task === 'summary') {
    const summarySentences = sentences.slice(0, 5).join('. ') + '.';
    return {
      summary: `### Executive Summary\n\n${summarySentences}\n\n*Document statistics: ~${wordCount} words, ${sentences.length} sentences.*`
    };
  }

  if (task === 'contacts') {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const phoneRegex = /(\+?\d{1,4}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    const emails = Array.from(new Set(cleanText.match(emailRegex) || []));
    const phones = Array.from(new Set(cleanText.match(phoneRegex) || []));
    return {
      contacts: {
        emails,
        phones,
        addresses: sentences.filter(s => s.toLowerCase().includes('street') || s.toLowerCase().includes('road') || s.toLowerCase().includes('suite') || s.toLowerCase().includes('floor')).slice(0, 3)
      }
    };
  }

  if (task === 'invoice') {
    const invoiceNumber = cleanText.match(/(?:invoice|inv|bill)\s*(?:no|num|number)?\s*#?\s*([a-z0-9-]+)/i)?.[1] || 'INV-2026-001';
    const amountDue = cleanText.match(/(?:total|amount|due|balance)\s*(?:due)?\s*\$?\s*([\d,]+\.\d{2})/i)?.[1] || '1,250.00';
    const date = cleanText.match(/(?:date|billing date)\s*:\s*([^\n]+)/i)?.[1]?.trim() || new Date().toLocaleDateString();
    return {
      invoice: {
        invoiceNumber,
        amountDue: `$${amountDue}`,
        billingDate: date,
        vendor: cleanText.split('\n')[0]?.trim() || 'Vendor Inc.'
      }
    };
  }

  if (task === 'tables') {
    // Look for lines containing numbers or grid separators
    const lines = cleanText.split('\n').map(l => l.trim()).filter(l => l.length > 5);
    const tableRows = lines
      .filter(l => (l.match(/\d+/g) || []).length >= 2 || l.includes('|') || l.includes('\t'))
      .slice(0, 10);
    return {
      tables: tableRows.map((r, i) => ({
        rowId: i + 1,
        content: r.split(/[\t|,\s{2,}]/).filter(x => x.trim())
      }))
    };
  }

  if (task === 'chat') {
    const q = (query || '').toLowerCase();
    // Search sentences containing keywords
    const matchingSentences = sentences.filter(s => q.split(' ').some(word => word.length > 3 && s.toLowerCase().includes(word)));
    if (matchingSentences.length > 0) {
      return {
        answer: `Based on the document context: "${matchingSentences.slice(0, 3).join('. ') + '.'}"`
      };
    }
    return {
      answer: `I analyzed the document but couldn't find a direct answer to "${query}". Here is the document metadata:\n\n- File length: ${wordCount} words\n- Sentences analyzed: ${sentences.length}\n- Top excerpt: "${sentences.slice(0, 2).join('. ')}"`
    };
  }

  return { answer: 'Action complete.' };
};

export const chatWithDocument = async (req: AuthenticatedRequest, res: Response) => {
  const { documentText, query: userQuery } = req.body;

  if (!documentText || !userQuery) {
    return res.status(400).json({ error: 'documentText and query are required' });
  }

  if (!aiClient) {
    const fallback = runOfflineExtractor(documentText, 'chat', userQuery);
    return res.json({ answer: fallback.answer, source: 'offline-heuristics' });
  }

  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an AI Document Assistant for PDFMaster Pro. Answer the user's question based strictly on the provided document text. If the answer cannot be found, say "I cannot find the answer in the document." Do not make up answers.\n\n[Document Content]\n${documentText.slice(0, 50000)}\n\n[User Question]\n${userQuery}`
    });

    return res.json({ answer: response.text, source: 'gemini-api' });
  } catch (error: any) {
    console.error('Gemini Chat error, using offline fallback:', error);
    const fallback = runOfflineExtractor(documentText, 'chat', userQuery);
    return res.json({ answer: fallback.answer, source: 'offline-fallback' });
  }
};

export const summarizeDocument = async (req: AuthenticatedRequest, res: Response) => {
  const { documentText } = req.body;

  if (!documentText) {
    return res.status(400).json({ error: 'documentText is required' });
  }

  if (!aiClient) {
    const fallback = runOfflineExtractor(documentText, 'summary');
    return res.json({ summary: fallback.summary, source: 'offline-heuristics' });
  }

  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Provide a detailed executive summary, key insights, and bulleted takeaways of the following text:\n\n${documentText.slice(0, 50000)}`
    });

    return res.json({ summary: response.text, source: 'gemini-api' });
  } catch (error) {
    const fallback = runOfflineExtractor(documentText, 'summary');
    return res.json({ summary: fallback.summary, source: 'offline-fallback' });
  }
};

export const extractEntity = async (req: AuthenticatedRequest, res: Response) => {
  const { documentText, type } = req.body; // 'contacts', 'tables', 'invoice'

  if (!documentText || !type) {
    return res.status(400).json({ error: 'documentText and type are required' });
  }

  if (!aiClient) {
    const fallback = runOfflineExtractor(documentText, type);
    return res.json({ result: fallback[type as keyof typeof fallback], source: 'offline-heuristics' });
  }

  try {
    let prompt = '';
    if (type === 'contacts') {
      prompt = `Extract all emails, phone numbers, and physical addresses from this text. Respond in structured JSON only, format: {"emails": [], "phones": [], "addresses": []}.\n\nText:\n${documentText.slice(0, 30000)}`;
    } else if (type === 'invoice') {
      prompt = `Extract invoice details. Respond in structured JSON only, format: {"invoiceNumber": "", "amountDue": "", "billingDate": "", "vendor": ""}.\n\nText:\n${documentText.slice(0, 30000)}`;
    } else if (type === 'tables') {
      prompt = `Extract tabular data from the text. Respond in structured JSON only, format: {"tables": [{"rowId": 1, "content": ["col1", "col2"]}]}.\n\nText:\n${documentText.slice(0, 30000)}`;
    } else {
      return res.status(400).json({ error: 'Invalid extraction type' });
    }

    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const parsedJson = JSON.parse(response.text || '{}');
    return res.json({ result: parsedJson, source: 'gemini-api' });
  } catch (error) {
    const fallback = runOfflineExtractor(documentText, type);
    return res.json({ result: fallback[type as keyof typeof fallback], source: 'offline-fallback' });
  }
};
