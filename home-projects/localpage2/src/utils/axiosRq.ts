import axios from "axios";
import router from "../router";

let baseURL = '/';
if (process.env.NODE_ENV != "production") {
    baseURL = 'http://192.168.1.5:3000/';
    console.log('开发ip:' + baseURL);
}
const request = axios.create({
    baseURL: baseURL,
})
console.log('环境：' + process.env.NODE_ENV);


request.defaults.headers.post['Content-Type'] = 'application/json';


// 添加请求拦截器
// 每一个我们自己封装的axios请求都会经过这个拦截器
// request.interceptors.request.use(function (config) {
//     // console.log(config)
//     // 在发送请求之前做些什么:我要看看有没有token,如果有，则以请求头的方式进行传递
//     let token = localStorage.getItem('user_token')
//     if (token) {
//       // 设置请求头
//       config.headers.Authorization = 'Bearer '+ token
//       config.headers.UUID = 'Bearer '+ localStorage.getItem('user_id')
//     }
//     return config;
//   }, function (error) {
//     // 对请求错误做些什么
//     return Promise.reject(error);
// });

// // 添加响应拦截器
// request.interceptors.response.use(function (response) {
//     // 2xx 范围内的状态码都会触发该函数。
//     // console.log(response)
//     // todo
//     if(response.data.message === '用户信息验证失败'){
//         // this.$router.push({name:'Login'})
//         window.location.href='#/login'
//     }
//     return response;
// }, function (error) {
//     // 超出 2xx 范围的状态码都会触发该函数
//     // console.log(error.response.status);
//     if(error.response.status === 401){
//         // console.log(error);
//         localStorage.clear();
//         router.push({ name: 'login'})
//     }
//     return Promise.reject(error);
// })


export default request;