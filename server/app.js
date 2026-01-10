const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const authenticateToken = require('./Middlewares/auth');
const isAdmin = require('./Middlewares/isAdmin'); 

const app = express();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// db
async function testDB() {
  try {
    const [rows] = await pool.query('SELECT 1+1 AS result');
    console.log('DB connected:', rows[0]);
  } catch (err) {
    console.error('DB connection failed:', err);
    process.exit(1); 
  }
}
testDB();

// Create uploads dir
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads', { recursive: true });
}

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static('uploads'));

// auth routes
const authRoutesFactory = require('./routes/auth.routes');
const authRoutes = authRoutesFactory(pool);
app.use('/api/auth', authRoutes);

const upload = multer({
  storage: multer.diskStorage({
    destination: 'uploads/',
    filename: (_, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
  }),
  fileFilter: (_, file, cb) => {
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.mimetype)) {
      return cb(new Error('Only images'), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 2 * 1024 * 1024 }
});

// Verify trip ownership
async function verifyTripOwner(tripId, userId) {
  try {
    const [rows] = await pool.query(
      'SELECT trip_id FROM trips WHERE trip_id = ? AND user_id = ?',
      [tripId, userId]
    );
    return rows.length > 0;
  } catch (err) {
    console.error(err);
    return false;
  }
}


// Get user profile
app.get('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT user_id, first_name, last_name, email, phone_number, city, country, profile_photo, additional_info FROM users WHERE user_id = ?',
      [req.user.user_id]
    );

    if (!users.length) return res.status(404).json({ error: 'User not found' });
    res.json(users[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user profile
app.put('/api/users/profile', authenticateToken, upload.single('profile_photo'), async (req, res) => {
  try {
    const { first_name, last_name, phone_number, city, country, additional_info } = req.body;
    const profile_photo = req.file ? `/uploads/${req.file.filename}` : null;

    let query = `
      UPDATE users
      SET first_name=?, last_name=?, phone_number=?, city=?, country=?, additional_info=?
    `;
    const params = [first_name, last_name, phone_number, city, country, additional_info];

    if (profile_photo) {
      query += ', profile_photo=?';
      params.push(profile_photo);
    }

    query += ' WHERE user_id=?';
    params.push(req.user.user_id);

    await pool.query(query, params);
    res.json({ message: 'Profile updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get cities
app.get('/api/cities', async (req, res) => {
  try {
    const { search } = req.query;
    let q = 'SELECT * FROM cities WHERE 1=1';
    const p = [];
    if (search) {
      q += ' AND (city_name LIKE ? OR country LIKE ?)';
      p.push(`%${search}%`, `%${search}%`);
    }
    q += ' ORDER BY popularity_score DESC';
    const [cities] = await pool.query(q, p);
    res.json(cities);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get activities
app.get('/api/activities', async (req, res) => {
  try {
    const { city_id, category, search } = req.query;
    let q = 'SELECT * FROM activities WHERE 1=1';
    const p = [];
    if (city_id) { q += ' AND city_id=?'; p.push(city_id); }
    if (category) { q += ' AND category=?'; p.push(category); }
    if (search) { q += ' AND activity_name LIKE ?'; p.push(`%${search}%`); }
    q += ' ORDER BY popularity_score DESC';
    const [rows] = await pool.query(q, p);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new trip
app.post('/api/trips', authenticateToken, async (req, res) => {
  try {
    console.log('trip body:', req.body);  

    const { 
      trip_name, description, status, start_date, end_date, 
      total_budget, trip_mates, user_id
    } = req.body;

    // validtn
    if (!trip_name || !description || !status || !start_date || !end_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const [result] = await pool.query(
      `INSERT INTO trips (
        user_id, trip_name, description, status, start_date, 
        end_date, total_budget, trip_mates
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.user_id,  
        trip_name,
        description,
        status,
        start_date,
        end_date,
        total_budget || 0,  
        JSON.stringify(trip_mates || [])
      ]
    );

    const tripId = result.insertId;

    if(trip_mates && trip_mates.length > 0){
      const mateValues = trip_mates.filter(mate => mate && mate.trim())
                                   .map(mate => [tripId, mate.trim()]);
      console.log(mateValues);
    }

    const [rows] = await pool.query('SELECT * FROM trips WHERE trip_id = ?', [tripId]);
    res.json(rows[0]);
  } catch (err) {
    console.error('POST /api/trips error:', err);
    res.status(500).json({ error: err.message });
  }
});


// Get all trips for user
app.get('/api/trips', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT t.*, COUNT(ts.stop_id) AS stop_count
       FROM trips t LEFT JOIN trip_stops ts ON t.trip_id=ts.trip_id
       WHERE t.user_id=?
       GROUP BY t.trip_id
       ORDER BY t.created_at DESC`,
      [req.user.user_id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// // Get single trip
app.get('/api/trips/:id', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM trips WHERE trip_id=? AND (user_id=? OR is_public=TRUE)',
      [req.params.id, req.user.user_id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Trip not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete trip
app.delete('/api/trips/:id', authenticateToken, async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM trips WHERE trip_id=? AND user_id=?',
      [req.params.id, req.user.user_id]
    );
    if (!result.affectedRows) return res.status(404).json({ error: 'Trip not found' });
    res.json({ message: 'Trip deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// update trip
app.put('/api/trips/:id', authenticateToken, async(req, res) => {
  try{
    const {id} = req.params;
    const userId = req.user.user_id;
    const { 
      trip_name, description, status, start_date, end_date, 
      total_budget, trip_mates
    } = req.body;

    const [trip] = await pool.query(
      'SELECT * FROM trips WHERE trip_id = ? AND user_id = ?', [id, userId]
    );

    if(trip.length === 0){
      return res.status(404).json({error: 'Trip not found'});
    }
    
    const existingTrip = trip[0];

    // Update trip
    await pool.query(
      `UPDATE trips SET 
        trip_name = ?, description = ?, status = ?, 
        start_date = ?, end_date = ?, total_budget = ?, trip_mates = ?
        WHERE trip_id = ? AND user_id = ?`,
      [
        trip_name ?? existingTrip.trip_name,
        description ?? existingTrip.description,
        status ?? existingTrip.status,
        start_date ?? existingTrip.start_date,
        end_date ?? existingTrip.end_date,
        total_budget ?? existingTrip.total_budget,
        JSON.stringify(trip_mates ?? JSON.parse(existingTrip.trip_mates || '[]')),
        id,
        userId
      ]
    );

    // Return updated trip
    const [updatedTrip] = await pool.query(
      'SELECT * FROM trips WHERE trip_id = ? AND user_id = ?', 
      [id, req.user.user_id]
    );

    res.status(200).json({
      message: 'Trip updated successfully',
      trip: updatedTrip[0]
    });
  } catch(error){
    console.log('updated trip error:', error);
    res.status(500).json({error: 'Internal server error'})
  }
})

// singel trip stop
app.post('/api/trips/:id/stops', authenticateToken, async (req, res) => {
  try {
    const tripId = req.params.id;
    const userId = req.user.user_id;
    const {stop_name, work, amount, paid_by, grand_total} = req.body;
    
    const [trip] = await pool.query(
      'SELECT 1 FROM trips WHERE trip_id = ? AND user_id = ?',
      [tripId, userId]
    );

    if (trip.length === 0)
    return res.status(403).json({ error: 'Unauthorized' });
    
    const [result] = await pool.query(
      `INSERT INTO trip_stops 
       (trip_id, stop_name, work, amount, paid_by, grand_total, stop_order)
       VALUES (?, ?, ?, ?, ?, ?, 
         (SELECT COALESCE(MAX(stop_order),0)+1 FROM trip_stops WHERE trip_id=?)
       )`,
      [tripId, stop_name, work, amount, paid_by, grand_total, tripId]
    );

    const [rows] = await pool.query(
      'SELECT * FROM trip_stops WHERE stop_id = ?', 
      [result.insertId]
    )
    
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'server error'});
  }
});

// get multiple stops
app.get('/api/trips/:id/stops', authenticateToken, async (req, res) => {
  try {
    const tripId = req.params.id;
    const userId = req.user.user_id;
    
    // Verify ownership
    const [trip] = await pool.query(
      'SELECT 1 FROM trips WHERE trip_id = ? AND user_id = ?',
      [tripId, userId]
    );

    if (trip.length === 0) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const [rows] = await pool.query(
      `SELECT * FROM trip_stops 
       WHERE trip_id = ? 
       ORDER BY stop_order ASC`,
      [tripId]
    );

    res.json(rows);
  } catch (err) {
    console.error('Get stops error:', err);
    res.status(500).json({error: 'Internal server error'});
  }
});

// Add itinerary item
app.post('/api/stops/:stopId/itinerary', authenticateToken, async (req, res) => {
  try {
    const { activity_name, day_number, activity_time, estimated_cost, notes, item_order } = req.body;
    const [r] = await pool.query(
      `INSERT INTO itinerary_items 
       (stop_id, activity_name, day_number, activity_time, estimated_cost, notes, item_order)
       VALUES (?,?,?,?,?,?,?)`,
      [req.params.stopId, activity_name, day_number, activity_time, estimated_cost, notes, item_order]
    );
    res.status(201).json({ itinerary_id: r.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Budget update
app.post('/api/trips/:tripId/budget', authenticateToken, async (req, res) => {
  try {
    if (!(await verifyTripOwner(req.params.tripId, req.user.user_id)))
      return res.status(403).json({ error: 'Unauthorized' });

    const { category, estimated_amount, actual_amount, notes } = req.body;

    await pool.query(
      `INSERT INTO budget_breakdown (trip_id, category, estimated_amount, actual_amount, notes)
       VALUES (?,?,?,?,?)
       ON DUPLICATE KEY UPDATE estimated_amount=?, actual_amount=?, notes=?`,
      [
        req.params.tripId, category, estimated_amount, actual_amount, notes,
        estimated_amount, actual_amount, notes
      ]
    );
    res.json({ message: 'Budget updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Community trips
app.get('/api/community/trips', async (_, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT t.trip_id, t.trip_name, t.cover_photo, t.start_date, t.end_date,
              u.first_name, u.last_name
       FROM trips t
       JOIN users u ON t.user_id=u.user_id
       WHERE t.is_public=TRUE
       ORDER BY t.created_at DESC
       LIMIT 50`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
