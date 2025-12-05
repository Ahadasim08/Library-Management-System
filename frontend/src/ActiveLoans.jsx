// LMS-Project/frontend/src/ActiveLoans.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/loans/active';

function ActiveLoans() {
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLoans = async () => {
            try {
                const response = await axios.get(API_BASE_URL);
                setLoans(response.data);
                setError(null);
            } catch (err) {
                setError("Failed to fetch active loans. Check if the backend /api/loans/active route is working.");
            } finally {
                setLoading(false);
            }
        };
        fetchLoans();
    }, []);

    if (loading) return <p className="text-info">Loading active loans...</p>;
    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <div className="mt-4">
            <h3 className="mb-4">Active Loans ({loans.length})</h3>
            
            {loans.length === 0 ? (
                <p className="alert alert-info">No books are currently overdue or checked out.</p>
            ) : (
                <div className="table-responsive">
                    <table className="table table-bordered table-sm table-striped">
                        <thead className="table-secondary">
                            <tr>
                                <th>Loan ID</th>
                                <th>Book Title</th>
                                <th>Member Name</th>
                                <th>Loan Date</th>
                                <th>Due Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loans.map((loan) => (
                                <tr key={loan.LoanID}>
                                    <td>{loan.LoanID}</td>
                                    <td><strong>{loan.BookTitle}</strong></td>
                                    <td>{loan.MemberName}</td>
                                    <td>{new Date(loan.LoanDate).toLocaleDateString()}</td>
                                    <td>
                                        <span className={`badge ${new Date(loan.ReturnDate) < new Date() ? 'bg-danger' : 'bg-warning text-dark'}`}>
                                            {new Date(loan.ReturnDate).toLocaleDateString()}
                                        </span>
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

export default ActiveLoans;