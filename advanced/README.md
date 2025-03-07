# Advanced RAG Architectures

## Using Memory for Single Questions
1. Iterar por los msjs de una conversación y encontrar los relevantes con un LLM.
2. Almacenar los mensajes relevantes en una memoria.
3. Utilizando la memoria, contestar la pregunta.
4. Evaluar los resultados (manualmente).

## Enabling Multi-Agents for Multi-Hop Reasoning

### Reuse single-hop memory arquitecture
1. Dos agentes, uno para la primera sesion y otro para la segunda.
2. Modificar el contexto para incluir ambas sesiones.

### Questions answering by agents
Habilitar la comunicacion entre agentes inteligentes.
Para responder una pregunta Q.
Con la peculiaridad de que la respuesta requiere de sumarizar y razonamiento.

Dar el resumen de una conversacion al agente A.
Le vamos a permitir hacer una pregunta al agente B.

En base a la pregunta y respuesta de los agentes.
Intentar responder la pregunta Q.

#### TODO
Habiltar ciclos iterativos de conversaciones y razonamiento. 


## Constructing a Knowledge Graph

## Others

* Evaluations for training
* Connect with Discord
