import React, { useState, useEffect } from 'react';
import { Car } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import VehicleCard from './VehicleCard';
import AddVehicleModal from './AddVehicleModal';
import { SectionHeader, SectionContent } from './SectionComponents';

const VehicleSection = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const { currentUser } = useAuth();

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

  const handleDeleteVehicle = async (vehicleId) => {
    try {
      await deleteDoc(doc(db, 'farms', currentUser.uid, 'vehicles', vehicleId));
    } catch (error) {
      console.error('Error deleting vehicle:', error);
    }
  };

  // Group vehicles by type but maintain flat list
  const vehiclesByType = vehicles.reduce((acc, curr) => {
    acc[curr.Type] = acc[curr.Type] || [];
    acc[curr.Type].push(curr);
    return acc;
  }, {});

  return (
    <div className="border-b border-white/10">
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
                      <h4 className="text-sm font-medium text-white/70">{type}</h4>
                      <span className="text-xs text-white/50 px-2 py-0.5 bg-white/10 rounded-full">
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
    </div>
  );
};

export default VehicleSection;