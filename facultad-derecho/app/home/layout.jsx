import Aside from "@/components/Aside";

export default function HomeLayout({children}){
    return(<>
        <Aside></Aside>
        {children}
        </>
    )
}