/*

1. Entrenar un modelo de PCA (general) para preguntas en dos dimensiones.
2. Filtrar las preguntas de temporalidad (categoria 2).
3. Guardar dos datasets distintos (temporal y no temporalidad).
4. Al graficarlas quiero visualizar por color las dos preguntas.

Despues vamos a hacer aprendizaje por contraste.

*/

import { writeFileSync } from 'fs'
import QUESTIONS from '../data/questions.json'
import { PCA } from 'ml-pca'

const categoryVisualization = () => {
    const embeddings = QUESTIONS.map(q => q.embeddings)
    const pca = new PCA(embeddings)

    const temporalQuestions = QUESTIONS.filter(q => q.category === 2)
    const normalQuestions = QUESTIONS.filter(q => q.category !== 2)

    const temporalEmbeddings = temporalQuestions.map(q => q.embeddings)
    const normalEmbeddings = normalQuestions.map(q => q.embeddings)

    const temporalPCA = pca.predict(temporalEmbeddings, { nComponents: 2 }).to2DArray()
    const normalPCA = pca.predict(normalEmbeddings, { nComponents: 2 }).to2DArray()

    const temporalData = temporalQuestions.map((q, i) => ({ x: temporalPCA[i][0], y: temporalPCA[i][1], text: q.question }))
    const normalData = normalQuestions.map((q, i) => ({ x: normalPCA[i][0], y: normalPCA[i][1], text: q.question }))

    writeFileSync('../app/src/data/temporalEmbeddings.json', JSON.stringify(temporalData))
    writeFileSync('../app/src/data/normalEmbeddings.json', JSON.stringify(normalData))
}

categoryVisualization()
