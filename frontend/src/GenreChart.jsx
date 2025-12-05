// src/GenreChart.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/analytics/genres';

function GenreChart() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(API_URL);
                setData(response.data);
            } catch (err) {
                console.error("Error fetching analytics:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <p>Loading analytics data...</p>;
    if (data.length === 0) return <p>No genre data available.</p>;

    return (
        <div className="card my-4">
            <div className="card-header bg-secondary text-white">
                Book Distribution by Genre (Analytics)
            </div>
            <div className="card-body">
                <ul className="list-group list-group-flush">
                    {data.map((item, index) => (
                        <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                            {item.GenreName}
                            <span className="badge bg-primary rounded-pill">{item.BookCount}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default GenreChart;