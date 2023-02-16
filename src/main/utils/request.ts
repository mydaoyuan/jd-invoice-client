import axios from 'axios'
import { CookieJar } from 'tough-cookie'
import { wrapper } from 'axios-cookiejar-support'
import {
  getCookieToStore,
  saveCookieToStore,
  deleteCookies,
} from '../services/login/store'
// const serves = axios.defaults
// 设置请求发送之前的拦截器
// serves.interceptors.request.use(
//   (config) => {
//     // 设置发送之前数据需要做什么处理
//     return config
//   },
//   (err) => Promise.reject(err)
// )

// // 设置请求接受拦截器
// serves.interceptors.response.use(
//   (res) => {
//     // 设置接受数据之后，做什么处理
//     if (res.data.code === 50000) {
//       console.error(res.data.data)
//     }
//     return res
//   },
//   (err) => {
//     // 判断请求异常信息中是否含有超时timeout字符串
//     if (err.message.includes('timeout')) {
//       console.log('错误回调', err)
//     }
//     if (err.message.includes('Network Error')) {
//       console.log('错误回调', err)
//     }
//     return Promise.reject(err)
//   }
// )

const jar = new CookieJar()
const storeCookie = getCookieToStore()
if (storeCookie) jar.store.putCookie(storeCookie)
const client = wrapper(axios.create({ jar }))
// 将serves抛出去

/**
 * 把 jar 中的cookie 存储到 electron store
 */
export async function saveJarCookie() {
  const ck = await jar.store.getAllCookies()
  console.log(JSON.stringify(ck))
  saveCookieToStore(ck)
}
export async function clearnCookie() {
  try {
    deleteCookies()
    await jar.removeAllCookies()
    await jar.store.removeAllCookies()
    return true
  } catch (error) {
    console.log(error)
  }
  return false
}
export default client
