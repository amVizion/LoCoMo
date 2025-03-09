// Construction of a dataset for temporal analysis in conversations

/*
#### Construccion de la herrmamienta
1. Filtrar las conversaciones que contienen informacion temporal (basado en la evidencia).
2. Reducir la dimensionalidad de las conversacions (5 a 12 dimensiones).
*/

import { writeFileSync } from 'fs'
import CONVERSATIONS from '../data/conversations.json'
import DATA from '../data/data.json'
import { PCA } from 'ml-pca'


// Filtrar las conversaciones basado en la evidencia
const getTemporalConversations = () => {
    // Filter questions by category (2).
    const questions = DATA.qa.filter(q => q.category === 2)

    // Get the dialog id from the evidence in the question
    const dialogIds = questions.map(q => q.evidence[0])

    // Obtener las conversaciones por dialog id
    const dialogues = CONVERSATIONS.filter(c => dialogIds.includes(c.id))
    return dialogues
}

const dimensionalityReduction = async(embeddings:number[][]) => {
    // Entrenando nuestro modelo de reduccion de dimensionalidad.
    const pca = new PCA(embeddings)

    // Reduciendo las conversaciones de 512 a 5 dimensiones.
    const reducedEmbeddings = pca.predict(embeddings, { nComponents:5 }).to2DArray()

    return reducedEmbeddings
}

const init = async() => {
    // Filtrar las conversaciones basado en la evidencia
    const conversations = getTemporalConversations()

    // Obtener los embeddings de las conversaciones
    const embeddings = conversations.map(c => c.embeddings)

    // Reducir la dimensionalidad de las conversaciones
    const reducedEmbeddings = await dimensionalityReduction(embeddings)

    // Map conversations to reduced embeddings
    const temporalConversations = conversations.map((c, i) => ({
        ...c, 
        reducedEmbeddings: reducedEmbeddings[i]
    }))

    writeFileSync('../data/temporal.json', JSON.stringify(temporalConversations))
}

init()
