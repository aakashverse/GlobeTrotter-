const express = require('express');
const jwt = require("jsonwebtoken");
const cors = require('cors');
const mysql = require('mysql2/promise');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const cookie = require("cookie");
const http = require("http");
const {Server} = require("socket.io");
require('dotenv').config();
const OpenAI = require("openai");

const authenticateToken = require('./Middlewares/auth');
const app = express();
const server = http.createServer(app);

// openai setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// const dbUrl = process.env.DATABASE_URL;
// if (!dbUrl) {
//   throw new Error("DATABASE_URL not set");
// }

// db
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

// DB test
async function testDB() {
    try {
      const conn = await pool.getConnection();
      console.log("MySQL connected");
      conn.release();
    } catch (err) {
      console.error("MySQL not ready yet");
    }
}
testDB();

// trip member?
async function isTripMember(tripId, user) {
  const fullName = `${user.first_name} ${user.last_name}`;

  const [rows] = await pool.query(
    `SELECT 1 FROM trips t
     LEFT JOIN trip_mates tm ON tm.trip_id = t.trip_id
     WHERE t.trip_id = ?
     AND (t.user_id = ? OR tm.mate_name = ?)`,
    [tripId, user.user_id, fullName]
  );

  return rows.length > 0;
}

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000",  process.env.CLIENT_URL ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  }
});

io.use(async (socket, next) => {
  try {
    const rawCookie = socket.handshake.headers.cookie;
    // console.log(rawCookie);

    if (!rawCookie) return next(new Error("No cookies provided"));
    
    const cookies = cookie.parse(rawCookie);
    const token = cookies.token;

    if(!token) throw new Error("Token missing")
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    
    // console.log('JWT user_id:', decoded.user_id); 
    
    const [rows] = await pool.query(
      `SELECT first_name, last_name FROM users WHERE user_id = ?`,
      [decoded.user_id]
    );

    // console.log('DB users found:', rows.length); 

    if (!rows.length) return next(new Error("user not found"));
 
    socket.user = {
      user_id: decoded.user_id,
      first_name: rows[0].first_name,
      last_name: rows[0].last_name
    };
    // console.log('Socket auth OK:', socket.user.user_id);
    next();
  } catch(err){
    console.log("Socket auth error: ", err.message);
    next(new Error("Unauthorized"));
  }
});

io.on("connection", (socket) => {
  console.log("user connected:", socket.user.user_id);

  socket.on("joinTrip", ({tripId}) => {
    socket.join(`trip_${tripId}`);
    console.log(`user ${socket.user.user_id} joined trip_${tripId}`);
    // console.log(`Room users:`, Object.keys(socket.adapter.rooms[`trip_${tripId}`] || {}).length);
  });

  socket.on("sendMessage", async({tripId, message, tempId}) => {
    if(!message?.trim()) return;

    const allowed = await isTripMember(tripId, socket.user);
    if (!allowed){
      socket.emit('error', 'Not authorized for this trip');
      return;
    };
    
    const [result] = await pool.query(
      `INSERT INTO trip_messages(trip_id, user_id, message) VALUES (?,?,?)`,
      [tripId, socket.user.user_id, message]
    );

    const chatMsg = {
        message_id: result.insertId,
        tempId,        // for frontend matching
        user_id: socket.user.user_id,
        first_name: socket.user.first_name,
        last_name: socket.user.last_name,
        message: message.trim(),
        created_at: new Date(),
        // delivered: false,
        // read: false
    };
    // console.log('Broadcasting to trip_', tripId, chatMsg);
    io.to(`trip_${tripId}`).emit("newMessage", chatMsg);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.user?.user_id);
  });
});

// Create uploads dir
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads', { recursive: true });
}

// Middleware - PERFECT ORDER
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', process.env.CLIENT_URL],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));

// Auth routes
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

// verifyTripOwner
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

// Profile routes
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

