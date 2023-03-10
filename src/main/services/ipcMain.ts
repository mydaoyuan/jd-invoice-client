import { ipcMain, dialog, BrowserWindow, app } from 'electron'
import config from '@config/index'
import Server from '../server'
import { winURL, preloadURL, staticPaths } from '../config/StaticPath'
import { updater } from './HotUpdater'
import { updater as updaterTest } from './HotUpdaterTest'
import DownloadFile from './downloadFile'
import Update from './checkupdate'
import { otherWindowConfig } from '../config/windowsConfig'
import { usePrintHandle } from './printHandle'
import { UpdateStatus } from 'electron_updater_node_core'
import { loginByQrCode, loginOut } from '../services/login/login'

export default {
  Mainfunc() {
    usePrintHandle()
    const allUpdater = new Update()
    ipcMain.handle('login-status', () => {
      return loginByQrCode()
    })
    ipcMain.handle('login-out', () => {
      return loginOut()
    })
    ipcMain.handle('IsUseSysTitle', async () => {
      return config.IsUseSysTitle
    })
    ipcMain.handle('windows-mini', (event, args) => {
      BrowserWindow.fromWebContents(event.sender)?.minimize()
    })
    ipcMain.handle('window-max', async (event, args) => {
      if (BrowserWindow.fromWebContents(event.sender)?.isMaximized()) {
        BrowserWindow.fromWebContents(event.sender)?.restore()
        return { status: false }
      } else {
        BrowserWindow.fromWebContents(event.sender)?.maximize()
        return { status: true }
      }
    })
    ipcMain.handle('window-close', (event, args) => {
      BrowserWindow.fromWebContents(event.sender)?.close()
    })
    ipcMain.handle('check-update', (event) => {
      allUpdater.checkUpdate(BrowserWindow.fromWebContents(event.sender))
    })
    ipcMain.handle('confirm-update', () => {
      allUpdater.quitAndInstall()
    })
    ipcMain.handle('app-close', (event, args) => {
      app.quit()
    })
    ipcMain.handle('get-static-path', (event, args) => {
      return staticPaths
    })
    ipcMain.handle('open-messagebox', async (event, arg) => {
      const res = await dialog.showMessageBox(
        BrowserWindow.fromWebContents(event.sender),
        {
          type: arg.type || 'info',
          title: arg.title || '',
          buttons: arg.buttons || [],
          message: arg.message || '',
          noLink: arg.noLink || true,
        }
      )
      return res
    })
    ipcMain.handle('open-errorbox', (event, arg) => {
      dialog.showErrorBox(arg.title, arg.message)
    })
    ipcMain.handle('start-server', async () => {
      try {
        const serveStatus = await Server.StatrServer()
        console.log(serveStatus)
        return serveStatus
      } catch (error) {
        dialog.showErrorBox('??????', error)
      }
    })
    ipcMain.handle('stop-server', async (event, arg) => {
      try {
        const serveStatus = await Server.StopServer()
        return serveStatus
      } catch (error) {
        dialog.showErrorBox('??????', error)
      }
    })
    ipcMain.handle('hot-update', (event, arg) => {
      updater(BrowserWindow.fromWebContents(event.sender))
    })
    ipcMain.handle('hot-update-test', async (event, arg) => {
      console.log('hot-update-test')
      try {
        let updateInfo = await updaterTest(
          BrowserWindow.fromWebContents(event.sender)
        )
        if (updateInfo === UpdateStatus.Success) {
          app.quit()
        } else if (updateInfo === UpdateStatus.HaveNothingUpdate) {
          console.log('???????????????')
        } else if (updateInfo === UpdateStatus.Failed) {
          console.error('????????????')
        }
      } catch (error) {
        // ????????????
        console.error('????????????')
      }
    })
    ipcMain.handle('start-download', (event, downloadUrl) => {
      new DownloadFile(
        BrowserWindow.fromWebContents(event.sender),
        downloadUrl
      ).start()
    })
    ipcMain.handle('open-win', (event, arg) => {
      const ChildWin = new BrowserWindow({
        titleBarStyle: config.IsUseSysTitle ? 'default' : 'hidden',
        ...Object.assign(otherWindowConfig, {}),
      })
      // ???????????????????????????devtools
      if (process.env.NODE_ENV === 'development') {
        ChildWin.webContents.openDevTools({ mode: 'undocked', activate: true })
      }
      ChildWin.loadURL(winURL + `#${arg.url}`)
      ChildWin.once('ready-to-show', () => {
        ChildWin.show()
        if (arg.IsPay) {
          // ???????????????????????????????????????
          const testUrl = setInterval(() => {
            const Url = ChildWin.webContents.getURL()
            if (Url.includes(arg.PayUrl)) {
              ChildWin.close()
            }
          }, 1200)
          ChildWin.on('close', () => {
            clearInterval(testUrl)
          })
        }
      })
      // ???????????????????????????
      ChildWin.once('show', () => {
        ChildWin.webContents.send('send-data-test', arg.sendData)
      })
    })
  },
}
