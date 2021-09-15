import axios from "axios";
import { toast } from 'react-toastify';

axios.interceptors.response.use(res => {
  //console.log('interceptor response', res.data.token);
  if (res.status === 200 && res.data.token) {
    //console.log('new token', res.data.token)
    localStorage.setItem('token', res.data.token)
  }

  return Promise.resolve(res);
})

axios.interceptors.request.use(req => {
  //console.log('set http jewt', localStorage.getItem('token'))
  req.headers.common['Authorization'] = 'Bearer ' + localStorage.getItem('token');
  return req
})

axios.interceptors.response.use(null, error => {
  // console.log('from http service', error.response)
  const expectedError =
    error.response &&
    error.response.status >= 400 &&
    error.response.status < 500;

  //console.log("error", error);
  if (!expectedError) {
    // status code 500
    if (error.response.data.error.message === "Imei exist") {
      toast.error("تکراری است IMEI کد");
    }
    else {toast.error("خطا در برقراری ارتباط با سرور. لطفا با ادمین سایت تماس بگیرید");}
    console.log(error.response, error); // eeno bayad log begirim
    //toastr.error('Server Error','An Unexpected error occured!')
  }

  if (expectedError) {
    switch (error.response.status) {

      case 400:
        toast.error('اطلاعات وارد شده صحیح نمی باشد');
        break;
      case 401:
        toast.error('کاربری با مشخصات وارد شده یافت نشد');
        break;
      case 403:
        toast.error('دسترسی غیر مجاز');
        break;
      case 404:
        toast.error('سرویس مورد نظر یافت نشد');
        break;
    }
  }

  return Promise.reject(error);
});

export function setJwt(jwt) {
  //console.log('set http jewt',jwt)
  //axios.defaults.headers.common['x-auth-token'] = jwt;
}

export default {
  get: axios.get,
  post: axios.post,
  put: axios.put,
  delete: axios.delete,
  setJwt: setJwt
};
