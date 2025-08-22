declare module "generate-options" {
    interface BaseOptions {
        input: string,
        model?: string,
    }

    interface SummarizeExplainOptions extends BaseOptions {
        action: "summarize" | "explain",
        config?: {
            length: "short"|"medium"|"long",
            targetAudience?: "beginner"|"intermediate"|"advanced",
        },
    }

    interface ActivityOptions extends BaseOptions {
        action: "activity",
        config?: {
            targetAudience?: "beginner"|"intermediate"|"advanced",
        },
        questionAmount: number,
    }

    export type Options = SummarizeExplainOptions | ActivityOptions;

    export interface ActivityResult {
        questions: { [key: number]: string };
        answers: { [key: number]: string };
    }

    export type GenerateResult = string | ActivityResult;

    export function generate(options: ActivityOptions): Promise<ActivityResult>;
    export function generate(options: SummarizeExplainOptions): Promise<string>;
    export function generate(options: Options): Promise<GenerateResult>;
}