import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // Receive Apify Payload
        const body = await req.json()
        const rawItems = Array.isArray(body) ? body : [body]

        if (rawItems.length === 0) {
            return new Response(JSON.stringify({ success: true, message: 'Empty payload' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        const geminiKey = Deno.env.get('GEMINI_API_KEY')
        if (!geminiKey) throw new Error('GEMINI_API_KEY missing')

        // Context for Gemini: combine tweets/messages
        const contextStr = rawItems.map((item: any) => {
            const text = item.full_text || item.text || item.message || '';
            const url = item.url || item.link || '';
            const date = item.created_at || item.date || '';
            return `Source: ${url}\nDate: ${date}\nText: ${text}\n`;
        }).join('\n---\n')

        const prompt = `
      You are an intelligence agent for a geopolitical dashboard tracking the Iran-Israel-US conflict.
      Analyze the following recent social media posts (Tweets/Telegram). 
      Deduplicate events that are discussing the same incident.
      
      Extract a JSON array of distinct 'events'. For EVERY event, YOU MUST output EXACTLY this JSON structure:
      {
        "category": "KINETIC" | "DIPLOMATIC" | "INTENT" | "LEADERSHIP",
        "severity": 1 to 5,
        "headline": "A short, neutral headline (English)",
        "summary": "A 1-2 sentence neutral summary (English)",
        "location_name": "City name OR 'Regional'",
        "latitude": float or null,
        "longitude": float or null,
        "sources": ["array of exact URLs from the context"],
        "sentiment": "ESCALATORY" | "DIPLOMATIC" | "ULTIMATUM" | "NEUTRAL"
      }

      CRITICAL:
      - Return ONLY a valid JSON array.
      - Merge sources discussing the same event.
      - Social media can be noisy; discard irrelevant or purely opinionated posts.
      
      Content to analyze:
      ${contextStr}
    `

        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${geminiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: "application/json" }
            })
        })

        const aiData = await geminiRes.json()
        const rawText = aiData.candidates[0].content.parts[0].text
        const eventsToInsert = JSON.parse(rawText)

        let insertedCount = 0
        for (const evt of eventsToInsert) {
            if (!evt.headline) continue;

            const isVerified = (evt.sources && evt.sources.length >= 2) ? 'VERIFIED' : 'PENDING'
            const locationPoint = (evt.longitude && evt.latitude)
                ? `POINT(${evt.longitude} ${evt.latitude})`
                : null

            const { error } = await supabaseClient
                .from('events')
                .insert({
                    category: evt.category || 'KINETIC',
                    severity: evt.severity || 3,
                    headline: evt.headline,
                    summary: evt.summary || '',
                    location: locationPoint,
                    location_name: evt.location_name,
                    sources: evt.sources || [],
                    source_count: evt.sources?.length || 0,
                    verification_status: isVerified,
                    sentiment: evt.sentiment || 'NEUTRAL',
                    lang_summary: { en: evt.headline }
                })

            if (!error) insertedCount++
        }

        return new Response(JSON.stringify({ success: true, processed: eventsToInsert.length, inserted: insertedCount }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
