import http from "./httpService";
import { toast } from "react-toastify";
import jwtDecode from "jwt-decode";

import { apiUrl } from "../config.json";


const apiEndpoint = apiUrl + "/TokenAuth/Authenticate";
const tokenKey = "token";
const encTokenKey = "encTokenKey";


toast.configure({ bodyClassName: "rtl" });

export async function login(user) {
  //console.log(apiEndpoint,user)
  const { data, success } = await http.post(apiEndpoint, user);
  //console.log("from authserv", data)
  if (data.result && data.success) {
    const jwt = data.result.accessToken;
    localStorage.setItem(tokenKey, jwt);
    localStorage.setItem(encTokenKey,data.result.encryptedAccessToken)
    return { result: true, message: null };
  }
  return { result: false, message: data.error };
}

export function logout() {
  //console.log('logoutttt')
  localStorage.removeItem(tokenKey);
  localStorage.removeItem(encTokenKey);
}

export function getCurrentUser() {
  try {
    // const jwt = CryptoJS.AES.decrypt(
    //   localStorage.getItem("token"),
    //   tokenHashKey
    // ).toString(CryptoJS.enc.Utf8);
    const jwt = localStorage.getItem("token");
    const decToken = jwtDecode(jwt);
    //console.log('decode toke', decToken);
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
  login,
  logout,
  getCurrentUser,
  getJwt
};
