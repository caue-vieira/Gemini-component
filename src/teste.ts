import { generate } from "./generate.ts";
import { read } from "./read.ts";

// const inputTxt = await read("../teste.txt");
const inputPdf = await read("../First-world-war.pdf");

const explainTest = await generate({
    action: "explain",
    input: inputPdf,
    config: {
        length: "short",
        targetAudience: "intermediate",
    }
})

console.log("Explain test:", explainTest);

const { questions, answers } = await generate({
    action: "activity",
    input: inputPdf,
    questionAmount: 2,
    config: {
        targetAudience: "intermediate",
    }
})

console.log("Activity questions:", questions);
console.log("Activity answers:", answers);