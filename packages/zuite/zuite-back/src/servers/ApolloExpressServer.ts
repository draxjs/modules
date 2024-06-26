import {ApolloServer} from "@apollo/server";
import {ApolloServerPluginDrainHttpServer} from '@apollo/server/plugin/drainHttpServer';
import express, {Express, Request, Response} from 'express'
import {expressMiddleware} from '@apollo/server/express4';
import * as http from "http";
import {IJwtUser} from "@drax/identity-share";

interface ApolloContext {
    request: Request
}

declare module 'express' {
    interface Request {
        authUser?: IJwtUser;
    }
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
        this.setupStatusRoute()
        this.setupHttpServer()
        this.setupApolloServer()
    }


    setupExpressServer(): void {
        this.expressApplication = express();

    }

    setupStatusRoute() {
        this.expressApplication.get('/status', (req: Request, res: Response) => {
            res.send('running')
        });
    }

    setupHttpServer() {
        this.httpServer = http.createServer(this.expressApplication);
    }

    setupApolloServer(): void {
        this.apolloServer = new ApolloServer<ApolloContext>({
                typeDefs: this.typeDefs,
                resolvers: this.resolvers,
                plugins: [ApolloServerPluginDrainHttpServer({httpServer: this.httpServer})]
            },
        )
    }

    linkExpressApollo() {
        this.expressApplication.use('/graphql',
            express.json(),
            expressMiddleware(this.apolloServer, {
                context: async ({ req }) => ({ authUser: req.authUser }),
            })
        );
    }

    expressUse(middleware: any) {
        this.expressApplication.use(middleware)
    }


    async start(port: number, baseUrl: string = 'http://localhost') {

        await this.apolloServer.start();
        this.linkExpressApollo()

        await new Promise<void>((resolve) => this.httpServer.listen({port: port}, resolve));

        console.log(`🚀 Server ExpressApollo ready at ${baseUrl}:${port}`);
    }

}

export default ApolloExpressServer;
