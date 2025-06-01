/*

Objetivo: Guiar el desarrolo de nuestra herramienta para el razonamiento temporal.
1. Cuales son las funciones (capacidades) que debemos incluir.
2. Cuales son los parametros de entrada y (tal vez de salida) de cada funcion.

Proceso:
1. Identificar cuales son las dimensiones que mas influyen en el razonamiento temporal.
2. Basado en las dimensiones identificadas (3), clusterizar los datos en base a esas 3 dimensiones.
3. Analsis de las distintas operaciones (con un LLM) que necesitamos incluir en nuestra herramienta.
4. Para cada una de las operaciones identificadas, definir los parametros de entrada y salida (con un LLM). 

*/

import TEMPORAL from '../data/temporal.json'
import CONVERSASTIONS from '../data/conversations.json'

import { kMeansCluster } from 'simple-statistics'
import { PCA } from 'ml-pca'
import { callOllama } from '../baseline/4.Infer'

const dimensionalityAnalysis = () => {
    // Reutilizar el modelo de PCA en las dimesiones temporales para todas las conversaciones.
    const temporalEmbeddings = TEMPORAL.map(c => c.embeddings)

    // Obtener las conversaciones temporales de las conversaciones
    const pca = new PCA(temporalEmbeddings)

    // Reduciendo las conversaciones de 512 a 5 dimensiones.
    const fullEmbeddings = CONVERSASTIONS.map(c => c.embeddings)
    const reducedEmbeddings = pca.predict(fullEmbeddings, { nComponents:5 }).to2DArray()


    // Simple identificacion por promedios para cada dimension
    const temporalAverages = TEMPORAL[0].reducedEmbeddings.map((v, i) => {
        const sum = temporalEmbeddings.reduce((acc, c) => acc + c[i], 0)
        return sum / temporalEmbeddings.length
    })

//    console.log('temporalAverages', temporalAverages)

    // Full conversation averages
    const shortEmbeddings = reducedEmbeddings[0].map((v, i) => {
        const sum = reducedEmbeddings.reduce((acc, c) => acc + c[i], 0)
        return sum / reducedEmbeddings.length
    })

//    console.log('shortEmbeddings', shortEmbeddings)

    // Deltas 
    const deltas = shortEmbeddings.map((v, i) => v - temporalAverages[i])
    console.log('deltas', deltas)

    // Filter indices of dimensions with most predictive value (larger delta)
    const sortedIndices = deltas.map((v, i) => ({ v, i })).sort((a, b) => b.v - a.v)
    const topIndices = sortedIndices.slice(0, 2).map(v => v.i)
    return topIndices
}

// Tomar las dimensiones con mayor valor predictivo y clusterizar los datos
const clusterize = ([idx1, idx2]:number[]) => {
    const clusters:string[][] = []

    
    const topDimensions = TEMPORAL.map(c => 
        [c.reducedEmbeddings[idx1], c.reducedEmbeddings[idx2]]
    )

    const { labels } = kMeansCluster(topDimensions, 5)

    // Iterate by cluster, and print all conversations in that cluster
    for (let i = 0; i < 5; i++) {
        const clusterConversations = TEMPORAL.filter((c, j) => labels[j] === i)
        .map(c => c.text)
        clusters.push(clusterConversations)
    }

    // TO Use by an LLM
    return clusters
}


const CLUSTER_PROMPT = (texts:string[]) => `
We are building a tool to help you understand the temporal reasoning.
We want to identify what capabilities in a given dataset.
The following conversations are clustered based on their temporal similarity.

Your task is to identify the common theme in each cluster conversations.
Explain what programming operations would the temporal reasoning module require.

Cluster conversations:
${texts.join('\n')}

What are the common themes in each cluster?
`


const identifyTools = async(clusters:string[][]) => {
    const residueCluster = []
    for(const texts of clusters) {
        if(texts.length < 3 ) {
            residueCluster.push(...texts)
            continue
        }

        const prompt = CLUSTER_PROMPT(texts)
        const reponse = await callOllama(prompt)
        console.log('Response', reponse)
    }

    const prompt = CLUSTER_PROMPT(residueCluster)
    const reponse = await callOllama(prompt)
    console.log('Response', reponse)
}


const analysis = () => {
    const topIndices = dimensionalityAnalysis()
    const clusters = clusterize(topIndices)
    const tools = identifyTools(clusters)
}

analysis()
