import {ApolloServer} from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express, {Express, Request, Response} from 'express'
import {expressMiddleware} from '@apollo/server/express4';
import * as http from "http";

interface ApolloContext{
    request: Request
}

class ApolloExpressServer {

    httpServer: any;
    expressApplication!: Express;
    apolloServer: any;
    typeDefs: any;
    resolvers: any;

    constructor(typeDefs: any, resolvers: any) {
        this.typeDefs = typeDefs;
        this.resolvers = resolvers;
        this.setup()

    }

    setup() {
        this.setupExpressServer()
        this.setupHttpServer()
        this.setupApolloServer()

    }



    setupExpressServer(): void {
        this.expressApplication = express();
        this.expressApplication.get('/ping', (req: Request, res: Response) => {
            res.send('pong')
        });
    }

    setupHttpServer(){
        this.httpServer = http.createServer(this.expressApplication);
    }

    setupApolloServer(): void {
        this.apolloServer = new ApolloServer<ApolloContext>({
            typeDefs: this.typeDefs,
            resolvers: this.resolvers,
            plugins: [ApolloServerPluginDrainHttpServer({ httpServer: this.httpServer })]
        },
        )
    }

    linkApolloServerWithExpress() {
        this.expressApplication.use('/graphql', express.json(), expressMiddleware(this.apolloServer));
    }

    async start(port: number, baseUrl: string = 'http://localhost') {

        await this.apolloServer.start();
        this.linkApolloServerWithExpress()

        await new Promise<void>((resolve) => this.httpServer.listen({ port: port }, resolve));

        console.log(`🚀 Server ready at ${baseUrl}:${port}`);
    }

}

export default ApolloExpressServer;
