# Adan AI

## Iterative hierarchical search

- [x] Encode summaries, reusing init methods.
- [x] Select randomly a question filtered by category.
- [x] Select top summary by similarity, compared to question.
- [x] Ask LLM if information is relevant to the question.
- [x] Evaluate based on reply.

## Agentless
El problema es que es muy lento. El segundo problema es que en el resumen no se encuentra la respuesta. Utilizar una mejora inspirada en Agentless.

Combinar la informacion de los resumenes con la informacion de las conversaciones. Iterativamente.

### Flujo

1. Dada una pregunta, seleccionar el resumen mas similar.
2. Preguntar a LLM si la informacion es relevante para contestar la pregunta.
    2.1 Si la respuesta es si, entonces pasar al modulo de resolver la pregunta.
    2.2 Si la respuesta es no, entonces las 10 conversas mas similares al resumen.
    2.3 Validar si la respuesta esta en las conversaciones.
    2.4 Si la respuesta esta en las conversaciones, entonces pasar al modulo de resolver la pregunta.
    2.5 De lo contrario repertir el paso dos, usando una tecnica de paginacion (mantener un indice de los resumes y las conversaciones ya exploradas).
3. Modulo de resolucion. Va tomar la informacion y proveer una respuesta.
    

### Modulos
1. Extraer los resumenes y las conversaciones. Manteniendo una memoria.
2. Validar si la informacion es relevante (por ahora no implementar suficiencia).
3. Resolver la pregunta.

*Nota* En un futuro podemos implementar un modulo de reformulacion de preguntas. Especialmente cuando avanzamos en las preguntas "multi-hop" que requieren multiple evidencia para ser contestadas.




## Single hop questions
- [ ] Implement memory.
- [ ] Iterative question.

