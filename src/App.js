import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './styles.css';
import SignIn from './signIn.js';
import CreateAnAccount from './createAnAcount.js';
import Library from './library.js';
import ViewMembers from './viewMembers.js';
import ViewBooks from './viewBooks.js';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';

function App() {
  const showErrorToast = (message) => {
    toast.error(message, {
      position: "top-right",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
    });
  };

  const showSuccessToast = (message) => {
    toast.success(message, {
      position: "top-right",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
    });
  };

  return (
    <Router>
      <Routes>
        <Route path='/' element={<SignIn showErrorToast={showErrorToast} />} />
        <Route path='/CreateAnAccount' element={<CreateAnAccount showErrorToast={showErrorToast} />} />
        <Route path='/Library' element={<Library showErrorToast={showErrorToast} showSuccessToast={showSuccessToast} />} />
        <Route path='/ViewMembers' element={<ViewMembers showErrorToast={showErrorToast} />} />
        <Route path='/ViewBooks' element={<ViewBooks showErrorToast={showErrorToast} />} />
      </Routes>
      <ToastContainer />
    </Router>
  );
}

export default App;
