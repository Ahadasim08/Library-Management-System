import React, { useState, useEffect } from 'react';
import axios from 'axios'; 

const API_BASE_URL = 'http://localhost:5000/api/books'; 
const RESERVATIONS_URL = 'http://localhost:5000/api/members';

// IMPORTANT: Catalog now receives the 'user' object via props from App.jsx
function Catalog({ user }) {
  const [books, setBooks] = useState([]);
  const [userReservations, setUserReservations] = useState([]); // Store user's personal reservations
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(''); 
  const [message, setMessage] = useState(null); // State for reservation messages

  const fetchBooks = async (term = '') => {
    setLoading(true);
    setError(null);
    setMessage(null); 
    try {
      const endpoint = term 
        ? `${API_BASE_URL}/search?title=${term}` 
        : API_BASE_URL; 

      const response = await axios.get(endpoint); 
      setBooks(response.data); 
      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data from the API. Check backend connection.");
      setLoading(false);
    }
  };

  // Fetch the current user's reservations to see what they have pending
  const fetchUserReservations = async () => {
      if (user.role === 'Member') {
          try {
              const res = await axios.get(`${RESERVATIONS_URL}/${user.id}/reservations`);
              setUserReservations(res.data);
          } catch (err) {
              console.error("Error fetching user reservations:", err);
          }
      }
  };

  useEffect(() => {
    fetchBooks();
    fetchUserReservations();
  }, [user]); // Re-run if user changes

  // --- Handle Reservation Click ---
  const handleReserveClick = async (bookId) => {
      if (user.role !== 'Member') {
          setMessage({ type: 'warning', text: 'Only registered Members can reserve books.' });
          return;
      }
      
      const memberId = user.id;
      
      try {
          await axios.post('http://localhost:5000/api/reserve', {
              memberId,
              bookId,
          });

          setMessage({ type: 'success', text: 'Request sent! Waiting for staff approval.' });
          
          // Refresh both lists so the UI updates immediately
          fetchBooks(searchTerm); 
          fetchUserReservations();

      } catch (err) {
          const errorMessage = err.response?.data || 'Reservation failed.';
          setMessage({ type: 'danger', text: errorMessage });
      }
  };

  // Helper to check if the current user has a pending request for a specific book
  const isPendingForUser = (bookId) => {
      return userReservations.some(r => r.BookID === bookId && r.Status === 'Pending'); // Assuming your API returns BookID in reservation list
  };

  // Note: You might need to update your GET /api/members/:id/reservations route in server.js 
  // to include 'BookID' and 'Status' in the SELECT statement if it doesn't already.
  // Currently it selects: r.ReservationID, b.Title, r.ReservationDate, r.ExpiryDate, r.Status
  // Let's double check server.js. If BookID is missing, this check won't work perfectly without it.
  // PROPOSED FIX: I will assume we match by Title for now or you update the backend query.
  // Better yet, let's match by Title since that is available in your current route.
  const isPendingByTitle = (bookTitle) => {
      return userReservations.some(r => r.Title === bookTitle && r.Status === 'Pending');
  };


  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleSearchClick = () => fetchBooks(searchTerm);

  return (
    <div>
      {/* Search Bar */}
      <div className="input-group mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Search books by title..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <button 
            className="btn btn-primary" 
            onClick={handleSearchClick}
            disabled={loading}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}
      
      {loading && <p className="text-info">Loading book catalog...</p>}
      {error && <div className="alert alert-danger">{error}</div>}
      
      {!loading && books.length > 0 && (
        <>
        <h3 className="mb-4">Results: {books.length} books found</h3>
        <div className="table-responsive">
            <table className="table table-striped table-hover align-middle">
                <thead className="table-dark">
                    <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Edition</th>
                        <th>Year</th>
                        <th>Price</th>
                        <th>Status</th>
                        <th>Action</th> 
                    </tr>
                </thead>
                <tbody>
                    {books.map((book) => {
                        // Check if THIS user has a pending request for THIS book
                        const isPending = isPendingByTitle(book.Title);

                        return (
                        <tr key={book.BookID}>
                            <td>{book.BookID}</td>
                            <td><strong>{book.Title}</strong></td>
                            <td>{book.Edition}</td>
                            <td>{book.PublicationYear}</td>
                            <td>${book.Price}</td> 
                            <td>
                              <span className={`badge ${book.AvailabilityStatus === 'Available' ? 'bg-success' : book.AvailabilityStatus === 'Reserved' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                                  {book.AvailabilityStatus}
                              </span>
                            </td>
                            <td>
                              {/* Action Logic */}
                              {book.AvailabilityStatus === 'Available' && !isPending && user.role === 'Member' && (
                                <button 
                                  className="btn btn-sm btn-success"
                                  onClick={() => handleReserveClick(book.BookID)}
                                >
                                  Reserve
                                </button>
                              )}
                              
                              {/* Show Pending State if User requested it */}
                              {isPending && (
                                  <span className="badge bg-info text-dark">Waiting for Approval</span>
                              )}

                              {/* Show Unavailable if reserved by someone else (or approved) */}
                              {book.AvailabilityStatus !== 'Available' && !isPending && (
                                  <span className="text-muted">Unavailable</span>
                              )}
                              
                              {user.role === 'Staff' && <span className="text-muted">Staff View</span>}
                            </td>
                        </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
        </>
      )}
      
    </div>
  );
}

export default Catalog;