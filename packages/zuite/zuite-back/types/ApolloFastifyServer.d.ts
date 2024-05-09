import { FastifyInstance } from "fastify";
declare class ApolloExpressServer {
    fastifyServer: FastifyInstance;
    apolloServer: any;
    typeDefs: any;
    resolvers: any;
    constructor(typeDefs: any, resolvers: any);
    fastifyRegisterApollo(): Promise<void>;
    addMonitorEndpoint(): void;
    start(port: number, baseUrl?: string): Promise<void>;
}
export default ApolloExpressServer;
//# sourceMappingURL=ApolloFastifyServer.d.ts.map