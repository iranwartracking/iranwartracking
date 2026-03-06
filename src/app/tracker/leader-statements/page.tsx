import { FeedSidebar } from '@/components/FeedSidebar';

export const metadata = {
    title: 'Leader Statements Feed | IranWar.net',
    description: 'Live coverage of diplomatic and political statements regarding the Iran conflict.',
};

export default function LeaderStatementsPage() {
    return (
        <div className="flex-1 flex overflow-hidden flex-col md:flex-row max-w-7xl mx-auto w-full">
            <div className="w-full md:w-[60%] lg:w-[65%] border-r border-war-border bg-war-bg overflow-y-auto p-4 sm:p-8">
                <h1 className="text-3xl font-bold text-white mb-2">Leader Statements</h1>
                <p className="text-zinc-400 mb-8 border-b border-war-border pb-6">
                    Direct quotes and statements from key geopolitical figures. This feed focuses purely on intent, threats, and official remarks, free from editorial commentary.
                </p>

                <div className="bg-war-panel border border-war-border rounded-lg p-6 flex flex-col items-center justify-center text-center min-h-[300px]">
                    <div className="text-purple-400 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Live AI Extraction</h2>
                    <p className="text-zinc-400 max-w-md">
                        Our AI agents continuously scan official Telegram channels, press briefings, and wire services to extract direct quotes from leaders in real-time. Use the sidebar to track the latest.
                    </p>
                </div>
            </div>

            <div className="w-full md:w-[40%] lg:w-[35%] h-[50vh] md:h-full overflow-y-auto bg-war-bg">
                <FeedSidebar />
            </div>
        </div>
    );
}
