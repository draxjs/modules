
interface IHttpOptionsInterface {
    headers: Headers;
}

interface IHttpClientInterface{
    get(url: string, options: IHttpOptionsInterface): Promise<object>
    post(url: string, data: any, options: IHttpOptionsInterface): Promise<object>
    put(url: string, data: any, options: IHttpOptionsInterface): Promise<object>
    delete(url: string, data: any, options: IHttpOptionsInterface): Promise<object>
    patch(url: string, data: any, options: IHttpOptionsInterface): Promise<object>

}

export {IHttpClientInterface, IHttpOptionsInterface}
