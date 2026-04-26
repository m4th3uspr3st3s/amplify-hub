'use client'

import { useEffect, useState } from 'react'
import {
  Call,
  CallControls,
  SpeakerLayout,
  StreamCall,
  StreamTheme,
  StreamVideo,
  StreamVideoClient,
} from '@stream-io/video-react-sdk'
import '@stream-io/video-react-sdk/dist/css/styles.css'

type TokenResponse = {
  apiKey: string
  token: string
  userId: string
  name: string
  image?: string
}

type StreamRoomProps = {
  callType: string
  callId: string
}

export function StreamRoom({ callType, callId }: StreamRoomProps) {
  const [client, setClient] = useState<StreamVideoClient | null>(null)
  const [call, setCall] = useState<Call | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    let activeClient: StreamVideoClient | null = null
    let activeCall: Call | null = null

    async function bootstrap() {
      try {
        const res = await fetch('/api/stream/token', { method: 'POST' })
        if (!res.ok) {
          throw new Error(`token_request_failed:${res.status}`)
        }
        const data = (await res.json()) as TokenResponse

        if (cancelled) return

        // getOrCreateInstance evita leak entre HMRs e múltiplos mounts.
        activeClient = StreamVideoClient.getOrCreateInstance({
          apiKey: data.apiKey,
          user: { id: data.userId, name: data.name, image: data.image },
          token: data.token,
        })

        activeCall = activeClient.call(callType, callId)
        // create:false — alunos entram, mas não criam calls. A criação fica
        // no Supabase Studio (PRD §4.2 RLS de live_sessions).
        await activeCall.join({ create: false })

        if (cancelled) {
          await activeCall.leave().catch(() => {})
          return
        }

        setClient(activeClient)
        setCall(activeCall)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'unknown_error')
        }
      }
    }

    bootstrap()

    return () => {
      cancelled = true
      activeCall?.leave().catch(() => {})
      activeClient?.disconnectUser().catch(() => {})
    }
  }, [callType, callId])

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6">
        <p className="font-sans text-sm text-(--color-text-secondary)">
          Não foi possível conectar à sala. Recarregue a página em instantes.
        </p>
      </div>
    )
  }

  if (!client || !call) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6">
        <p className="font-sans text-sm text-(--color-text-muted)">
          Conectando à sala…
        </p>
      </div>
    )
  }

  // StreamTheme aplica o dark theme nativo do SDK. Override de touch target
  // em globals.css garante 44pt em mute/video/hangup (DS Universal §0.1).
  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <StreamTheme className="amplify-stream-room str-video__call--dark">
          <div className="flex min-h-[calc(100vh-4rem)] flex-col">
            <div className="flex-1">
              <SpeakerLayout participantsBarPosition="bottom" />
            </div>
            <div className="border-t border-(--color-border-default) bg-(--color-bg-base) px-4 py-3">
              <CallControls />
            </div>
          </div>
        </StreamTheme>
      </StreamCall>
    </StreamVideo>
  )
}
