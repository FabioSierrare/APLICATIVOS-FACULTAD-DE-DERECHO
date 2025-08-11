import "./globals.css";

export default function RootLayout({children}){
    return(
        <html>
            <body className="bg-[#f2f2f2] ">
                {children}
            </body>
        </html>
    )
}