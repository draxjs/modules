import type {ApolloServerPlugin, GraphQLRequestContext} from '@apollo/server'

const ApolloDebugPlugin : ApolloServerPlugin = {
    async requestDidStart() {
        return {
            async parsingDidStart(requestContext : GraphQLRequestContext<any>) {
                console.log("parsingDidStart")

            },
            async validationDidStart(requestContext : GraphQLRequestContext<any>) {
                console.log("validationDidStart")
            },
            async executionDidStart(requestContext : GraphQLRequestContext<any>) {
                console.log("executionDidStart")

            },
            async willSendResponse(requestContext : GraphQLRequestContext<any>) {
                console.log("willSendResponse")
            }
        };
    },
};


export default ApolloDebugPlugin
