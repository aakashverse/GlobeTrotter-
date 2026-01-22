import { useState } from "react";
import {
  ChevronLeft,
  Search,
  Calendar,
  MapPin,
  Plus,
  X,
  Tag,
  Globe,
  DollarSign,
  Users,     
} from "lucide-react";
import useToast from "../hooks/useToast";
import City from "./City";
// const baseURL = import.meta.env.VITE_API_URL;

export default function NewTrip({ onBack, onCreateTrip }) {
  const [formData, setFormData] = useState({
    tripName: "",
    description: "",
    startDate: "",
    endDate: "",
    status: "",
    total_budget: "",
    tripMates: [], // my fav feature :)
    destination: "",
    suggestions: []
  });

  const [showCitySelector, setShowCitySelector] = useState(false);
  const { showSuccess, showError } = useToast();

  // city handling
  const handleCitiesSelected = (selectedCities) => {
    if (selectedCities && selectedCities.length > 0) {
      const placesText = selectedCities
        .map((city) => `${city.name}, ${city.country}`)
        .join(", ");
      setFormData((prev) => ({ ...prev, destination: placesText }));
      showSuccess(`${selectedCities.length} city added to destination!`);
    }
    setShowCitySelector(false); 
  };

  const addSuggestion = () => {
    const newSug = `Activity ${formData.suggestions.length + 1}`;
    setFormData((prev) => ({
      ...prev,
      suggestions: [...prev.suggestions, newSug],
    }));
  };

  const removeSuggestion = (index) => {
    setFormData((prev) => ({
      ...prev,
      suggestions: prev.suggestions.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // basic validation
    if (
      !formData.tripName.trim() ||
      !formData.destination.trim() ||
      !formData.startDate ||
      !formData.endDate ||
      !formData.status ||
      !formData.total_budget
    ) {
      showError("Please fill all fields");
      return;
    }

    // budget validation
    const budgetNum = parseFloat(formData.total_budget);
    if (isNaN(budgetNum) || budgetNum < 0) {
      showError("Please enter valid budget");
      return;
    }

    // date validation
    if (formData.endDate < formData.startDate) {
      showError("Please enter valid dates");
      return;
    }

    // submit data to db
    const submitData = {
      user_id: 1,
      trip_name: formData.tripName.trim(),
      description: formData.description,
      status: formData.status,
      start_date: formData.startDate,
      end_date: formData.endDate,
      destination: formData.destination,
      total_budget: budgetNum,
      ...(formData.tripMates?.filter(m => m.trim()).length > 0 && {
        trip_mates: formData.tripMates.filter(m => m.trim())
      })
    };

    console.log("DB submit data:", submitData);

    try {
      const res = await fetch(`/api/trips`, {
        method: "POST",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create trip");
      }

      const data = await res.json();
      console.log("Trip created:", data);
      onCreateTrip(data);
      onBack("my-trips");
    } catch (err) {
      console.error("Create error:", err);
      showError(err.message);
    }
  };

  // Show City selector or main form
  if (showCitySelector) {
    return (
      <City
        onBack={() => setShowCitySelector(false)}
        onAddCity={handleCitiesSelected} // Receives array of cities
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50">
      <header className="bg-white/90 backdrop-blur-sm shadow-sm sticky top-0 z-20 border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-200 rounded-xl transition-all flex items-center space-x-2 text-sm md:text-base"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="font-medium hidden sm:inline">Cancel</span>
            </button>

            <div className="flex-1 flex justify-center items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Plan New Trip
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <form
          onSubmit={handleSubmit}
          className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/50 space-y-8"
        >
          {/* Plan a new trip */}
          <div className="space-y-6">
            {/* Trip Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                <Tag className="w-5 h-5 text-gray-500" />
                <span>Trip Name</span>
              </label>
              <input
                type="text"
                value={formData.tripName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    tripName: e.target.value,
                  }))
                }
                className="w-full p-4 pl-9 border-2 border-gray-200 rounded-2xl focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100/50 shadow-sm text-lg font-medium pr-12"
                placeholder="Europe Escape, London NightOut, Adventurous India etc"
              />
            </div>
                  {/* Trip Mates */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                <Users className="w-5 h-5 text-gray-500" />
                <span>Trip Mates</span>
              </label>

            <div className="space-y-3">
              {formData.tripMates.map((mate, index) => (
                <div key={index} className="flex gap-2 items-end">
               <input
                 type="text"
                 value={mate}
                 onChange={(e) => {
                   const newMates = [...formData.tripMates];
                   newMates[index] = e.target.value;
                   setFormData((prev) => ({
                     ...prev,
                     tripMates: newMates,
                   })
              );
          }}
          className="flex-1 p-4 pl-9 border-2 border-gray-200 rounded-2xl focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-100 shadow-sm text-lg"
          placeholder="mate name"
        />
        <button
          type="button"
          onClick={() => {
            const newMates = formData.tripMates.filter((_, i) => i !== index);
            setFormData((prev) => ({
              ...prev,
              tripMates: newMates,
            }));
          }}
          className="px-4 py-4 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    ))}
    
    {/* Add new mate input - always visible */}
    <div className="flex gap-2">
      <input
        type="text"
        placeholder="Enter new mate name"
        value={formData.tripMates[formData.tripMates.length - 1] || ""}
        onChange={(e) => {
          if (formData.tripMates.length === 0) {
            setFormData((prev) => ({
              ...prev,
              tripMates: [e.target.value],
            }));
          } else {
            const newMates = [...formData.tripMates];
            newMates[formData.tripMates.length - 1] = e.target.value;
            setFormData((prev) => ({
              ...prev,
              tripMates: newMates,
            }));
          }
        }}
        onKeyPress={(e) => {
          if (e.key === 'Enter' && e.target.value.trim()) {
            const newMates = [...formData.tripMates, ""];
            setFormData((prev) => ({
              ...prev,
              tripMates: newMates,
            }));
            e.target.value = "";
          }
        }}
        className="flex-1 p-4 pl-9 border-2 border-gray-200 rounded-2xl focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-100 shadow-sm text-lg"
      />
      <button
        type="button"
        onClick={() => {
          const lastMate = formData.tripMates[formData.tripMates.length - 1];
          if (lastMate && lastMate.trim()) {
            const newMates = [...formData.tripMates, ""];
            setFormData((prev) => ({
              ...prev,
              tripMates: newMates,
            }));
          }
        }}
        className="px-6 py-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
      >
        <Plus className="w-5 h-5" />
      </button>
    </div>
  </div>

  {/* Display current mates */}
  {formData.tripMates.length > 0 && (
    <div className="mt-4 p-4 bg-green-50 rounded-2xl border border-green-200">
      <p className="text-sm font-medium text-green-800">
        👥 {formData.tripMates.filter(m => m.trim()).length} mate(s) added:
      </p>
      <div className="flex flex-wrap gap-2 mt-2">
        {formData.tripMates
          .filter(m => m.trim())
          .map((mate, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
            >
              {mate}
            </span>
          ))}
      </div>
    </div>
  )}
</div>


            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                <Tag className="w-5 h-5 text-gray-500" />
                <span>Description</span>
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="w-full p-4 pl-9 border-2 border-gray-200 rounded-2xl focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100/50 shadow-sm text-lg font-medium pr-12"
                placeholder="A brief description of your trip"
              />
            </div>

            {/* Destination */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-gray-500" />
                <span>Destination</span>
              </label>
              <div className="space-y-2">
                <div className="relative">
                  <input
                    type="text"
                    value={formData.destination}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        destination: e.target.value,
                      }))
                    }
                    className="w-full p-4 pl-9 border-2 border-gray-200 rounded-2xl focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100/50 shadow-sm text-lg font-medium pr-20"
                    placeholder="Male, Maldives, New York, USA..."
                  />

                  {/* City Selector Button */}
                  <button
                    type="button"
                    onClick={() => setShowCitySelector(true)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-xl shadow-md transition-all"
                    title="Select Cities"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-xs text-gray-500">
                  💡 Click search icon to auto-fill destinations from cities list
                </p>

                {formData.place && (
                  <p className="text-sm text-green-600 font-medium mt-1">
                    {formData.destination.substring(0, 50)}...
                  </p>
                )}
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <span>Start Date</span>
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      startDate: e.target.value,
                    }))
                  }
                  className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100/50 shadow-sm text-lg font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <span>End Date</span>
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      endDate: e.target.value,
                    }))
                  }
                  className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100/50 shadow-sm text-lg font-medium"
                />
              </div>
            </div>

            {/* Status Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                <span>Trip Status</span>
              </label>

              <div className="relative">
                <select
                  value={formData.status || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: e.target.value,
                    }))
                  }
                  className="w-full p-4 pl-10 pr-10 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-sm text-lg font-medium appearance-none bg-white"
                >
                  <option value="">Select status</option>
                  <option value="upcoming">🔜 Upcoming</option>
                  <option value="ongoing">••• Ongoing</option>
                  <option value="completed">✔ Completed</option>
                </select>

                <svg
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            {/* Budget Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-gray-500" />
                <span>Estimated Budget</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.total_budget || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    total_budget: e.target.value,
                  }))
                }
                className="w-full p-4 pl-9 border-2 border-gray-200 rounded-2xl focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100/50 shadow-sm text-lg font-medium pr-12"
                placeholder="Enter estimated budget (₹)"
              />
            </div>
          </div>

          {/* Suggestions Grid */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <label className="text-lg font-bold text-gray-800 flex items-center space-x-2">
                <Globe className="w-6 h-6" />
                <span>Suggestion for places to visit/Activities to perform</span>
              </label>
              <button
                type="button"
                onClick={addSuggestion}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium rounded-xl transition-all group"
              >
                <Plus className="w-4 h-4 group-hover:scale-110" />
                <span>Add</span>
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {formData.suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="group relative bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl border-2 border-gray-200 hover:border-blue-300 hover:shadow-md transition-all hover:-translate-y-1"
                >
                  <button
                    type="button"
                    onClick={() => removeSuggestion(index)}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-red-50 hover:text-red-600 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <p className="font-medium text-gray-800 text-sm leading-relaxed line-clamp-3 h-20 flex items-center">
                    {suggestion}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-center items-center p-2 m-4">
            <button
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-blue-700 transition-all"
            >
              Create Trip
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
