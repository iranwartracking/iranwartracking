// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

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
        // 1. Initialize Supabase Client using Service Role (admin)
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 2. Fetch news from Tavily API
        const tavilyKey = Deno.env.get('TAVILY_API_KEY')
        if (!tavilyKey) throw new Error('TAVILY_API_KEY missing')

        const tavilyQuery = "Iran Israel USA conflict latest strikes diplomacy threats news today"
        const tavilyRes = await fetch("https://api.tavily.com/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                api_key: tavilyKey,
                query: tavilyQuery,
                search_depth: "advanced",
                include_raw_content: false,
                max_results: 10,
                days: 1
            })
        })

        const newsData = await tavilyRes.json()
        const contextStr = newsData.results.map((r: any) => `Source: ${r.url}\nTitle: ${r.title}\nContent: ${r.content}\n`).join('\n---\n')

        // 3. Process with Gemini 1.5 Flash
        const geminiKey = Deno.env.get('GEMINI_API_KEY')
        if (!geminiKey) throw new Error('GEMINI_API_KEY missing')

        const prompt = `
      You are an intelligence agent for a geopolitical dashboard tracking the Iran-Israel-US conflict.
      Analyze the following recent news snippets. Deduplicate events that are discussing the same incident.
      
      Extract a JSON array of distinct 'events'. For EVERY event, YOU MUST output EXACTLY this JSON structure:
      {
        "category": "KINETIC" | "DIPLOMATIC" | "INTENT" | "LEADERSHIP",
        "severity": 1 to 5 (integer, 5 is highest),
        "headline": "A short, neutral headline (English)",
        "summary": "A 2-3 sentence neutral summary (English)",
        "location_name": "City name OR 'Regional' if no specific city",
        "latitude": float or null (ONLY if a specific city was found),
        "longitude": float or null (ONLY if a specific city was found),
        "sources": ["array of exact URLs from the context"],
        "leader_quotes": [{"leader": "Name", "quote": "Exact phrase", "source": "URL"}],
        "sentiment": "ESCALATORY" | "DIPLOMATIC" | "ULTIMATUM" | "NEUTRAL"
      }

      CRITICAL:
      - Return ONLY a valid JSON array. No markdown blocks, no text outside the array.
      - If multiple sources mention the same strike, merge them into 1 event with both URLs in 'sources'.
      
      News content to analyze:
      ${contextStr}
    `

        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: "application/json" }
            })
        })

        const aiData = await geminiRes.json()
        const rawText = aiData.candidates[0].content.parts[0].text

        // Parse the JSON array
        const eventsToInsert = JSON.parse(rawText)

        // 4. Insert into Supabase
        let insertedCount = 0
        for (const evt of eventsToInsert) {
            if (!evt.headline) continue;

            // Determine verification
            const isVerified = (evt.sources && evt.sources.length >= 2) ? 'VERIFIED' : 'PENDING'

            // PostGIS Point Format: 'POINT(longitude latitude)'
            const locationPoint = (evt.longitude && evt.latitude)
                ? `POINT(${evt.longitude} ${evt.latitude})`
                : null

            // Build English base struct (Translations can be added in a separate pipeline or async)
            const langSummary = {
                en: evt.headline
            }

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
                    leader_quotes: evt.leader_quotes || [],
                    sentiment: evt.sentiment || 'NEUTRAL',
                    lang_summary: langSummary
                })

            if (!error) insertedCount++
        }

        return new Response(JSON.stringify({ success: true, processed: eventsToInsert.length, inserted: insertedCount }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    } catch (error: unknown) {
        const err = error as Error;
        return new Response(JSON.stringify({ error: err.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
