import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const CropProfit = ({ cropName, areaInAcres }) => {
    const [profit, setProfit] = useState(null);
    const [error, setError] = useState('');
    const { currentUser } = useAuth();

    useEffect(() => {
        const fetchCropPrice = async () => {
            if (!cropName || !areaInAcres) {
                setError('Missing crop or area information');
                return;
            }

            try {
                // Get the crop's API identifier from Firebase
                const cropRef = db.collection('farms').doc(currentUser.uid).collection('crops').doc(cropName);
                const cropDoc = await cropRef.get();
                
                if (!cropDoc.exists) {
                    setError('Crop not found');
                    return;
                }

                const cropData = cropDoc.data();
                const apiCode = cropData.apiCode;
                const yieldPerAcre = cropData.yieldPerAcre || 0; // Get yield from Firebase

                // Make the API call to Quandl
                const response = await axios.get(`https://www.quandl.com/api/v3/datasets/${apiCode}.json`, {
                    params: {
                        api_key: process.env.REACT_APP_QUANDL_API_KEY,
                    },
                });

                const currentPrice = response.data.dataset.data[0][1]; // Price per unit
                
                // Calculate profit using actual area
                const profitValue = currentPrice * yieldPerAcre * areaInAcres;
                setProfit(profitValue);
                
                // Log the calculation details
                console.log('Profit Calculation:', {
                    cropName,
                    areaInAcres,
                    currentPrice,
                    yieldPerAcre,
                    totalProfit: profitValue
                });

            } catch (err) {
                console.error('Error fetching crop price:', err);
                setError('Failed to fetch crop price');
            }
        };

        if (cropName && areaInAcres) {
            fetchCropPrice();
        }
    }, [cropName, areaInAcres, currentUser.uid]);

    if (error) {
        return <p className="text-red-500 text-sm">{error}</p>;
    }

    return (
        <div className="space-y-2">
            {profit !== null ? (
                <>
                    <div className="bg-green-50 p-3 rounded-md">
                        <p className="text-sm text-gray-600">Estimated Profit</p>
                        <p className="text-lg font-semibold text-gray-900">
                            ${profit.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })}
                        </p>
                    </div>
                    <p className="text-xs text-gray-500">
                        Based on current market prices and {areaInAcres.toFixed(2)} acres
                    </p>
                </>
            ) : (
                <div className="animate-pulse flex space-x-4">
                    <div className="flex-1 space-y-4 py-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CropProfit;