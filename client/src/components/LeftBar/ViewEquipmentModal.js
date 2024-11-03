import React, { useState } from 'react';
import { X, Calendar, Clock, Info, MapPin, Wrench, Tractor, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const ViewEquipmentModal = ({ isOpen, onClose, equipment }) => {
    const [showUnassignModal, setShowUnassignModal] = useState(false);
  const { currentUser } = useAuth();

  //if it isn't opened or the passed equipment doesnt exist dont render anything.
  if (!isOpen || !equipment) return null;

  //handles functionality for when the user chooses to unassign the equipment from it's plot
  //main idea is to unassigned the plot id associated with the equipment reference to cut the tie
  const handleUnassign = async () => {
    try {
      const equipmentRef = doc(db, 'farms', currentUser.uid, 'equipment', equipment.id);
      await updateDoc(equipmentRef, {
        assignedPlotId: null,
        active: false,
        updatedAt: new Date().toISOString()
      });

      // Close both modals
      setShowUnassignModal(false);
      onClose();
    } catch (err) {
      console.error('Error unassigning equipment:', err);
    }
  }

  //nested component for the modal that shows up when the user is asked if they are sure they want to unassign the equipment. nested makes it so I props arent passed and logic is straightfoward.
  const UnassignModal = () => (
    <div className="fixed inset-0 flex items-center justify-center z-[200] overflow-hidden">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setShowUnassignModal(false)}
      />
      
      <div className="relative backdrop-blur-md bg-white/30 rounded-lg shadow-2xl w-full max-w-sm mx-4 border border-white/20">
        <div className="p-6 space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div className="p-3 rounded-full bg-red-500/20">
              <AlertTriangle className="text-red-500" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-white text-center">
              Unassign Equipment?
            </h3>
            <p className="text-white/70 text-center">
              Are you sure you want to unassign this equipment from its current plot?
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mt-6">
            <button
              onClick={() => setShowUnassignModal(false)}
              className="py-2 px-4 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUnassign}
              className="py-2 px-4 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
            >
              Unassign
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  //makes the date styling constant
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };



  return (
    <>
    <div className="fixed inset-0 flex items-center justify-center z-[150] overflow-hidden">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative backdrop-blur-md bg-white/30 rounded-lg shadow-2xl w-full max-w-md mx-4 border border-white/20">
        <div className="flex justify-between items-center p-4 border-b border-white/20">
          <h2 className="text-xl font-semibold text-white">Equipment Details</h2>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Info Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white">{equipment.Name}</h3>
                <p className="text-white/70">{equipment.Manufacturer}</p>
              </div>
              <div className="p-3 rounded-lg bg-primary/20">
                <Tractor className="text-primary" size={24} />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 rounded-full bg-white/10 text-sm text-white/70">
                {equipment.equipmentID}
              </span>
              <span className="px-2 py-1 rounded-full bg-white/10 text-sm text-white/70">
                {equipment.Type}
              </span>
            </div>
          </div>

          {/* Equipment Category Info */}
          <div className="p-4 bg-white/10 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Wrench className="text-white/70" size={16} />
              <span className="text-sm font-medium text-white">Equipment Category</span>
            </div>
            <p className="text-lg font-semibold text-white">
              {equipment.Type}
            </p>
          </div>

          {/* Status Section */}
          <div className="grid grid-cols-2 gap-4" >
            <div className={`p-4 ${equipment.assignedPlotId ? 'bg-[#4CAF50]/20'  : 'bg-[#ffffff]/10'} rounded-lg`}>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="text-white/70" size={16} />
                <span className="text-sm font-medium text-white">Status</span>
              </div>
              <p className="text-lg font-semibold text-white">
                {equipment.active ? 'Active' : 'Inactive'}
              </p>
            </div>
            
            <div className={`p-4 ${equipment.assignedPlotId ? 'bg-[#4CAF50]/20 hover:bg-red-500/20'  : 'bg-[#ffffff]/10'} rounded-lg`}
                onClick={() => {
                    if(equipment.assignedPlotId)
                        setShowUnassignModal(true)
                }}
            >
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="text-white/70" size={16} />
                <span className="text-sm font-medium text-white">Assignment</span>
              </div>
              <p className="text-lg font-semibold text-white">
                {equipment.assignedPlotId ? 'Assigned' : 'Unassigned'}
              </p>
            </div>
          </div>

          {/* Dates Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="text-white/70" size={16} />
              <span className="text-sm text-white">Created: {formatDate(equipment.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="text-white/70" size={16} />
              <span className="text-sm text-white">Last Updated: {formatDate(equipment.updatedAt)}</span>
            </div>
          </div>

          {/* Notes Section */}
          {equipment.Notes && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Info className="text-white/70" size={16} />
                <span className="text-sm font-medium text-white">Notes</span>
              </div>
              <p className="text-white/70 text-sm p-3 bg-white/10 rounded-lg">
                {equipment.Notes}
              </p>
            </div>
          )}

          {/* Maintenance Status - Optional section that could be added */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white/10 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Wrench className="text-white/70" size={16} />
                <span className="text-sm font-medium text-white">Usage</span>
              </div>
              <p className="text-lg font-semibold text-white">
                {equipment.usage || 'Not Tracked'}
              </p>
            </div>

            <div className="p-4 bg-white/10 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="text-white/70" size={16} />
                <span className="text-sm font-medium text-white">Next Service</span>
              </div>
              <p className="text-lg font-semibold text-white">
                {equipment.nextService ? formatDate(equipment.nextService) : 'Not Scheduled'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    {showUnassignModal && <UnassignModal />}
    </>
  );
};

export default ViewEquipmentModal;
