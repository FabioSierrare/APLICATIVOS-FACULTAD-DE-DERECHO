import Links from "next/link"

export default function NavBar(){
    return(
        <nav>
            <ul>
                <Links href="turnos">Turnos</Links>
            </ul>
            <ul>
                <a href="">Dos</a>
            </ul>
            <ul>
                <a href="">Tres</a>
            </ul>
        </nav>
    )
}