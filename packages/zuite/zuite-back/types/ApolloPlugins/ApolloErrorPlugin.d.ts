declare const ApolloErrorPlugin: {
    requestDidStart(): Promise<{
        parsingDidStart(): Promise<(err: any) => Promise<void>>;
        validationDidStart(): Promise<(errs: any) => Promise<void>>;
        executionDidStart(): Promise<{
            executionDidEnd(err: any): Promise<void>;
        }>;
    }>;
};
export default ApolloErrorPlugin;
//# sourceMappingURL=ApolloErrorPlugin.d.ts.map