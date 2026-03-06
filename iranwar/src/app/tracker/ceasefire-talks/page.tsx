import { FeedSidebar } from '@/components/FeedSidebar';

export const metadata = {
    title: 'Diplomacy & Ceasefire Talks | IranWar.net',
    description: 'Track diplomatic developments, UN resolutions, and ceasefire negotiations in real-time.',
};

export default function CeasefireTalksPage() {
    return (
        <div className="flex-1 flex overflow-hidden flex-col md:flex-row max-w-7xl mx-auto w-full">
            <div className="w-full md:w-[60%] lg:w-[65%] border-r border-war-border bg-war-bg overflow-y-auto p-4 sm:p-8">
                <h1 className="text-3xl font-bold text-blue-400 mb-2">Diplomacy & Ceasefire Talks</h1>
                <p className="text-zinc-400 mb-8 border-b border-war-border pb-6">
                    Live monitoring of international negotiations, UN resolutions, and diplomatic shifting in the region.
                </p>

                <div className="bg-war-panel border border-war-border rounded-lg p-6 flex flex-col items-center justify-center text-center min-h-[300px]">
                    <div className="text-blue-400 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">De-escalation Efforts</h2>
                    <p className="text-zinc-400 max-w-md">
                        Filter the sidebar to "Diplomacy" to see the latest off-ramps and negotiation updates provided by global actors.
                    </p>
                </div>
            </div>

            <div className="w-full md:w-[40%] lg:w-[35%] h-[50vh] md:h-full overflow-y-auto bg-war-bg">
                <FeedSidebar />
            </div>
        </div>
    );
}
