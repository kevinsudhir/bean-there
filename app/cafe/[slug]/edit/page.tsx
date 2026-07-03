import { notFound } from "next/navigation";
import AddCafeForm from "@/components/AddCafeForm";
import RequireAuth from "@/components/RequireAuth";
import { getCafeBySlug } from "@/lib/cafes";

export const dynamic = "force-dynamic";
export const metadata = { title: "Edit café — Bean There" };

/** Edit page for one café. Auth-guarded; pre-fills the form with the café. */
export default async function EditCafePage({
  params,
}: {
  params: { slug: string };
}) {
  const cafe = await getCafeBySlug(params.slug);
  if (!cafe) notFound();

  return (
    <main>
      <RequireAuth>
        <AddCafeForm existing={cafe} />
      </RequireAuth>
    </main>
  );
}
