/*

Objetivo: Maximizar el contraste al representar las preguntas en dos dimensiones.

1. Volver a entrenar un modelo de reducción de dimensionalidad (general) con PCA (dimensiones 12).
2. Identificar cuales dos dimensiones tienen mayor predictibilidad.
3. Utilizar estas dos dimensiones para representar las preguntas.
4. Visualizar.

*/

import { PCA } from 'ml-pca';
import QUESTIONS from '../data/questions.json';
import { writeFileSync } from 'fs';

const embeddings = QUESTIONS.map((question) => question.embeddings);
const pca = new PCA(embeddings);

const prediction = pca.predict(embeddings, { nComponents: 12 }).to2DArray()
const questions = QUESTIONS.map((question, index) => ({
    ...question,
    embeddings: prediction[index] 
}));

// Get Averages for temporal questions and not.
const temporalQuestions = questions.filter(({ category }) => category === 2);
const notTemporalQuestions = questions.filter(({ category }) => category !== 2);

const getAverages = (e:number[][]):number[] => e[0].map((_, index) => {
        const sum = e.reduce((acc, current) => acc + current[index], 0);
        return sum / e.length;
}); 

const temporalAverages = getAverages(temporalQuestions.map(({ embeddings }) => embeddings));
const notTemporalAverages = getAverages(notTemporalQuestions.map(({ embeddings }) => embeddings));
console.log(temporalAverages.length, notTemporalAverages.length);

// Get the two most predictable dimensions. Substract the averages.
const dimensionDeltas = temporalAverages.map((average, index) => Math.abs(average - notTemporalAverages[index]));
console.log(dimensionDeltas);

const mostPredictableDimensions = dimensionDeltas.map((delta, index) => ({ delta, index })).sort((a, b) => b.delta - a.delta).slice(0, 2);
console.log(mostPredictableDimensions);

// Get the values of the embeddings for the two most predictable dimensions.
const normalPredictions = notTemporalQuestions.map(({ embeddings, question }) => ({
    x: embeddings[mostPredictableDimensions[0].index],
    y: embeddings[mostPredictableDimensions[1].index],
    question
}));

const temporalPredictions = temporalQuestions.map(({ embeddings, question }) => ({
    x: embeddings[mostPredictableDimensions[0].index],
    y: embeddings[mostPredictableDimensions[1].index],
    question
}));

writeFileSync('../app/src/data/contrastNormal.json', JSON.stringify(normalPredictions, null, 2));
writeFileSync('../app/src/data/contrastTemporal.json', JSON.stringify(temporalPredictions, null, 2));






/*

Dos forma de maximizar el contraste:
1. Entrenar el modelo de PCA con preguntas.
2. Entrenar un modelo general y utilizar las dimensiones con mayor predictibilidad.

*/
