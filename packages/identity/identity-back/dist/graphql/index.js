import { GraphqlMerger } from "@drax/common-back";
export default async () => {
    const __dirname = new URL(".", import.meta.url).pathname;
    const typeDefs = GraphqlMerger.mergeTypeDefs(__dirname);
    const resolvers = GraphqlMerger.mergeResolvers(__dirname);
    return { typeDefs, resolvers };
};
