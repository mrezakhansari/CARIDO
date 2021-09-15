import http from "./httpService";
import { apiUrl } from "../config.json";

const apiEndpoint = apiUrl + "/services/app/Transaction/";


export const getAllTransactions = () => {
    return http.get(apiEndpoint + 'GetAll');
}

export const createTransaction = (productInfo) => {
    return http.post(apiEndpoint + 'Create', productInfo);
}

export const verifyTransaction = (transactionInfo) => {
    return http.post(apiEndpoint + 'Verify', transactionInfo);
}