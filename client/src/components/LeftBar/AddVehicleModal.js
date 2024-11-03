import React, { useState } from 'react';
import { X, Loader2, CheckCircle } from 'lucide-react';
import { collection, addDoc, getDocs } from 'firebase/firestore';
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
        Model: "",
        Notes: "",
        FuelType: "",
        costPerAcre: 0, // Set costPerAcre to zero initially
    });

    const fuelTypeMap = {
        'Tractor': { fuel: 'Diesel', cost: 3.00 },
        'Combine Harvester': { fuel: 'Diesel', cost: 3.50 },
        'Bale Wagon': { fuel: 'Gasoline', cost: 2.80 },
        'Sprayer': { fuel: 'Diesel', cost: 3.20 },
        'Seeder': { fuel: 'Gasoline', cost: 2.60 },
        'Planter': { fuel: 'Diesel', cost: 3.00 },
        'Grain Cart': { fuel: 'Diesel', cost: 3.10 },
    };

    const generateVehicleId = async (type) => {
        try {
            const vehicleCollectionRef = collection(db, 'farms', currentUser.uid, 'vehicles');
            const snapshot = await getDocs(vehicleCollectionRef);
            const count = snapshot.size + 1;
            const paddedNumber = String(count).padStart(3, '0');

            switch(type) {
                case 'Tractor':
                    return `TRAC${paddedNumber}`;
                case 'Combine Harvester':
                    return `COMH${paddedNumber}`;
                case 'Bale Wagon':
                    return `BALW${paddedNumber}`;
                case 'Sprayer':
                    return `SPRY${paddedNumber}`;
                case 'Seeder':
                    return `SEED${paddedNumber}`;
                case 'Planter':
                    return `PLNT${paddedNumber}`;
                case 'Grain Cart':
                    return `GROC${paddedNumber}`;
                default:
                    return `VEH${paddedNumber}`;
            }
        } catch (error) {
            console.error('Error generating ID:', error);
            throw error;
        }
    };

    const handleSubmit = async () => {
        // Corrected validation check
        if (!newDocument.Name || !newDocument.Manufacturer || !newDocument.Type || !newDocument.Model) {
            setError('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const vehicleId = await generateVehicleId(newDocument.Type);
            const vehicleCollectionRef = collection(db, 'farms', currentUser.uid, 'vehicles');

            const vehicleData = {
                ...newDocument,
                VehicleID: vehicleId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                owner: currentUser.uid,
                ownerEmail: currentUser.email,
                active: true
            };

            await addDoc(vehicleCollectionRef, vehicleData);

            setSuccessMessage(`${newDocument.Name} ${vehicleId} has been successfully added`);
            setShowSuccess(true);

            setDocument({
                Name: "",
                Manufacturer: "",
                Type: "",
                Model: "",
                Notes: "",
                FuelType: "",
                costPerAcre: 0, // Reset costPerAcre
            });

            onClose();

        } catch (err) {
            setError('Failed to add vehicle: ' + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleTypeChange = (e) => {
        const selectedType = e.target.value;
        const fuelInfo = fuelTypeMap[selectedType] || { fuel: "", cost: 0 };
        setDocument({
            ...newDocument,
            Type: selectedType,
            FuelType: fuelInfo.fuel, // Set fuel type based on selected vehicle type
            costPerAcre: fuelInfo.cost, // Set costPerAcre based on selected vehicle type
        });
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
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    
                    {/* Modal Content */}
                    <div className="relative backdrop-blur-md bg-white/30 rounded-lg shadow-2xl w-full max-w-md mx-4 border border-white/20">
                        {/* Header */}
                        <div className="flex justify-between items-center p-4 border-b border-white/20">
                            <h2 className="text-xl font-semibold text-white">Add Vehicle</h2>
                            <button 
                                onClick={onClose}
                                className="text-white hover:text-gray-200 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mx-6 mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                                <p className="text-red-500 text-sm">{error}</p>
                            </div>
                        )}

                        {/* Form Content */}
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-white text-sm font-medium mb-1">
                                    Type
                                </label>
                                <input
                                    list="vehicle-types"
                                    value={newDocument.Type}
                                    onChange={handleTypeChange} // Update handler
                                    className="w-full px-4 py-2.5 bg-white/70 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-gray-500 backdrop-blur-sm"
                                    placeholder="Search or select vehicle type"
                                    required
                                />
                                
                                {/* datalist with searchable options */}
                                <datalist id="vehicle-types">
                                    <option value="Tractor">Tractor</option>
                                    <option value="Combine Harvester">Combine Harvester</option>
                                    <option value="Bale Wagon">Bale Wagon</option>
                                    <option value="Sprayer">Sprayer</option>
                                    <option value="Seeder">Seeder</option>
                                    <option value="Planter">Planter</option>
                                    <option value="Grain Cart">Grain Cart</option>
                                </datalist>
                            </div>

                            <div>
                                <label className="block text-white text-sm font-medium mb-1">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={newDocument.Name}
                                    onChange={(e) => setDocument({...newDocument, Name: e.target.value})}
                                    className="w-full px-4 py-2.5 bg-white/70 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-gray-500 backdrop-blur-sm"
                                    placeholder="Enter vehicle name"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-white text-sm font-medium mb-1">
                                    Manufacturer
                                </label>
                                <input
                                    type="text"
                                    value={newDocument.Manufacturer}
                                    onChange={(e) => setDocument({...newDocument, Manufacturer: e.target.value})}
                                    className="w-full px-4 py-2.5 bg-white/70 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-gray-500 backdrop-blur-sm"
                                    placeholder="Enter manufacturer"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-white text-sm font-medium mb-1">
                                    Model
                                </label>
                                <input
                                    type="text"
                                    value={newDocument.Model}
                                    onChange={(e) => setDocument({...newDocument, Model: e.target.value})}
                                    className="w-full px-4 py-2.5 bg-white/70 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-gray-500 backdrop-blur-sm"
                                    placeholder="Enter model"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-white text-sm font-medium mb-1">
                                    Notes
                                </label>
                                <textarea
                                    rows="4"
                                    value={newDocument.Notes}
                                    onChange={(e) => setDocument({...newDocument, Notes: e.target.value})}
                                    className="w-full px-4 py-2.5 bg-white/70 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-gray-500 backdrop-blur-sm"
                                    placeholder="Add any notes"
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                onClick={handleSubmit}
                                className="w-full mt-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg focus:outline-none"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Add Vehicle'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AddVehicleModal;
