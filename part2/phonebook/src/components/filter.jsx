import React from 'react'

const Filter = ({ search, handleSearch }) => (
  <div>
    filter shown with <input value={search} onChange={handleSearch} />
  </div>
)

export default Filter
