import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
//import { getTripById, getWeatherForecast, getEvents } from "../api";
import AddUserImage from "../assets/add-user.png";

function daysUntil(dateString) {
  const today = new Date();
  const target = new Date(dateString);
  const diffTime = target - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function getDateRange(start, end) {
  const range = [];
  let current = new Date(start);
  const last = new Date(end);
  while (current <= last) {
    range.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return range;
}

function formatDateRange(start, end) {
  const format = (dateStr) => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };
  return `${format(start)} - ${format(end)}`;
}

function CustomPlan() {
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [weatherByDate, setWeatherByDate] = useState({});
  const [suggestedEvents, setSuggestedEvents] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dummyTrip = {
          id: tripId,
          name: "Trip to Yosemite",
          start_date: "2024-07-01",
          end_date: "2024-07-03",
          activities: [
            { id: 1, name: "Hiking", location: "Yosemite" },
            { id: 2, name: "Camping", location: "Yosemite" },
          ],
          invited_users: [{ id: 2, username: "mark_smith" }],
        };
  
        setTrip(dummyTrip);
  
        const location = dummyTrip.activities[0]?.location || "Yosemite";
  
        const daysOut = daysUntil(dummyTrip.start_date);
        if (daysOut <= 8) {
          // 🔧 FAKE WEATHER FORECAST START
          setWeatherByDate({
            "2024-07-01": [
              { time: "2024-07-01T03:00:00Z", temperature_max: 18, description: "Cloudy" },
              { time: "2024-07-01T06:00:00Z", temperature_max: 20, description: "Sunny" },
              { time: "2024-07-01T09:00:00Z", temperature_max: 23, description: "Sunny" },
            ],
            "2024-07-02": [
              { time: "2024-07-02T03:00:00Z", temperature_max: 17, description: "Rain" },
              { time: "2024-07-02T06:00:00Z", temperature_max: 19, description: "Rain" },
              { time: "2024-07-02T09:00:00Z", temperature_max: 21, description: "Cloudy" },
            ]
          });
          //FAKE WEATHER FORECAST END
        }

        //FAKE EVENTS DATA START
        setSuggestedEvents([
          { id: 1, name: "Yosemite Night Tour", rating: 4.9, categories: ["Tours", "Nature"] },
          { id: 2, name: "Local Food Festival", rating: 4.6, categories: ["Food & Drink"] },
          { id: 3, name: "Climbing Workshop", rating: 4.7, categories: ["Active Life"] },
        ]);
        //FAKE EVENTS DATA END

        // Weather: only fetch if the trip is within 8 days
        // if (daysOut <= 8) {
        //   const forecast = await getWeatherForecast(location);
          
        //   //Group of forecast entries
        //   const groupedForecast = {};
        //   for (const entry of forecast) {
        //     const date = entry.forecast_date;
        //     if (!groupedForecast[date]) groupedForecast[date] = [];
        //     groupedForecast[date].push(entry);
        // }
        //   setWeatherByDate(groupedForecast);
        // }
  
        //Suggested events from yelp
        const events = await getEvents(location);
        setSuggestedEvents(events);
      } catch (err) {
        console.error("Error loading trip or weather/events:", err);
      }
    };
  
    fetchData();
  }, [tripId]);  

  if (!trip) return <p>Loading trip data...</p>;

  const { name, start_date, end_date, activities, invited_users } = trip;
  const tripDates = getDateRange(start_date, end_date);

  return (
    <>
      {/*Trip Title + Date Range + Users*/}
      <div className="flex justify-between items-center mb-8">
        {/* LEFT: Title + Date */}
        <div>
          <h2 className="text-3xl font-bold">{name}</h2>
          <p className="text-gray-600 text-sm mt-1">
            {formatDateRange(start_date, end_date)}
          </p>
        </div>

      {/*User avatars + Add button*/}
        <div className="flex items-center gap-2">
          {invited_users.map((user, idx) => (
            <div
              key={user.id}
              className="w-10 h-10 rounded-full bg-gray-300 text-xs flex items-center justify-center font-semibold text-white"
              style={{ backgroundColor: ["#7E57C2", "#29B6F6", "#66BB6A"][idx % 3] }}
              title={`@${user.username}`}
            >
              {user.username.charAt(0).toUpperCase()}
            </div>
          ))}

      {/*Add user button (non-functional)*/}
          <button
            className="w-10 h-10 rounded-full bg-orange-400 text-white flex items-center justify-center text-xl font-bold shadow hover:bg-orange-500"
            title="Add user"
          >
            <img src={AddUserImage} alt="Add user" className="w-full h-full object-cover" />
          </button>
        </div>
      </div>

      {/* === DAILY TRIP SECTIONS === */}
      {tripDates.map((date) => {
      const dateStr = date.toISOString().split("T")[0];
      const forecasts = weatherByDate[dateStr];

      return (
        <div key={dateStr} className="mb-10 p-4 border rounded shadow">
          <h3 className="text-xl font-bold text-orange-500 mb-2">{dateStr}</h3>

          {/* WEATHER FIRST */}
          <div className="mb-4">
            <h4 className="text-lg font-semibold mb-2">Hourly Forecast</h4>
            {daysUntil(start_date) <= 8 ? (
              forecasts && forecasts.length > 0 ? (
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {forecasts.map((forecast, index) => {
                    const hour = new Date(forecast.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    return (
                      <div
                        key={index}
                        className="flex flex-col justify-between items-center bg-blue-100 text-blue-800 rounded-[50px] px-2 py-4 shadow-md"
                        style={{ width: "103px", height: "183px", minWidth: "103px" }}
                      >
                        <p className="text-sm font-semibold">{hour}</p>
                        <p className="text-md my-2 italic">{forecast.description}</p>
                        <p className="text-lg font-bold">{forecast.temperature_max}°C</p>
                      </div>
                    );
              })}
          </div>
        ) : (
          <p className="italic text-gray-500">No forecast available for this day.</p>
        )
      ) : (
        <p className="italic text-gray-500">
          Weather forecast will be available closer to your trip date.
        </p>
      )}
    </div>

      {/* ACTIVITIES */}
    <div className="mb-4">
      <h4 className="text-lg font-semibold">Planned Activities</h4>
      {activities.length > 0 ? (
        <ul className="list-disc ml-5">
          {activities.map((a) => (
            <li key={a.id}>
              {a.name} — Rating: {a.rating}
            </li>
          ))}
        </ul>
      ) : (
        <p className="italic text-gray-500">No activities planned for this day.</p>
      )}
      </div>

      {/* SUGGESTED EVENTS */}
      <div>
        <h4 className="text-lg font-semibold">Suggested Events</h4>
        {suggestedEvents.length > 0 ? (
          <ul className="list-disc ml-5">
            {suggestedEvents.slice(0, 3).map((event) => (
              <li key={event.id}>
                {event.name} — {event.categories.join(", ")} — {event.rating}
              </li>
            ))}
          </ul>
        ) : (
          <p className="italic text-gray-500">No events found for this day.</p>
        )}
      </div>
    </div>
    );
    })}
    </>

  );
}

export default CustomPlan;
