import "./App.css";
import Home from "./Pages/Home";
import { Route } from "react-router-dom";
import Chat from "./Pages/Chat";
import React from "react";
import Reset from "./Component/PasswordReset/Reset";

function App() {
  return (
    <div className="App">
      <Route path="/" component={Home} exact />
      <Route path="/resetPassword" component={Reset} />
      <Route path="/chats" component={Chat} />
    </div>
  );
}

export default App;
