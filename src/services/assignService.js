import http from "./httpService";
import { apiUrl } from "../config.json";

const apiEndpoint = apiUrl + "/services/app/Assign/";


export const CreateAssign = (data) => {
    return http.post(apiEndpoint + 'Create', data);
}

export const DeleteAssign = (id) => {
    console.log(id)
    return http.delete(apiEndpoint + 'Delete' + `?Id=${id}`);
}