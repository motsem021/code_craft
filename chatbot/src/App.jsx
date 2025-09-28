import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import Log_in from "./Component/Login/Log_in";
import SignUp from "./Component/Signup/Signup.jsx";
import Home from "./Component/Home/Home.jsx";
import Ai_Generate from "./Component/Ai_Generate/Ai_Generate.jsx";
import My_Articles from "./Component/My_Articles/My_Articles.jsx";
import ChatBot from "./Component/ChatBot/ChatBot.jsx";

function App() {
  

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/login" element={<Log_in />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/home" element={<Home />} />
        <Route path="/generate" element={<Ai_Generate />} />
        <Route path="/save"element={<My_Articles/>}/>
        <Route path="/chatbot"element={<ChatBot/>}/>
      </Routes>
    </Router>
  );
}

export default App;
