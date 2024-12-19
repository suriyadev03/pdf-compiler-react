import React from 'react'

const Loader = ({ loadPercentage }) => {

  return (
    <div className='loader'>
      <div>
        <div style={{width:loadPercentage+'%'}}>
          {/* <span>{loadPercentage}%</span> */}
        </div>
      </div>
    </div>
  )
}

export default Loader
