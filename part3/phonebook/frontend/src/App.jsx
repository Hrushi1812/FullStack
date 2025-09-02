import React, { useState, useEffect } from 'react'
import personService from './services/persons'
import Filter from './components/filter'
import PersonForm from './components/personform'
import Persons from './components/Persons'
import Notification from './components/Notification'

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [search, setSearch] = useState('')
  const [notification, setNotification] = useState({ message: null, type: null })

  useEffect(() => {
    personService.getAll().then(initialPersons => setPersons(initialPersons))
  }, [])

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification({ message: null, type: null }), 5000)
  }

  const addName = event => {
    event.preventDefault()
    if (!newName.trim() || !newNumber.trim()) {
      showNotification('Name and number cannot be empty', 'error')
      return
    }

    const existingPerson = persons.find(p => p.name === newName)
    if (existingPerson) {
      if (
        window.confirm(
          `${newName} is already added, replace the old number with a new one?`
        )
      ) {
        const updatedPerson = { ...existingPerson, number: newNumber }
        personService
          .update(existingPerson.id, updatedPerson)
          .then(returnedPerson => {
            setPersons(
              persons.map(p => (p.id !== existingPerson.id ? p : returnedPerson))
            )
            setNewName('')
            setNewNumber('')
            showNotification(`Updated number for ${returnedPerson.name}`)
          })
          .catch(() => {
            showNotification(
              `Information of ${existingPerson.name} has already been removed from server`,
              'error'
            )
            setPersons(persons.filter(p => p.id !== existingPerson.id))
          })
      }
      return
    }

    const nameObject = { name: newName, number: newNumber }
    personService.create(nameObject).then(newPerson => {
      setPersons(persons.concat(newPerson))
      setNewName('')
      setNewNumber('')
      showNotification(`Added ${newPerson.name}`)
    })
  }

  const handleDelete = (id, name) => {
    if (window.confirm(`Delete ${name}?`)) {
      personService
        .remove(id)
        .then(() => {
          setPersons(persons.filter(p => p.id !== id))
          showNotification(`Deleted ${name}`)
        })
        .catch(error => {
          showNotification(`The person '${name}' was already removed from server`, 'error')
          setPersons(persons.filter(p => p.id !== id))
        })
    }
  }

  const personsToShow = persons.filter(person =>
    person.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <h1>Phonebook</h1>
      <Notification message={notification.message} type={notification.type} />
      <Filter search={search} handleSearch={e => setSearch(e.target.value)} />
      <h2>Add a new</h2>
      <PersonForm
        addName={addName}
        newName={newName}
        handleNameChange={e => setNewName(e.target.value)}
        newNumber={newNumber}
        handleNumberChange={e => setNewNumber(e.target.value)}
      />
      <h2>Numbers</h2>
      <Persons personsToShow={personsToShow} handleDelete={handleDelete} />
    </div>
  )
}

export default App
