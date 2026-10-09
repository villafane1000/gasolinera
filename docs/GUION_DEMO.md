# Guion de la demo · 5 minutos

**0:00 – 0:30 · Contexto.** "El piloto mostró dos problemas que no son de visión: enrolamiento y disputas. Este MVP muestra cómo se ve Flow para el conductor y cómo el agente de disputas ataca el 61 % de 'no reconozco' sin darle al modelo ninguna decisión sobre dinero."

**0:30 – 2:00 · En la isla.**
1. *Frecuente de la app* → Reproducir. Señalar: la retención es de COP 140.000 (hold dinámico), no 200.000; el recibo trae la foto de la placa; tiempo ≈ 2:00.
2. *Sin enlace* → "Solo opera el saldo prepago reservado. Una tarjeta aquí pasaría a asistido: un cupo local no es una autorización del emisor."
3. *Preautorización rechazada* → "El surtidor nunca se habilita. Estos casos son la cola del p90 y se miden aparte."

**2:00 – 4:30 · Agente de disputas.**
1. *D-1041* → mostrar las 6 llamadas de solo lectura, la decisión del motor (representar, COP 0) y el recibo como evidencia.
2. *D-1044* → "Marca y modelo no coinciden y hay un viaje imposible de 300 km en 38 min: fraude real, reembolso total, bloqueo y escalamiento."
3. *D-1045* → "El cliente intenta darle órdenes al agente. Se marca como inyección, la decisión no cambia." Pulsar **Redactar**: si el modelo menciona un monto no autorizado, el borrador se descarta.
4. **Aprobar y firmar** → "La herramienta vuelve a correr las reglas antes de ejecutar: aunque el modelo se equivoque, la acción no pasa."

**4:30 – 5:00 · Cierre.** "El LLM recomienda y redacta; las reglas deciden; la persona aprueba. Pasaría a 'decide' solo en reembolsos menores a COP 50.000 tras 1.000 casos con 98 % de acuerdo."

## Si algo falla en vivo

- Sin IA: elegir "Sin modelo (plantilla)"; todo lo demás funciona igual.
- Sin internet: abrir `index.html` local.
