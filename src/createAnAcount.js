import React, { useState } from "react";

const CreateAnAccount = ({showErrorToast}) => {
  const [libraryName, setLibraryName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
  };

  const registerLibrary = async () => {
    if (!libraryName || !password || !confirmPassword) {
      showErrorToast('All fields are required');
      return;
    }
    if (password !== confirmPassword) {
      showErrorToast('The passwords entered do not match');
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:5000/library', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: libraryName, password
        }),
      });

      const result = await response.json();

      if (response.ok) {
        showErrorToast('Library registered successfully! Your Library Id is: ' + result.library_id + '. Make sure to save the id on your records because you need it to log in.');
        window.location.href = `/Library?libraryId=${result.library_id}`;
      } else {
        showErrorToast('Error: ' + result.error);
        console.error(result.error);
      }
    } catch (error) {
      showErrorToast('An unexpected error occurred: ' + error.message);
      console.error('An unexpected error occurred:', error);
    }
  };

  return (
    <div>
      <div className="text-center">
        <h1 className="newams">Welcome aboard LibrarySphere, </h1>
        <h2 className="newams">we can't wait for you to join us!</h2>
      </div>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <input
              id="libraryName"
              className="form-control black"
              type="text"
              placeholder="Please Enter your Library Name"
              value={libraryName}
              onChange={(e) => setLibraryName(e.target.value)}
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
                <span id="black" className="input-group-text" onClick={togglePasswordVisibility}>👁️</span>
              </div>
            </div><br />
            <div className="password-container">
              <div className="input-group">
                <input
                  className="form-control black"
                  type={confirmPasswordVisible ? "text" : "password"}
                  placeholder="Please confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <span id="black" className="input-group-text" onClick={toggleConfirmPasswordVisibility}>👁️</span>
              </div>
            </div><br />
            <div className="text-center">
              <button type="button" onClick={registerLibrary} className="btn btn-dark w-100">
                Register Your Library
              </button><br /><br />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAnAccount;
