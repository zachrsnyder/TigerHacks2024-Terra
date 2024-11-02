import React, { useState } from 'react';
import { X, Loader2, CheckCircle } from 'lucide-react';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';

// Success Modal Component
const SuccessModal = ({ message, onClose }) => {
    // Auto-close after 3 seconds
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
        Make: "",
        Model: "",
        Type: "",
        Description: "",
    });

    const generateEquipmentId = async (type) => {
        try {
            const equipmentCollectionRef = collection(db, 'farms', currentUser.uid, 'equipment');
            const snapshot = await getDocs(equipmentCollectionRef);
            const count = snapshot.size + 1;
            const paddedNumber = String(count).padStart(3, '0');
            
            switch(type) {
                case 'Tractor':
                    return `TCTR${paddedNumber}`;
                case 'Harvester':
                    return `HARV${paddedNumber}`;
                case 'Sprayer':
                    return `SPRY${paddedNumber}`;
                case 'Planter':
                    return `PLNT${paddedNumber}`;
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
        if (!newDocument.Make || !newDocument.Model || !newDocument.Type) {
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
                active: true
            };

            await addDoc(equipmentCollectionRef, equipmentData);

            // Show success modal
            setSuccessMessage(`${newDocument.Make} ${equipmentId} has been successfully added`);
            setShowSuccess(true);

            // Reset form
            setDocument({
                Make: "",
                Model: "",
                Type: "",
                Description: "",
            });
            
            // Close the main modal
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
                                    Type*
                                </label>
                                <select
                                    value={newDocument.Type}
                                    onChange={(e) => setDocument({...newDocument, Type: e.target.value})}
                                    className="w-full px-4 py-2.5 bg-white/70 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-gray-500 backdrop-blur-sm"
                                    required
                                >
                                    <option value="">Select equipment type</option>
                                    <option value="Tractor">Tractor</option>
                                    <option value="Harvester">Harvester</option>
                                    <option value="Sprayer">Sprayer</option>
                                    <option value="Planter">Planter</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-white text-sm font-medium mb-1">
                                    Make*
                                </label>
                                <input
                                    type="text"
                                    value={newDocument.Make}
                                    onChange={(e) => setDocument({...newDocument, Make: e.target.value})}
                                    className="w-full px-4 py-2.5 bg-white/70 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-gray-500 backdrop-blur-sm"
                                    placeholder="Enter vehicle make"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-white text-sm font-medium mb-1">
                                    Model*
                                </label>
                                <input
                                    type="text"
                                    value={newDocument.Model}
                                    onChange={(e) => setDocument({...newDocument, Model: e.target.value})}
                                    className="w-full px-4 py-2.5 bg-white/70 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-gray-500 backdrop-blur-sm"
                                    placeholder="Enter vehicle model"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-white text-sm font-medium mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={newDocument.Description}
                                    onChange={(e) => setDocument({ ...newDocument, Description: e.target.value })}
                                    className="w-full h-20 px-4 py-2.5 bg-white/70 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-gray-500 backdrop-blur-sm resize-none"
                                    placeholder="Enter a short description"
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
                                disabled={isSubmitting}
                                className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors flex items-center space-x-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="animate-spin" size={18} />
                                        <span>Adding...</span>
                                    </>
                                ) : (
                                    <span>Add Equipment</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AddEquipmentModal;