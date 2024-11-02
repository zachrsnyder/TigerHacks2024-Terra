import React, { useState, useEffect } from 'react';
import getEquipmentByUserUID from './queries'
import {useAuth} from '../../contexts/AuthContext'
import { Folder, FolderOpen, Plus } from 'lucide-react';

function PlotSection() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [plot, setPlot] = useState([])
  const { currentUser } = useAuth();
  const [toggleAdd, setToggleAdd] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const setPlotList = async() => {
      //setPlot(await getPlotByUserUID(currentUser))
    }

    setPlotList()
    setIsLoading(false)
  }, [])

  const toggleDropdown = () => setIsOpen(!isOpen);

  return (
    <div className="border-b border-gray-300">
      <div className='flex justify-between items-center'>
        <div 
          className="flex items-center cursor-pointer p-4"
          onClick={toggleDropdown}
        >
          {isOpen ? <FolderOpen size={24} className="text-text mr-3" /> : <Folder size={24} className="text-text mr-3" />}
          <h3 className="text-lg font-semibold">Plots</h3>
        </div>
        <div className='pr-4'>
          <Plus 
            size={24} 
            className="text-white cursor-pointer" 
            onClick={() => setShowAddModal(true)} // Fixed this line
          />
        </div>
      </div>
      {isOpen && (isLoading ? (
        <div>
          <h2>Loading...</h2>
        </div>
      ) : (
        <div className="p-4 space-y-2">
          {plot.map((tool) => (
            <div>Plot!</div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default PlotSection;