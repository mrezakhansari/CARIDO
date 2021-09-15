import http from "./httpService";
import { apiUrl } from "../config.json";

const apiEndpoint = apiUrl + "/services/app/Product/";


export const getAllProducts = () => {
    return http.get(apiEndpoint + 'GetAll');
}

export const createProduct = (productInfo) => {
    return http.post(apiEndpoint + 'Create', productInfo);
}

export const editProduct = (productInfo) => {
    return http.put(apiEndpoint + 'Update', productInfo);
}

export const deleteProduct = (productId) => {
    return http.delete(apiEndpoint + `Delete/?Id=${productId}`);
}