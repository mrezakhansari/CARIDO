import http from "./httpService";
import { apiUrl } from "../config.json";

const apiEndpoint = apiUrl + "/services/app/GpsLocation/";

export const getGpsLocation = (data) =>{
    return http.get(apiEndpoint + `GetGpsLocation?From=${data.From}&To=${data.To}&vehicleId=${data.vehicleId}`);
}


