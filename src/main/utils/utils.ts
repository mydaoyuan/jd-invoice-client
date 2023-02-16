import cookie from 'cookie'
export function sleep(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time))
}
export function parseSetCookie(cookiesArr) {
  const cookies = cookie.parse(cookiesArr.join(';'))
  return Object.keys(cookies)
    .map((name) => {
      const value = cookies[name]
      return { name, value }
    })
    .reduce((a, b) => {
      a[b.name] = b
      return a
    }, {})
}
