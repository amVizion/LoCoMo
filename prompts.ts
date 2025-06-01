export const ROUTER_PROMPT = (input:string) => `
Your task is to determine if there is a mathematical operation in the following input.
The operation can be disguised in a mathematical problem.

Input: ${input}

Reply with 'YES' or 'NO'.
Do not provide additional information or explanations.

Example: YES
`

export const RETRIEVER_PROMPT = (input:string) => `
There is a mathematical operation in the following input.
Your task is to retrieve the numbers, and operation type.

Return the output in JSON format. With the following keys: 'numbers', 'operation'.
Valid operations are: 'addition', 'subtraction', 'multiplication', 'division'.

Example output:
{
    "numbers": [1, 2],
    "operation": "addition"
}

Input: ${input}
`


export const ERROR_MESSAGE = `
The following is a calculator bot. It requires a mathematical operation to proceed.
`
