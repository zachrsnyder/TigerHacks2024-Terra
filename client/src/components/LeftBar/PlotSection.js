import React, { useState, useEffect } from 'react';
import getEquipmentByUserUID from './queries'
import {useAuth} from '../../contexts/AuthContext'
import { Folder, FolderOpen, Plus } from 'lucide-react';
import { doc, collection, getDocs } from 'firebase/firestore';
import PlotCard from './PlotCard';
import { db } from '../../firebase';
import { uid } from 'chart.js/helpers';
import { map, isArray } from 'lodash';

function PlotSection({pointPlots}) {
    const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [plots, setPlots] = useState([])
  const { currentUser } = useAuth();
  const [toggleAdd, setToggleAdd] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    setIsLoading(true);

    // Define the asynchronous function inside useEffect
    const fetchPlots = async () => {
        async function getFarmPlots(farmId) {
            // Reference the farm document
            const farmDocRef = doc(db, 'farms', farmId);
            console.log(farmDocRef);

            // Reference the plots subcollection within the specific farm document
            const plotsCollectionRef = collection(farmDocRef, 'plots');
            console.log(plotsCollectionRef);

            // Fetch all documents in the plots subcollection
            const plotsSnapshot = await getDocs(plotsCollectionRef);
            console.log(plotsSnapshot);

            // Extract plot data
            const plots = plotsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            console.log(plots);

            return plots;
        }

        try {
            const myPlots = await getFarmPlots(currentUser.uid);
            console.log(myPlots); // Use myPlots here
            setPlots(myPlots);
            console.log(Array.isArray(myPlots));
        } catch (error) {
            console.error("Error fetching plots:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Call the async function
    fetchPlots();
}, [pointPlots]);

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
          {plots.forEach((plot) => (
            <PlotCard data={plot}/>
          ))}
        </div>
      ))}
    </div>
  );
}

export default PlotSection;