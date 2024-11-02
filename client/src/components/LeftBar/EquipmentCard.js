import React from 'react';

const EquipmentCard = ({equipment}) => {
  return (
    <div className="w-full p-4 bg-white border-solid border-y-2 border-black">
      <div className="flex justify-between items-center mb-2"> 
        <h3 className="text-lg font-semibold">test</h3>
        <span className={`text-sm font-medium ${'Active' === 'Active' ? 'text-green-500' : 'text-gray-500'}`}>
          Active
        </span>
      </div>
      <div className="relative h-2 w-full bg-gray-200 rounded-full">
        <div
          className="absolute top-0 left-0 h-full bg-blue-500 rounded-full"
          style={{ width: `${50}%` }}
        ></div>
      </div>
    </div>
  )
}

export default EquipmentCard