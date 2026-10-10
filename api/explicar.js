// Explicación de alertas de fraude para el analista (Vercel Function, sin dependencias).
// El LLM solo INFORMA: recibe la decisión ya tomada por el motor determinista y la explica.
// Usa un modelo pequeño y barato (ruteo de modelos): la redacción corta no necesita el modelo grande.
"use strict";
const MODEL = process.env.MODEL_RAPIDO || "claude-haiku-5-5";
const PRICES = { "claude-haiku-5-5": [0.1, 0.5], "claude-sonnet-5-5": [2, 10] };
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now(), win = 10 * 60 * 1000, max = Number(process.env.RATE_MAX || 25) * 2;
  const arr = (hits.get(ip) || []).filter(t => now - t < win); arr.push(now); hits.set(ip, arr);
  return arr.length > max;
}
const SYSTEM = `Eres el asistente del analista de fraude de AndesFuel Flow (Colombia).
Recibes una transacción, las señales que evaluó el motor de fraude, el puntaje del modelo y la DECISIÓN ya tomada por el motor.
Explica en máximo 60 palabras, en español claro, por qué el motor decidió eso y qué debe revisar el analista.
No cambies la decisión, no propongas otra, no inventes datos que no estén en la entrada. Responde solo con el texto.`;

module.exports = async (req, res) => {
  res.setHeader("cache-control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "Usa POST" });
  if (!process.env.ANTHROPIC_API_KEY) return res.status(503).json({ error: "sin_llm" });
  const ip = (req.headers["x-forwarded-for"] || "").split(",")[0] || "anon";
  if (rateLimited(ip)) return res.status(429).json({ error: "limite" });
  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  const datos = JSON.stringify(body.datos || {});
  if (datos.length > 3000) return res.status(400).json({ error: "demasiado_grande" });
  const t0 = Date.now();
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 20000);
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST", signal: ctl.signal,
      headers: { "content-type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: MODEL, max_tokens: 300, system: SYSTEM, messages: [{ role: "user", content: `<caso>${datos}</caso>` }] })
    });
    clearTimeout(t);
    const j = await r.json();
    if (!r.ok) return res.status(502).json({ error: "modelo", detalle: (j.error && j.error.message) || r.status });
    const texto = (j.content || []).filter(b => b.type === "text").map(b => b.text).join(" ").trim().slice(0, 700);
    const [pin, pout] = PRICES[MODEL] || [0.1, 0.5];
    const u = j.usage || {};
    return res.status(200).json({ texto, modelo: MODEL, latencia_ms: Date.now() - t0,
      uso: { input_tokens: u.input_tokens || 0, output_tokens: u.output_tokens || 0, costo_usd: Number((((u.input_tokens || 0) * pin + (u.output_tokens || 0) * pout) / 1e6).toFixed(6)) } });
  } catch (e) {
    clearTimeout(t);
    return res.status(502).json({ error: "modelo", detalle: String(e.message || e) });
  }
};
