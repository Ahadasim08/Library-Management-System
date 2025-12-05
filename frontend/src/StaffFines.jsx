import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/staff/fines/summary';

function StaffFines() {
    const [fines, setFines] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(API_URL)
            .then(res => {
                setFines(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching fines:", err);
                setLoading(false);
            });
    }, []);

    if (loading) return <p className="text-muted">Loading fines...</p>;

    return (
        <div className="card my-4">
            <div className="card-header bg-danger text-white">
                <strong>Outstanding Fines (By Member)</strong>
            </div>
            <div className="card-body p-0">
                <div className="table-responsive" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    <table className="table table-sm table-hover mb-0">
                        <thead>
                            <tr>
                                <th>Member Name</th>
                                <th>Unpaid Count</th>
                                <th>Total Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fines.length > 0 ? (
                                fines.map((f, i) => (
                                    <tr key={i}>
                                        <td>{f.FullName}</td>
                                        <td>{f.PendingFinesCount}</td>
                                        <td className="text-danger fw-bold">${f.TotalFineAmount.toFixed(2)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="text-center p-2">No outstanding fines found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default StaffFines;