import { useState } from "react";
import { ChevronRight } from "lucide-react";

export default function CalendarScreen({ onBack }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();
  const firstDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const prevMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  const nextMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );

  const renderDays = () => {
    const days = [];
    const totalSlots = Math.ceil((daysInMonth + firstDay) / 7) * 7;

    for (let i = 0; i < totalSlots; i++) {
      const dayNum = i - firstDay + 1;
      const isValid = dayNum > 0 && dayNum <= daysInMonth;
      const hasTrip =
        isValid && (dayNum === 4 || dayNum === 15 || dayNum === 23);

      days.push(
        <div
          key={i}
          className={`min-h-24 border border-gray-200 p-2 ${
            !isValid ? "bg-gray-50" : "bg-white"
          }`}
        >
          {isValid && (
            <>
              <div className="font-semibold text-gray-700">{dayNum}</div>
              {hasTrip && (
                <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded mt-1">
                  {dayNum === 4
                    ? "PARIS TRIP"
                    : dayNum === 15
                    ? "SARIS 10"
                    : "JAPAN ADVENTURE"}
                </div>
              )}
            </>
          )}
        </div>
      );
    }
    return days;
  };

  return (
    <div className="min-h-screen">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center space-x-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronRight className="w-6 h-6 rotate-180" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Calendar View</h1>
        </div>
      </header>
      <hr></hr>
        <div className="bg-white rounded-2xl shadow-lg p-8">

          <div className="flex justify-center items-center mb-6 space-x-8">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight className="w-6 h-6 rotate-180" />
            </button>
            <h3 className="text-2xl font-bold text-gray-800">
              {monthNames[currentDate.getMonth()]}{" "}
              {currentDate.getFullYear()}
            </h3>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0 border border-gray-200">
            {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
              <div
                key={day}
                className="bg-gray-100 border border-gray-200 p-3 text-center font-bold text-gray-700"
              >
                {day}
              </div>
            ))}
            {renderDays()}
          </div>
        </div>
    </div>
  );
}
