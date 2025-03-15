/*

Recordatorio: Estamos buscando desarrollar nuestra herramienta de razonamiento temporal.

Vamos a clusterizar las preguntas en grupos para identificar que herramientas de razonamiento temporal requerimos en base al tipo de pregunta.

Clusterización:
1. Filtar las preguntas de razonamiento temporal.
2. Entrenar un modelo de PCA con las preguntas de razonamiento temporal.
3. Predecir la totalidad de las preguntas con nuestro modelo.
4. Identificar las dimensiones con mayor predictibilidad.
5. Utilizar estas dimensiones para clusterizar las preguntas.
6. Visualizar.

Preguntas por contestar:
1. Porque utilizamos las otras preguntas antes de clusterizar si solo queremos clusterizar las preguntas de razonamiento temporal?
2. Porque identificamos las dimensiones mas predicitvas y no utilizamos todas las dimensiones?
3. Porque use 7 y no 12 o 5 dimensiones para encontrar las dimensiones mas significativas?

*/

import { PCA } from 'ml-pca';
import { writeFileSync } from 'fs';
import QUESTIONS from '../data/questions.json';
import { kMeansCluster } from 'simple-statistics';

const temporalQuestions = QUESTIONS.filter(({ category }) => category === 2);
const embeddings = temporalQuestions.map((question) => question.embeddings);
const pca = new PCA(embeddings);

const normalQuestions = QUESTIONS.filter(({ category }) => category !== 2);
const normalPrediction = pca.predict(normalQuestions.map(({ embeddings }) => embeddings), { nComponents: 12 }).to2DArray()

const temporalPrediction = pca.predict(temporalQuestions.map(({ embeddings }) => embeddings), { nComponents: 12 }).to2DArray()



// Get Averages for temporal questions and normal questions
const temporalAverages = temporalPrediction[0].map((_, index) => {
    const sum = temporalPrediction.reduce((acc, current) => acc + current[index], 0);
    return sum / temporalPrediction.length;
})

const normalAverages = normalPrediction[0].map((_, index) => {
    const sum = normalPrediction.reduce((acc, current) => acc + current[index], 0);
    return sum / normalPrediction.length;
})

// Get the two most predictable dimensions. Substract the averages.
const dimensionDeltas = temporalAverages.map((average, index) => Math.abs(average - normalAverages[index]));

const mostPredictableDimensions = dimensionDeltas.map((delta, index) => ({ delta, index })).sort((a, b) => b.delta - a.delta).slice(0, 5);

// Get the values of the embeddings for the two most predictable dimensions.
const temporalDimensions = temporalQuestions.map(({ embeddings }) => embeddings.map((value, index) => value - temporalAverages[index]));



const temporalData = temporalDimensions.map((embeddings, index) => ({
    embeddings: [
        embeddings[mostPredictableDimensions[0].index],
        embeddings[mostPredictableDimensions[1].index],
        embeddings[mostPredictableDimensions[2].index],
        embeddings[mostPredictableDimensions[3].index],
        embeddings[mostPredictableDimensions[4].index],
    ],
    question: temporalQuestions[index].question
}));



const { labels } = kMeansCluster(temporalData.map(({ embeddings }) => embeddings), 5);

const PCA2 = new PCA(temporalData.map(({ embeddings }) => embeddings));
const reducedEmbeddings = PCA2.predict(temporalData.map(({ embeddings }) => embeddings), { nComponents: 2 }).to2DArray();

const clusterData = temporalData.map((cluster, index) => ({
    x: reducedEmbeddings[index][0],
    y: reducedEmbeddings[index][1],
    question: cluster.question,
    cluster: labels[index]
}))    


writeFileSync('../app/src/data/temporalClusters.json', JSON.stringify(clusterData, null, 2));
writeFileSync('../app/src/data/data.json', JSON.stringify(clusterData, null, 2));

// Validate intermidiate steps
console.log(temporalAverages.length, normalAverages.length);
console.log(dimensionDeltas);
console.log(mostPredictableDimensions);



