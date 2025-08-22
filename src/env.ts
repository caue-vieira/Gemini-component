
function getApiKey(): string {
    const value = process.env.GEMINI_API_KEY;

    if (value === undefined) {
        throw new Error("The environment variable GEMINI_API_KEY must be set!");
    }

    return value;
}

export const env = {
    GEMINI_API_KEY: getApiKey(),
};