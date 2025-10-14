import { MapComponent } from "@/components/map";
import { Navbar } from "@/components/navbar";

export default function Page() {
  return (
    <>
      <Navbar />
      <MapComponent />
      <div className="h-full w-full">hello world</div>
    </>
  );
}
