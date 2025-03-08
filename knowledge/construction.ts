/*

Iterar por las conversaciones de un dialogo e identificar las relaciones en forma de triple. Mantener un indice (diccionario) con las entidades y sus relaciones. De tal forma permitiendo navegar entre entidades y utilizar algorithmos de busqueda en graficas para responser las preguntas. 

Para cada relacion mantegamos el origen de la conversacion que contiene la relacion (o triple) de tal forma poder validar cuando (y si) tenemos suficiente informacion para responder la pregunta.  

*/

import { writeFileSync } from 'fs';
import { getSession } from '../advanced/memoryRAG';
import CONVERSATIONS from '../data/conversations.json'
import { callOllama } from '../baseline/4.Infer';

export interface iTriple {
  subject: string;
  predicate: string;
  object: string;
  dialogue_id: string;
}


// TODO: Evaluate if tuples would be better (instead of JSON)
const TRIPLE__PROMPT = (text:string) => `
Your task is to build a knowledge graph from the following text.
Identify the entities and their relationships in the text.

Do not include every possible, only the relevants for answering questions.
The text is part of a conversation. 
Only include triples where the subject or object is not a speaker.

Answer in json format. With the following structure:
[ { "subject": "entity", "predicate": "relationship", "object": "entity" } ]

TEXT:
${text}

JSON:
`
const ERROR_IDS:number[] = []

const getTriple = async(text:string, dialogue_id:number):Promise<iTriple[]> => {
    const prompt = TRIPLE__PROMPT(text)

    //Call Ollama
    const response = await callOllama(prompt)
    
    // Validate triple
    try {
        const triples = JSON.parse(response)
        // Check if array

        if (!Array.isArray(triples)) throw new Error('Invalid response')

        for (const triple of triples) {
            if (!triple.subject || !triple.predicate || !triple.object) throw new Error('Invalid triple')
        }

        return triples.map((triple) => ({...triple, dialogue_id}))

    // TODO: Implement recursive (triple attempt)
    } catch (error) {
        ERROR_IDS.push(dialogue_id)
        return []
    }

}

const TRIPLES:iTriple[] = []
const index = async(idx:string) => {
    // Get conversation for session (idx)
    const conversation = CONVERSATIONS.filter(({ id }) => getSession(id) === idx)

    // Iterate trough conversations
    for (const c in conversation) {
        // Get triples from dialogue
        const dialogue_id = parseInt(c)
        const {text, speaker} = conversation[dialogue_id]
        const triples = await getTriple(`${speaker}: ${text}`, dialogue_id)
        if(triples.length > 0) TRIPLES.push(...triples)
        console.log(TRIPLES)
    }

    // Save knowledge graph
    writeFileSync('./data/knowledge.json', JSON.stringify(TRIPLES))
    console.log('ERRORS:', ERROR_IDS)

}

// index('1') 
