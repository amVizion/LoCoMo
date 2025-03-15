# Temporal Reasoning

Queremos utilizar computacion simbolico (programacion) para resolver problemas de razonamiento temporal.

El primer problema que vamos a resolver involucra calcular la diferencia entre una fecha y un periodo de tiempo (por ejemplo ayer).

Conforme avancemos añadiremos mayor funcionalidad a nuestra herramienta de razonamiento temporal.

La herramienta va tener un modulo de enrutador que identifica cuando utilizar la herramienta, que funcion (programatica) utilizar, que argumentos necesita y como reportar los resultados.

Vamos a utilizar analisis numericos para identificar que herramientas necesitamos y como implementarlas.

Tambien vamos a utilizar un analisis numerico para intentar no depender del modelo de lenguaje para saber cuando utilizar nuestra herramienta y como utilizarla (quiza solo la utilicemos como verifiquemos).


**Modulos**
1. Calcular la diference entre una fecha y un periodo de tiempo.




## Computar el Delta Temporal entre dos fechas

### Sample Question:
*Question*: "When Jon has lost his job as a banker?",
*Answer*: "19 January, 2023" 
*Evidence*: "Hey Gina! Good to see you too. Lost my job as a banker **yesterday**, so I'm gonna take a shot at starting my own business."
*conversation Date:* "4:04 pm on 20 January, 2023"


## Objetives:
1. Implementemos un modulo de razonamiento temporal (herramienta).
2. Construcción de un modelo de aprendizaje profundo para identificar el uso de la herramienta.
3. Modelado de la información en un grafo de conocimiento temporal.
4. Visualizacion del dataset temporal y de nuestro grafo dinamico (temporal).
5. Comparacion con Mistral sin el modulo de razonamiento. 

## Implementación:

### Construccion del dataset

*Objetivo:* Informar las herramientas que requerimos para construir el dataset temporal.
*Tecnica:* Aprendizaje por contraste para identificar las conversaciones que tienen informacion temporal.

Modelo contiene dos componentes: discernimiento de las conversaciones con informacion temporal y la identificacion de las diferentes relaciones temporales. Esto nos va resolver cuando utilizar el modelo y como desarrollarlo (que capacidades incluir en la herramienta).

#### Construccion de la herrmamienta
1. Filtrar las conversaciones que contienen informacion temporal (basado en la evidencia).
2. Reducir la dimensionalidad de las conversacions (5 a 12 dimensiones).
3. Clusterizar las conversaciones e identificar si podemos discernir las distintas relaciones temporales.


#### Discriminacion de informacion temporal 
Puede ser aplicable durante la extraccion de datos (RAG) o para la construccion de la grafica de conocimiento dinamica. 

1. Reducir la dimensionalidad de las conversacions (12 dimensiones).
2. Filtrar las conversaciones que contienen informacion temporal (basado en la evidencia).
3. Entrenar un modelo (sencillo) de regresion para identificar las conversaciones con informacion temporal.



Aclaracion:
Proceso de reduccion de dimensionalidad puede ser mejorado para facilitar la segmentacion de conversaciones con informacion temporal.
