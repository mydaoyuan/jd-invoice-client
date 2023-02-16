import { BrowserWindow } from 'electron'
import { getCookies } from './store'
import { sleep } from '../../utils/utils'
import {
  getQRcode,
  getQRcodeTicket,
  validateQRcodeTicket,
  validateCookies,
} from './api'
import { saveJarCookie, clearnCookie } from '../../utils/request'

let mainWindow
// 新发送一个二维码请求.则取消原来的二维码校验
let qrCodeIsRuningId = 1

export function getCookie(): any {
  return getCookies()
}

// 二维码登录
export async function loginByQrCode() {
  const isLogin = await validateCookies()
  console.log(isLogin, 'isLogin')
  mainWindow.webContents.send('login-status-sync', isLogin)
  if (isLogin) return isLogin
  // download QR code
  qrCodeIsRuningId++
  const qrCode = await getQRcode()
  if (!qrCode) {
    throw new Error('二维码下载失败')
  }
  tickQrStatus(qrCodeIsRuningId)
  return qrCode
}

async function tickQrStatus(runId: number) {
  // get QR code ticket
  let ticket = null
  const retryTimes = 85
  for (let i = 0; i < retryTimes; i++) {
    ticket = await getQRcodeTicket()
    if (ticket || runId != qrCodeIsRuningId) {
      break
    }
    await sleep(2000)
  }
  if (runId != qrCodeIsRuningId) return
  if (!ticket) {
    const msg = '二维码过期，请重新获取扫描'
    mainWindow.webContents.send('qrcode-status', { code: '1', msg })
    throw new Error(msg)
  }

  // validate QR code ticket
  if (!(await validateQRcodeTicket(ticket))) {
    const msg = '二维码信息校验失败'
    mainWindow.webContents.send('qrcode-status', { code: '2', msg })
    throw new Error(msg)
  }

  console.log('二维码登录成功')
  mainWindow.webContents.send('qrcode-status', { code: '0' })
  await saveJarCookie()
}

export async function loginOut() {
  return clearnCookie()
}
export async function initLogin(mainW: BrowserWindow) {
  mainWindow = mainW
  // 验证toKen
}
