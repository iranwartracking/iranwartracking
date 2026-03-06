export const metadata = {
    title: 'About IranWar Tracker | IranWar.net',
    description: 'The story behind IranWar.net and how our AI-verified tracking system works.',
};

export default function AboutPage() {
    return (
        <div className="flex-1 overflow-y-auto bg-war-bg w-full">
            <div className="max-w-3xl mx-auto px-4 py-12">
                <h1 className="text-4xl font-bold text-white mb-6">About IranWar.net</h1>

                <div className="prose prose-invert prose-zinc max-w-none">
                    <p className="text-lg text-zinc-300 mb-8 leading-relaxed">
                        IranWar.net is a real-time, AI-assisted intelligence dashboard designed to provide zero-bias, highly transparent tracking of the Middle East conflict. We built this tracking tool out of a deeply personal necessity—to help families coordinate, verify safety zones, and filter through the noise during critical situations.
                    </p>

                    <h2 className="text-2xl font-semibold text-white mt-10 mb-4">Why We Built This</h2>
                    <p className="text-zinc-400 mb-6">
                        In times of crisis, the "Fog of War" creates panic. Telegram channels spread rumors, and traditional news struggles to keep up with the pace of events. We saw firsthand how crucial it is to have <strong>verified facts, fast</strong>. By leveraging artificial intelligence to group and verify reports, we provide clarity when it's needed most.
                    </p>

                    <h2 className="text-2xl font-semibold text-white mt-10 mb-4">How It Works</h2>
                    <div className="space-y-4 text-zinc-400">
                        <div className="bg-war-panel p-4 rounded-lg border border-war-border">
                            <h3 className="font-bold text-white mb-2">1. Ingestion</h3>
                            <p className="text-sm">Our system continuously monitors official wire services, established news networks, and state-verified feeds.</p>
                        </div>

                        <div className="bg-war-panel p-4 rounded-lg border border-war-border">
                            <h3 className="font-bold text-white mb-2">2. Entity Resolution & Deduplication (AI)</h3>
                            <p className="text-sm">When an event happens, 50 outlets might report it. Our AI clusters these reports into a single, unified 'Event' to prevent map clutter and panic-inducing duplication.</p>
                        </div>

                        <div className="bg-war-panel p-4 rounded-lg border border-war-border">
                            <h3 className="font-bold text-white mb-2">3. The 2-Source Verification Rule</h3>
                            <p className="text-sm">Events only receive the green "Verified" checkmark if they are corroborated by at least two distinct, trusted sources. Until then, they remain marked as "Pending."</p>
                        </div>
                    </div>

                    <h2 className="text-2xl font-semibold text-white mt-10 mb-4">The Cost of Transparency</h2>
                    <p className="text-zinc-400 mb-6">
                        Running LLMs (Large Language Models) for real-time translation and event verification is expensive. Our daily operational cost is roughly <strong>$20/day</strong>. We rely entirely on community donations to keep this service free, live, and ad-free for everyone who relies on it—especially those on the ground.
                    </p>

                    <div className="mt-8 p-6 bg-zinc-800/50 rounded-lg text-center border border-zinc-700">
                        <h3 className="text-lg font-bold text-white mb-2">Support the Project</h3>
                        <p className="text-sm text-zinc-400 mb-4">Help us maintain server capacity and API access.</p>
                        <a
                            href="https://ko-fi.com/your-kofi-link"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block bg-white text-black font-bold py-2 px-6 rounded-md hover:bg-zinc-200 transition-colors"
                        >
                            Donate via Ko-fi
                        </a>
                    </div>

                    <div className="mt-16 text-xs text-zinc-600 border-t border-war-border pt-8">
                        <p className="mb-2"><strong>Disclaimer:</strong> Information provided for educational and analytical purposes only. AI-generated summaries may contain errors. Always verify with official sources before making safety-critical decisions.</p>
                        <p>Our code uses Anthropic/Google AI endpoints and Supabase open-source infrastructure.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
