import React from 'react';

const CropProfit = ({ cropName, acreage }) => {
    // Market prices in USD
    const cropPrices = {
        corn: 4.50,          // per bushel
        wheat: 5.75,         // per bushel
        rice: 0.15,          // per pound
        barley: 5.20,        // per bushel
        oats: 3.80,          // per bushel
        sorghum: 4.00,       // per bushel
        soybeans: 12.50,     // per bushel
        canola: 15.00,       // per bushel
        rapeseed: 15.00,     // per bushel
        'sunflower seeds': 0.25, // per pound
        sugarcane: 25.00,    // per ton
        cotton: 0.80,        // per pound
        potatoes: 12.00,     // per hundredweight
        alfalfa: 200.00,     // per ton
        hay: 180.00          // per ton
    };

    // Average yields per acre
    const cropYields = {
        corn: 180,        // bushels per acre
        wheat: 50,        // bushels per acre
        rice: 7500,       // pounds per acre
        barley: 70,       // bushels per acre
        oats: 65,         // bushels per acre
        sorghum: 75,      // bushels per acre
        soybeans: 50,     // bushels per acre
        canola: 40,       // bushels per acre
        rapeseed: 40,     // bushels per acre
        'sunflower seeds': 1500, // pounds per acre
        sugarcane: 30,    // tons per acre
        cotton: 850,      // pounds per acre
        potatoes: 400,    // hundredweight per acre
        alfalfa: 8,       // tons per acre
        hay: 4            // tons per acre
    };

    // Units for display
    const cropUnits = {
        corn: 'bushels',
        wheat: 'bushels',
        rice: 'pounds',
        barley: 'bushels',
        oats: 'bushels',
        sorghum: 'bushels',
        soybeans: 'bushels',
        canola: 'bushels',
        rapeseed: 'bushels',
        'sunflower seeds': 'pounds',
        sugarcane: 'tons',
        cotton: 'pounds',
        potatoes: 'cwt',
        alfalfa: 'tons',
        hay: 'tons'
    };

    const calculateProfit = () => {
        if (!cropName || !acreage) return null;

        const normalizedCropName = cropName.toLowerCase();
        const price = cropPrices[normalizedCropName];
        const yieldPerAcre = cropYields[normalizedCropName];

        if (!price || !yieldPerAcre) return null;

        // Calculate total yield and profit
        const totalYield = yieldPerAcre * acreage;
        const totalProfit = price * totalYield;

        return {
            profit: totalProfit,
            yieldPerAcre,
            totalYield,
            pricePerUnit: price,
            unit: cropUnits[normalizedCropName]
        };
    };

    const result = calculateProfit();

    if (!result) {
        return (
            <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-500">Unable to calculate value</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 p-3 rounded-md space-y-2">
            <div>
                <h3 className="text-sm font-medium text-gray-900">Market Value:</h3>
                <p className="text-lg font-semibold text-green-600">
                    ${result.profit.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    })}
                </p>
            </div>
            
            <div className="space-y-1">
                <p className="text-xs text-gray-600">
                    Yield: {result.totalYield.toLocaleString()} {result.unit}
                    <span className="text-gray-400"> ({result.yieldPerAcre} per acre)</span>
                </p>
                <p className="text-xs text-gray-600">
                    Price: ${result.pricePerUnit} per {result.unit}
                </p>
            </div>
        </div>
    );
};

export default CropProfit;