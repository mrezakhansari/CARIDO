import http from "./httpService";
import { toast } from "react-toastify";
import jwtDecode from "jwt-decode";

import { apiUrl } from "../config.json";


const apiEndpoint = apiUrl + "/services/app/Sms";
const tokenKey = "token";


toast.configure({ bodyClassName: "rtl" });

export async function sendVerificationCode(user) {
    console.log("from authserv", user)
    const { data } = await http.post(apiEndpoint + '/SendVerificationCode', user);
    console.log("from authserv", data)
    if (data.result && data.success) {
        //     const jwt = data.result.accessToken;
        //     localStorage.setItem(tokenKey, jwt);
        return { result: true, message: null };
    }
    return { result: false, message: data.error.message };
}

export async function VerifyCode(code) {
    console.log("user verify code", code)
    const { data } = await http.post(apiEndpoint + '/VerifyCode', code);
    console.log("then verify code", data)
    if (data.result && data.success) {
         const jwt = data.result.accessToken;
         localStorage.setItem(tokenKey, jwt);
        return { result: true, message: null };
    }
    return { result: false, message: data.error.message };
}

export function logout() {
    console.log('logoutttt')
    localStorage.removeItem(tokenKey);
}

export function getCurrentUser() {
    try {
        // const jwt = CryptoJS.AES.decrypt(
        //   localStorage.getItem("token"),
        //   tokenHashKey
        // ).toString(CryptoJS.enc.Utf8);
        const jwt = localStorage.getItem("token");
        const decToken = jwtDecode(jwt);
        // console.log('decode toke', decToken);
        if (decToken.exp < Date.now() / 1000) {
            toast.error("Your credential is expired, Please login again");
            logout();
            return null;
        }
        return decToken;

    } catch (ex) {
        return null;
    }
}

export function getJwt() {
    return localStorage.getItem(tokenKey);
}

export default {
    sendVerificationCode,
    logout,
    getCurrentUser,
    getJwt
};
