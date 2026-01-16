import {
  Search,
  MapPin,
  Globe,
  ListTodo,
  Calendar,
  Heart,
  Sparkles,
  ArrowRight,
  Bot
} from 'lucide-react';
import Header from './Header';

export default function Dashboard({ user, onNavigate }) {

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading user info...
      </div>
    );
  }

  const previousTrips = [
  {
    id: 1,
    name: "Paris Adventure",
    image: "https://plus.unsplash.com/premium_photo-1661919210043-fd847a58522d?q=1000&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=400&h=300&fit=crop",
    description: "7 days exploring the City of Light with Eiffel Tower, Louvre, and Seine cruises",
    status: "completed",
    stops: 3,
    startDate: "2024-03-15",
    country: "France"
  },
  {
    id: 2,
    name: "Tokyo Food Journey",
    image: "https://images.unsplash.com/photo-1668562810574-0ff271257517?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fHRva3lvJTIwZm9vZCUyMGpvdXJuZXl8ZW58MHx8MHx8fDA%3D",
    description: "10 days of sushi tours, street food, and cultural experiences in Tokyo",
    status: "completed", 
    stops: 5,
    startDate: "2024-04-22",
    country: "Japan"
  },
  {
    id: 3,
    name: "New York City Escape",
    image: "https://images.unsplash.com/flagged/photo-1575597255483-55f2afb6f42c?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    description: "5 days discovering Times Square, Central Park, and Broadway shows",
    status: "completed",
    stops: 4,
    startDate: "2024-05-10",
    country: "USA"
  }
];

  const topDestinations = [
    { name: 'Paris', country: 'France', image: '🗼', info: 'https://theworldtravelguy.com/?s=Paris' },
    { name: 'Tokyo', country: 'Japan', image: '🗾' , info: 'https://theworldtravelguy.com/?s=japan'},
    { name: 'New York', country: 'USA', image: '🗽', info: 'https://theworldtravelguy.com/?s=usa' },
    { name: 'Bali', country: 'Indonesia', image: '🏝️', info: 'https://theworldtravelguy.com/?s=indonesia' },
    { name: 'London', country: 'UK', image: '🏰', info : 'https://theworldtravelguy.com/?s=bali' }
  ];


  return (
    <>
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-3xl p-12 lg:p-16 overflow-hidden mb-16 shadow-2xl">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
            <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-pink-300 rounded-full mix-blend-multiply filter blur-2xl animate-pulse"></div>
          </div>
          
          <div className="absolute top-16 right-16 w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center animate-bounce">
            <MapPin className="w-8 h-8 text-white/90" />
          </div>
          <div className="absolute bottom-16 left-16 w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center animate-ping">
            <Heart className="w-7 h-7 text-white" />
          </div>
    
          <div className="relative z-10 text-white max-w-3xl">
            <div className="inline-flex items-center px-6 py-3 bg-white/25 backdrop-blur-sm rounded-2xl mb-8 border border-white/40 shadow-xl">
              <Sparkles className="w-6 h-6 mr-3" />
              <span className="text-lg font-bold tracking-wide">✨ Welcome back, {user.first_name || user.name || "Traveler"}!</span>
            </div>
            
            <h2 className="text-5xl lg:text-6xl xl:text-7xl font-black mb-6 bg-gradient-to-r from-white via-blue-50 to-white bg-clip-text leading-tight">
              Ready for your next
              <span className="block bg-gradient-to-r from-yellow-300 via-orange-400 to-red-400 bg-clip-text text-transparent mt-2">
                unforgettable adventure
              </span>?
            </h2>
            
            <p className="text-xl lg:text-2xl mb-12 font-light leading-relaxed opacity-90 max-w-2xl">
              Discover breathtaking destinations and create memories that last a lifetime.
            </p>
            
            <div className="flex flex-col lg:flex-row gap-6 items-center lg:items-end">
              <button 
                onClick={() => onNavigate('create-trip')}
                className="group relative bg-white/95 backdrop-blur-xl text-blue-800 px-12 py-6 lg:py-7 rounded-3xl font-bold text-xl shadow-2xl hover:shadow-3xl hover:-translate-y-2 transition-all duration-500 overflow-hidden hover:bg-white lg:min-w-[280px]"
              >
                <span className="relative z-10 flex items-center justify-center space-x-3">
                  ✨ Start Planning
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-0 group-hover:opacity-20 transition-opacity" />
              </button>
              
              <button className="flex items-center space-x-4 px-10 py-5 bg-white/30 backdrop-blur-sm hover:bg-white/50 border border-white/50 rounded-3xl text-lg font-semibold transition-all hover:shadow-2xl hover:scale-105" onClick={()=> onNavigate('popular')}>
                <Globe className="w-7 h-7" />
                <span>Explore Popular</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 mb-12 border border-white/50">
          <div className="flex items-center space-x-4">
            <Search className="w-6 h-6 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search destinations, activities..." 
              className="flex-1 outline-none text-xl placeholder-gray-500 py-4 bg-transparent" 
            />
            <button className="px-6 py-4 bg-gray-100 hover:bg-gray-200 rounded-2xl font-semibold transition-all whitespace-nowrap">
              Group by
            </button>
            <button className="px-6 py-4 bg-gray-100 hover:bg-gray-200 rounded-2xl font-semibold transition-all whitespace-nowrap">
              Filter
            </button>
            <button className="px-6 py-4 bg-gray-100 hover:bg-gray-200 rounded-2xl font-semibold transition-all whitespace-nowrap">
              Sort by...
            </button>
          </div>
        </div>

        {/* Top Destinations */}
        <section className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
              <Globe className="w-9 h-9 text-blue-600" />
              <span>Top Destinations</span>
            </h3>
            <button className="text-blue-600 font-semibold hover:underline flex items-center space-x-2">
              View All <ArrowRight className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
    {topDestinations.map((dest, idx) => (
    <a
      key={idx}
      href={`https://theworldtravelguy.com/?s=${encodeURIComponent(dest.name)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 border border-white/50 cursor-pointer overflow-hidden block"
    >
      <div className="text-6xl mb-6 group-hover:scale-110 transition-transform">{dest.image}</div>
      <h4 className="font-bold text-xl text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
        {dest.name}
      </h4>
      <p className="text-sm text-gray-600 font-medium">{dest.country}</p>
    </a>
  ))}
</div>
</section>

      {/* Previous Trips */}
    <section className="mb-20">
     <div className="flex justify-between items-center mb-12">
      <div className="flex items-center space-x-4">
      <div className="w-3 h-12 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full shadow-lg" />
      <div>
        <h3 className="text-4xl font-black text-gray-900 mb-1">Previous Trips</h3>
        <p className="text-lg text-gray-600 font-medium">Relive your amazing journeys</p>
      </div>
    </div>
    <button 
      onClick={() => onNavigate('my-trips')} 
      className="group text-blue-600 font-bold text-xl hover:text-blue-700 flex items-center space-x-2 transition-all"
    >
      <span>View All Trips</span>
      <ArrowRight className="w-7 h-7 group-hover:translate-x-2 transition-transform" />
    </button>
  </div>
  
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
    {previousTrips.map((trip) => (
      <div 
        key={trip.id}
        onClick={() => {
          // onSelectTrip?.(trip); // Pass trip data if needed
          onNavigate('itinerary');
        }}
        className="group bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden hover:shadow-3xl hover:-translate-y-4 transition-all duration-700 cursor-pointer border border-white/50 hover:border-blue-200 relative"
      >
        {/* Image */}
        <div 
          className="h-80 relative overflow-hidden group-hover:scale-110 transition-transform duration-700"
          style={{ 
            backgroundImage: `url(${trip.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          
          {/* Status Badge */}
          <div className="absolute top-6 right-6">
            <span className="bg-white/95 backdrop-blur-sm text-green-700 px-4 py-2 rounded-2xl font-bold text-sm shadow-lg flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Completed</span>
            </span>
          </div>
          
          {/* Quick Stats */}
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex items-center justify-between text-white/90 text-sm">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>{trip.stops} stops</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(trip.startDate).toLocaleDateString('short')}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-10">
          <h4 className="text-3xl font-black text-gray-900 mb-4 group-hover:text-blue-600 transition-all line-clamp-2 leading-tight">
            {trip.name}
          </h4>
          
          <p className="text-gray-600 text-lg mb-8 leading-relaxed line-clamp-3">
            {trip.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 text-sm text-gray-500 font-medium">
              <Globe className="w-5 h-5 text-gray-400" />
              <span>{trip.country}</span>
            </div>
            <button className="group/btn bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden relative">
              <span className="relative z-10 flex items-center space-x-2">
                View Details
                <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-white/20 backdrop-blur-sm opacity-0 group-hover/btn:opacity-100 transition-opacity" />
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>
</section>

        {/* Quick Actions */}
        <section className="mt-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 p-4">
            <button 
              onClick={() => onNavigate('my-trips')} 
              className="group bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col items-center space-y-3 hover:-translate-y-2 hover:bg-gradient-to-br hover:from-blue-50 border border-white/50"
            >
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center group-hover:bg-blue-200 group-hover:scale-110 transition-all">
                <MapPin className="w-8 h-8 text-blue-600" />
              </div>
              <span className="font-bold text-gray-900 text-sm leading-tight text-center">My Trips</span>
            </button>
            
            <button 
              onClick={() => onNavigate('city-search')} 
              className="group bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col items-center space-y-3 hover:-translate-y-2 hover:bg-gradient-to-br hover:from-purple-50 border border-white/50"
            >
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center group-hover:bg-purple-200 group-hover:scale-110 transition-all">
                <Search className="w-8 h-8 text-purple-600" />
              </div>
              <span className="font-bold text-gray-900 text-sm leading-tight text-center">Cities</span>
            </button>
            
            <button 
              onClick={() => onNavigate('join-chat')} 
              className="group bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col items-center space-y-3 hover:-translate-y-2 hover:bg-gradient-to-br hover:from-emerald-50 border border-white/50"
            >
              <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center group-hover:bg-emerald-200 group-hover:scale-110 transition-all">
                <Globe className="w-8 h-8 text-emerald-600" />
              </div>
              <span className="font-bold text-gray-900 text-sm leading-tight text-center">Chat</span>
            </button>
            
            <button 
              onClick={() => onNavigate('calendar')} 
              className="group bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col items-center space-y-3 hover:-translate-y-2 hover:bg-gradient-to-br hover:from-orange-50 border border-white/50"
            >
              <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center group-hover:bg-orange-200 group-hover:scale-110 transition-all">
                <Calendar className="w-8 h-8 text-orange-600" />
              </div>
              <span className="font-bold text-gray-900 text-sm leading-tight text-center">Calendar</span>
            </button>
            
            <button 
              onClick={() => onNavigate('build-itinerary')} 
              className="group bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col items-center space-y-3 hover:-translate-y-2 hover:bg-gradient-to-br hover:from-rose-50 border border-white/50"
            >
              <div className="w-14 h-14 bg-rose-100 rounded-2xl flex items-center justify-center group-hover:bg-rose-200 group-hover:scale-110 transition-all">
                <ListTodo className="w-8 h-8 text-rose-600" />
              </div>
              <span className="font-bold text-gray-900 text-sm leading-tight text-center">Itinerary</span>
            </button>
            
          </div>
        </section>
      </main>
    </div>
    </>
  );
}
