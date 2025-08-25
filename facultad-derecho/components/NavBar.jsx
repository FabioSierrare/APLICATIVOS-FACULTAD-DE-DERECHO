export default function({children}){
    return(
        <header className="sticky top-0 z-30 border-b bg-gradient-to-r from-primary via-[#6A3BAF] to-[#7A5BCF] backdrop-blur supports-[backdrop-filter]:bg-primary/80">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="place-items-center w-12 rounded-2xl bg-white/20 text-white">
              <img src="/img/Logo.png" alt="logo" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-center  text-white">
                Universidad Colegio <br></br> Mayor de Cundinamarca
              </h1>
            </div>
          </div>
          <div className="hidden mx-5 md:flex items-center gap-5">{children}</div>
        </div>
        
      </header>
    )
}