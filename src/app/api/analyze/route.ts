import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `Sei un esperto analista di bollette energetiche italiane. Analizza la bolletta fornita ed estrai le seguenti informazioni in formato JSON.

Rispondi SOLO con un oggetto JSON valido, senza testo aggiuntivo. Lo schema è:

{
  "fornitore": "nome del fornitore energia",
  "pod": "codice POD o PDR",
  "potenza_impegnata": "potenza in kW",
  "periodo_fatturazione": "es. 01/01/2024 - 31/01/2024",
  "consumo_totale_kwh": numero,
  "consumo_f1": numero o null,
  "consumo_f2": numero o null,
  "consumo_f3": numero o null,
  "costo_energia": numero (solo componente energia),
  "oneri_sistema": numero,
  "imposte": numero (accise + IVA),
  "totale": numero,
  "valutazione": "promossa" | "bocciata" | "sufficiente",
  "problemi": ["lista di problemi rilevati"],
  "suggerimenti": ["lista di suggerimenti per risparmiare"],
  "risparmio_potenziale": numero (stima annuale in euro)
}

Criteri di valutazione:
- PROMOSSA: Costo per kWh competitivo, nessun errore evidente, consumi ottimizzati
- SUFFICIENTE: Costo nella media, alcuni margini di miglioramento
- BOCCIATA: Costo elevato, errori di fatturazione, o opportunità di risparmio significative ignorate

Problemi comuni da verificare:
- Potenza impegnata sovradimensionata rispetto ai consumi
- Tariffa non adatta al profilo di consumo (es. monoraria vs bioraria)
- Penali per potenza reattiva
- Costi di commercializzazione troppo alti
- Errori di lettura contatore

Suggerimenti utili:
- Cambio tariffa se consumo concentrato in orari specifici
- Riduzione potenza impegnata se sottoutilizzata
- Valutazione fotovoltaico se consumi diurni elevati
- Verifica eligibilità per Comunità Energetica (CER)
- Confronto con altre offerte del mercato libero`;

async function analyzeWithClaude(base64: string, mediaType: string): Promise<string> {
  const anthropic = new Anthropic();

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: [
          {
            type: mediaType === "application/pdf" ? "document" : "image",
            source: {
              type: "base64",
              media_type: mediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp" | "application/pdf",
              data: base64,
            },
          } as Anthropic.DocumentBlockParam | Anthropic.ImageBlockParam,
          {
            type: "text",
            text: "Analizza questa bolletta energetica italiana e fornisci l'analisi in formato JSON come specificato.",
          },
        ],
      },
    ],
    system: SYSTEM_PROMPT,
  });

  const textContent = response.content.find((c) => c.type === "text");
  if (!textContent || textContent.type !== "text") {
    throw new Error("Nessuna risposta testuale da Claude");
  }
  return textContent.text;
}

async function analyzeWithGemini(base64: string, mediaType: string): Promise<string> {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType: mediaType,
        data: base64,
      },
    },
    {
      text: `${SYSTEM_PROMPT}\n\nAnalizza questa bolletta energetica italiana e fornisci l'analisi in formato JSON come specificato.`,
    },
  ]);

  const response = await result.response;
  return response.text();
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Nessun file caricato" },
        { status: 400 }
      );
    }

    const useAnthropic = !!process.env.ANTHROPIC_API_KEY;
    const useGoogle = !!process.env.GOOGLE_AI_API_KEY;

    if (!useAnthropic && !useGoogle) {
      return NextResponse.json(
        { error: "Nessuna API key configurata (ANTHROPIC_API_KEY o GOOGLE_AI_API_KEY)" },
        { status: 500 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");

    let mediaType: string;
    if (file.type === "application/pdf") {
      mediaType = "application/pdf";
    } else if (file.type === "image/png") {
      mediaType = "image/png";
    } else if (file.type === "image/gif") {
      mediaType = "image/gif";
    } else if (file.type === "image/webp") {
      mediaType = "image/webp";
    } else {
      mediaType = "image/jpeg";
    }

    let responseText: string;
    let provider: string;

    if (useAnthropic) {
      provider = "claude";
      responseText = await analyzeWithClaude(base64, mediaType);
    } else {
      provider = "gemini";
      responseText = await analyzeWithGemini(base64, mediaType);
    }

    let jsonText = responseText.trim();
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
    }

    const analysis = JSON.parse(jsonText);
    analysis._provider = provider;

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Error analyzing bolletta:", error);
    return NextResponse.json(
      { error: "Errore durante l'analisi della bolletta" },
      { status: 500 }
    );
  }
}
