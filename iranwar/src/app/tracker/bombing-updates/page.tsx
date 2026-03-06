import { FeedSidebar } from '@/components/FeedSidebar';

export const metadata = {
    title: 'Live Bombing & Strike Updates | IranWar.net',
    description: 'Real-time verified reports of kinetic military action and bombings in the Middle East conflict.',
};

export default function BombingUpdatesPage() {
    return (
        <div className="flex-1 flex overflow-hidden flex-col md:flex-row max-w-7xl mx-auto w-full">
            <div className="w-full md:w-[60%] lg:w-[65%] border-r border-war-border bg-war-bg overflow-y-auto p-4 sm:p-8">
                <h1 className="text-3xl font-bold text-red-500 mb-2">Kinetic Events & Bombings</h1>
                <p className="text-zinc-400 mb-8 border-b border-war-border pb-6">
                    Verified tactical updates on airstrikes, drone attacks, and ground skirmishes.
                </p>

                <div className="bg-war-panel border border-war-border rounded-lg p-6 flex flex-col items-center justify-center text-center min-h-[300px]">
                    <div className="text-red-500 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Tracking the Frontlines</h2>
                    <p className="text-zinc-400 max-w-md">
                        Events listed here are cross-referenced across multiple sources before being marked as Verified. Select the "Kinetic" tab in the feed to filter for strikes.
                    </p>
                </div>
            </div>

            <div className="w-full md:w-[40%] lg:w-[35%] h-[50vh] md:h-full overflow-y-auto bg-war-bg">
                <FeedSidebar />
            </div>
        </div>
    );
}
