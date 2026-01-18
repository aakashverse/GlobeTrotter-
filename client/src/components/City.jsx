import { useState, useEffect } from "react";
import { ChevronRight, Search, Check } from "lucide-react";
import sampleCities from "../assets/sampleCities.json"; 

export default function City({ onBack, onAddCity }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [cities, setCities] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [isAdding, setIsAdding] = useState(false);

  // Load from JSON file
  useEffect(() => {
    setCities(sampleCities);
    setFilteredCities(sampleCities);
  }, []);

  // Filter logic (unchanged)
  useEffect(() => {
    let filtered = cities.filter((city) =>
      city.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (selectedCountry !== "All") {
      filtered = filtered.filter((city) => city.country === selectedCountry);
    }
    setFilteredCities(filtered);
  }, [searchTerm, selectedCountry, cities]);

  const handleAddCity = (city) => {
    if (!selectedCities.find((c) => c.id === city.id)) {
      setIsAdding(true);
      const newSelected = [...selectedCities, city];
      setSelectedCities(newSelected);
      onAddCity?.(newSelected);
      setTimeout(() => setIsAdding(false), 500);
    }
  };

  const countries = ["All", ...new Set(cities.map((c) => c.country))];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
       <header className="bg-white sticky top-0 z-20 border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronRight className="w-6 h-6 rotate-180" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            Back
          </h1>
        </div>
      </header>

      {/* Search */}
      <div className="flex items-center mb-6">
        <Search className="w-6 h-6 text-gray-500 mr-2" />
        <input
          type="text"
          placeholder="Search cities... (try 'America' or 'Prayagraj')"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
        />
      </div>

      {/* Country Filters */}
      <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
        {countries.map((country) => (
          <button
            key={country}
            onClick={() => setSelectedCountry(country)}
            className={`px-4 py-2 rounded-full border-2 font-medium whitespace-nowrap transition-all ${
              selectedCountry === country
                ? "bg-blue-500 text-white border-blue-500 shadow-md"
                : "bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:shadow-sm"
            }`}
          >
            {country}
          </button>
        ))}
      </div>

      {/* Cities Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-6 ml-20 mr-20">
        {filteredCities.length === 0 ? (
          <p className="col-span-full text-gray-500 text-center py-12 text-lg">
            {cities.length === 0 ? "Loading cities..." : "No cities found"}
          </p>
        ) : (
          filteredCities.map((city) => (
            <div key={city.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden border border-gray-100">
              
              {/* City Image */}
              <div className="h-50 overflow-hidden">
                <img 
                  src={city.image} 
                  alt={city.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  onError={(e) => e.target.src = `https://via.placeholder.com/400x250/4A90E2/FFFFFF?text=${city.name}`}
                />
              </div>
              
              {/* Content */}
              <div className="p-6 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xl text-gray-900">{city.name}</h3>
                  <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold rounded-full shadow-sm">
                    #{city.ranking}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600">🇮🇳 {city.country}</p>
                
                {/* Attractions */}
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Top Attractions</p>
                  <div className="flex flex-wrap gap-1">
                    {city.attractions.slice(0, 3).map((attr, i) => (
                      <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded-md text-gray-700 font-medium">
                        {attr}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 pt-2 pb-3">
                  <div className="text-center p-2 bg-gradient-to-b from-blue-50 to-blue-100 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{city.costIndex}</div>
                    <div className="text-xs text-gray-600 uppercase tracking-wide">Cost Index</div>
                  </div>
                  <div className="text-center p-2 bg-gradient-to-b from-green-50 to-green-100 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{city.popularity}</div>
                    <div className="text-xs text-gray-600 uppercase tracking-wide">Popularity</div>
                  </div>
                  <div className={`text-center p-2 rounded-lg ${
                    city.aqi < 50 ? 'bg-green-50' : city.aqi < 100 ? 'bg-yellow-50' : 'bg-red-50'
                  }`}>
                    <div className={`text-lg font-bold ${
                      city.aqi < 50 ? 'text-green-600' : city.aqi < 100 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {city.aqi}
                    </div>
                    <div className="text-xs text-gray-600">{city.weather}</div>
                  </div>
                </div>
              </div>
              
              {/* Add Button */}
              <button
                onClick={() => handleAddCity(city)}
                disabled={selectedCities.find(c => c.id === city.id) || isAdding}
                className={`w-full py-3 px-4 font-semibold rounded-b-2xl transition-all text-sm ${
                  selectedCities.find(c => c.id === city.id)
                    ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg'
                    : isAdding
                    ? 'bg-blue-400 text-white animate-pulse shadow-lg'
                    : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl'
                }`}
              >
                {selectedCities.find(c => c.id === city.id) ? (
                  <>
                    <Check className="w-4 h-4 inline mr-1" />
                    Added!
                  </>
                ) : isAdding ? 'Adding...' : 'Add to Trip'}
              </button>
            </div>
          ))
        )}
      </div>

      {/* Selected Cities Summary */}
      {selectedCities.length > 0 && (
        <div className="mt-12 p-6 bg-white rounded-3xl shadow-2xl border border-blue-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
              <MapPin className="w-8 h-8 text-blue-500" />
              <span>Selected Cities ({selectedCities.length})</span>
            </h2>
            <button
              onClick={() => onAddCity(selectedCities)}
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all"
              disabled={selectedCities.length === 0}
            >
              ✅ Done - Auto-fill Destinations
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-48 overflow-y-auto">
            {selectedCities.map((city) => (
              <div key={city.id} className="group relative p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl hover:shadow-md transition-all border">
                <img 
                  src={city.image} 
                  alt={city.name}
                  className="w-full h-20 object-cover rounded-lg mb-2"
                />
                <h4 className="font-semibold text-sm text-gray-900 line-clamp-1">{city.name}</h4>
                <p className="text-xs text-gray-600">{city.country}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
