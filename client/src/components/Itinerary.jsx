import { useState } from "react";
import { ChevronRight, Search, Plus } from "lucide-react";

export default function BuildItinerary({ onBack }) {
  const [sections, setSections] = useState([
    {
      id: 1,
      title: "Travel Section",
      dateRange: "xx to yy",
      budget: "",
    //   description: "All necessary information about this section.",
    },
    {
      id: 2,
      title: "Hotel",
      dateRange: "xx to yy",
      budget: "",
    //   description: "All the necessary information about this section.",
    },
    {
      id: 3,
      title: "Activities",
      dateRange: "xx to yy",
      budget: "",
    //   description: "All the necessary information about this section.",
    },
  ]);

  const addSection = () => {
    const newSection = {
      id: sections.length + 1,
      title: `Section ${sections.length + 1}`,
      dateRange: "xx to yy",
      budget: "",
      description: "All the necessary information about this section.",
    };
    setSections([...sections, newSection]);
  };

  const updateSection = (id, field, value) => {
    setSections(
      sections.map((section) =>
        section.id === id ? { ...section, [field]: value } : section
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center space-x-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronRight className="w-6 h-6 rotate-180" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Build Itinerary</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 flex items-center space-x-4">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search itinerary sections..."
            className="flex-1 outline-none"
          />
        </div>

        <div className="space-y-6">
          {sections.map((section) => (
            <div
              key={section.id}
              className="bg-white rounded-2xl shadow-lg p-8 border-l-4 border-blue-500"
            >
              <div className="flex justify-between items-start mb-6">
                <input
                  type="text"
                  value={section.title}
                  onChange={(e) => updateSection(section.id, "title", e.target.value)}
                  placeholder="Section title (Travel, Hotel, Activity...)"
                  className="text-2xl font-bold text-gray-800 outline-none bg-transparent w-96"
                />
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={section.dateRange}
                    onChange={(e) => updateSection(section.id, "dateRange", e.target.value)}
                    placeholder="Date Range"
                    className="px-4 py-2 border border-gray-300 rounded-lg w-32 text-sm"
                  />
                  <input
                    type="text"
                    value={section.budget}
                    onChange={(e) => updateSection(section.id, "budget", e.target.value)}
                    placeholder="Budget"
                    className="px-4 py-2 border border-gray-300 rounded-lg w-24 text-sm"
                  />
                </div>
              </div>

              <textarea
                value={section.description}
                onChange={(e) => updateSection(section.id, "description", e.target.value)}
                placeholder="All necessary information about this section. This can be anything like travel section, hotel or any other activity"
                rows={4}
                className="w-full p-4 border border-gray-200 rounded-xl outline-none resize-vertical text-sm text-gray-700"
              />
            </div>
          ))}

          <button
            onClick={addSection}
            className="flex items-center justify-center w-full p-8 border-2 border-dashed border-gray-300 rounded-2xl hover:border-blue-400 hover:bg-blue-50 transition-colors"
          >
            <Plus className="w-8 h-8 text-gray-400 mr-2" />
            <span className="text-lg font-medium text-gray-600">Add another Section</span>
          </button>
        </div>
      </main>
    </div>
  );
}
