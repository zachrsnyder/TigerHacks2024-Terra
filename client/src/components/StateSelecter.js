import React from 'react';


const StateSelecter = ({ selectedState, setSelectedState }) => {
    const states = [
        "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY",
        "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND",
        "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
      ];

  return (
    <div className="mb-4">
      <label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label>
      <select
        id="state"
        value={selectedState}
        onChange={(e) => setSelectedState(e.target.value)}
        className="w-full px-4 py-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
      >
        <option value="">Select a state</option>
        {states.map((state) => (
          <option key={state} value={state}>{state}</option>
        ))}
      </select>
    </div>
  )
}

export default StateSelecter