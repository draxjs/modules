import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import { expressMiddleware } from '@apollo/server/express4';
import * as http from "http";
class ApolloExpressServer {
    constructor(typeDefs, resolvers) {
        this.typeDefs = typeDefs;
        this.resolvers = resolvers;
        this.setup();
    }
    setup() {
        this.setupExpressServer();
        this.setupHttpServer();
        this.setupApolloServer();
    }
    setupExpressServer() {
        this.expressApplication = express();
        this.expressApplication.get('/ping', (req, res) => {
            res.send('pong');
        });
    }
    setupHttpServer() {
        this.httpServer = http.createServer(this.expressApplication);
    }
    setupApolloServer() {
        this.apolloServer = new ApolloServer({
            typeDefs: this.typeDefs,
            resolvers: this.resolvers,
            plugins: [ApolloServerPluginDrainHttpServer({ httpServer: this.httpServer })]
        });
    }
    linkApolloServerWithExpress() {
        this.expressApplication.use('/graphql', express.json(), expressMiddleware(this.apolloServer));
    }
    async start(port, baseUrl = 'http://localhost') {
        await this.apolloServer.start();
        this.linkApolloServerWithExpress();
        await new Promise((resolve) => this.httpServer.listen({ port: port }, resolve));
        console.log(`🚀 Server ready at ${baseUrl}:${port}`);
    }
}
export default ApolloExpressServer;
