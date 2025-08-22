"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var generate_ts_1 = require("./generate.ts");
var read_ts_1 = require("./read.ts");
var input = await (0, read_ts_1.read)("../teste.txt");
console.log(input);
var teste = await (0, generate_ts_1.generate)({
    action: "explain",
    input: input,
    config: {
        length: "medium",
    }
});
