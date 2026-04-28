import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    })
  }

  try {
    const body = await req.json()
    console.log("Received request body:", JSON.stringify(body, null, 2))
    
    const { name, email, message, base64Audio, intent, sentiment, time } = body

    console.log(`Attempting to send email for ${name} (${intent})`)

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Portfolio Assistant <portfolio@harshvardhansingh.me>',
        to: ['harshvardhansingh.ds@gmail.com'],
        subject: `[PORTFOLIO] ${intent} from ${name}`,
        html: `
          <div style="font-family: sans-serif; background: #0d0b09; color: #f5e2c0; padding: 40px; border-radius: 12px; border: 1px solid #ff3d00;">
            <h2 style="color: #ff3d00; border-bottom: 1px solid rgba(255,61,0,0.2); padding-bottom: 10px;">INCOMING TRANSMISSION</h2>
            <p><strong>Sender:</strong> ${name} (${email})</p>
            <p><strong>Intent:</strong> ${intent}</p>
            <p><strong>Sentiment Score:</strong> ${sentiment || 'N/A'}</p>
            <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 8px; margin: 20px 0; color: #8b8680;">
              ${message}
            </div>
            ${time ? `<p style="font-size: 12px; color: #666;">Audio Duration: ${time}</p>` : ''}
          </div>
        `,
        attachments: base64Audio ? [
          {
            filename: 'hbot_voicemail.webm',
            content: base64Audio,
          },
        ] : [],
      }),
    })

    const data = await res.json()
    console.log("Resend API Response:", JSON.stringify(data, null, 2))
    
    if (!res.ok) {
      throw new Error(`Resend API Error: ${JSON.stringify(data)}`)
    }

    return new Response(JSON.stringify(data), { 
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      status: 200 
    })

  } catch (error) {
    console.error("Function Error:", error.message)
    return new Response(JSON.stringify({ error: error.message }), { 
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      status: 500 
    })
  }
})
