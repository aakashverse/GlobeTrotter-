import { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";

import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import CreateTrip from "./components/NewTrip";
import MyTrip from "./components/MyTrip";
import Itinerary from "./components/Itinerary";
import Profile from "./components/Profile";
import City from "./components/City";
import Calendar from "./components/Calender";
import Analytics from "./components/Analytics";
import Popular from "./components/Popular";
import Header from "./components/Header";
import EditTrip from "./components/EditTrip";
import NewStop from "./components/NewStop";
import JoinTripChat from "./components/JoinTripChat";
import TripChat from "./components/TripChat";

import useAuth from "./hooks/useAuth";
import useToast from "./hooks/useToast";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState("login");
  const [currentTrip, setCurrentTrip] = useState(null); 
  const [currentTripId, setCurrentTripId] = useState(null);
  const [chatTripId, setChatTripId] = useState(null);
  const { user, isAuthenticated, authReady, login } = useAuth();
  const {showSuccess} = useToast();

  // Automatically go to dashboard after refresh if user is logged in
  useEffect(() => {
    if (authReady && isAuthenticated && user) {
      setCurrentScreen("dashboard");
    }
  }, [authReady, isAuthenticated, user]);

  // wait for auth check
  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Restoring session...
      </div>
    );
  }

  // const handleBack = () =>{
  //   setCurrentScreen("/dashboard");
  // }

  const handleCreateTrip = () =>{
    // console.log("trip created!")
    showSuccess("Trip created successfully!");
    setTimeout(() => {
      setCurrentScreen("dashboard"); // delay before redirect for better UX
    }, 1000); 
  }

  
  const handleNavigate = (path, state) => {
    if (path.includes('edit')) {
      setCurrentScreen('edit-trip');
      setCurrentTrip(state?.trip);  // pass trip
    } else if (path.includes('new-stop')) {
      const tripId = path.split('/')[2]; // Extract from /trips/123/new-stop
      setCurrentScreen('new-stop');
      setCurrentTripId(tripId);        // Extract tripId
    } else if(path === 'join-chat'){
      setCurrentScreen('join-chat');
    } else if(path === 'trip-chat'){
      setCurrentScreen('trip-chat');
    } else if (path === 'my-trips'){
      setCurrentScreen('my-trips');
    } else if (path === 'trip-ai'){
      setCurrentScreen('trip-ai');
    } else if (path === 'analytics'){
      setCurrentScreen('analytics');
    } else {
      setCurrentScreen(path.replace('/', '')); // Handle other paths
    }
  };

  // User is authenticated and user object exists
  return (
    <>
      <Toaster position="top-right" />

      {currentScreen === "login" && (
        <Login 
          onLogin={(user) => {
            login(user);
            setCurrentScreen("dashboard");
          }}

          onRegister={() => setCurrentScreen('register')}
          />
      )}

      {currentScreen === "register" && (
        <Register 
          onBack={() => setCurrentScreen("login")} 
          onLogin={() => setCurrentScreen("login")}
        />
      )}

      {isAuthenticated && user &&  (
      <>
        <Header
          user={user}
          onNavigate={handleNavigate}
          onLogout={() => setCurrentScreen('login')}
          />
      
        {currentScreen === "dashboard" && (
          <Dashboard user={user} onNavigate={handleNavigate} />
        )}

        {currentScreen === "profile" && (
          <Profile user={user} onBack={() => setCurrentScreen("dashboard")} />
        )}

        {currentScreen === "create-trip" && (
          <CreateTrip onBack={() => setCurrentScreen("dashboard")} onCreateTrip={handleCreateTrip}/>
        )}

        {currentScreen === "my-trips" && (
          <MyTrip onNavigate={handleNavigate} 
            user={user}
          />
        )}

        {currentScreen === "build-itinerary" && (
          <Itinerary onBack={() => setCurrentScreen("my-trips")} />
        )}

        {currentScreen === "join-chat" && (
          <JoinTripChat 
              onBack={() => setCurrentScreen("dashboard")}
              onJoin={(tripId) => {
                setChatTripId(tripId);
                setCurrentScreen("trip-chat");
              }}
            />
        )}

        {currentScreen === "trip-chat" && ( 
          <TripChat 
            tripId={chatTripId}
            userId={user.id}
            firstName={user.first_name}
            lastName={user.last_name}
            onBack={() => setCurrentScreen("dashboard")}
          />
        )}

        {currentScreen === "calendar" && (
          <Calendar onBack={() => setCurrentScreen("dashboard")} />
        )}

        {currentScreen === "analytics" && (
          <Analytics onBack={() => setCurrentScreen("dashboard")} />
        )}

        {currentScreen === "city-search" && (
          <City onBack={() => setCurrentScreen("dashboard")} />
        )}

        {currentScreen === "popular" && (
          <Popular onBack={() => setCurrentScreen("dashboard")} />
        )}

      {/* Edit Trip Screen */}
        {currentScreen === "edit-trip" && (
          <EditTrip 
            trip={currentTrip}
            onNavigate={handleNavigate}
            onBack={() => setCurrentScreen("my-trips")}
          />
        )}

      {/* New Stop Screen */} 
        {currentScreen === "new-stop" && (
          <NewStop 
            tripId={currentTripId}
            onNavigate={handleNavigate}
            onBack={() => setCurrentScreen("my-trips")}
           />
        )}

        {/* trip-ai
         {currentScreen === "trip-ai" && (
          <TripAI 
            onBack={() => setCurrentScreen("dashboard")}
           />
        )} */}
    </>
  )};
  </>
 );
}
