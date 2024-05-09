import { Express } from 'express';
declare class ApolloExpressServer {
    httpServer: any;
    expressApplication: Express;
    apolloServer: any;
    typeDefs: any;
    resolvers: any;
    constructor(typeDefs: any, resolvers: any);
    setup(): void;
    setupExpressServer(): void;
    setupHttpServer(): void;
    setupApolloServer(): void;
    linkApolloServerWithExpress(): void;
    start(port: number, baseUrl?: string): Promise<void>;
}
export default ApolloExpressServer;
//# sourceMappingURL=ApolloExpressServer.d.ts.map