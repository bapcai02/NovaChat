import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

if (typeof window !== 'undefined') {
  ;(window as any).Pusher = Pusher
}

let echo: any | null = null

export const getEcho = (): any => {
  if (echo) return echo

  const key = (process.env.NEXT_PUBLIC_PUSHER_APP_KEY || process.env.NEXT_PUBLIC_PUSHER_KEY || 'localkey') as string
  const cluster = (process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER || process.env.NEXT_PUBLIC_WS_CLUSTER || 'mt1') as string
  const host = process.env.NEXT_PUBLIC_WS_HOST || 'localhost'
  const port = Number(process.env.NEXT_PUBLIC_WS_PORT || 6001)

  echo = new Echo({
    broadcaster: 'pusher',
    key,
    cluster,
    wsHost: host,
    wsPort: port,
    wssPort: port,
    forceTLS: false,
    disableStats: true,
    enabledTransports: ['ws', 'wss'],
    authEndpoint: `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '')}/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: typeof window !== 'undefined' && localStorage.getItem('auth_token')
          ? `Bearer ${localStorage.getItem('auth_token')}`
          : ''
      }
    }
  })

  try {
    const p = (echo as any).connector?.pusher
    if (p) {
      p.connection.bind('state_change', (s: any) => {
        console.log('[Echo] connection state', s?.previous, '→', s?.current)
      })
      p.connection.bind('connected', () => {
        console.log('[Echo] connected')
      })
      p.connection.bind('error', (err: any) => {
        console.warn('[Echo] connection error', err)
      })
    }
  } catch (e) {
    console.warn('[Echo] unable to bind connection events', e)
  }

  return echo
}


