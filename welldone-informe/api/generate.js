export const config = { maxDuration: 60 };

const SYSTEM_PROMPT = `Eres el Asistente Senior de Ingeniería de Welldone Ingeniería & Mantenimiento S.A.S. Tu misión es analizar una propuesta comercial y generar el contenido de un Informe Técnico de Cierre. REGLAS CRÍTICAS: Responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional, sin markdown, sin comillas de código. Si un dato no está en la propuesta, usa "[DATO PENDIENTE]". Detecta el sector: PH, Logística, Centro Comercial, Educativo, Médico u Otro. Adapta el tono según sector. Genera EXACTAMENTE este JSON: {"meta":{"cliente":"","nombre_proyecto":"","codigo_proyecto":"","fecha_ejecucion":"","interlocutor":"","elaborado_por":"__ELABORADO_POR__","id_informe":"","sector":""},"cap1_resumen":"","cap2_condicion_inicial":"","cap3_alcance_intro":"","cap3_items":[{"item":1,"descripcion":"","um":"","cantidad":"","ejecucion":"100%"}],"cap5_resultados":"","cap5_metricas":{"tiempo_ejecucion":"","valor_contratado":"[DATO PENDIENTE]","valor_final":"[DATO PENDIENTE]","desviaciones":"Ninguna"},"cap6_recomendaciones":{"urgente":[""],"corto_plazo":[""],"anual":[""]},"cap7_cierre":"","cap8_garantias":[{"cobertura":"Mano de Obra","detalle":"Correcta aplicación del esquema de reparación.","tiempo":"6 meses"},{"cobertura":"Material","detalle":"Defectos de fabricación según proveedor.","tiempo":"Según fabricante"},{"cobertura":"Funcionamiento","detalle":"Estanqueidad, adherencia y continuidad.","tiempo":"6 meses"}],"cap8_compromiso":"","cap8_post_servicio":["Visita de inspección preventiva sin costo a los 3 meses.","Reporte fotográfico del estado post-intervención."]}`;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { pdfText, apiKey, elaboradoPor } = req.body;
    if (!pdfText || !apiKey) return res.status(400).json({ error: "Faltan campos: pdfText, apiKey" });

    const systemPrompt = SYSTEM_PROMPT.replace("__ELABORADO_POR__", elaboradoPor || "[DATO PENDIENTE]");

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{
          role: "user",
          content: `Analiza esta propuesta comercial y genera el JSON del informe técnico de cierre:\n\n${pdfText}`
        }]
      })
    });

    if (!anthropicRes.ok) {
      const err = await anthropicRes.json().catch(() => ({}));
      return res.status(anthropicRes.status).json({ error: `Anthropic API error: ${err?.error?.message || anthropicRes.statusText}` });
    }

    const data = await anthropicRes.json();
    let raw = data.content[0].text.trim();
    raw = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    return res.status(200).json(JSON.parse(raw));

  } catch (err) {
    return res.status(500).json({ error: err.message || "Error interno" });
  }
}
