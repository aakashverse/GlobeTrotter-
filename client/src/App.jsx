import { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";

import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import CreateTrip from "./components/NewTrip";
import MyTrip from "./components/MyTrip";
import Itinerary from "./components/Itinerary";
import Profile from "./components/Profile";
import Community from "./components/Community";
import City from "./components/City";
import Calendar from "./components/Calender";
import Admin from "./components/Admin";
import Popular from "./components/Popular";
import Header from "./components/Header";

import useAuth from "./hooks/useAuth";
import useToast from "./hooks/useToast";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState("login");
  const [selectedTrip, setSelectedTrip] = useState(null);

  const { user, isAuthenticated, authReady, login, logout } = useAuth();
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

  const handleBack = () =>{
    setCurrentScreen("/dashboard");
  }

  const handleCreateTrip = (tripData) =>{
    // console.log("trip created!")
    showSuccess("Trip created successfully!");
    setTimeout(() => {
      setCurrentScreen("dashboard"); // delay before redirect for better UX
    }, 1000); 
  }

  // User is authenticated and user object exists
  return (
    <>
      <Toaster position="top-right" />
      
      {!isAuthenticated || !user ?  (
        <Login
          onLogin={(user) => {
            login(user);
            setCurrentScreen("dashboard");
          }}
        />
      ) : (
      <>
      <Header
        user={user}
        onNavigate={setCurrentScreen}
        onLogout={async () => {
          await logout();
          setCurrentScreen("login");
        }}
      />

      {currentScreen === "dashboard" && (
        <Dashboard user={user} onNavigate={setCurrentScreen} />
      )}

      {currentScreen === "profile" && (
        <Profile user={user} onBack={() => setCurrentScreen("dashboard")} />
      )}

      {currentScreen === "create-trip" && (
        <CreateTrip onBack={handleBack} onCreateTrip={handleCreateTrip}/>
      )}

      {currentScreen === "my-trips" && (
        <MyTrip
          trip={selectedTrip}
          onSelectTrip={setSelectedTrip}
          onNavigate={setCurrentScreen}
        />
      )}

      {currentScreen === "build-itinerary" && (
        <Itinerary onBack={() => setCurrentScreen("my-trips")} />
      )}

      {currentScreen === "community" && (
        <Community onBack={() => setCurrentScreen("dashboard")} />
      )}

      {currentScreen === "calendar" && (
        <Calendar onBack={() => setCurrentScreen("dashboard")} />
      )}

      {currentScreen === "admin" && (
        <Admin onBack={() => setCurrentScreen("dashboard")} />
      )}

      {currentScreen === "city-search" && (
        <City onBack={() => setCurrentScreen("dashboard")} />
      )}

      {currentScreen === "popular" && (
        <Popular onBack={() => setCurrentScreen("dashboard")} />
      )}
    </>
  )};
  </>
 );
}
