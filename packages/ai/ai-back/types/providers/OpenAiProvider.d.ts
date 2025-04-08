import type { IAIProvider, IPromptParams, IPromptResponse } from "../interfaces/IAIProvider";
declare class OpenAiProvider implements IAIProvider {
    protected _apiKey: string;
    protected _model: any;
    protected _client: any;
    constructor(apiKey: string, model: string);
    get model(): any;
    get client(): any;
    generateEmbedding({ text, model }: {
        text: string;
        model: string;
    }): Promise<number[]>;
    prompt(input: IPromptParams): Promise<IPromptResponse>;
}
export default OpenAiProvider;
export { OpenAiProvider };
//# sourceMappingURL=OpenAiProvider.d.ts.map