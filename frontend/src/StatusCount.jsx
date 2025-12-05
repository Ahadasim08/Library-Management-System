import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/analytics/status-count';

function StatusCount() {
    const [statusData, setStatusData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(API_URL);
                setStatusData(response.data);
            } catch (err) {
                console.error("Error fetching status counts:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <p className="text-info">Loading status counts...</p>;
    
    // Helper function for styling based on status
    const getBadgeClass = (status) => {
        switch (status) {
            case 'Available': return 'bg-success';
            case 'Checked Out': return 'bg-danger';
            case 'Reserved': return 'bg-warning text-dark';
            default: return 'bg-secondary';
        }
    };

    return (
        <div className="card my-4 shadow-sm">
            <div className="card-header bg-info text-white">
                Book Availability Summary
            </div>
            <div className="card-body p-0">
                <ul className="list-group list-group-flush">
                    {statusData.map((item, index) => (
                        <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                            <strong>{item.AvailabilityStatus}</strong>
                            <span className={`badge ${getBadgeClass(item.AvailabilityStatus)} rounded-pill`}>
                                {item.Total}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default StatusCount;