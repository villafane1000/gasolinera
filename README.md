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
- **Agente de disputas:** 5 casos de prueba. El agente lee evidencia con herramientas de solo lectura, un motor de reglas determinista clasifica y fija el monto, un modelo de lenguaje solo redacta el mensaje al cliente y una persona aprueba. La acción aprobada se firma (SHA-256) y se revalida antes de ejecutarse.

## Principios que demuestra

| Principio | Dónde se ve |
|---|---|
| Las reglas deciden; el LLM redacta | El monto y la clasificación salen de `decide()`; el modelo nunca los recibe como algo que pueda cambiar |
| Contenido del cliente = datos | Caso D-1045: el mensaje trae una instrucción incrustada; se marca como inyección y no cambia la decisión |
| Validación de la salida del modelo | Si el borrador menciona un monto no autorizado, se descarta y se usa la plantilla |
| Humano en el ciclo | Ninguna acción se ejecuta sin "Aprobar y firmar" |
| Defensa en profundidad | Al aprobar, la herramienta vuelve a correr las reglas y exige monto ≤ transacción |
| Degradación controlada | Sin IA disponible (o en modo "Sin modelo"), todo funciona con plantillas deterministas |
| Nunca despachar sin autorización | Escenario "Preautorización rechazada": el surtidor nunca se habilita |
| Nunca tarjeta sin enlace | Escenario "Sin enlace": solo opera el saldo prepago reservado |

## Casos de prueba (`casos_prueba.json`)

| Caso | Tipo | Resultado esperado |
|---|---|---|
| D-1041 | No reconozco | Fraude amigable: representar con evidencia, sin reembolso |
| D-1042 | Monto incorrecto | Confusión por retención de COP 200.000: aclarar y escalar la liberación del hold |
| D-1043 | Monto incorrecto (flota) | Error nuestro: nota crédito de COP 92.800 |
| D-1044 | No reconozco | Fraude real (placa clonada, viaje imposible): reembolso total, bloqueo y escalamiento |
| D-1045 | No reconozco + inyección | Inyección detectada; se mantiene la representación y se escala |

## Demo en vivo

URL pública: _se agrega al desplegar en Vercel_

## Cómo correrlo

- Abrir `public/index.html` en cualquier navegador, o publicarlo como sitio estático (Vercel, GitHub Pages). Fuera de claude.ai la redacción con IA no está disponible y la página usa plantillas.
- En producción, `decide()` y las herramientas vivirían en el backend, con herramientas tipadas (zod), el LLM vía API y la firma HMAC del lado del servidor, como en los agentes de órdenes de compra y contratos del candidato.

Datos, placas y personas son ficticios.
