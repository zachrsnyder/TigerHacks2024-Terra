import {React, useEffect, useState} from 'react'
import EquipmentSection from './EquipmentSection'
import {Check, ChevronRight, ChevronLeft} from 'lucide-react'
import PlotSection from './PlotSection'
import VehicleSection from './VehicleSection'


const LeftDashboard = ({pointPlots, setPointPlots, selectedPlot, setSelectedPlot}) => {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [isHovered, setIsHovered] = useState(false);

    const toggleAside = () => {
      setIsCollapsed(!isCollapsed);
    };  

    return (
    <div className='absolute left-0 top-16 h-screen flex '>
      <aside className={`h-screen z-10 text-text transition-all duration-300 bg-primary ${
          isCollapsed ? 'w-0 p-0' : 'w-[20vw]'} overflow-hidden`}>
        <VehicleSection />
        <EquipmentSection />
        <PlotSection pointPlots={pointPlots} setSelectedPlot={setSelectedPlot} selectedPlot={selectedPlot}/>
      </aside>
      <div className='h-full items-center relative flex justify-center'>
        <div className="w-[2vw] h-[6vw] bg-primary rounded-r-full justify-center align-middle items-center flex z-10" style={{ opacity: isHovered ? .90 : .75, color: 'white' }} onClick={toggleAside} onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}>
          {isCollapsed ? (<ChevronRight color='white' size={24}/>) : (<ChevronLeft color='white' size={24}/>) }
        </div>
      </div>
    </div>
  )
}

export default LeftDashboard