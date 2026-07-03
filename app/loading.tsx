import WallLoading from "@/components/WallLoading";

/**
 * Shown automatically by Next.js (via Suspense) while the home page's server
 * component is fetching café data. Gives the bobbing-cup animation instead of
 * a blank screen on slower connections.
 */
export default function Loading() {
  return (
    <main>
      <WallLoading />
    </main>
  );
}
