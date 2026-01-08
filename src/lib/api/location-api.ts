// API service for fetching countries and cities
const API_BASE_URL = 'https://countriesnow.space/api/v0.1'

export interface Country {
  iso2: string
  iso3: string
  country: string
}

export interface CountryWithCities {
  iso2: string
  iso3: string
  country: string
  cities: string[]
}

// Cache for API responses
let countriesCache: Country[] | null = null
let citiesCache: Map<string, string[]> = new Map()

export async function getCountries(): Promise<Country[]> {
  if (countriesCache) {
    return countriesCache
  }

  try {
    const response = await fetch(`${API_BASE_URL}/countries`)
    if (!response.ok) {
      throw new Error('Failed to fetch countries')
    }
    
    const data = await response.json()
    if (data.error) {
      throw new Error(data.msg || 'Failed to fetch countries')
    }
    
    // Extract just country names and codes
    countriesCache = data.data.map((item: CountryWithCities) => ({
      iso2: item.iso2,
      iso3: item.iso3,
      country: item.country
    })).sort((a: Country, b: Country) => a.country.localeCompare(b.country))
    
    return countriesCache
  } catch (error) {
    console.error('Error fetching countries:', error)
    // Return fallback list if API fails
    return getFallbackCountries()
  }
}

export async function getCitiesByCountry(country: string): Promise<string[]> {
  // Check cache first
  if (citiesCache.has(country)) {
    return citiesCache.get(country) || []
  }

  try {
    const response = await fetch(`${API_BASE_URL}/countries/cities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ country })
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch cities')
    }
    
    const data = await response.json()
    if (data.error) {
      throw new Error(data.msg || 'Failed to fetch cities')
    }
    
    const cities = (data.data || []).sort()
    citiesCache.set(country, cities)
    
    return cities
  } catch (error) {
    console.error('Error fetching cities for country:', country, error)
    return []
  }
}

// Fallback countries list in case API is down
function getFallbackCountries(): Country[] {
  return [
    { iso2: 'US', iso3: 'USA', country: 'United States' },
    { iso2: 'GB', iso3: 'GBR', country: 'United Kingdom' },
    { iso2: 'CA', iso3: 'CAN', country: 'Canada' },
    { iso2: 'AU', iso3: 'AUS', country: 'Australia' },
    { iso2: 'DE', iso3: 'DEU', country: 'Germany' },
    { iso2: 'FR', iso3: 'FRA', country: 'France' },
    { iso2: 'ES', iso3: 'ESP', country: 'Spain' },
    { iso2: 'IT', iso3: 'ITA', country: 'Italy' },
    { iso2: 'NL', iso3: 'NLD', country: 'Netherlands' },
    { iso2: 'SE', iso3: 'SWE', country: 'Sweden' },
    { iso2: 'NO', iso3: 'NOR', country: 'Norway' },
    { iso2: 'DK', iso3: 'DNK', country: 'Denmark' },
    { iso2: 'FI', iso3: 'FIN', country: 'Finland' },
    { iso2: 'BE', iso3: 'BEL', country: 'Belgium' },
    { iso2: 'CH', iso3: 'CHE', country: 'Switzerland' },
    { iso2: 'AT', iso3: 'AUT', country: 'Austria' },
    { iso2: 'PL', iso3: 'POL', country: 'Poland' },
    { iso2: 'PT', iso3: 'PRT', country: 'Portugal' },
    { iso2: 'IE', iso3: 'IRL', country: 'Ireland' },
    { iso2: 'NZ', iso3: 'NZL', country: 'New Zealand' },
    { iso2: 'JP', iso3: 'JPN', country: 'Japan' },
    { iso2: 'KR', iso3: 'KOR', country: 'South Korea' },
    { iso2: 'SG', iso3: 'SGP', country: 'Singapore' },
    { iso2: 'IN', iso3: 'IND', country: 'India' },
    { iso2: 'BR', iso3: 'BRA', country: 'Brazil' },
    { iso2: 'MX', iso3: 'MEX', country: 'Mexico' },
    { iso2: 'AR', iso3: 'ARG', country: 'Argentina' },
    { iso2: 'ZA', iso3: 'ZAF', country: 'South Africa' },
    { iso2: 'AE', iso3: 'ARE', country: 'United Arab Emirates' },
    { iso2: 'IL', iso3: 'ISR', country: 'Israel' },
  ].sort((a, b) => a.country.localeCompare(b.country))
}