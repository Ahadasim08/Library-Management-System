import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Catalog from './Catalog'; 
import MyReservations from './MyReservations';
import GenreChart from './GenreChart';
import StaffReservations from './StaffReservations'; 
import StaffCheckedOut from './StaffCheckedOut'; 
import StatusCount from './StatusCount';
import StaffFines from './StaffFines'; 

// Dashboard Component (Admin View)
const Dashboard = ({ userRole }) => (
    <div className="mt-4">
        {userRole === 'Staff' ? (
            <>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2>Staff Dashboard</h2>
                    <span className="text-muted">Overview & Management</span>
                </div>
                
                {/* Section 1: Key Metrics & Current Status */}
                <div className="row mb-4">
                    <div className="col-md-8">
                         {/* Active Loans takes more space as it might have more columns/data */}
                        <StaffCheckedOut /> 
                    </div>
                    <div className="col-md-4">
                        {/* Quick look at book availability status */}
                        <StatusCount /> 
                    </div>
                </div>

                {/* Section 2: Action Items (Reservations) */}
                <div className="row mb-4">
                    <div className="col-12">
                        <StaffReservations /> 
                    </div>
                </div>

                {/* Section 3: Analytics & Financials */}
                <div className="row">
                    <div className="col-md-6">
                        <h4 className="mb-3 text-secondary">Library Analytics</h4>
                        <GenreChart />
                    </div>
                    <div className="col-md-6">
                         <h4 className="mb-3 text-secondary">Financials</h4>
                        {/* Fines Table */}
                        <StaffFines /> 
                    </div>
                </div>
            </>
        ) : (
            // --- MEMBER VIEW WITH BANNER ---
            <div>
                {/* Hero Banner Section */}
                <div 
                    className="p-5 text-center bg-image rounded-3 shadow-sm mb-5" 
                    style={{ 
                        // Ensure your image is in the 'public' folder with this EXACT name
                        backgroundImage: "url('/Gemini_Generated_Image_419ep8419ep8419e.png')", 
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        height: '400px',
                        position: 'relative',
                        color: 'white'
                    }}
                >
                    {/* Dark Overlay for text readability */}
                    <div className="mask" style={{ 
                        backgroundColor: 'rgba(0, 0, 0, 0.6)', 
                        position: 'absolute', top: 0, bottom: 0, left: 0, right: 0,
                        borderRadius: '0.3rem'
                    }}></div>

                    {/* Content sitting on top of the overlay */}
                    <div className="d-flex justify-content-center align-items-center h-100" style={{ position: 'relative', zIndex: 1 }}>
                        <div className="text-white">
                            <h1 className="mb-3 display-3 fw-bold">Welcome to the Library</h1>
                            <h4 className="mb-3">Discover thousands of books, manage your loans, and reserve your next read.</h4>
                            <div className="mt-4">
                                <Link className="btn btn-outline-light btn-lg px-4" to="/catalog" role="button">
                                    Browse Catalog
                                </Link>
                                <Link className="btn btn-primary btn-lg px-4 ms-3" to="/reservations" role="button">
                                    My Reservations
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Access Cards for Members */}
                <div className="row">
                    <div className="col-md-4">
                        <div className="card h-100 text-center p-3 border-0 shadow-sm">
                            <div className="card-body">
                                <h3 className="text-primary">📚</h3>
                                <h5 className="card-title">Extensive Catalog</h5>
                                <p className="card-text">Search through our vast collection of fiction, science, history, and more.</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card h-100 text-center p-3 border-0 shadow-sm">
                            <div className="card-body">
                                <h3 className="text-success">📅</h3>
                                <h5 className="card-title">Easy Reservations</h5>
                                <p className="card-text">Found a book you like? Reserve it instantly and pick it up at your convenience.</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card h-100 text-center p-3 border-0 shadow-sm">
                            <div className="card-body">
                                <h3 className="text-warning">⏳</h3>
                                <h5 className="card-title">Manage Loans</h5>
                                <p className="card-text">Keep track of your due dates and active loans directly from your dashboard.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
);

// Main Application Component
function App() {
  // Mock State Management: Start as a Member (ID 201)
  const [user, setUser] = useState({ id: 201, name: "Member User", role: "Member" });

  const loginAs = (role) => {
    // Member IDs start from 201; Staff IDs start from 1
    setUser({ 
        id: role === 'Staff' ? 1 : 201, 
        name: role === 'Staff' ? "Admin Staff" : "Member User",
        role: role 
    });
  };

  return (
    <Router>
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm sticky-top">
        <div className="container">
          <Link className="navbar-brand fw-bold" to="/">📚 Digital Library</Link>
          
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            {/* Nav Links based on Role */}
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link className="nav-link" to="/catalog">Book Catalog</Link>
              </li>
              {user.role === 'Staff' && (
                <li className="nav-item">
                  <Link className="nav-link" to="/dashboard">Staff Dashboard</Link>
                </li>
              )}
              {user.role === 'Member' && (
                <li className="nav-item">
                  <Link className="nav-link" to="/reservations">My Reservations</Link>
                </li>
              )}
            </ul>
            
            {/* Role Switcher / User Status */}
            <div className="d-flex align-items-center">
                <span className="navbar-text me-3 text-white">
                    Logged in as: <strong>{user.name} ({user.role})</strong>
                </span>
                <button 
                    className="btn btn-outline-light btn-sm" 
                    onClick={() => loginAs(user.role === 'Staff' ? 'Member' : 'Staff')}
                >
                    Switch to {user.role === 'Staff' ? 'Member' : 'Staff'} View
                </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mt-4 mb-5">
        <Routes>
          {/* Main Home and Dashboard routes */}
          <Route path="/" element={<Dashboard userRole={user.role} />} /> 
          <Route path="/dashboard" element={<Dashboard userRole={user.role} />} />
          
          {/* Component routes */}
          <Route path="/catalog" element={<Catalog user={user} />} />
          <Route path="/reservations" element={<MyReservations user={user} />} />
          
          <Route path="*" element={<h3 className="text-danger text-center mt-5">404: Page Not Found</h3>} />
        </Routes>
      </div>
      
      <footer className="footer bg-light mt-auto py-3 border-top">
          <div className="container text-center">
              <span className="text-muted">© 2025 Project | Library Management System</span>
          </div>
      </footer>
    </Router>
  );
}

export default App;