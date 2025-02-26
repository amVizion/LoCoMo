export interface iQuestion {
    embeddings: number[]
    question: string
    answer?: string
    evidence: string[]
    category: number
    adversarial_answer?: undefined;
}

export interface iDialogue {
    embeddings: number[]
    id: string
    text: string
    speaker: string
}
