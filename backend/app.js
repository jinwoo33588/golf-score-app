const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const healthRouter = require('./routes/health');
const authRouter   = require('./routes/auth');
const roundRoutes  = require('./routes/roundRoutes'); // 이후 추가
const holeRoutes   = require('./routes/holeRoutes');   // 이후 추가
const statsRoutes  = require('./routes/statsRoutes');

const { auth }     = require('./middleware/auth');

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(cors({
  origin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(','),
  credentials: false,
}));

app.use('/api', healthRouter);
app.use('/api/auth', authRouter);


// 인증 필요한 것들
app.use('/api', roundRoutes);
app.use('/api', holeRoutes);
app.use('/api', auth, statsRoutes);


app.use((req, res) => res.status(404).json({ error: { message: 'Not Found' }}));
app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({ error: { message: err.message || 'Internal Server Error' }});
});

module.exports = app;
