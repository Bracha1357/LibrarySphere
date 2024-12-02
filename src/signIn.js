import React, { useState } from "react"
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom"

const SignIn = ({ showErrorToast }) => {
  const [libraryId, setLibraryId] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);

  const navigate = useNavigate()

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible)
  }

  const handleSubmit = () => {
    if (!libraryId || !password) {
      showErrorToast('Please enter both Library ID and Password');
      return;
    }

    fetch('http://127.0.0.1:5000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ libraryId, password }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          navigate(`/Library?libraryId=${encodeURIComponent(data.libraryId)}`)
        } else {
          showErrorToast('Password or Library ID is incorrect. Please try again.');
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }

  return (
    <div className="container-fluid">
      <div className="left-side side-images d-none d-md-block p-4">
        <img className="img-thumbnail" src="/images/library.png" alt="Children’s Library of Savannah Elementary" />
        <img className="img-thumbnail" src="/images/library2.png" alt="Wisdom Wellspring Library" />
        <img className="img-thumbnail" src="/images/library6.jpg" alt="Echo Valley Library" />
      </div>
      <div className="main-content">
        <h1 className="text-center newams">Welcome to LibrarySphere!</h1>
        <h2 className="text-center pb-5 newams">
          The Future of Library Management
        </h2>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <h3
                className="cav position-relative py-2 px-4 text-bg-dark border border-dark rounded-pill text-center"
              >
                To get started, please log in with your library credentials.
              </h3>
              <br />
            </div>
          </div>
        </div>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-4">
              <input
                className="form-control black"
                type="text"
                placeholder="Please Enter your Library Id"
                value={libraryId}
                onChange={(e) => setLibraryId(e.target.value)}
              /><br />
              <div className="password-container">
                <div className="input-group">
                  <input
                    className="form-control black"
                    type={passwordVisible ? "text" : "password"}
                    placeholder="Please Enter your Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <span
                    id="black"
                    className="input-group-text"
                    onClick={() => togglePasswordVisibility()}
                  >
                    👁️
                  </span>
                </div>
              </div><br />
              <div className="text-center">
                <button onClick={handleSubmit} className="btn btn-dark w-100">
                  Find Your Library
                </button><br /><br />
              </div>
            </div>
          </div>
        </div>
        <div id="library-name" className="text-center my-4"></div>
      </div>
      <div className="text-center">
        <Link to="/CreateAnAccount" className="text-dark">Not a part of our Library yet? Register here!</Link>
      </div>
      <div className="right-side side-images d-none d-md-block p-4">
        <img className="img-thumbnail" src="/images/library4.jpg" alt="The Knowledge Corner" />
        <img className="img-thumbnail" src="/images/library5.jpg" alt="The Reading Nook" />
        <img className="img-thumbnail" src="/images/library3.png" alt="The Learning Loft" />
      </div>
    </div>
  );
};

export default SignIn;
