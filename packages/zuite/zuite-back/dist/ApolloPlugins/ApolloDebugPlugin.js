const ApolloDebugPlugin = {
    async requestDidStart() {
        return {
            async parsingDidStart(requestContext) {
                console.log("parsingDidStart");
            },
            async validationDidStart(requestContext) {
                console.log("validationDidStart");
            },
            async executionDidStart(requestContext) {
                console.log("executionDidStart");
            },
            async willSendResponse(requestContext) {
                console.log("willSendResponse");
            }
        };
    },
};
export default ApolloDebugPlugin;
