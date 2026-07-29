export default function Jornada({jornada, set, parametroText}) {
    return <div className="w-full">
      <label className={`block ${parametroText}`}>JORNADA <span className="text-red-600">*</span></label>
        <select
          value={jornada}
          onChange={(e) => set(e.target.value)}
          className="bg-primary text-white w-full h-10 border-white/30 border  rounded-lg px-4 focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
        >
          <option value="" className="" disabled>
            Seleccione jornada 
          </option>
          <option value="AM">AM - 08:00 - 12:00</option>
          <option value="PM">PM - 01:00 - 05:00</option>
        </select>
      </div>
}