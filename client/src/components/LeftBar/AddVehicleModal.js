import React, { useState, useEffect } from 'react';
import { X, Loader2, CheckCircle } from 'lucide-react';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';

const SuccessModal = ({ message, onClose }) => {
    useEffect(() => {
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

const AddVehicleModal = ({ isOpen, onClose }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const { currentUser } = useAuth();

    const [newDocument, setDocument] = useState({
        Name: "",
        Manufacturer: "",
        Type: "",
        Notes: "",
        VehicleID: "",
        costPerAcre: 2.70,
        fuelType: ""
    });

    // Define a mapping for vehicle types and their respective fuel types
    const fuelTypeMap = {
        'Tractor': 'Diesel',
        'Combine Harvester': 'Diesel',
        'Bale Wagon': 'Diesel',
        'Sprayer': 'Diesel',
        'Seeder': 'Diesel',
        'Planter': 'Diesel',
        'Grain Cart': 'Diesel',
    };

    const generateVehicleId = async (type) => {
        // Similar ID generation logic as in your equipment example
        try {
            const equipmentCollectionRef = collection(db, 'farms', currentUser.uid, 'vehicles');
            const snapshot = await getDocs(equipmentCollectionRef);
            const count = snapshot.size + 1;
            const paddedNumber = String(count).padStart(3, '0');
            
            return `VEH${paddedNumber}`;
        } catch (error) {
            console.error('Error generating ID:', error);
            throw error;
        }
    };

    const handleSubmit = async () => {
        if (!newDocument.Name || !newDocument.Manufacturer || !newDocument.Type) {
            setError('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const vehicleId = await generateVehicleId(newDocument.Type);
            const equipmentCollectionRef = collection(db, 'farms', currentUser.uid, 'vehicles');

            const vehicleData = {
                ...newDocument,
                VehicleID: vehicleId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                owner: currentUser.uid,
                ownerEmail: currentUser.email,
                active: true,
                fuelType: fuelTypeMap[newDocument.Type] || 'Unknown' // Set fuel type based on type
            };

            await addDoc(equipmentCollectionRef, vehicleData);

            setSuccessMessage(`${newDocument.Name} ${vehicleId} has been successfully added`);
            setShowSuccess(true);

            setDocument({
                Name: "",
                Manufacturer: "",
                Type: "",
                Notes: "",
                VehicleID: "",
                costPerAcre: 2.70,
                fuelType: ""
            });
            
            onClose();

        } catch (err) {
            setError('Failed to add vehicle: ' + err.message);
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
                            <h2 className="text-xl font-semibold text-white">Add Vehicle</h2>
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
                                    value={newDocument.Type}
                                    onChange={(e) => setDocument({ ...newDocument, Type: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-white/70 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-gray-500 backdrop-blur-sm text-black"
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
                                    value={newDocument.Name}
                                    onChange={(e) => setDocument({ ...newDocument, Name: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-white/70 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-gray-500 backdrop-blur-sm text-black"
                                    placeholder="Enter vehicle name"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-white text-sm font-medium mb-1">Manufacturer</label>
                                <input
                                    type="text"
                                    value={newDocument.Manufacturer}
                                    onChange={(e) => setDocument({ ...newDocument, Manufacturer: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-white/70 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-gray-500 backdrop-blur-sm text-black"
                                    placeholder="Enter vehicle manufacturer"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-white text-sm font-medium mb-1">Notes</label>
                                <textarea
                                    value={newDocument.Notes}
                                    onChange={(e) => setDocument({ ...newDocument, Notes: e.target.value })}
                                    className="w-full h-20 px-4 py-2.5 bg-white/70 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-gray-500 backdrop-blur-sm resize-none text-black"
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
                                className={`flex items-center px-4 py-2 text-white rounded-lg transition-colors ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10'}`}
                                disabled={isSubmitting}
                            >
                                {isSubmitting && <Loader2 className="animate-spin mr-2" />}
                                Add Vehicle
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AddVehicleModal;
