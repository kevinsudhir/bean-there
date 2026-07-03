import Header from "@/components/Header";
import Wall from "@/components/Wall";
import AddCafeButton from "@/components/AddCafeButton";
import { getCafes } from "@/lib/cafes";

/**
 * Home page. This is a Server Component: it runs on the server, fetches the
 * cafes, and passes them to <Wall>, which is a Client Component that handles
 * interactivity (filtering, opening the modal).
 *
 * We opt out of static caching so newly added cafes show up without a rebuild.
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage({
  searchParams,
}: {
  searchParams: { preview?: string };
}) {
  // Dev/preview helper: visit /?preview=empty to see the empty state (and its
  // game) on the live site without touching the database. Any other value or
  // no param behaves normally.
  const cafes =
    searchParams.preview === "empty" ? [] : await getCafes();

  return (
    <main>
      <Header />
      <Wall cafes={cafes} />
      <AddCafeButton />
    </main>
  );
}
