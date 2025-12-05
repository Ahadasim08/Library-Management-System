// src/MyReservations.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/members';

function MyReservations({ user }) {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);
    const memberId = user.id; 

    const fetchReservations = async () => {
        setLoading(true);
        setMessage(null);
        try {
            const response = await axios.get(`${API_BASE_URL}/${memberId}/reservations`);
            setReservations(response.data);
        } catch (err) {
            setMessage({ type: 'danger', text: 'Failed to load reservations.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user.role === 'Member') {
            fetchReservations();
        } else {
            setLoading(false);
            setMessage({ type: 'info', text: 'Please log in as a Member to view this page.' });
        }
    }, [user.role, memberId]);


    // --- NEW: Handle Cancellation ---
    const handleCancelReservation = async (reservationId) => {
        if (window.confirm("Are you sure you want to cancel this reservation?")) {
            try {
                const res = await axios.delete(`http://localhost:5000/api/reserve/${reservationId}`);
                setMessage({ type: 'success', text: res.data.message });
                // Refresh the list after successful deletion
                fetchReservations(); 
            } catch (err) {
                setMessage({ type: 'danger', text: err.response?.data || 'Cancellation failed.' });
            }
        }
    };
    

    if (loading) return <p className="text-info">Loading your reservations...</p>;
    if (message && message.type === 'info') return <div className={`alert alert-${message.type}`}>{message.text}</div>;

    return (
        <div className="mt-4">
            <h2>Your Active Reservations</h2>
            {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}
            
            {reservations.length === 0 ? (
                <div className="alert alert-warning">You currently have no active reservations.</div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-striped">
                        <thead className="table-dark">
                            <tr>
                                <th>Reservation ID</th>
                                <th>Book Title</th>
                                <th>Date Reserved</th>
                                <th>Expiry Date</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reservations.map((res) => (
                                <tr key={res.ReservationID}>
                                    <td>{res.ReservationID}</td>
                                    <td><strong>{res.Title}</strong></td>
                                    <td>{new Date(res.ReservationDate).toLocaleDateString()}</td>
                                    <td>{new Date(res.ExpiryDate).toLocaleDateString()}</td>
                                    <td>
                                        <button 
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => handleCancelReservation(res.ReservationID)}
                                        >
                                            Cancel
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default MyReservations;