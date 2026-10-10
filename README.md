# Gasolinera · Caso Flow (AndesFuel)

Prueba técnica para el rol AI-Native Product Manager, Seamless Experience. Caso y cifras ficticios.

## Contenido

| Carpeta | Qué contiene |
|---|---|
| `entregables/` | Los 7 entregables obligatorios: resumen ejecutivo, módulos M1–M6, modelo financiero, diagramas, roadmap y dashboard, presentación y declaración de IA |
| `public/` | Prototipo funcional (entregable opcional 8) |
| `docs/GUION_DEMO.md` | Guion de la demo de 5 minutos |
| `casos_prueba.json` | Los 5 casos de prueba del agente de disputas con su resultado esperado |

## Prototipo: agente de disputas y recorrido en isla

Entregable opcional 8 del caso Flow (AndesFuel, caso ficticio). Una página web sin dependencias de servidor:

- **En la isla:** simula la máquina de estados de una transacción Flow en 5 escenarios (flota con tag, frecuente de la app, noche con placa dudosa, sin enlace con prepago reservado, preautorización rechazada). Muestra la pantalla de la isla, el teléfono del conductor y el tiempo en isla.
- **Agente de disputas:** 5 casos de prueba y 2 ataques de inyección. Botones *Caso 1–5*, *Ataque 1–2* y *Correr los 7*: cada uno narra paso a paso qué revisa el agente, qué está bien, qué está mal, qué concluye el motor y qué falta autorizar. Al final, un tablero de evaluación con acuerdo, ataques contenidos, costo y latencia. El agente lee evidencia con herramientas de solo lectura, un motor de reglas determinista clasifica y fija el monto, un modelo de lenguaje solo redacta el mensaje al cliente y una persona aprueba. La acción aprobada se firma (SHA-256) y se revalida antes de ejecutarse.
- **Motor de fraude:** 6 transacciones (normal, placa clonada, viaje imposible entre estaciones, volumen mayor que el tanque del modelo, frecuencia anómala, cuenta nueva de alto riesgo). 5 reglas del repostaje evaluadas una a una (las críticas bloquean solas) más un modelo de puntaje logístico que gradúa la zona gris: aprobar, verificación adicional (≥0,5) o asistido (≥0,8). El LLM solo redacta la explicación para el analista (`api/explicar.js`, Haiku).
- **Interruptor Con LLM / Sin LLM** (arriba a la derecha): el mismo flujo corre con el modelo o solo con reglas. Si la API falla, la página cae a reglas sola.

## Principios que demuestra

| Principio | Dónde se ve |
|---|---|
| Las reglas deciden; el LLM investiga, propone y redacta | El monto y la clasificación salen de `decide()`; el modelo nunca los recibe como algo que pueda cambiar |
| Contenido del cliente = datos | Caso D-1045: el mensaje trae una instrucción incrustada; se marca como inyección y no cambia la decisión |
| Validación de la salida del modelo | Si el borrador menciona un monto no autorizado, se descarta y se usa la plantilla |
| Humano en el ciclo | Ninguna acción se ejecuta sin "Aprobar y firmar" |
| Defensa en profundidad | Al aprobar, la herramienta vuelve a correr las reglas y exige monto ≤ transacción |
| Degradación controlada | Sin IA disponible (o en modo "Sin modelo"), todo funciona con plantillas deterministas |
| Nunca despachar sin autorización | Escenario "Preautorización rechazada": el surtidor nunca se habilita |
| Nunca tarjeta sin enlace | Escenario "Sin enlace": solo opera el saldo prepago reservado |


## Agente con LLM (`api/agente.js`)

Función de Vercel sin dependencias que corre el ciclo del agente contra la API de Anthropic:

1. El modelo recibe la disputa (el mensaje del cliente va marcado como dato no confiable) y **elige qué herramientas de solo lectura llamar**: transacción, ANPR, ticket del surtidor, presencia del dispositivo, historial y notificaciones.
2. Termina con `proponer_resolucion` (salida estructurada: clasificación, acción, monto, confianza, razones, señales de inyección y borrador).
3. El servidor **revalida con el motor de reglas**: si la clasificación, la acción o el monto no coinciden, gana la regla y el caso se escala. El monto nunca supera la transacción y el borrador no puede mencionar montos no autorizados.
4. Devuelve la traza completa (`trace_id`, cada llamada, tiempos), tokens y costo por caso. Una persona aprueba antes de ejecutar.

Controles: tope de 8 pasos, timeout de 25 s por llamada con un reintento, límite de ejecuciones por IP y `max_tokens` acotado. Sin `ANTHROPIC_API_KEY` la página sigue funcionando en modo reglas.

**Evaluación:** el botón *Evaluar el agente* corre los 5 casos dorados y 2 ataques de inyección, y reporta acuerdo con las reglas, ataques contenidos, costo medio y latencia p50.

| Variable de entorno (Vercel) | Uso |
|---|---|
| `ANTHROPIC_API_KEY` | Obligatoria para el modo LLM. Nunca en el código |
| `MODEL` | Opcional. Por defecto `claude-sonnet-5-5` |
| `RATE_MAX` | Opcional. Ejecuciones por IP cada 10 min (por defecto 25) |

## Explicación de fraude con LLM (`api/explicar.js`)

`POST /api/explicar` con `{datos}` (≤3.000 caracteres). Usa `MODEL_RAPIDO` (por defecto `claude-haiku-5-5`): recibe la decisión ya tomada por el motor y la explica en ≤60 palabras. No puede cambiarla. Mismo límite por IP; sin `ANTHROPIC_API_KEY` responde 503 y la página usa plantilla.

## Casos de prueba (`casos_prueba.json`)

| Caso | Tipo | Resultado esperado |
|---|---|---|
| D-1041 | No reconozco | Fraude amigable: representar con evidencia, sin reembolso |
| D-1042 | Monto incorrecto | Confusión por retención de COP 200.000: aclarar y escalar la liberación del hold |
| D-1043 | Monto incorrecto (flota) | Error nuestro: nota crédito de COP 92.800 |
| D-1044 | No reconozco | Fraude real (placa clonada, viaje imposible): reembolso total, bloqueo y escalamiento |
| D-1045 | No reconozco + inyección | Inyección detectada; se mantiene la representación y se escala |

## Demo en vivo

URL pública: https://gasolinera-phi.vercel.app/

## Cómo correrlo

- Abrir `public/index.html` en cualquier navegador, o publicarlo como sitio estático (Vercel, GitHub Pages). Fuera de claude.ai la redacción con IA no está disponible y la página usa plantillas.
- En producción, `decide()` y las herramientas vivirían en el backend, con herramientas tipadas (zod), el LLM vía API y la firma HMAC del lado del servidor, como en los agentes de órdenes de compra y contratos del candidato.

Datos, placas y personas son ficticios.
