import {React, useEffect, useState} from 'react'
import EquipmentSection from './EquipmentSection'


const LeftDashboard = () => {
    
    return (
    <aside className='w-1/4 h-screen z-10 bg-secondary text-text fixed top-16 left-0'>
        <EquipmentSection />
    </aside>
  )
}

export default LeftDashboard