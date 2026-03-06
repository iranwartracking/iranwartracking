import { Map } from '../components/Map';
import { FeedSidebar } from '../components/FeedSidebar';

export default function Home() {
  return (
    <div className="flex-1 flex overflow-hidden flex-col md:flex-row">
      <div className="w-full md:w-[60%] lg:w-[65%] h-[50vh] md:h-full border-b md:border-b-0 md:border-r border-war-border relative bg-war-panel z-0">
        <Map />
      </div>

      <div className="w-full md:w-[40%] lg:w-[35%] h-[50vh] md:h-full overflow-y-auto bg-war-bg">
        <FeedSidebar />
      </div>
    </div>
  );
}
