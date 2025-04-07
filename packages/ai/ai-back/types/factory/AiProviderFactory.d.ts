import type { IAIProvider } from "../interfaces/IAIProvider";
declare class AiProviderFactory {
    private static singleton;
    static instance(provider: string): IAIProvider;
}
export default AiProviderFactory;
export { AiProviderFactory };
//# sourceMappingURL=AiProviderFactory.d.ts.map