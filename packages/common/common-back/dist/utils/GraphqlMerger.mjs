import { mergeTypeDefs, mergeResolvers } from '@graphql-tools/merge';
import { loadFiles } from '@graphql-tools/load-files';
import { pathToFileURL } from 'url';
class GraphqlMerger {
    static async mergeTypeDefs(dirname) {
        const loadedTypeDefs = await loadFiles(`${dirname}/types/*.graphql`, {
            ignoreIndex: true,
            requireMethod: async (path) => {
                return await import(pathToFileURL(path).toString());
            },
        });
        const typeDefs = mergeTypeDefs(loadedTypeDefs);
        return typeDefs;
    }
    static async mergeResolvers(dirname) {
        const loadedResolvers = await loadFiles(`${dirname}/resolvers/*.resolvers.*`, {
            ignoreIndex: true,
            requireMethod: async (path) => {
                let p = pathToFileURL(path).toString();
                return await import(p);
            },
        });
        const resolvers = mergeResolvers(loadedResolvers);
        return resolvers;
    }
}
export default GraphqlMerger;
