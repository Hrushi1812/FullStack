const Persons = ({ persons, onRemove }) => (
  <ul>
    {persons.map(person => (
      <li key={person.name}>
        {person.name} {person.number}{' '}
        <button onClick={() => onRemove(person)}>delete</button>
      </li>
    ))}
  </ul>
)

export default Persons
