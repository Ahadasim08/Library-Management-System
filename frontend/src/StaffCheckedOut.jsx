// src/StaffCheckedOut.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/staff/loans/checkedout';

function StaffCheckedOut() {
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLoans = async () => {
            try {
                const response = await axios.get(API_URL);
                setLoans(response.data);
            } catch (err) {
                console.error("Error fetching staff checked-out books:", err);
                setError("Failed to load Checked-Out Books data.");
            } finally {
                setLoading(false);
            }
        };
        fetchLoans();
    }, []);

    if (loading) return <p className="text-info">Loading active loans data...</p>;
    if (error) return <div className="alert alert-danger">{error}</div>;

    // Filter to count overdue books (ReturnDate is before today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdueCount = loans.filter(loan => new Date(loan.ReturnDate) < today).length;

    return (
        <div className="card my-4">
            <div className="card-header bg-danger text-white d-flex justify-content-between">
                <span>Total Active Loans</span>
                <span className={`badge ${overdueCount > 0 ? 'bg-light text-danger' : 'bg-light text-success'}`}>
                    Overdue: {overdueCount}
                </span>
            </div>
            <div className="card-body p-0">
                <div className="table-responsive" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    <table className="table table-sm table-striped mb-0">
                        <thead>
                            <tr>
                                <th>Loan ID</th>
                                <th>Book Title</th>
                                <th>Member</th>
                                <th>Due Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loans.map((loan) => {
                                const dueDate = new Date(loan.ReturnDate);
                                const isOverdue = dueDate < today;
                                return (
                                    <tr key={loan.LoanID} className={isOverdue ? 'table-danger' : ''}>
                                        <td>{loan.LoanID}</td>
                                        <td><strong>{loan.BookTitle}</strong></td>
                                        <td>{loan.MemberName}</td>
                                        <td>{dueDate.toLocaleDateString()}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default StaffCheckedOut;