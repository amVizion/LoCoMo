import conversations from './conversations.json'
import { iQuestion, iDialogue } from './types'

const cosineSimilarity = (a: number[], b: number[]) => {
    const dotProduct = a.reduce((acc, val, i) => acc + val * b[i], 0)
    const magnitudeA = Math.sqrt(a.reduce((acc, val) => acc + Math.pow(val, 2), 0))
    const magnitudeB = Math.sqrt(b.reduce((acc, val) => acc + Math.pow(val, 2), 0))
    return dotProduct / (magnitudeA * magnitudeB)
}

const euclideanDistance = (a: number[], b: number[]) => {
    return Math.sqrt(a.reduce((acc, val, i) => acc + Math.pow(val - b[i], 2), 0))
}

type Distance = 'cosine' | 'euclidean'
export const findAnswers = (question:iQuestion, metric?:Distance, topAnswers?:number) => {
    const distances = conversations.map(({ embeddings, id, text, speaker }) => {
        if(metric === 'euclidean') {
            const distance = euclideanDistance(question!.embeddings, embeddings)
            return { distance, id, text, speaker }
        }

        const distance = cosineSimilarity(question!.embeddings, embeddings)
        return { distance, id, text, speaker }
    })

    const sorted = distances.sort((a, b) => b.distance - a.distance)
    const top10 = sorted.slice(0, topAnswers || 10)

    return top10 as unknown as iDialogue[]
}

// First question, which retrieval distance is better: euclidean or cosine?

