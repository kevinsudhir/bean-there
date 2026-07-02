import AddCafeForm from "@/components/AddCafeForm";
import RequireAuth from "@/components/RequireAuth";

export const metadata = { title: "Add a café — Bean There" };

export default function AddPage() {
  return (
    <main>
      <RequireAuth>
        <AddCafeForm />
      </RequireAuth>
    </main>
  );
}
