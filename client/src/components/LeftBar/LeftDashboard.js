import {React, useEffect, useState} from 'react'
import EquipmentSection from './EquipmentSection'
import {Check, ChevronRight, ChevronLeft} from 'lucide-react'
import PlotSection from './PlotSection'


const LeftDashboard = ({pointPlots}) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const toggleAside = () => {
      setIsCollapsed(!isCollapsed);
    };  

    return (
    <div className='absolute left-0 top-16 h-screen flex '>
      <aside className={`h-screen z-10 text-text transition-all duration-300 bg-primary ${
          isCollapsed ? 'w-0 p-0' : 'w-[20vw]'} overflow-hidden`}>
        <EquipmentSection />
        <PlotSection pointPlots={pointPlots}/>
      </aside>
      <div className='h-full items-center relative flex justify-center'>
        <div className="w-[2vw] h-[6vw] bg-primary rounded-r-full justify-center align-middle items-center flex z-10" style={{ opacity: isHovered ? .70 : .30, color: 'white' }} onClick={toggleAside} onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}>
          {isCollapsed ? (<ChevronRight color='white' size={24}/>) : (<ChevronLeft color='white' size={24}/>) }
        </div>
      </div>
    </div>
  )
}

export default LeftDashboard