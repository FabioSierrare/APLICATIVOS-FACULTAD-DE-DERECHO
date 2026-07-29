import EditarCalendarioForId from "@/components/CalendarioEdit"

export default async function Edit({params}){
    const {id} = await params
    return <EditarCalendarioForId id={id}/>
}