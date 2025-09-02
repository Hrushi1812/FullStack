import React from 'react'

const Notification = ({ message, type }) => {
  if (message === null) return null

  const notificationStyle = {
    color: type === 'error' ? 'red' : 'green',
    background: '#f2f2f2',
    fontSize: 20,
    border: `3px solid ${type === 'error' ? 'red' : 'green'}`,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  }

  return <div style={notificationStyle}>{message}</div>
}

export default Notification
