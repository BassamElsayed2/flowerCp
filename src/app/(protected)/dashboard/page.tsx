import Welcome from "@/components/Dashboard/Restaurant/Welcome";
import RecentNews from "@/components/RecentNews";

export const dynamic = "force-dynamic";

export default function page() {
  return (
    <>
      <Welcome />
      <div className="2xl:grid 2xl:grid-cols-2 gap-[25px]">
        <RecentNews />
      </div>
    </>
  );
}
