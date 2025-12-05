const express = require('express');
const sql = require('mssql');
const cors = require('cors'); 

const app = express();
const PORT = 5000; 

// Middleware Setup
app.use(cors()); 
app.use(express.json()); 

// 1. SQL Server Configuration
const config = {
    server: 'DESKTOP-42EBPK9', 
    database: 'LibrarySystemDB', 
    user: 'sa', 
    password: '1234', 
    options: {
        encrypt: true, 
        trustServerCertificate: true, 
        enableArithAbort: true
    }
};

let pool;

// 2. Database Connection
async function startServer() {
    try {
        pool = await sql.connect(config);
        console.log('✅ Database connected successfully. Pool established.');
        app.listen(PORT, () => {
            console.log(`🚀 API Server running on http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('❌ FATAL ERROR: Database connection failed.');
        console.error(err.message);
        process.exit(1); 
    }
}

// ---------------------------------------------
// 3. API Endpoints (Routes)
// ---------------------------------------------

// --- Route 1: Fetch all books
app.get('/api/books', async (req, res) => {
    try {
        const result = await pool.request().query(`
            SELECT BookID, Title, Edition, PublicationYear, Price, AvailabilityStatus FROM Books;
        `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send('Error fetching book data.');
    }
});

// --- Route 2: Search books
app.get('/api/books/search', async (req, res) => {
    const { title } = req.query; 
    if (!title) return res.status(400).send('Title required.');
    try {
        const result = await pool.request()
            .input('searchTitle', sql.VarChar, '%' + title + '%')
            .query(`SELECT BookID, Title, Edition, PublicationYear, Price, AvailabilityStatus FROM Books WHERE Title LIKE @searchTitle;`);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send('Error searching books.');
    }
});

// --- Route 3: List active loans (Member View)
app.get('/api/loans/active', async (req, res) => {
    try {
        const result = await pool.request().query(`
            SELECT l.LoanID, rc.ReceiptID, l.LoanDate, l.ReturnDate, b.Title AS BookTitle, u.FullName AS MemberName
            FROM Loan l
            JOIN Receipt rc ON l.ReceiptID = rc.ReceiptID
            JOIN Books b ON rc.BookID = b.BookID
            JOIN Membership m ON rc.MemberID = m.MemberShipID
            JOIN [User] u ON m.UserID = u.UserID
            WHERE l.ReturnDate >= CAST(GETDATE() AS DATE);
        `); 
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send('Error fetching active loans.');
    }
});

// --- Route 4: Submit Reservation (Sets status to 'Pending')
app.post('/api/reserve', async (req, res) => {
    const { memberId, bookId } = req.body; 
    if (!memberId || !bookId) return res.status(400).send('Missing fields.');

    try {
        const bookCheck = await pool.request().input('bookId', sql.Int, bookId).query("SELECT AvailabilityStatus FROM Books WHERE BookID = @bookId");
        if (bookCheck.recordset.length === 0 || bookCheck.recordset[0].AvailabilityStatus !== 'Available') {
            return res.status(409).send('Book is not available.');
        }

        await pool.request()
            .input('memberId', sql.Int, memberId)
            .input('bookId', sql.Int, bookId)
            .input('today', sql.Date, new Date())
            .input('expiry', sql.Date, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
            .query(`INSERT INTO Reservation (MemberID, BookID, ReservationDate, ExpiryDate, Status) VALUES (@memberId, @bookId, @today, @expiry, 'Pending');`);

        res.status(201).send({ message: 'Reservation requested. Waiting for staff approval.' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error.');
    }
});

// --- Route 5: Get reservations for a specific member
app.get('/api/members/:memberId/reservations', async (req, res) => {
    try {
        const result = await pool.request()
            .input('memberId', sql.Int, req.params.memberId)
            .query(`
                SELECT r.ReservationID, b.Title, r.ReservationDate, r.ExpiryDate, r.Status
                FROM Reservation r JOIN Books b ON r.BookID = b.BookID
                WHERE r.MemberID = @memberId ORDER BY r.ReservationDate DESC;
            `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send('Error fetching reservations.');
    }
});

// --- Route 6: Cancel Reservation
app.delete('/api/reserve/:reservationId', async (req, res) => {
    try {
        const check = await pool.request().input('id', sql.Int, req.params.reservationId).query("SELECT BookID FROM Reservation WHERE ReservationID = @id");
        if (check.recordset.length === 0) return res.status(404).send('Not found.');
        
        const bookId = check.recordset[0].BookID;
        await pool.request().input('id', sql.Int, req.params.reservationId).query("DELETE FROM Reservation WHERE ReservationID = @id");
        // Ensure book is available if it was reserved
        await pool.request().input('bid', sql.Int, bookId).query("UPDATE Books SET AvailabilityStatus = 'Available' WHERE BookID = @bid AND AvailabilityStatus = 'Reserved'");
        
        res.send({ message: 'Reservation cancelled.' });
    } catch (err) {
        res.status(500).send('Error cancelling.');
    }
});

// --- Route 7: Genre Analytics
app.get('/api/analytics/genres', async (req, res) => {
    try {
        const result = await pool.request().query(`
            SELECT g.GenreName, COUNT(b.BookID) AS BookCount FROM Books b 
            JOIN Genre g ON b.GenreID = g.GenreID GROUP BY g.GenreName ORDER BY BookCount DESC;
        `); 
        res.json(result.recordset);
    } catch (err) { res.status(500).send('Error.'); }
});

// --- Route 8: Top Borrowed Books
app.get('/api/analytics/top-borrowed', async (req, res) => {
    try {
        const result = await pool.request().query(`
            SELECT TOP 10 b.BookID, b.Title, COUNT(rc.ReceiptID) AS TimesBorrowed FROM Receipt rc 
            JOIN Books b ON rc.BookID = b.BookID GROUP BY b.BookID, b.Title ORDER BY TimesBorrowed DESC;
        `); 
        res.json(result.recordset);
    } catch (err) { res.status(500).send('Error.'); }
});

// --- Route 9: Staff - All Checked Out Loans
app.get('/api/staff/loans/checkedout', async (req, res) => {
    try {
        const result = await pool.request().query(`
            SELECT l.LoanID, b.Title AS BookTitle, u.FullName AS MemberName, l.LoanDate, l.ReturnDate, b.AvailabilityStatus
            FROM Loan l JOIN Receipt rc ON l.ReceiptID = rc.ReceiptID JOIN Books b ON rc.BookID = b.BookID
            JOIN Membership m ON rc.MemberID = m.MemberShipID JOIN [User] u ON m.UserID = u.UserID
            WHERE l.ReturnDate >= CAST(GETDATE() AS DATE) ORDER BY l.ReturnDate ASC;
        `);
        res.json(result.recordset);
    } catch (err) { res.status(500).send('Error.'); }
});

// --- Route 10: Staff - All Reservations
app.get('/api/staff/reservations/all', async (req, res) => {
    try {
        const result = await pool.request().query(`
            SELECT r.ReservationID, b.Title AS BookTitle, u.FullName AS MemberName, r.ReservationDate, r.ExpiryDate, r.Status
            FROM Reservation r JOIN Books b ON r.BookID = b.BookID JOIN Membership m ON r.MemberID = m.MemberShipID
            JOIN [User] u ON m.UserID = u.UserID ORDER BY r.ReservationDate ASC;
        `);
        res.json(result.recordset);
    } catch (err) { res.status(500).send('Error.'); }
});

// --- Route 11: Staff - Status Counts
app.get('/api/analytics/status-count', async (req, res) => {
    try {
        const result = await pool.request().query(`
            SELECT AvailabilityStatus, COUNT(BookID) AS Total FROM Books GROUP BY AvailabilityStatus;
        `);
        res.json(result.recordset);
    } catch (err) { res.status(500).send('Error.'); }
});

// --- Route 12: Staff - Manage Reservation (Accept/Decline)
app.put('/api/staff/reservations/:id', async (req, res) => {
    const reservationId = req.params.id;
    const { status } = req.body; 

    try {
        if (status === 'Accepted') {
            await pool.request().input('id', sql.Int, reservationId).query("UPDATE Reservation SET Status = 'Accepted' WHERE ReservationID = @id");
            // Find book and mark Reserved
            const resData = await pool.request().input('id', sql.Int, reservationId).query("SELECT BookID FROM Reservation WHERE ReservationID = @id");
            if(resData.recordset.length > 0) {
                await pool.request().input('bid', sql.Int, resData.recordset[0].BookID).query("UPDATE Books SET AvailabilityStatus = 'Reserved' WHERE BookID = @bid");
            }
            res.send({ message: 'Reservation Accepted.' });
        } else if (status === 'Declined') {
            await pool.request().input('id', sql.Int, reservationId).query("UPDATE Reservation SET Status = 'Declined' WHERE ReservationID = @id");
            res.send({ message: 'Reservation Declined.' });
        }
    } catch (err) { res.status(500).send('Error.'); }
});

// --- Route 13: Staff - Fines Summary
app.get('/api/staff/fines/summary', async (req, res) => {
    try {
        const result = await pool.request().query(`
            SELECT u.UserID, u.FullName, COUNT(f.FineID) AS PendingFinesCount, SUM(f.Amount) AS TotalFineAmount
            FROM Fine f JOIN Loan l ON f.LoanID = l.LoanID JOIN Receipt r ON l.ReceiptID = r.ReceiptID
            JOIN Membership m ON r.MemberID = m.MemberShipID JOIN [User] u ON m.UserID = u.UserID
            WHERE f.IsPaid = 0 OR f.IsPaid IS NULL
            GROUP BY u.UserID, u.FullName ORDER BY TotalFineAmount DESC;
        `);
        res.json(result.recordset);
    } catch (err) { res.status(500).send('Error.'); }
});

startServer();