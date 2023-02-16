import Store from 'electron-store'
const store = new Store()

export function getCookies(): any {
  const cookies = store.get('cookies')
  return cookies
}

export function setCookies(cookies) {
  store.set('cookies', cookies)
}

export function deleteCookies() {
  store.delete('cookies')
}

export function saveCookieToStore(cookies) {
  store.store.cookies = cookies
}
export function getCookieToStore() {
  const cookie = store.get('cookies')
  console.log(cookie, '========get cookie')
  return cookie
}
