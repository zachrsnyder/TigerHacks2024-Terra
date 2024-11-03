import React, { useState, useEffect } from 'react';
import { Car } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import VehicleCard from './VehicleCard';
import AddVehicleModal from './AddVehicleModal';
import { EditVehicleModal } from './EditModals';
import { SectionHeader, SectionContent } from './SectionComponents';

// section of left dashboard that contains vehicles information. Includes a header and a map of all 
// vehicles specific to the context user in little cards

const VehicleSection = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const { currentUser } = useAuth();

  // occurs on mount of the component or when the current user changes, which shouldn't happen in this components lifetime
  // fetchs the collection of all vehicles and adds a listener (onSnapshot) for when the collection is altered. Returns on dismount 
  // and unsubscribes to the listener
  useEffect(() => {
    if (!currentUser) return;

    const vehiclesRef = collection(db, 'farms', currentUser.uid, 'vehicles');
    const unsubscribe = onSnapshot(
      query(vehiclesRef),
      (snapshot) => {
        const vehicleData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
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

  //deletes a vehicledoc from the collection given an id
  const handleDeleteVehicle = async (vehicleId) => {
    try {
      await deleteDoc(doc(db, 'farms', currentUser.uid, 'vehicles', vehicleId));
    } catch (error) {
      console.error('Error deleting vehicle:', error);
    }
  };

  //opens up edit modal
  const handleEditVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowEditModal(true);
  };

  // used to sort vehicles by type
  const vehiclesByType = vehicles.reduce((acc, curr) => {
    acc[curr.Type] = acc[curr.Type] || [];
    acc[curr.Type].push(curr);
    return acc;
  }, {});

  return (
    <div className="border-b border-white/10 text-text">
      <SectionHeader
        title="Vehicles"
        icon={Car}
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
        onAdd={() => setShowAddModal(true)}
      />

      {isOpen && (
        <SectionContent isLoading={isLoading}>
          {vehicles.length > 0 ? (
            <div className="space-y-6 px-2">
              {Object.entries(vehiclesByType).map(([type, items]) => (
                <div key={type} className="space-y-2">
                  <div className="flex items-center justify-between py-1 px-2">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-medium text-text/70">{type}</h4>
                      <span className="text-xs text-text/50 px-2 py-0.5 bg-white/10 rounded-full">
                        {items.length}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {items.map(item => (
                      <VehicleCard
                        key={item.id}
                        vehicle={item}
                        onDelete={handleDeleteVehicle}
                        onEdit={handleEditVehicle}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-white/50 text-center py-4">
              No vehicles added yet
            </div>
          )}
        </SectionContent>
      )}

      <AddVehicleModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />

      {selectedVehicle && (
        <EditVehicleModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedVehicle(null);
          }}
          vehicle={selectedVehicle}
        />
      )}

      
    </div>
  );
};

export default VehicleSection;