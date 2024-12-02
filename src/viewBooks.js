import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; 

const ViewBooks = ({ showErrorToast }) => {
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [libraryName, setLibraryName] = useState('');
  const [libraryId, setLibraryId] = useState('');

useEffect(() => {
  const libraryIdFromUrl = new URLSearchParams(window.location.search).get('libraryId');
  if (!libraryIdFromUrl) {
    showErrorToast('No Library ID provided');
    return;
  }
  setLibraryId(libraryIdFromUrl);

  fetch(`http://127.0.0.1:5000/library/${libraryIdFromUrl}/books`)
    .then((response) => {
      if (!response.ok) {
        showErrorToast('Error fetching books');
        throw new Error('Error fetching books');
      }
      return response.json();
    })
    .then((data) => {
      if (data.error) {
        showErrorToast(data.error);
      } else {
        setBooks(data);
      }
    })
    .catch((error) => {
      console.error('Error fetching books:', error);
      showErrorToast('An error occurred while fetching books');
    });

  fetch(`http://127.0.0.1:5000/library/${libraryIdFromUrl}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        setLibraryName('Library not found');
      } else {
        setLibraryName(data.title);
      }
    })
    .catch((error) => {
      console.error('Error fetching library data:', error);
      setLibraryName('Error fetching library data');
    });
}, [showErrorToast]);


  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredBooks = books.filter((book) =>
    book.title && book.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displaySuggestions = () => {
    if (!searchQuery || filteredBooks.length === 0) return null;

    return filteredBooks.map((book) => (
      <li
        key={book.book_id}
        className="list-group-item"
        onClick={() => setSearchQuery(book.title)}
      >
        {book.title}
      </li>
    ));
  };

  const displayBooks = () => {
    return filteredBooks.map((book) => (
      <tr key={book.book_id}>
        <td>{book.book_id}</td>
        <td>{book.title}</td>
        <td>{book.author}</td>
        <td>{book.isbn}</td>
        <td>{book.status}</td>
        <td>{book.lent_to}</td>
        <td>{book.lent_date}</td>
        <td>{book.ebook}</td>
      </tr>
    ));
  };

  return (
    <div>
      <div className="container my-5">
        <h1 className="text-center mb-4 newams">{libraryName}</h1>
        <h2 className="text-center mb-4 newams">View books</h2>
        <div className="d-flex mb-3">
          <div className="input-group mb-3">
            <input
              type="text"
              id="search-bar"
              className="form-control"
              placeholder="Search books..."
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

        <table id="books-list" className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Author</th>
              <th>ISBN</th>
              <th>Status</th>
              <th>Member Book is Lent to</th>
              <th>Lent Date</th>
              <th>eBook</th>
            </tr>
          </thead>
          <tbody>{displayBooks()}</tbody>
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

export default ViewBooks;
