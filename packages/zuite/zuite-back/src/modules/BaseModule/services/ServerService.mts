
class ServerService{

    get getApplicationName(): string{
        return process.env.APP_NAME ? process.env.APP_NAME : 'UNKNOWN';
    }
}

export default ServerService;
