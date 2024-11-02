import React from 'react'

const PlotCard = ({data}) => {
    const handleClick = () => {
        
    }


  return (
    <div className=' rounded-md shadow-md hover:bg-primary-hover mx-2 my-[.1rem] bg-primary' onClick={handleClick}>
        <p className='text-xl'>{data.name}</p>
    </div>
  )
}

export default PlotCard