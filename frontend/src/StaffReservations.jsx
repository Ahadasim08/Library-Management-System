import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/staff/reservations/all';

function StaffReservations() {
    const [reservations, setReservations] = useState([]);

    const fetchReservations = async () => {
        try {
            const response = await axios.get(API_URL);
            // Filter to show only Pending requests first
            setReservations(response.data.filter(r => r.Status === 'Pending' || !r.Status));
        } catch (err) {
            console.error("Error fetching reservations:", err);
        }
    };

    useEffect(() => { fetchReservations(); }, []);

    const handleStatus = async (id, status) => {
        try {
            await axios.put(`http://localhost:5000/api/staff/reservations/${id}`, { status });
            alert(`Reservation ${status}`);
            fetchReservations(); // Refresh list
        } catch (err) {
            alert("Error updating status");
        }
    };

    return (
        <div className="card my-4">
            <div className="card-header bg-warning text-dark">
                <strong>Pending Reservation Requests</strong>
            </div>
            <div className="card-body p-0">
                <div className="table-responsive">
                    <table className="table table-sm table-hover mb-0">
                        <thead>
                            <tr>
                                <th>Book</th>
                                <th>Member</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reservations.map((res) => (
                                <tr key={res.ReservationID}>
                                    <td>{res.BookTitle}</td>
                                    <td>{res.MemberName}</td>
                                    <td>{new Date(res.ReservationDate).toLocaleDateString()}</td>
                                    <td>
                                        <button className="btn btn-xs btn-success me-1" onClick={() => handleStatus(res.ReservationID, 'Accepted')}>Accept</button>
                                        <button className="btn btn-xs btn-danger" onClick={() => handleStatus(res.ReservationID, 'Declined')}>Decline</button>
                                    </td>
                                </tr>
                            ))}
                            {reservations.length === 0 && <tr><td colspan="4" className="text-center p-3">No pending requests</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default StaffReservations;