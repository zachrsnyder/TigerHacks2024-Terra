import React, { useState, useEffect } from 'react';
import { Folder } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import EquipmentCard from './EquipmentCard';
import AddEquipmentModal from './AddEquipmentModal';
import { EditEquipmentModal } from './EditModals';
import { SectionHeader, SectionContent } from './SectionComponents';

const EquipmentSection = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [equipment, setEquipment] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    const equipmentRef = collection(db, 'farms', currentUser.uid, 'equipment');
    const unsubscribe = onSnapshot(
      query(equipmentRef),
      (snapshot) => {
        const equipmentData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setEquipment(equipmentData);
        setIsLoading(false);
      },
      (error) => {
        console.error('Error fetching equipment:', error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  const handleDeleteEquipment = async (equipmentId) => {
    try {
      await deleteDoc(doc(db, 'farms', currentUser.uid, 'equipment', equipmentId));
    } catch (error) {
      console.error('Error deleting equipment:', error);
    }
  };

  const handleEditEquipment = (equipment) => {
    setSelectedEquipment(equipment);
    setShowEditModal(true);
  };

  const equipmentByType = equipment.reduce((acc, curr) => {
    acc[curr.Type] = acc[curr.Type] || [];
    acc[curr.Type].push(curr);
    return acc;
  }, {});

  return (
    <div className="border-b border-white/10">
      <SectionHeader
        title="Equipment"
        icon={Folder}
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
        onAdd={() => setShowAddModal(true)}
      />

      {isOpen && (
        <SectionContent isLoading={isLoading}>
          {equipment.length > 0 ? (
            <div className="space-y-6 px-2">
              {Object.entries(equipmentByType).map(([type, items]) => (
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
                      <EquipmentCard
                        key={item.id}
                        equipment={item}
                        onDelete={handleDeleteEquipment}
                        onEdit={handleEditEquipment}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-white/50 text-center py-4">
              No equipment added yet
            </div>
          )}
        </SectionContent>
      )}

      <AddEquipmentModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />

      {selectedEquipment && (
        <EditEquipmentModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedEquipment(null);
          }}
          equipment={selectedEquipment}
        />
      )}
    </div>
  );
};

export default EquipmentSection;