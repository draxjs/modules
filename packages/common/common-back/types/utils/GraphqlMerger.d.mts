import { TypeSource, IResolvers } from '@graphql-tools/utils';
declare class GraphqlMerger {
    static mergeTypeDefs(dirname: string): Promise<TypeSource>;
    static mergeResolvers(dirname: string): Promise<IResolvers>;
}
export default GraphqlMerger;
//# sourceMappingURL=GraphqlMerger.d.mts.map