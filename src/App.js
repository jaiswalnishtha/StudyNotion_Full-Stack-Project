import "./App.css";
import {Route, Routes, useNavigate } from "react-router-dom";
import Home from "./pages/Home"
import Navbar from "./components/common/Navbar"
import OpenRoute from "./components/core/Auth/OpenRoute"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import Catalog from "./pages/Catalog";
import { BrowserRouter } from "react-router-dom";
import ForgotPassword from "./pages/ForgotPassword";
import UpdatePassword from "./pages/UpdatePassword";
import VerifyEmail from "./pages/VerifyEmail";
import { useDispatch, useSelector } from "react-redux";
import About from "./pages/About";

function App() {
  return (
   <div className="w-screen min-h-screen bg-richblack-900 flex flex-col font-inter">
   <Navbar/>
    <Routes>
      <Route path="/" element={<Home/>} />
      <Route path = "catalog/:catalogName" element={<Catalog/>}/>
      <Route
          path="signup"
          element={
            <OpenRoute>
              <Signup />
            </OpenRoute>
          }
        />
    <Route
          path="login"
          element={
            <OpenRoute>
              <Login/>
            </OpenRoute>
          }
        />
    <Route
          path="forgot-password"
          element={
            <OpenRoute>
              <ForgotPassword />
            </OpenRoute>
          }
        />

    <Route
          path="update-password/:id"
          element={
            <OpenRoute>
              <UpdatePassword />
            </OpenRoute>
          }
        />

    <Route
          path="verify-email"
          element={
            <OpenRoute>
              <VerifyEmail />
            </OpenRoute>
          }
        />
    <Route
          path="about"
          element={

              <About />
 
          }
        />
    </Routes>
    

   </div>
  );
}

export default App;
