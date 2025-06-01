/*

Objetivo: Identicar cuales son las herramientas que requerimos.

Proceso:
1. Filtrar las preguntas de categoria 2 y realizar un analisis manualmente.
2. Utilizar un proceso de reduccion de dimensionalidad y clusterizacion mas modelo de lenguaje para tener una lista definitiva.

*/

import QUESTIONS from '../data/questions.json'
import CONVERSATIONS from '../data/conversations.json'

import { kMeansCluster } from 'simple-statistics'
import { iQuestion } from '../types'
import { PCA } from 'ml-pca'
import { callOllama } from '../baseline/4.Infer'
import { writeFileSync } from 'fs'

interface iAnsweredQuestion extends iQuestion {
    conversation: string
    timestamp: string
    speaker: string
}

const filterQuestions = () => {
    const filteredQuestions = QUESTIONS.filter(q => q.category === 2)

    // For each question, print the question, the answer, and the evidence.
    const temporalQuestions = filteredQuestions.map(q => {
        const conversation = CONVERSATIONS.find(c => c.id === q.evidence[0])!
        const { text, date_time, speaker } = conversation
        // console.log(q.question, q.answer, text, date_time)
        return { 
            ...q, 
            conversation:text, 
            timestamp:date_time,
            speaker 
        } as iAnsweredQuestion  
    })

    return temporalQuestions
}

// TODO: perform contrastive clustering
const getClusters = (questions:iAnsweredQuestion[]) => {
    // Reutilizar el modelo de PCA en las dimesiones temporales para todas las conversaciones.
    const qEmbeddings = questions.map(c => c.embeddings)

    // Obtener las conversaciones temporales de las conversaciones
    const pca = new PCA(qEmbeddings)

    // Reduciendo las conversaciones de 512 a 5 dimensiones.
    const reducedEmbeddings = pca.predict(qEmbeddings, { nComponents:2 }).to2DArray()
    const data = questions.map((q, i) => ({ 
        x: reducedEmbeddings[i][0], 
        y: reducedEmbeddings[i][1],
        text: q.question 
    }))
    writeFileSync('../app/src/data/embeddings.json', JSON.stringify(data))
    return

    // Clusterizar las preguntas
    const { centroids, labels } = kMeansCluster(reducedEmbeddings, 5)
    const rawClusters = centroids.map((c, i) => {
        // Clusters do not contain reduced embeddings
        const elements = questions
            .filter((_, idx) => labels[idx] === i)
            .map((q, idx) => ({...q, embeddings: reducedEmbeddings[idx] }))
        return elements
    })

    // Consolidate clusters with less than 3 elements
    const clusters = rawClusters.reduce((acc, c) => {
        if(c.length <= 3) {
            const lastCluster = acc[acc.length - 1]
            return [...acc.slice(0, -1), [...lastCluster, ...c]]
        }
        return [c, ...acc]
    }, [[]] as iAnsweredQuestion[][]).filter(c => c.length > 0)

    console.log('Raw Clusters', rawClusters.map(c => c.length))
    console.log('Clusters', clusters.map(c => c.length))

    return clusters
}

const ANALYSIS_PROMPT = (questions:iAnsweredQuestion[]) => `
The following questions are answered via a temporal reasoining process.
The questions are grouped by similarity.

Your task is:

1. Find the commonalities in the temporal reasoining pattern across the group question.
2. Identify the programming tools that would required to answer the questions.
3. Provide a possible set of future analysis based on the content.

${
questions.map((q, i) => `
Question: ${q.question}
Answer: ${q.answer}
Evidence: ${q.speaker}(${q.timestamp}): ${q.conversation}
    `).join('\n\n')
}

`

const getAnalysis = async(clusters:iAnsweredQuestion[][]) => {
    const report = []
    for (const cluster of clusters) {
        const texts = cluster.map(q => q.question)
        const prompt = ANALYSIS_PROMPT(cluster)
        const analysis = await callOllama(prompt)
        report.push({ texts, analysis })
    }

    return report
}

const index = async() => {
    const questions = filterQuestions()
    const clusters = getClusters(questions)
/*    

    const llmAnalysis = await getAnalysis(clusters)
    writeFileSync('../data/llmAnalysis.json', JSON.stringify(llmAnalysis))
*/

}

/*

1. Visualizar las preguntas en un espacio de 2D.
2. Distinguir las preguntas de razonamiento temporal de las que no lo son.
    2.a. Reduccion de dimensionalidad.
    2.b. Aprendizaje por contraste.
3. Visualizar preguntas y respuestas.
4. Visualizacion por dimensionalidad.
    - Entidades (eventos, nombres propios).
    - Tiempo (presente, pasado y futuro).
    - Persona (John y Gina)
5. Exploracion por dimensiones.


-------------

1. Añadir el texto al guardar las preguntas.
2. Añadir el tooltip a la grafica.


*/

index().catch(console.log)
