
import './App.css';
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import Home from './pages/Home';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AddUser from './users/AddUser';
import ViewUser from './users/ViewUser';
import Login from './Login';
import EditUser from './users/EditUser';

function App() {
  return (
    <div className="App">
      <Router>


        <Routes>
          <Route path="/" element={<Login />} />

          <Route path="/home" element={<Home />} />
          <Route path="/adduser" element={<AddUser />} />
          <Route path="/viewuser/:id" element={<ViewUser />} />
          <Route path="/edituser/:id" element={<EditUser />} />
        </Routes>

      </Router>



    </div>
  );
}

export default App;
