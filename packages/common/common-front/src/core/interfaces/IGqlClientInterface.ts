
interface IGqlOptionsInterface {
}

interface IGqlClientInterface{
    query(url?: string, data?: any, options?: IGqlOptionsInterface): Promise<object>
    mutation(url?: string, data?: any, options?: IGqlOptionsInterface): Promise<object>

}

export {IGqlClientInterface, IGqlOptionsInterface}
