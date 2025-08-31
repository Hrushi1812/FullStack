import Weather from './Weather'

const Country = ({ country }) => {
  const languages = country.languages ? Object.values(country.languages) : []

  return (
    <>
      <h1>{country.name.common}</h1>
      <div>Capital {country.capital}</div>
      <div>Area {country.area}</div>

      <h2>Languages</h2>

      <ul>
        {languages.map((language) => (
          <li key={language}>{language}</li>
        ))}
      </ul>

      <img
        src={country.flags.png}
        alt={`Flag of ${country.name.common}`}
        width="200"
      />

      <Weather country={country} />
    </>
  )
}

const CountryList = ({ countries, showCountry }) => {
  if (countries.length > 10) {
    return <div>Too many matches, specify another filter</div>
  }

  if (countries.length > 1) {
    return countries.map((c) => (
      <div key={c.cca3}>
        {c.name.common}{' '}
        <button onClick={() => showCountry(c.name.common)}>Show</button>
      </div>
    ))
  }

  if (countries.length === 1) {
    return <Country country={countries[0]} />
  }

  return <div>No matches, please try another search</div>
}

export default CountryList