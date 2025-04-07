import type { IAIProvider, IPromptRequest, IPromptResponse } from "../interfaces/IAIProvider";
declare class OpenAiProvider implements IAIProvider {
    protected _apiKey: string;
    protected _model: any;
    protected _client: any;
    constructor(apiKey: string, model: string);
    get model(): any;
    get client(): any;
    prompt(input: IPromptRequest): Promise<IPromptResponse>;
}
export default OpenAiProvider;
export { OpenAiProvider };
//# sourceMappingURL=OpenAiProvider.d.ts.map