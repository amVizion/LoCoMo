# Knowledge Graph

Tener triples conectados por relaciones es una forma de representar conocimiento. En este caso, utilizaremos la grafica de conocimiento para responder preguntas sobre una conversacion entre dos personas.

## Constuction

Iterar por las conversaciones de un dialogo e identificar las relaciones en forma de triple. Mantener un indice (diccionario) con las entidades y sus relaciones. De tal forma permitiendo navegar entre entidades y utilizar algorithmos de busqueda en graficas para responser las preguntas. 

Para cada relacion mantegamos el origen de la conversacion que contiene la relacion (o triple) de tal forma poder validar cuando (y si) tenemos suficiente informacion para responder la pregunta.  

## Inference

Algoritmos a considerar: busqueda en profundidad, busqueda en amplitud, busqueda balanceada y exploracion de subgraficas.

### Busqueda Inteligente

Utilizar un LLM para navegar la grafica de conocimiento.

1. Identificar el nodo inicial (prompt en la pregunta).
    1.1. Si el nodo no es exacto utilizar un segundo prompt.
2. Obtener las relaciones para ese nodo inicial.
3. Preguntar al LLM que nodo visitar.
4. Iterar por las relaciones del siguiente
    4.1. Cada 5 nodos visitados preguntar al LLM si continuar o detener.
    4.2. Al incluir las relaciones del nuevo nodo. Este puede regresar.

Vamos a mantener una memoria identificando las relaciones y dialoos visitados.
Al evaluar la respuesta, veremos cuantos nodos visitados fueron relevantes.


## Training/Evaluation

Mediciones para entrenamiento de modelos numericos de navegacion en la grafica y razonamiento.

## Pruebas

1. Preguntas single-hop answers.
2. Preguntas multi-hop answers within a single conversation.
3. Medicion de inferencia:
    - Tamaño de subgrafica necesaria para responder una pregunta.
    - Profundida (maxima) para responder preguntas.
    - Probabilidad de encontrar respuesta en navegacion profunda.
    - Nodos visitados por amplitud para encontrar respuesta.



## TODO

1. Construccion numerica de la grafica de conocimiento.
    - Identificar sujeto y objeto.
    - Relacion va ser a traves del dialogo relevante.

2. Proceso de navegacion tambien numerico.
    - Medir las entidades de la pregunta inicial.
    - Cuales relaciones son mas relevantes.
    - Exploracion => N == 5 (numerico). 
    - Utilizar esos nodos para preguntar al LLM.

3. Conectar la base de datos a Discord.
    - Cada dia procesar la informacion de los lives (dentro de KG).
    - Procesar en tiempo real el contenido del live (modelo de transcripticion de Google).
    Objetivos:
        - Cuando una persona tenga una pregunta que el modelo de lenguaje sea capaz de reponder (en base a conocimiento a anteriror). Identificar cuando es pregunta y cuando no.
        - Iniciar el dialogo al tomar partes interesantes del live (a traves del TTS), y generar preguntas para promover la conversacions. Quiza en base a datos historicos.
        - Respuestas tanto en elive como en la comunidad.
        - Para personas que se registren (den su aprovacion) ir conectando los temas y aplicaciones del live con las preguntas historicas de los asistentes (estudiantes).ñ-

    El objetivo es llevarlo al ambito de la educacion (mas alla de la IA)-

