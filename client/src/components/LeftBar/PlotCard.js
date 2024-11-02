import React from 'react'

const PlotCard = ({data}) => {
    const handleClick = () => {
        
    }


  return (
    <div className='w-full border-b-2 border-secondary' onClick={handleClick}>
        <p className='text-xl'>{data.name}</p>
    </div>
  )
}

export default PlotCard