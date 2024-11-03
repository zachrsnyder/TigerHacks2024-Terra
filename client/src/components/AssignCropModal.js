import React, { useState } from 'react';
import { X, Loader2, CheckCircle, Search } from 'lucide-react';
import { setDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

const AssignCropModal = ({ isOpen, onClose, plotId, onAssign }) => {
    const { currentUser } = useAuth();
    const [selectedCrop, setSelectedCrop] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const crops = [
        'corn',
        'wheat',
        'rice',
        'barley',
        'oats',
        'sorghum',
        'soybeans',
        'canola',
        'rapeseed',
        'sunflower seeds',
        'sugarcane',
        'cotton',
        'potatoes',
        'alfalfa',
        'hay'
    ];

    const filteredCrops = crops.filter(crop => 
        crop.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedCrop || !currentUser?.uid || !plotId) return;

        setIsLoading(true);
        setError('');

        try {
            const plotRef = doc(db, 'farms', currentUser.uid, 'plots', plotId);
            
            await setDoc(plotRef, {
                crop: selectedCrop,
                updatedAt: new Date().toISOString()
            }, { merge: true });

            // Call onAssign with the selected crop after successful database update
            onAssign(selectedCrop);
            
            setSuccess(true);
            setTimeout(() => {
                handleClose();
            }, 1500);
        } catch (error) {
            console.error('Error assigning crop:', error);
            setError('Failed to assign crop');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setSelectedCrop('');
        setSearchTerm('');
        setSuccess(false);
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    // Check for required data
    if (!currentUser?.uid || !plotId) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleClose}></div>
                <div className="relative bg-white rounded-lg p-6 w-96 max-w-[90vw]">
                    <div className="text-red-500 text-center">
                        <p>Unable to load modal: Missing required information.</p>
                        <button
                            onClick={handleClose}
                            className="mt-4 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleClose}></div>
            <div className="relative bg-white rounded-lg p-6 w-96 max-w-[90vw]">
                <button 
                    onClick={handleClose} 
                    className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <X className="h-5 w-5 text-gray-500" />
                </button>
                
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Assign Crop</h2>
                    <p className="text-sm text-gray-500 mt-1">Select a crop to assign to this plot</p>
                </div>

                {success ? (
                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="bg-green-50 rounded-full p-2 mb-4">
                            <CheckCircle className="h-8 w-8 text-green-500" />
                        </div>
                        <p className="text-lg font-medium text-gray-900">Crop assigned successfully!</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="cropSearch" className="block text-sm font-medium text-gray-700 mb-1">
                                Search Crops
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    id="cropSearch"
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-t-lg 
                                             focus:outline-none focus:ring-2 focus:ring-blue-500 
                                             focus:border-transparent"
                                    placeholder="Type to search..."
                                />
                            </div>
                            <div className="border border-t-0 border-gray-300 rounded-b-lg">
                                <div className="max-h-48 overflow-y-auto">
                                    {filteredCrops.map(crop => (
                                        <button
                                            type="button"
                                            key={crop}
                                            onClick={() => setSelectedCrop(crop)}
                                            className={`w-full px-4 py-2.5 text-left hover:bg-gray-50 
                                                      transition-colors border-b border-gray-200 last:border-b-0
                                                      ${selectedCrop === crop 
                                                        ? 'bg-blue-50 text-blue-700' 
                                                        : 'text-gray-700'}`}
                                        >
                                            {crop.split('_').map(word => 
                                                word.charAt(0).toUpperCase() + word.slice(1)
                                            ).join(' ')}
                                        </button>
                                    ))}
                                    {filteredCrops.length === 0 && (
                                        <div className="px-4 py-3 text-gray-500 text-center">
                                            No crops found
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 
                                         bg-white border border-gray-300 rounded-lg
                                         hover:bg-gray-50 focus:outline-none focus:ring-2 
                                         focus:ring-offset-1 focus:ring-blue-500
                                         transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading || !selectedCrop}
                                className={`px-4 py-2 text-sm font-medium text-white 
                                          rounded-lg focus:outline-none focus:ring-2 
                                          focus:ring-offset-1 focus:ring-blue-500
                                          transition-colors ${isLoading || !selectedCrop
                                          ? 'bg-blue-400 cursor-not-allowed'
                                          : 'bg-blue-600 hover:bg-blue-700'}`}
                            >
                                {isLoading ? (
                                    <div className="flex items-center">
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        Assigning...
                                    </div>
                                ) : (
                                    'Assign Crop'
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default AssignCropModal;