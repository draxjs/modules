class ServerService {
    get getApplicationName() {
        return process.env.APP_NAME ? process.env.APP_NAME : 'UNKNOWN';
    }
}
export default ServerService;
