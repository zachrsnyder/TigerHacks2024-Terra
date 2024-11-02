import React, { useState, useEffect } from 'react';
import { Folder, FolderOpen, Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import EquipmentCard from './EquipmentCard';
import AddEquipmentModal from './AddEquipmentModal';

const EquipmentSection = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [equipment, setEquipment] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const { currentUser } = useAuth();

  // State to track which types of equipment are expanded
  const [expandedTypes, setExpandedTypes] = useState({});

  useEffect(() => {
    if (!currentUser) return;

    const equipmentRef = collection(db, 'farms', currentUser.uid, 'equipment');

    const unsubscribe = onSnapshot(
      query(equipmentRef),
      (snapshot) => {
        const equipmentData = [];
        snapshot.forEach((doc) => {
          equipmentData.push({
            id: doc.id,
            ...doc.data()
          });
        });
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

  const toggleDropdown = () => setIsOpen(!isOpen);

  // Group equipment by type
  const equipmentByType = equipment.reduce((acc, curr) => {
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
          <h3 className="text-lg font-semibold">Equipment</h3>
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
          ) : Object.keys(equipmentByType).length > 0 ? (
            Object.keys(equipmentByType).map((type) => (
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
                    {equipmentByType[type].map((item) => (
                      <EquipmentCard
                        key={item.id}
                        equipment={item}
                        onDelete={handleDeleteEquipment}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-text/70 text-center">No equipment added yet</div>
          )}
        </div>
      )}

      <AddEquipmentModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </div>
  );
};

export default EquipmentSection;
