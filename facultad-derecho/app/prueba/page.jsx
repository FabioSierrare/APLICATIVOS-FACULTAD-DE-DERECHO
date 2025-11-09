"use client"

import DatePickerWithBlocks from "@/components/Calendario";
import { Combobox } from "@headlessui/react";
import { useState } from "react";



export default function prueba(){
  const [value, setValue] = useState(0);
  const onclick = () => {
    setValue(value + 1);
  }

  return <div className="bg-gradient-to-r from-primary via-[#6A3BAF] to-[#7A5BCF] backdrop-blur supports-[backdrop-filter]:bg-primary/80 md:min-h-auto p-10 rounded-2xl max-w-2xl m-auto">
    <h1 className="text-white font-semibold text-xl mb-5 text-center">Registro de turno</h1>
    <div className=" flex md:justify-between flex-col mb-7">
      <h3 className="text-white font-semibold text-md mb-5">Seleccione la fecha del turno</h3>
      <DatePickerWithBlocks className="mx-auto"/>
    </div>
    <div>
      <label className="text-white font-semibold text-md mb-2">Seleccione la jornada del turno</label>
      <h1 className="text-white">{value}</h1>
      <button className="bg-active-text rounded-2xl p-4 text-secundary-text" onClick={onclick}>Aumentar contador</button>   
    </div>
  </div>
}