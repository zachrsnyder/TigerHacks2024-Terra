import React, { useState, useEffect } from 'react';
import { Folder, FolderOpen, Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import VehicleCard from './VehicleCard';
import AddVehicleModal from './AddVehicleModal';

const VehicleSection = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const { currentUser } = useAuth();

  // State to track which types of vehicles are expanded
  const [expandedTypes, setExpandedTypes] = useState({});

  useEffect(() => {
    if (!currentUser) return;

    const vehiclesRef = collection(db, 'farms', currentUser.uid, 'vehicles');

    const unsubscribe = onSnapshot(
      query(vehiclesRef),
      (snapshot) => {
        const vehicleData = [];
        snapshot.forEach((doc) => {
          vehicleData.push({
            id: doc.id,
            ...doc.data()
          });
        });
        setVehicles(vehicleData);
        setIsLoading(false);
      },
      (error) => {
        console.error('Error fetching vehicles:', error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  const handleDeleteVehicle = async (vehicleId) => {
    try {
      await deleteDoc(doc(db, 'farms', currentUser.uid, 'vehicles', vehicleId));
    } catch (error) {
      console.error('Error deleting vehicle:', error);
    }
  };

  const toggleDropdown = () => setIsOpen(!isOpen);

  // Group vehicles by type
  const vehiclesByType = vehicles.reduce((acc, curr) => {
    acc[curr.Type] = acc[curr.Type] || [];
    acc[curr.Type].push(curr);
    return acc;
  }, {});

  // Toggle the expanded state for a specific type
  const toggleTypeExpansion = (type) => {
    setExpandedTypes((prev) => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  return (
    <div className="border-b border-gray-300">
      <div className="flex justify-between items-center">
        <div
          className="flex items-center cursor-pointer p-4"
          onClick={toggleDropdown}
        >
          {isOpen ? (
            <FolderOpen size={24} className="text-text mr-3" />
          ) : (
            <Folder size={24} className="text-text mr-3" />
          )}
          <h3 className="text-lg font-semibold">Vehicles</h3>
        </div>
        <div className="pr-4">
          <Plus
            size={24}
            className="text-text cursor-pointer"
            onClick={() => setShowAddModal(true)}
          />
        </div>
      </div>

      {isOpen && (
        <div className="p-4 space-y-4">
          {isLoading ? (
            <div className="text-text text-center">Loading...</div>
          ) : Object.keys(vehiclesByType).length > 0 ? (
            Object.keys(vehiclesByType).map((type) => (
              <div key={type}>
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => toggleTypeExpansion(type)}
                >
                  <h4 className="text-lg font-semibold text-text my-2">{type}</h4>
                  {expandedTypes[type] ? (
                    <FolderOpen size={20} className="text-text" />
                  ) : (
                    <Folder size={20} className="text-text" />
                  )}
                </div>
                {expandedTypes[type] && (
                  <div className="pl-4 space-y-2">
                    {vehiclesByType[type].map((item) => (
                      <VehicleCard
                        key={item.id}
                        vehicle={item}
                        onDelete={handleDeleteVehicle}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-text/70 text-center">No vehicles added yet</div>
          )}
        </div>
      )}

      <AddVehicleModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </div>
  );
};

export default VehicleSection;