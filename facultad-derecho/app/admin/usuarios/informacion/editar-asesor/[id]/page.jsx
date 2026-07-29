import InfoAsesor from "@/components/InfoAsesores";

export default async function EditarAsesores( { params } ){

    const { id } = await params;  // ✔ CORRECTO

    return <InfoAsesor id={id}/>
}