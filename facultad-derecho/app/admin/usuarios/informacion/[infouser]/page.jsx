import UserProfilePage from "@/components/InformacionUsuarios";

export default async function Page({ params }) {
  const { infouser } = await params;  // ✔ CORRECTO

  return (
    <div>
      <UserProfilePage id={infouser} />
    </div>
  );
}
