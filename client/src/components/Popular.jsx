import { useState, useEffect } from "react";
import { ChevronLeft, MapPin, Users, Star } from "lucide-react";

export default function Popular({ onBack, showToast }) {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const toastId = showToast('Loading popular spots...', 'info');
    fetch("https://api.api-ninjas.com/v1/city?limit=5&min_population=1000000&country=US,GB,FR,IT,ES,JP,AU")
      .then(res => {
         if(!res.ok) throw new Error(`HTTP ${res.status}: ${res.status.Text}`);
         return res.json();
      })
      .then(data => {
        // Enhance with mock popularity scores/images for demo
        const popular = data.map(city => ({
          name: city.name,
          country: city.country,
          population: city.population.toLocaleString(),
          // Mock data for realism
          rating: (4 + Math.random()).toFixed(1),
          image: `https://picsum.photos/400/250?random=${city.name.charCodeAt(0)}`,
          travelers: Math.floor(Math.random() * 50000) + 10000
        }));
        setDestinations(popular);
        setLoading(false);
        showToast(`Loaded ${data.length} destinations!`, 'success');
      })
      .catch(err => {
        setError("Failed to load destinations");
        setLoading(false);
        showToast('Failed to load destinations', 'error')
      });
  }, [showToast]);

  if (loading) return <div className="p-8 text-center">Loading popular spots...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-sm sticky top-0 z-20 border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={onBack}
              className="p-2 hover:bg-gray-200 rounded-xl transition-all flex items-center space-x-2"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="font-medium hidden sm:inline">Back</span>
            </button>
            <div className="flex-1 flex justify-center items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Explore Popular Destinations
              </h1>
            </div>
            <div className="w-12" />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {error ? (
          <div className="text-center py-12 text-red-500">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinations.map((city, i) => (
              <div key={i} className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden cursor-pointer hover:-translate-y-2">
                <img 
                  src={city.image} 
                  alt={city.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="p-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <h3 className="font-bold text-xl">{city.name}</h3>
                    <span className="text-sm text-gray-500 ml-auto">{city.country}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{city.rating}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{city.travelers.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 mb-4">
                    Pop: {city.population}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
