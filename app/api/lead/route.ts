import { createHash } from 'node:crypto'
import { NextResponse } from 'next/server'

const GO_HIGH_LEVEL_WEBHOOK = 'https://services.leadconnectorhq.com/hooks/iGbC817rCzAfj7HtPYRs/webhook-trigger/acb94afa-4246-416c-a726-9c048def03d9'
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID
const META_CAPI_TOKEN = process.env.META_CONVERSIONS_API_TOKEN

const sha256 = (value: string) => createHash('sha256').update(value.trim().toLowerCase()).digest('hex')

async function sendMetaLeadEvent(request: Request, payload: Record<string, unknown>) {
  if (!META_PIXEL_ID || !META_CAPI_TOKEN) return

  const answers = (payload.answers ?? {}) as Record<string, string>
  const userData: Record<string, unknown> = {}

  if (answers.email) userData.em = [sha256(answers.email)]
  const phoneDigits = (answers.phone || '').replace(/\D/g, '')
  if (phoneDigits) userData.ph = [sha256(phoneDigits)]

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  if (ip) userData.client_ip_address = ip
  const ua = request.headers.get('user-agent')
  if (ua) userData.client_user_agent = ua

  const cookie = request.headers.get('cookie') || ''
  const fbp = cookie.match(/_fbp=([^;]+)/)?.[1]
  const fbc = cookie.match(/_fbc=([^;]+)/)?.[1]
  if (fbp) userData.fbp = fbp
  if (fbc) userData.fbc = fbc

  const body = {
    data: [{
      event_name: 'Lead',
      event_time: Math.floor(Date.now() / 1000),
      event_id: typeof payload.eventId === 'string' ? payload.eventId : undefined,
      action_source: 'website',
      event_source_url: typeof payload.pageUrl === 'string' ? payload.pageUrl : undefined,
      user_data: userData,
    }],
  }

  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${META_PIXEL_ID}/events?access_token=${META_CAPI_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    })
    if (!res.ok) console.error('[meta-capi] Lead event failed:', res.status, await res.text())
  } catch (error) {
    console.error('[meta-capi] Lead event error:', error)
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json()

    if (!payload || typeof payload !== 'object' || !payload.answers) {
      return NextResponse.json({ error: 'Invalid lead payload' }, { status: 400 })
    }

    const response = await fetch(GO_HIGH_LEVEL_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
    })

    if (!response.ok) {
      console.error('[v0] GoHighLevel webhook failed:', response.status)
      return NextResponse.json({ error: 'Webhook delivery failed' }, { status: 502 })
    }

    await sendMetaLeadEvent(request, payload)

    return NextResponse.json({ delivered: true })
  } catch (error) {
    console.error('[v0] Lead webhook error:', error)
    return NextResponse.json({ error: 'Unable to submit lead' }, { status: 500 })
  }
}
