import http from "./httpService";
import { apiUrl } from "../config.json";

const apiEndpoint = apiUrl + "/services/app/User/";


export const getUsers = () => {
    //console.log(apiEndpoint)
    return http.get(apiEndpoint + 'GetAll');
}

export const deleteUserInfo = (userId) => {
    //console.log(apiEndpoint + `/${userId}`)
    return http.delete(apiEndpoint + 'Delete' + `?Id=${userId}`);
}

export const updateUserStatusToActive = (userInfo) => {
    //console.log('api for edit user info', userInfo)
    return http.post(apiEndpoint + 'Activate',userInfo);
}

export const updateUserStatusToInactive = (userInfo) => {
    //console.log('api for edit user info', userInfo)
    return http.post(apiEndpoint + 'DeActivate',userInfo);
}

export const editUserInfo = (userInfo) => {
    //console.log('api for edit user info', userInfo)
    return http.put(apiEndpoint + 'Update' ,userInfo);
}

