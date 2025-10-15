import MapComponent from "@/components/map";
import { Navbar } from "@/components/navbar";

export default function Page() {
  return (
    <div className="h-full w-full bg-background">
      <Navbar />
      <MapComponent />
    </div>
  );
}
