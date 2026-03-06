import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Ko-fi sends requests as WWW-Form-Urlencoded
serve(async (req) => {
    try {
        const textData = await req.text()
        const params = new URLSearchParams(textData)
        const dataStr = params.get('data')

        if (!dataStr) {
            return new Response("Missing data", { status: 400 })
        }

        const koFiData = JSON.parse(dataStr)

        // 1. Verify Token
        const expectedToken = Deno.env.get('KOFI_VERIFICATION_TOKEN')
        if (koFiData.verification_token !== expectedToken) {
            return new Response("Unauthorized webhook", { status: 401 })
        }

        // 2. Init Supabase
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 3. Process Donation Amount
        const amountStr = koFiData.amount
        if (amountStr && !koFiData.is_subscription_payment) {
            const amount = parseFloat(amountStr)

            // Get current total
            const { data: configData } = await supabaseClient
                .from('site_config')
                .select('value')
                .eq('key', 'daily_donations_total')
                .single()

            const currentTotal = configData ? parseFloat(configData.value) : 0
            const newTotal = currentTotal + amount

            // Update total
            await supabaseClient
                .from('site_config')
                .update({ value: newTotal.toString(), updated_at: new Date().toISOString() })
                .eq('key', 'daily_donations_total')
        }

        // 4. Process Optional Premium Upgrade (if they provided email matching an account)
        const email = koFiData.email
        if (email) {
            // Find user
            const { data: profile } = await supabaseClient
                .from('profiles')
                .select('id')
                .eq('email', email)
                .single()

            if (profile) {
                // Upgrade them for 30 days
                const expiry = new Date()
                expiry.setDate(expiry.getDate() + 30)

                await supabaseClient
                    .from('profiles')
                    .update({
                        is_premium: true,
                        subscription_status: 'kofi_supporter',
                        expiry_date: expiry.toISOString()
                    })
                    .eq('id', profile.id)
            }
        }

        return new Response("Webhook processed", { status: 200 })

    } catch (error: unknown) {
        const err = error as Error;
        return new Response(JSON.stringify({ error: err.message }), { status: 500 })
    }
})
