import NavBar from "@/components/NavBar"
import "./globals.css";
import {Open_Sans} from "next/font/google"

const open = Open_Sans(
    {
        weight: ["300", "500", "700"],
        style: ["normal"],
        subsets: ["latin"]
    }
)

export default function RootLayout({children}){
    return(
        <html>
            <body className="bg-[#f2f2f2]">
                {children}
            </body>
        </html>
    )
}