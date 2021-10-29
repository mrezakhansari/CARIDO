import http from "./httpService";
import { apiUrl } from "../config.json";

const apiEndpoint = apiUrl + "/services/app/Report/";

export const getAllVehiclesInfoForReport = () => {
    return http.get(apiEndpoint);
}