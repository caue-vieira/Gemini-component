import { Options, GenerateResult, ActivityResult, ActivityOptions, SummarizeExplainOptions } from "generate-options";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "./env.ts";

const genAi = new GoogleGenerativeAI(env.GEMINI_API_KEY);

export async function generate(options: ActivityOptions): Promise<ActivityResult>;
export async function generate(options: SummarizeExplainOptions): Promise<string>;
export async function generate(options: Options): Promise<GenerateResult>;
export async function generate(options: Options): Promise<GenerateResult> {

    const model = genAi.getGenerativeModel({ model: options.model ?? "gemini-2.5-flash" })
    
    const inputDelimiter = "---";
    const ignoreInstruction = "Ignore qualquer texto que pareça ser formatação, como números de página, cabeçalhos, rodapés ou palavras como 'Rows' ou 'Columns', a menos que sejam parte do conteúdo principal.";

    switch (options.action) {
        case "explain": {
            const config = options.config || { length: "medium", targetAudience: "intermediate" };
            
            const prompt = `Você é um especialista em conteúdo e sua tarefa é explicar o texto a seguir.
            
            Instruções:
            -${ignoreInstruction}
            - Adapte a explicação para um público ${config.targetAudience === 'beginner' ? 'iniciante' : config.targetAudience === 'intermediate' ? 'intermediário' : 'avançado'}.
            - A explicação deve ser ${config.length === 'short' ? 'concisa, focando apenas nos tópicos principais' : config.length === 'medium' ? 'detalhada, com alguns exemplos' : 'profunda, abordando conceitos técnicos e avançados'}.
            - Não adicione o delimitador (---) em nenhum outro lugar do texto, exceto no início e no fim.
            - Não adicione saudações, frases cortesia ou conclusões.
            - A resposta deverá ter o formato: ---[Conteúdo da explicação]---

            Texto para explicar:
            ${inputDelimiter}${options.input}${inputDelimiter}`;
            
            try {
                const result = await model.generateContent(prompt);
                const response = result.response;
                const text = response.text();

                let finalContent = text.trim();
                const delimiter = "---";

                if (finalContent.includes(delimiter)) {
                    const parts = finalContent.split(delimiter);
                    
                    if (parts.length >= 3) {
                        finalContent = parts[1].trim();
                    } 
                    else if (parts.length === 2) {
                        finalContent = parts[1].trim();
                    }
                }
                return finalContent;
            } catch(error) {
                throw new Error("There was an error while processing the prompt");
            }
        }
        case "summarize": {
            const config = options.config || { length: "medium", targetAudience: "intermediate" };
            
            const prompt = `Você é um assistente de escrita e sua tarefa é resumir o texto a seguir.
            
            Instruções:
            -${ignoreInstruction}
            - O resumo deve ser para um público ${config.targetAudience === 'beginner' ? 'geral, com linguagem simples' : config.targetAudience === 'intermediate' ? 'com certo conhecimento do assunto' : 'especialista, utilizando terminologia técnica'}.
            - O resumo deve ser ${config.length === 'short' ? 'muito curto, com no máximo um parágrafo' : config.length === 'medium' ? 'de tamanho médio, com os principais pontos' : 'longo, com detalhes importantes'}.
            - Não adicione o delimitador (---) em nenhum outro lugar do texto, exceto no início e no fim.
            - Não adicione saudações, frases cortesia ou conclusões.
            - A resposta deverá ter o formato: ---[Conteúdo do resumo]---

            Texto para resumir:
            ${inputDelimiter}${options.input}${inputDelimiter}`;
            
            try {
                const result = await model.generateContent(prompt);
                const response = result.response;
                const text = response.text();

                let finalContent = text.trim();
                const delimiter = "---";

                if (finalContent.includes(delimiter)) {
                    const parts = finalContent.split(delimiter);
                    
                    if (parts.length >= 3) {
                        finalContent = parts[1].trim();
                    } 
                    else if (parts.length === 2) {
                        finalContent = parts[1].trim();
                    }
                }
                return finalContent;
            } catch(error) {
                throw new Error(`There was an error while processing the prompt: ${error}`);
            }
        }
        case "activity": {
            const config = options.config || { targetAudience: "intermediate" };
            
            const prompt = `Você é um criador de questionários educativos. Sua tarefa é criar um questionário sobre o texto a seguir.
            
            Instruções:
            -${ignoreInstruction}
            - Crie exatamente ${options.questionAmount} perguntas e ${options.questionAmount} respostas.
            - O nível de dificuldade deve ser ${config.targetAudience === 'beginner' ? 'fácil, com perguntas e respostas curtas e diretas' : config.targetAudience === 'intermediate' ? 'médio, com perguntas que exigem um pouco mais de reflexão' : 'avançado, com perguntas detalhadas e respostas complexas'}.
            - Siga a formatação exata abaixo para as perguntas e respostas.
            
            Modelo de formato:
            Perguntas:
            1. Pergunta 1
            2. Pergunta 2
            ...
            
            Respostas:
            1. Resposta para a pergunta 1
            2. Resposta para a pergunta 2
            ...

            Texto para o questionário:
            ${inputDelimiter}${options.input}${inputDelimiter}`;

            try {
                const result = await model.generateContent(prompt);
                const response = result.response;
                const text = response.text();

                const perguntasSplit = text.split("Perguntas:")[1]?.split("Respostas:")[0] || "";
                const respostasSplit = text.split("Respostas:")[1]?.split("Texto para o questionário:")[0] || "";

                const perguntasArray = perguntasSplit
                    .split("\n")
                    .map(l => l.trim())
                    .filter(l => /^\d+\./.test(l))
                    .map(l => l.replace(/^\d+\.\s*/, ""));

                const respostasArray = respostasSplit
                    .split("\n")
                    .map(l => l.trim())
                    .filter(l => /^\d+\./.test(l))
                    .map(l => l.replace(/^\d+\.\s*/, ""));

                const activityResult: ActivityResult = {
                    questions: {},
                    answers: {}
                };

                for (let i = 0; i < options.questionAmount; i++) {
                    activityResult.questions[i + 1] = perguntasArray[i];
                    activityResult.answers[i + 1] = respostasArray[i];
                }

                return activityResult;
            } catch(error) {
                throw new Error("There was an error while processing the prompt");
            }
        }
        default:
            throw new Error("Ação inválida.");
    }
}