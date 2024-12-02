import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; 

const ViewMembers = ({showErrorToast}) => {
  const [members, setMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [libraryName, setLibraryName] = useState('');
  const [libraryId, setLibraryId] = useState('');

  useEffect(() => {
    const libraryIdFromUrl = new URLSearchParams(window.location.search).get('libraryId');
    if (!libraryIdFromUrl) {
      alert('No Library ID provided');
      return;
    }
    setLibraryId(libraryIdFromUrl);

    fetch(`http://127.0.0.1:5000/library/${libraryIdFromUrl}/members`)
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
        } else {
          setMembers(data);
        }
      })
      .catch((error) => {
        console.error('Error fetching members:', error);
        alert('An error occurred while fetching members');
      });

    fetch(`http://127.0.0.1:5000/library/${libraryIdFromUrl}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          setLibraryName('Library not found');
        } else {
          setLibraryName(data.name);
        }
      })
      .catch((error) => {
        console.error('Error fetching library data:', error);
        setLibraryName('Error fetching library data');
      });
  }, []); 

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredMembers = members.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displaySuggestions = () => {
    if (!searchQuery || filteredMembers.length === 0) return null;

    return filteredMembers.map((member) => (
      <li
        key={member.member_id}
        className="list-group-item"
        onClick={() => setSearchQuery(member.name)}
      >
        {member.name}
      </li>
    ));
  };

  const displayMembers = () => {
    return filteredMembers.map((member) => (
      <tr key={member.member_id}>
        <td>{member.member_id}</td>
        <td>{member.name}</td>
      </tr>
    ));
  };

  return (
    <div>
      <div className="container my-5">
        <h1 className="text-center mb-4 newams">{libraryName}</h1>
        <h2 className="text-center mb-4 newams">View Members</h2>
        <div className="d-flex mb-3">
          <div className="input-group mb-3">
            <input
              type="text"
              id="search-bar"
              className="form-control"
              placeholder="Search members..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <span id="rounded" className="input-group-text">
              <i className="bi bi-search" id="search-button"></i>
            </span>
          </div>
          <ul
            id="search-suggestions"
            className="list-group position-absolute w-100"
            style={{ zIndex: 9999 }}
          >
            {displaySuggestions()}
          </ul>
        </div>

        <table id="members-list" className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
            </tr>
          </thead>
          <tbody>{displayMembers()}</tbody>
        </table>
      </div>
      <div className="text-center">
        <Link
          to={`/library?libraryId=${libraryId}`} 
          className="text-dark"
        >
          Return to home page
        </Link>
      </div>
    </div>
  );
};

export default ViewMembers;

