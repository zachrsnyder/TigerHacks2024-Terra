import React, { useState } from 'react';
import { X, Loader2, CheckCircle } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';

const SuccessModal = ({ message, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[100]">
      <div className="relative backdrop-blur-md bg-black/30 px-8 py-6 rounded-lg shadow-2xl border border-green-500/20 max-w-sm mx-4 text-center">
        <div className="flex flex-col items-center gap-3">
          <CheckCircle className="text-green-500" size={32} />
          <p className="text-white text-lg">{message}</p>
        </div>
      </div>
    </div>
  );
};

export const EditEquipmentModal = ({ isOpen, onClose, equipment }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const { currentUser } = useAuth();

  const [editedEquipment, setEditedEquipment] = useState(equipment || {
    Name: "",
    Manufacturer: "",
    Type: "",
    Notes: "",
  });

  const handleSubmit = async () => {
    if (!editedEquipment.Name || !editedEquipment.Manufacturer || !editedEquipment.Type) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const equipmentRef = doc(db, 'farms', currentUser.uid, 'equipment', equipment.id);
      
      await updateDoc(equipmentRef, {
        ...editedEquipment,
        updatedAt: new Date().toISOString(),
      });

      setSuccessMessage(`${editedEquipment.Name} has been successfully updated`);
      setShowSuccess(true);
      onClose();
    } catch (err) {
      setError('Failed to update equipment: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen && !showSuccess) return null;

  return (
    <>
      {showSuccess ? (
        <SuccessModal 
          message={successMessage}
          onClose={() => setShowSuccess(false)}
        />
      ) : (
        <div className="fixed inset-0 flex items-center justify-center z-50 overflow-hidden">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <div className="relative backdrop-blur-md bg-white/30 rounded-lg shadow-2xl w-full max-w-md mx-4 border border-white/20">
            <div className="flex justify-between items-center p-4 border-b border-white/20">
              <h2 className="text-xl font-semibold text-white">Edit Equipment</h2>
              <button 
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {error && (
              <div className="mx-6 mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            )}

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-white text-sm font-medium mb-1">Type</label>
                <input
                  list="equipment-types"
                  value={editedEquipment.Type}
                  onChange={(e) => setEditedEquipment({ ...editedEquipment, Type: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/70 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-gray-500 backdrop-blur-sm"
                  placeholder="Search or select equipment type"
                  required
                />
                <datalist id="equipment-types">
                  <option value="Harvester" />
                  <option value="Sprayer" />
                  <option value="Planter" />
                  <option value="Tiller" />
                  <option value="Backhoe" />
                  <option value="Rotary Cutter" />
                  <option value="Pallet Fork" />
                  <option value="Post Hole Digger" />
                  <option value="Box Blade" />
                  <option value="Harrow" />
                  <option value="Other" />
                </datalist>
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={editedEquipment.Name}
                  onChange={(e) => setEditedEquipment({ ...editedEquipment, Name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/70 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-gray-500 backdrop-blur-sm"
                  placeholder="Enter equipment name"
                  required
                />
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-1">Manufacturer</label>
                <input
                  type="text"
                  value={editedEquipment.Manufacturer}
                  onChange={(e) => setEditedEquipment({ ...editedEquipment, Manufacturer: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/70 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-gray-500 backdrop-blur-sm"
                  placeholder="Enter manufacturer"
                  required
                />
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-1">Notes</label>
                <textarea
                  value={editedEquipment.Notes}
                  onChange={(e) => setEditedEquipment({ ...editedEquipment, Notes: e.target.value })}
                  className="w-full h-20 px-4 py-2.5 bg-white/70 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-gray-500 backdrop-blur-sm resize-none"
                  placeholder="Enter any additional notes (optional)"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 p-4 border-t border-white/20">
              <button
                onClick={onClose}
                className="px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className={`flex items-center px-4 py-2 text-white rounded-lg transition-colors ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10'
                }`}
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 className="animate-spin mr-2" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const EditVehicleModal = ({ isOpen, onClose, vehicle }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const { currentUser } = useAuth();

  const [editedVehicle, setEditedVehicle] = useState(vehicle || {
    Name: "",
    Manufacturer: "",
    Type: "",
    Notes: "",
    fuelType: ""
  });

  const handleSubmit = async () => {
    if (!editedVehicle.Name || !editedVehicle.Manufacturer || !editedVehicle.Type) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const vehicleRef = doc(db, 'farms', currentUser.uid, 'vehicles', vehicle.id);
      
      await updateDoc(vehicleRef, {
        ...editedVehicle,
        updatedAt: new Date().toISOString(),
      });

      setSuccessMessage(`${editedVehicle.Name} has been successfully updated`);
      setShowSuccess(true);
      onClose();
    } catch (err) {
      setError('Failed to update vehicle: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen && !showSuccess) return null;

  return (
    <>
      {showSuccess ? (
        <SuccessModal 
          message={successMessage}
          onClose={() => setShowSuccess(false)}
        />
      ) : (
        <div className="fixed inset-0 flex items-center justify-center z-50 overflow-hidden">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <div className="relative backdrop-blur-md bg-white/30 rounded-lg shadow-2xl w-full max-w-md mx-4 border border-white/20">
            <div className="flex justify-between items-center p-4 border-b border-white/20">
              <h2 className="text-xl font-semibold text-white">Edit Vehicle</h2>
              <button 
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {error && (
              <div className="mx-6 mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            )}

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-white text-sm font-medium mb-1">Type</label>
                <input
                  list="vehicle-types"
                  value={editedVehicle.Type}
                  onChange={(e) => setEditedVehicle({ ...editedVehicle, Type: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/70 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-gray-500 backdrop-blur-sm"
                  placeholder="Search or select vehicle type"
                  required
                />
                <datalist id="vehicle-types">
                  <option value="Tractor" />
                  <option value="Combine Harvester" />
                  <option value="Bale Wagon" />
                  <option value="Sprayer" />
                  <option value="Seeder" />
                  <option value="Planter" />
                  <option value="Grain Cart" />
                </datalist>
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={editedVehicle.Name}
                  onChange={(e) => setEditedVehicle({ ...editedVehicle, Name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/70 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-gray-500 backdrop-blur-sm"
                  placeholder="Enter vehicle name"
                  required
                />
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-1">Manufacturer</label>
                <input
                  type="text"
                  value={editedVehicle.Manufacturer}
                  onChange={(e) => setEditedVehicle({ ...editedVehicle, Manufacturer: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/70 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-gray-500 backdrop-blur-sm"
                  placeholder="Enter manufacturer"
                  required
                />
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-1">Notes</label>
                <textarea
                  value={editedVehicle.Notes}
                  onChange={(e) => setEditedVehicle({ ...editedVehicle, Notes: e.target.value })}
                  className="w-full h-20 px-4 py-2.5 bg-white/70 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-gray-500 backdrop-blur-sm resize-none"
                  placeholder="Enter any additional notes (optional)"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 p-4 border-t border-white/20">
              <button
                onClick={onClose}
                className="px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className={`flex items-center px-4 py-2 text-white rounded-lg transition-colors ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10'
                }`}
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 className="animate-spin mr-2" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
                