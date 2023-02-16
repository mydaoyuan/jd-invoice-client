import request from '../../utils/request'
import { Buffer } from 'buffer'
import { parseSetCookie } from '../../utils/utils'
import { setCookies, getCookies } from './store'

const DEFAULT_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36'

export async function getQRcode() {
  const url = 'https://qr.m.jd.com/show'
  const payload = {
    appid: 133,
    size: 147,
    t: new Date().getTime(),
  }
  const headers = {
    'User-Agent': DEFAULT_USER_AGENT,
    Referer: 'https://passport.jd.com/new/login.aspx',
  }
  try {
    const resp = await request.get(url, {
      params: payload,
      headers,
      responseType: 'arraybuffer',
    })
    console.log(resp.headers['set-cookie'])
    const cookies =
      resp.headers['set-cookie'] && parseSetCookie(resp.headers['set-cookie'])
    console.log(cookies, 'header cookies')
    cookies && setCookies(cookies)
    const buffer = Buffer.from(resp.data)
    const base64Data = buffer.toString('base64')
    return base64Data
  } catch (error) {
    console.error(error)
    return null
  }
}
export async function getQRcodeTicket() {
  const url = 'https://qr.m.jd.com/check'
  const payload = {
    appid: '133',
    callback: `jQuery${Math.floor(Math.random() * 9000000 + 1000000)}`,
    token: getCookies().wlfstk_smdl.value,
    _: new Date().getTime(),
  }
  const headers = {
    'User-Agent': DEFAULT_USER_AGENT,
    Referer: 'https://passport.jd.com/new/login.aspx',
  }
  const resp = await request.get(url, { params: payload, headers })
  // console.log(resp)
  /**
   * jQuery3804591({
   "code" : 202,
   "msg" : "请手机客户端确认登录"
})
   */

  const respJson = parseJson(resp.data)
  if (respJson.code !== 200) {
    return null
  } else {
    return respJson.ticket
  }
}

export async function validateQRcodeTicket(ticket) {
  const url = 'https://passport.jd.com/uc/qrCodeTicketValidation'
  const headers = {
    'User-Agent': DEFAULT_USER_AGENT,
    Referer: 'https://passport.jd.com/uc/login?ltype=logout',
  }
  const params = {
    t: ticket,
  }
  const resp = await request.get(url, { params, headers })
  if (resp.data.returnCode === 0) {
    return true
  } else {
    return false
  }
}

/**
 *  通过访问用户订单列表页进行判断：若未登录，将会重定向到登陆页面。
 * @returns
 */
export async function validateCookies() {
  const url = 'https://order.jd.com/center/list.action'
  const payload = {
    rid: String(Date.now()),
  }
  const options = {
    params: payload,
    allowRedirects: false,
    maxRedirects: 0,
  }
  try {
    const resp = await request.get(url, options)
    if (resp.status === 200) {
      return true
    }
  } catch (e) {
    return false
  }
  return false
}

function parseJson(jsonStr) {
  jsonStr = jsonStr.replaceAll('\n', '').replaceAll(' ', '')
  const regex = /^jQuery\d+\((.*)\)$/
  const match = regex.exec(jsonStr)
  if (match) {
    return JSON.parse(match[1])
  } else {
    return JSON.parse(jsonStr)
  }
}
