/*

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

*/

import CONVERSATIONS from '../data/conversations.json'
import QUESTIONS from '../data/questions.json'
import KG from '../data/knowledge.json'

import { callOllama } from '../baseline/4.Infer';
import { iQuestion } from '../types';
import { iTriple } from './construction';
import { getSession } from '../advanced/memoryRAG';

// Relevant conversations
const MEMORY:number[] = []

// TODO: Use for evaluation.
const VISITED_NODES = []

// Get entities from question.
const QUESTION_PROMPT = (text:string) => `
In the following question, identify the entities that are relevant to find the answer.
Return your answer in json format ([entity1, entity2, ...]).
Do not add any other information, or explanations.

QUESTION:
${text}

ENTITIES:
`

// TODO: Fallback question prompt (in case no exact match).

// Navigate to next entity.
const NAVIGATE_PROMPT = (relations:string[], question:string) => `
You will be provided with a question, and a list of relations.
Identitfy the relation that is most relevant to answer the question.

QUESTION:
${question}

RELATIONS:
${relations.join('\n')}

Return your answer in a JSON triple: [subject, relation, object]. 

SELECTED RELATION:
`

// Answer the question. (If no info, reply will be NO)
const ANSWER_PROMPT = (question:string, texts:string[]) => `
Based on the following information answer the question.
If you need more information, reply with NO.
Answer succintly. Do not provide additional explanations.

QUESTION:
${question}

INFORMATION:
- ${texts.join('\n')}

`


// Get unique entities from KG
const getGraphEntities = () => {
    const entities = KG.map((triple) => [triple.subject, triple.object]).flat()
    const uniqueEntities = [...new Set(entities)]
    return uniqueEntities.map((entity) => entity.toLowerCase())    
}

// Get key of initial node.
const getInitialNode = async(question:string):Promise<string> => {
    const uniqueEntities = getGraphEntities()

    // Get entities from question
    const questionPrompt = QUESTION_PROMPT(question)
    const ollamaEntities = await callOllama(questionPrompt)

    // Get question entities from Ollama.
    const questionEntities = JSON.parse(ollamaEntities).map((entity:string) => entity.toLowerCase())
    if(!Array.isArray(questionEntities)) throw new Error('Invalid response from Ollama')
    if(!questionEntities.length) throw new Error('No entities found in question')

    // Find initial node. Start by the first question entity that has a match in the KG.
    const kgEntities = getGraphEntities()
    const initialNode = questionEntities.find((entity:string) =>
        kgEntities.includes(entity)
    )


    console.log('Initial Node:', initialNode)

    if(initialNode) return initialNode  

    // Printed sorted unique entities
    console.log('Entities:', uniqueEntities.sort())
    console.log('Question Entities:', questionEntities)

    throw new Error('No initial node found')

}


// Consider both: entities and relationships
const findRelation = async(entity:string, question:string):Promise<string> => {
    console.log('entity:', entity)
    const neighbors = KG.filter((triple) => 
        triple.subject.toLowerCase() === entity 
        || triple.object.toLowerCase() === entity
    ).map((triple) => `${triple.subject} ${triple.predicate} ${triple.object}`)

    if(!neighbors.length) throw new Error('No neighbors found')

    const prompt = NAVIGATE_PROMPT(neighbors, question)
    const response = await callOllama(prompt)

    console.log('Ollama entity:', response)

    // Validate Ollama response
    const selectedRelation = JSON.parse(response)
    const [subject, _, object] = selectedRelation
    
    // TODO: Validate subject or object is entity

    const selectedTriple = KG.find((triple) => 
        triple .subject=== subject && triple.object === object
    )

    console.log('Selected Triple:', selectedTriple)
    if(!selectedTriple) throw new Error('Invalid Selected Triple')

    // TODO: Handle edge case when selectedRelation is duplicated (as subject, and entity)-
    MEMORY.push(selectedTriple.dialogue_id)

    const nextEntity = entity === subject ? object : subject
    console.log('Next Entity:', nextEntity)
    return nextEntity
}


const getAnswer = async(question:string) => {
    // Get conversations from Memory index.
    const conversationIds = MEMORY.map(id => `D1:${id}`)
    const conversations = CONVERSATIONS.filter(({ id }) => conversationIds.includes(id))
    const texts = conversations.map(({ text }) => text)

    const prompt = ANSWER_PROMPT(question, texts)
    const response = await callOllama(prompt)
    const cleanResponse = response.trim()

    if(cleanResponse === 'NO') return ''

    return cleanResponse as string
}

const index = async(question:string) => {
    // Get starting node
    const initialNode = await getInitialNode(question)
    let selectedEntity = initialNode

    // Iterate over nodes
    while (true) {
        // Get most relevant relation, and update memory.
        const nextEntity = await findRelation(selectedEntity, question) 
        selectedEntity = nextEntity
        
        // Ask LLM if continue
        const answer = await getAnswer(question)
        if(!!answer.length) break
    }
}

index('What job did Jon lost?')


/*

1. Dividir el proceso de visita al siguiente nodo en dos (antes de contestar y despues).
2. Si el nodo no tiene mas relaciones. Vamos a remover la entidad y buscar la siguiente entidad.


Observations:
- Ideally we want single word entities.
- Selection process we want to find the most information dense entities.
- During selection we need validation, and printing.

Observatons II
- Construct knowledge graph through communities:
1. Seleccionar las palabras con mayor peso (por ejemplo, TF-IDF o Atención).
    1. Para cada dialogo => Vamos a balancear la longitud del dialogo, con el de las palabras (seleccionadas).
2. Identificando las relaciones entre las palabras con mayor peso (podemos usar lexemas).
3. Identificar las comunidades o subgrafos dentro de las relaciones.

===================
Agregar las relaciones
====================

Encontrar durante la construccion:
Simplificar las entidades a una sola palabra. Con un lexema en comun.

En el nodo inicial: empezar seleccionado el nodo mas relevante con la mayor cantidad de informacion.

1. Busqueda semantica en caso de que no haya un match exacto.



*/

