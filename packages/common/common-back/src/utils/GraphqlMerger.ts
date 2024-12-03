import {mergeTypeDefs, mergeResolvers} from '@graphql-tools/merge'
import {TypeSource, IResolvers} from '@graphql-tools/utils'
import {loadFiles} from '@graphql-tools/load-files'
import {pathToFileURL} from 'url';

class GraphqlMerger{

    static async mergeTypeDefs(dirname: string): Promise<TypeSource>{
        const loadedTypeDefs = await loadFiles(`${dirname}/types/*.graphql`, {
            ignoreIndex: true,
            requireMethod: async (path: string) => {
                return await import(pathToFileURL(path).toString())
            },
        });
        const typeDefs = mergeTypeDefs(loadedTypeDefs)
        return typeDefs
    }

    static async mergeResolvers(dirname: string): Promise<IResolvers>{
        const loadedResolvers = await loadFiles(
            `${dirname}/resolvers/*.resolvers.*`,
            {
                ignoreIndex: true,
                requireMethod: async (path: string) => {
                    let p: string = pathToFileURL(path).toString()
                    return await import(p)
                },
            }
        );

        const resolvers = mergeResolvers(loadedResolvers)
        return resolvers
    }
}


export default GraphqlMerger
