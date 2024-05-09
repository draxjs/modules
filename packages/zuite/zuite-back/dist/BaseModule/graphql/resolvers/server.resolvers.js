import ServerService from "../../services/ServerService.mjs";
export default {
    Query: {
        server: () => {
            let serverService = new ServerService();
            return { applicationName: serverService.getApplicationName };
        }
    }
};