app.put('/api/users/profile', authenticateToken, upload.single('profile_photo'), async (req, res) => {
  try {
    const { first_name, last_name, phone_number, city, country, additional_info } = req.body;
    const profile_photo = req.file ? `/uploads/${req.file.filename}` : null;

    let query = `UPDATE users SET first_name=?, last_name=?, phone_number=?, city=?, country=?, additional_info=?`;
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

// Cities & Activities
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

// Create trip
app.post('/api/trips', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const {
      trip_name,
      description,
      status,
      start_date,
      end_date,
      destination,
      total_budget,
      trip_mates = []
    } = req.body;

    // Insert trip
    const [result] = await connection.query(
      `INSERT INTO trips (
        user_id, trip_name, description, status,
        start_date, end_date, destination, total_budget
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.user_id,
        trip_name,
        description,
        status,
        start_date,
        end_date,
        destination || null,
        total_budget || 0
      ]
    );

    const tripId = result.insertId;

    // Prepare mates
    const mates = new Set([
      `${req.user.first_name} ${req.user.last_name}`,
      ...trip_mates.map(m => m.trim()).filter(Boolean)
    ]);

    // Insert mates SAFELY
    for (const name of mates) {
      await connection.query(
        `INSERT INTO trip_mates (trip_id, mate_name)
         VALUES (?, ?)`,
        [tripId, name]
      );
    }

    await connection.commit();
    res.status(201).json({ trip_id: tripId });

  } catch (err) {
    await connection.rollback();
    console.error("Trip create error:", err);
    res.status(500).json({ error: "Failed to create trip" });
  } finally {
    connection.release();
  }
});

// Get trips
app.get('/api/trips', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT t.*, COUNT(ts.stop_id) AS stop_count
       FROM trips t LEFT JOIN trip_stops ts ON t.trip_id=ts.trip_id
       WHERE t.user_id=? GROUP BY t.trip_id ORDER BY t.created_at DESC`,
      [req.user.user_id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single trip
app.get('/api/trips/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [tripRows] = await pool.query('SELECT * FROM trips WHERE trip_id=?', [id]);
    const trip = tripRows[0];
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    
    const [mateRows] = await pool.query(
      `SELECT 1 FROM trip_mates WHERE trip_id = ? AND mate_name = ?`,
      [id, req.user.first_name + ' ' + req.user.last_name]
    );
    
    const isOwner = trip.user_id === req.user.user_id;
    const isMate = mateRows.length > 0;
    
    if (!(await isTripMember(id, req.user))) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json(trip);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// All trips (owned + joined)
app.get('/api/users/:user_id/trips', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const fullName = `${user.first_name} ${user.last_name}`;

    const [rows] = await pool.query(`
      SELECT DISTINCT t.*, 
        CASE 
          WHEN t.user_id = ? THEN 'owner'
          ELSE 'member'
        END AS role
      FROM trips t
      LEFT JOIN trip_mates tm ON tm.trip_id = t.trip_id
      WHERE t.user_id = ? OR tm.mate_name = ?
      ORDER BY t.created_at DESC
    `, [user.user_id, user.user_id, fullName]);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch trips' });
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

// Update trip
app.put('/api/trips/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;
    const { trip_name, description, status, start_date, end_date, total_budget, trip_mates } = req.body;

    const [tripRows] = await pool.query('SELECT * FROM trips WHERE trip_id = ? AND user_id = ?', [id, userId]);
    if (tripRows.length === 0) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    
    const existingTrip = tripRows[0];

    await pool.query(
      `UPDATE trips SET trip_name = ?, description = ?, status = ?, start_date = ?, end_date = ?, total_budget = ?
      WHERE trip_id = ? AND user_id = ?`,
      [
        trip_name ?? existingTrip.trip_name,
        description ?? existingTrip.description,
        status ?? existingTrip.status,
        start_date ?? existingTrip.start_date,
        end_date ?? existingTrip.end_date,
        total_budget ?? existingTrip.total_budget,
        id,
        userId
      ]
    );

    const [updatedTripRows] = await pool.query('SELECT * FROM trips WHERE trip_id = ? AND user_id = ?', [id, userId]);
    res.status(200).json({
      message: 'Trip updated successfully',
      trip: updatedTripRows[0]
    });
  } catch (error) {
    console.error('updated trip error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Add trip stop
app.post('/api/trips/:id/stops', authenticateToken, async (req, res) => {
  try {
    const tripId = req.params.id;
    const userId = req.user.user_id;
    const { stop_name, stop_activities, amount_spent, paid_by } = req.body;
    const amount = parseFloat(amount_spent) || 0;
    
    const [tripRows] = await pool.query('SELECT * FROM trips WHERE trip_id = ?', [tripId]);
    const trip = tripRows[0];
    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    const [mateRows] = await pool.query(
      `SELECT 1 FROM trip_mates WHERE trip_id = ? AND mate_name = ?`,
      [tripId, req.user.first_name + ' ' + req.user.last_name]
    );
    const isMate = mateRows.length > 0;

    const isOwner = trip.user_id === req.user.user_id;
    if (amount > 0 && !isOwner && !isMate) {
      return res.status(403).json({ error: 'Only owners/members can add expenses' });
    }

    const [maxOrderRows] = await pool.query(
      'SELECT COALESCE(MAX(stop_order), 0) as next_order FROM trip_stops WHERE trip_id = ?',
      [tripId]
    );
    const stopOrder = (maxOrderRows[0]?.next_order || 0) + 1;

    const [result] = await pool.query(
      `INSERT INTO trip_stops (trip_id, stop_name, stop_activities, amount_spent, paid_by, stop_order)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [tripId, stop_name, stop_activities, amount, paid_by, stopOrder]
    );

    const [newStopRows] = await pool.query('SELECT * FROM trip_stops WHERE stop_id = ?', [result.insertId]);
    res.status(201).json(newStopRows[0]);
  } catch (err) {
    res.status(500).json({ error: 'server error' });
  }
});

//  Get stops
app.get('/api/trips/:id/stops', authenticateToken, async (req, res) => {
  try {
    const tripId = req.params.id;
    const userId = req.user.user_id;

    if (!(await isTripMember(tripId, req.user))) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // const [rows] = await pool.query(
    //   `SELECT * FROM trip_stops WHERE trip_id = ? ORDER BY stop_order ASC`,
    //   [tripId]
    // );
    
    const [rows] = await pool.query(
      `SELECT stop_id, trip_id, stop_name, stop_activities, amount_spent, paid_by, grand_total, stop_order, created_at 
       FROM trip_stops 
       WHERE trip_id = ? 
       ORDER BY stop_order ASC, created_at ASC`,
      [tripId]
    );
    // const trip = tripRows[0];
    // if (!trip) return res.status(404).json({ error: 'Trip not found' });
 
    // const [mateRows] = await pool.query(
    //   `SELECT 1 FROM trip_mates WHERE trip_id = ? AND mate_name = ?`,
    //   [tripId, req.user.first_name + ' ' + req.user.last_name]
    // );
    
    res.json(rows);
  } catch (err) {
    console.error('Stops routy error:', err);
    res.status(500).json({ error: 'IFailed to fetch stops' });
  }
});


// get chat
app.get('/api/trips/:id/chat', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!(await isTripMember(id, req.user))) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    const [messages] = await pool.query(
      `SELECT m.message_id, m.message, m.created_at, u.first_name, u.last_name, u.user_id
       FROM trip_messages m JOIN users u ON u.user_id = m.user_id
       WHERE m.trip_id = ? ORDER BY m.created_at ASC`,
      [id]
    );

    res.json(messages);
  } catch (err) {
    // console.error('Chat error:', err);
    res.status(500).json({ error: 'Failed to fetch chat' });
  }
});

// Join trip
app.post('/api/trips/:id/join', authenticateToken, async (req, res) => {
  try {
    const tripId = req.params.id;
    const mateName = `${req.user.first_name} ${req.user.last_name}`;

    //  Check trip exists
    const [tripRows] = await pool.query(
      'SELECT 1 FROM trips WHERE trip_id = ?',
      [tripId]
    );

    if (tripRows.length === 0) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    // Check already joined
    const [mateRows] = await pool.query(
      'SELECT 1 FROM trip_mates WHERE trip_id = ? AND mate_name = ?',
      [tripId, mateName]
    );

    if (mateRows.length > 0) {
      return res.status(200).json({ message: 'Already joined' });
    }

    // Insert
    await pool.query(
      'INSERT INTO trip_mates (trip_id, mate_name) VALUES (?, ?)',
      [tripId, mateName]
    );

    res.json({
      success: true,
      message: 'Joined trip!',
      trip_id: tripId
    });

  } catch (error) {
    console.error('Join error:', error);
    res.status(500).json({ error: 'Failed to join' });
  }
});


// Chat POST
app.post('/api/trips/:id/chat', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ error: 'Message required' });
    }

    await pool.query(
      `INSERT INTO trip_messages (trip_id, user_id, message) VALUES (?, ?, ?)`,
      [id, req.user.user_id, message]
    );

    res.status(201).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// get trip mates
app.get('/api/trips/:id/mates', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    if (!(await isTripMember(id, req.user))) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const [mates] = await pool.query(
      `SELECT DISTINCT mate_name FROM trip_mates WHERE trip_id = ? ORDER BY mate_name`,
      [id]
    );
    
    res.json(mates.map(m => ({ mate_name: m.mate_name })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch mates' });
  }
});

//  route as trip AI
app.post('/api/trips/:tripId/ai-assistant', authenticateToken, async (req, res) => {
  try {
    const { tripId } = req.params;
    const { userQuery } = req.body;
    
    if (!userQuery?.trim()) {
      return res.status(400).json({ error: "Query is required" });
    }
    
    if (!(await isTripMember(tripId, req.user))) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    // console.log(req.body);

    const [trip]  = await pool.query('SELECT * FROM trips WHERE trip_id = ?', [tripId]);
    const [stops] = await pool.query('SELECT stop_name FROM trip_stops WHERE trip_id = ?', [tripId]);
    const [mates] = await pool.query('SELECT mate_name FROM trip_mates WHERE trip_id = ?', [tripId]);

    const context = `
      You are helping with a travel plan.
      Trip Name: ${trip[0]?.trip_name}
      Stops: ${stops.map(s => s.stop_name).join(', ') || 'None'}
      Trip Mates: ${mates.map(m => m.mate_name).join(', ')}
      Total Budget: ₹${trip[0]?.total_budget || 0}
      Destination Country/City: ${trip[0]?.destination || 'Not specified'}
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: `you are Trippy, a friendly travel assistant.
                    Use this trip context:\n${context}`
        },
        {
          role: "user",
          content: userQuery,
        },
      ],
      max_tokens: 800,
    });

    const result = response.choices[0].message.content;
    res.json({response: result})
    console.log(result);

  }catch(err) {
    console.error('AI Error:', err);

    if (err.status === 429) {
      return res.status(429).json({
        error: "AI is busy. Please wait a few seconds."
      });
    }

    res.status(500).json({ error: 'AI unavailable' });
  }
});

// analytics route (ADMIN ONLY)
app.get("/api/admin/analytics", authenticateToken, async (req, res) => {
  try {
    /* TOTAL USERS */
    const [[users]] = await pool.query(
      "SELECT COUNT(*) total FROM users"
    );

    /* ACTIVE USERS TODAY */
    const [[activeUsers]] = await pool.query(
      `SELECT COUNT(DISTINCT user_id) total
       FROM trips
       WHERE DATE(created_at) = CURDATE()`
    );

    /* TOTAL TRIPS */
    const [[trips]] = await pool.query(
      "SELECT COUNT(*) total FROM trips"
    );

    /* TRIPS BY STATUS */
    const [statusStats] = await pool.query(`
      SELECT status, COUNT(*) count
      FROM trips
      GROUP BY status
    `);

    /* POPULAR CITIES */
    const [popularCities] = await pool.query(`
      SELECT destination, COUNT(*) trips
      FROM trips
      GROUP BY destination
      ORDER BY trips DESC
      LIMIT 5
    `);

    /* TRIPS TIMELINE (LAST 7 DAYS) */
    const [tripsTimeline] = await pool.query(`
      SELECT 
      DATE(created_at) AS date,
      DAYNAME(created_at) AS day,
      COUNT(*) AS trips
      FROM trips
      WHERE created_at >= CURDATE() - INTERVAL 7 DAY
      GROUP BY DATE(created_at), DAYNAME(created_at)
      ORDER BY DATE(created_at);
    `);

    /* TOP COUNTRIES */
    const [topCountries] = await pool.query(`
      SELECT country, COUNT(*) users
      FROM users
      GROUP BY country
      ORDER BY users DESC
      LIMIT 5
    `);

    /* AVG TRIP DURATION */
    const [[avgTrip]] = await pool.query(`
      SELECT ROUND(AVG(DATEDIFF(end_date, start_date)), 1) avgDuration
      FROM trips
      WHERE end_date IS NOT NULL
    `);

    res.json({
      totalUsers: users.total,
      activeUsersToday: activeUsers.total,
      totalTrips: trips.total,
      avgTripDuration: avgTrip.avgDuration || 0,

      statusStats,
      popularCities,
      tripsTimeline,
      topCountries
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Analytics fetch failed" });
  }
});

// get itinerary
app.get('/api/trips/:id/itinerary', authenticateToken, async (req, res) => {
  const [stops] = await pool.query(`
    SELECT * 
    FROM trip_stops 
    WHERE trip_id = ? 
    ORDER BY stop_order
  `, [req.params.id]);
  
  // Parse JSON activities column
  const stopsWithActivities = stops.map(stop => ({
    ...stop,
    stop_activities: JSON.parse(stop.stop_activities || '[]')  // ✅ Direct JSON parse
  }));
  
  res.json({ stops: stopsWithActivities });
});

// new itinerary
app.post('/api/trips/:tripId/itinerary', authenticateToken, async (req, res) => {
  const { stops } = req.body;
  console.log("stop req body: ", stops);
  
  try {
    // Clear existing stops
    // await pool.query('DELETE FROM trip_stops WHERE trip_id = ?', [req.params.tripId]);
    
    // Insert new stops with activities as JSON
    for (let i = 0; i < stops.length; i++) {
      await pool.query(
        'INSERT INTO trip_stops (trip_id, city, start_date, end_date, amount_spent, stop_order, paid_by, grand_total, stop_activities) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [ 
          stops[i].id,
          stops[i].city, 
          stops[i].startDate, 
          stops[i].endDate, 
          stops[i].amount || 0, 
          stops[i]=i,
          stops[i].paid_by,
          stops[i].grand_total,
          JSON.stringify(stops[i].activities || []) 
        ]
      );
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Itinerary save error:', error);
    res.status(500).json({ error: 'Failed to save itinerary' });
  }
});

// expense and budget
app.get('/api/trips/:tripId/expenses', authenticateToken, async(req, res) => {
  const { tripId } = req.params;

  try {
    const [expenses] = await pool.query(
      `SELECT * FROM expenses 
       WHERE trip_id = ?
       ORDER BY expense_date DESC`,
      [tripId]
    );

    const [[summary]] = await pool.query(
      `SELECT SUM(amount) totalSpent FROM expenses WHERE trip_id = ?`,
      [tripId]
    );

    const [byCategory] = await pool.query(
      `SELECT category, SUM(amount) total
       FROM expenses
       WHERE trip_id = ?
       GROUP BY category`,
      [tripId]
    );

    const [byDate] = await pool.query(
      `SELECT expense_date AS date, SUM(amount) total
       FROM expenses
       WHERE trip_id = ?
       GROUP BY expense_date
       ORDER BY expense_date`,
      [tripId]
    );

    res.json({
      expenses,
      analytics: {
        totalSpent: summary.totalSpent || 0,
        byCategory,
        byDate
      }
    });

  } catch (err) {
    res.status(500).json({ error: 'Failed to load expenses' });
  }
});



// app.post('/api/trips/:tripId/budget', authenticateToken, async (req, res) => {
//   try {
//     if (!(await verifyTripOwner(req.params.tripId, req.user.user_id))) {
//       return res.status(403).json({ error: 'Unauthorized' });
//     }

//     const { category, estimated_amount, actual_amount, work } = req.body;

//     await pool.query(
//       `INSERT INTO budget_breakdown (trip_id, category, estimated_amount, actual_amount, work)
//        VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE estimated_amount=?, actual_amount=?, work=?`,
//       [req.params.tripId, category, estimated_amount, actual_amount, work, estimated_amount, actual_amount, work]
//     );
//     res.json({ message: 'Budget updated' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Server error' });
//   }

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
