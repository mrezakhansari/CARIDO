import http from "./httpService";
import { apiUrl } from "../config.json";

const apiEndpoint = apiUrl + "/auth/permission";


export const getPermissions = () => {
    //console.log(apiEndpoint)
    return http.get(apiEndpoint);
}