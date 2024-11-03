import {React, useState} from 'react'
import EquipmentSection from './EquipmentSection'
import {ChevronRight, ChevronLeft} from 'lucide-react'
import PlotSection from './PlotSection'
import VehicleSection from './VehicleSection'


const LeftDashboard = ({pointPlots, setPointPlots, selectedPlot, setSelectedPlot, setShowSidebarGuide}) => {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [isHovered, setIsHovered] = useState(false);

    // Function to toggle the sidebar open or closed
    const toggleAside = () => {
      setIsCollapsed(!isCollapsed);
      setShowSidebarGuide(false);
    };

    return (
    <div className='absolute left-0 top-16 bottom-0 flex text-[var(--text-color)]'>
      <aside className={`h-full z-10 transition-all duration-300 bg-primary ${
          isCollapsed ? 'w-0 p-0' : 'w-[25vw]'} overflow-y-scroll`}>
        <VehicleSection />
        <EquipmentSection />
        <PlotSection pointPlots={pointPlots} setSelectedPlot={setSelectedPlot} selectedPlot={selectedPlot}/>
      </aside>
      <div className='h-full items-center relative flex justify-center'>
        <div className="w-[2vw] h-[6vw] bg-primary rounded-r-full justify-center align-middle items-center flex z-10" style={{ opacity: isHovered ? .90 : .75, color: 'white' }} onClick={toggleAside} onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}>
          {isCollapsed ? (<ChevronRight color='var(--text-color)' size={24}/>) : (<ChevronLeft color='var(--text-color)' size={24}/>) }
        </div>
      </div>
    </div>
  )
}

export default LeftDashboard