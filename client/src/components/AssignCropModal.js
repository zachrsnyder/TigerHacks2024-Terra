import React, { useState } from 'react';
import { X, Loader2, CheckCircle } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';

const AssignCropModal = ({ isOpen, onClose, plotId }) => {
    const [selectedCrop, setSelectedCrop] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const { currentUser } = useAuth();

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
        'sunflower_seeds',
        'sugarcane',
        'cotton',
        'potatoes',
        'alfalfa',
        'hay'
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();

        setIsLoading(true);
        setError('');

        try {
            await addDoc(collection(db, 'farms', currentUser.uid, 'plots', plotId, 'crops'), {
                name: selectedCrop
            });

            setSuccess(true);
            setSelectedCrop('');
        } catch (error) {
            console.error('Error assigning crop:', error);
            setError('Failed to assign crop');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setSuccess(false);
        setError('');
        setSelectedCrop('');
        setSearchTerm('');
        onClose();
    };

    const filteredCrops = crops.filter(crop => crop.includes(searchTerm.toLowerCase()));

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center ${isOpen ? 'block' : 'hidden'}`}>
            <div className="fixed inset-0 bg-black opacity-50"></div>
            <div className="relative bg-white rounded-lg p-8 w-96">
                <button onClick={handleClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
                    <X size={24} />
                </button>
                <h2 className="text-2xl font-bold mb-4">Assign Crop</h2>
                {success ? (
                    <div className="flex items-center space-x-2 text-green-500">
                        <CheckCircle size={24} />
                        <span>Crop assigned successfully</span>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search Crop"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
                            />
                            <ul className="absolute z-10 w-full bg-white border border-gray-300 mt-1 rounded-md max-h-60 overflow-auto">
                                {filteredCrops.map(crop => (
                                    <li
                                        key={crop}
                                        onClick={() => {
                                            setSelectedCrop(crop);
                                            setSearchTerm('');
                                        }}
                                        className={`px-4 py-2 cursor-pointer hover:bg-blue-100 ${selectedCrop === crop ? 'bg-blue-100' : ''}`}
                                    >
                                        {crop.replace('_', ' ').replace(/\b\w/g, char => char.toUpperCase())}
                                    </li>
                                ))}
                                {filteredCrops.length === 0 && (
                                    <li className="px-4 py-2 text-gray-500">No crops found</li>
                                )}
                            </ul>
                        </div>
                        {error && <div className="text-red-500">{error}</div>}
                        <button
                            type="submit"
                            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
                            disabled={isLoading || !selectedCrop}
                        >
                            {isLoading ? <Loader2 size={24} /> : 'Assign Crop'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default AssignCropModal;
