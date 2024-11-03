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

const AddEquipmentModal = ({ isOpen, onClose }) => {
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
    });

    const generateEquipmentId = async (type) => {
        try {
            const equipmentCollectionRef = collection(db, 'farms', currentUser.uid, 'equipment');
            const snapshot = await getDocs(equipmentCollectionRef);
            const count = snapshot.size + 1;
            const paddedNumber = String(count).padStart(3, '0');
            
            switch(type) {
                case 'Harvester':
                    return `HARV${paddedNumber}`;
                case 'Sprayer':
                    return `SPRY${paddedNumber}`;
                case 'Planter':
                    return `PLNT${paddedNumber}`;
                case 'Tiller':
                    return `TILL${paddedNumber}`;
                case 'Backhoe':
                    return `BCKH${paddedNumber}`;
                case 'Rotary Cutter':
                    return `RCUT${paddedNumber}`;
                case 'Pallet Fork':
                    return `PLTF${paddedNumber}`;
                case 'Post Hole Digger':
                    return `PHLD${paddedNumber}`;
                case 'Box Blade':
                    return `BBLD${paddedNumber}`;
                case 'Harrow':
                    return `HRRW${paddedNumber}`;
                case 'Other':
                    return `OTH${paddedNumber}`;
                default:
                    return `EQP${paddedNumber}`;
            }
        } catch (error) {
            console.error('Error generating ID:', error);
            throw error;
        }
    };

    const handleSubmit = async () => {
        // Corrected validation check
        if (!newDocument.Name || !newDocument.Manufacturer || !newDocument.Type) {
            setError('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const equipmentId = await generateEquipmentId(newDocument.Type);
            const equipmentCollectionRef = collection(db, 'farms', currentUser.uid, 'equipment');

            const equipmentData = {
                ...newDocument,
                VehicleID: equipmentId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                owner: currentUser.uid,
                ownerEmail: currentUser.email,
                assignedPlotId: ""

            };

            await addDoc(equipmentCollectionRef, equipmentData);

            setSuccessMessage(`${newDocument.Name} ${equipmentId} has been successfully added`);
            setShowSuccess(true);

            setDocument({
                Name: "",
                Manufacturer: "",
                Type: "",
                Notes: "",
            });
            
            onClose();

        } catch (err) {
            setError('Failed to add equipment: ' + err.message);
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
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    
                    {/* Modal Content */}
                    <div className="relative backdrop-blur-md bg-white/30 rounded-lg shadow-2xl w-full max-w-md mx-4 border border-white/20">
                        {/* Header */}
                        <div className="flex justify-between items-center p-4 border-b border-white/20">
                            <h2 className="text-xl font-semibold text-white">Add Equipment</h2>
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
                                    list="equipment-types"
                                    value={newDocument.Type}
                                    onChange={(e) => setDocument({ ...newDocument, Type: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-white/70 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-gray-500 backdrop-blur-sm text-black"
                                    placeholder="Search or select equipment type"
                                    required
                                />
                                
                                {/* datalist with searchable options */}
                                <datalist id="equipment-types">
                                    <option value="Harvester">Harvester</option>
                                    <option value="Sprayer">Sprayer</option>
                                    <option value="Planter">Planter</option>
                                    <option value="Tiller">Tiller</option>
                                    <option value="Backhoe">Backhoe</option>
                                    <option value="Rotary Cutter">Rotary Cutter</option>
                                    <option value="Pallet Fork">Pallet Fork</option>
                                    <option value="Post Hole Digger">Post Hole Digger</option>
                                    <option value="Box Blade">Box Blade</option>
                                    <option value="Harrow">Harrow</option>
                                    <option value="Other">Other</option>
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
                                    className="w-full px-4 py-2.5 bg-white/70 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-gray-500 backdrop-blur-sm text-black"
                                    placeholder="Enter equipment name"
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
                                    className="w-full px-4 py-2.5 bg-white/70 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-gray-500 backdrop-blur-sm text-black"
                                    placeholder="Enter equipment manufacturer"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-white text-sm font-medium mb-1">
                                    Notes
                                </label>
                                <textarea
                                    value={newDocument.Notes}
                                    onChange={(e) => setDocument({ ...newDocument, Notes: e.target.value })}
                                    className="w-full h-20 px-4 py-2.5 bg-white/70 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-gray-500 backdrop-blur-sm resize-none text-black"
                                    placeholder="Enter any additional notes (optional)"
                                />
                            </div>
                        </div>

                        {/* Footer */}
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
                                Add Equipment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AddEquipmentModal;
