import React, { useState } from 'react';
import { Slider } from "./Slider";

const CropProfit = ({ cropName, acreage }) => {
    const [yieldPercentage, setYieldPercentage] = useState(100);

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
        const baseYieldPerAcre = cropYields[normalizedCropName];

        if (!price || !baseYieldPerAcre) return null;

        // Apply yield percentage adjustment
        const adjustedYieldPerAcre = (baseYieldPerAcre * yieldPercentage) / 100;
        const totalYield = adjustedYieldPerAcre * acreage;
        const totalProfit = price * totalYield;

        return {
            profit: totalProfit,
            yieldPerAcre: adjustedYieldPerAcre,
            baseYieldPerAcre,
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
        <div className="bg-gray-50 p-4 rounded-md space-y-4">
            <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-gray-700">
                        Expected Yield: {yieldPercentage}%
                    </label>
                    <div className="mt-2">
                        <Slider
                            value={[yieldPercentage]}
                            onValueChange={(value) => setYieldPercentage(value[0])}
                            max={130}
                            min={70}
                            step={1}
                            className="w-full"
                        />
                    </div>
                    <div className="mt-1 flex justify-between text-xs text-gray-500">
                        <span>70%</span>
                        <span>100%</span>
                        <span>130%</span>
                    </div>
                </div>

                <div className="pt-2">
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
                        Expected Yield: {result.totalYield.toLocaleString()} {result.unit}
                        <span className="text-gray-400"> ({result.yieldPerAcre.toFixed(1)} per acre)</span>
                    </p>
                    <p className="text-xs text-gray-600">
                        Base Yield: {result.baseYieldPerAcre} {result.unit} per acre
                    </p>
                    <p className="text-xs text-gray-600">
                        Price: ${result.pricePerUnit} per {result.unit}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CropProfit;