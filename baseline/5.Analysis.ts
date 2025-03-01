/*
- Filter out questions with a single response.
- Measure the average distance between 

*/ 

import dialogues from '../data/conversations.json'
import questions from '../data/questions.json'

// Get center for a set of N dimensional vectors
const averageCenter = (points: number[][]) => {
    const center = points.reduce((acc, point) => {
        return acc.map((val, i) => val + point[i])
    })

    return center.map(val => val / points.length)
}

export const getDelta = () => {
    const conversationCenter = averageCenter(dialogues.map(d => d.embeddings))
    const questionCenter = averageCenter(questions.map(q => q.embeddings))

    // Compute displacement between the two centers
    const delta = conversationCenter.map((val, i) => val - questionCenter[i])
    console.log('delta', delta)

    // Get distance between the two centers
    const distance = Math.sqrt(delta.reduce((acc, val) => acc + val**2, 0))
    console.log('distance', distance)

    return delta
}

// getDelta()
