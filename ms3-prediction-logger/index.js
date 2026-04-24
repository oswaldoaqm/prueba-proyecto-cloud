const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/predictions';

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

const LogSchema = new mongoose.Schema({
  log_id: Number,
  modelo_id: Number,
  modelo_nombre: String,
  request_id: String,
  input_features: Object,
  prediccion_output: Number,
  probabilidad_clase: [Number],
  latencia_ms: Number,
  timestamp: Date,
  metadata: Object
}, { collection: 'prediction_logs' });

const Log = mongoose.model('Log', LogSchema);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'ms3-prediction-logger' });
});

app.post('/logs', async (req, res) => {
  try {
    const count = await Log.countDocuments();
    const doc = new Log({
      log_id: req.body.log_id || count + 1,
      modelo_id: req.body.modelo_id,
      modelo_nombre: req.body.modelo_nombre,
      request_id: req.body.request_id,
      input_features: req.body.input_features,
      prediccion_output: req.body.prediccion_output,
      probabilidad_clase: req.body.probabilidad_clase,
      latencia_ms: req.body.latencia_ms,
      timestamp: req.body.timestamp ? new Date(req.body.timestamp) : new Date(),
      metadata: req.body.metadata || {}
    });
    await doc.save();
    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/logs/modelo/:modelo_id', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const modelo_id = parseInt(req.params.modelo_id);
    const logs = await Log.find({ modelo_id })
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await Log.countDocuments({ modelo_id });
    res.json({ total, page, limit, logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/logs/estadisticas', async (req, res) => {
  try {
    const modelo_id = req.query.modelo_id ? parseInt(req.query.modelo_id) : null;
    const match = modelo_id ? { modelo_id } : {};
    const stats = await Log.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$modelo_id',
          total: { $sum: 1 },
          promedio_prediccion: { $avg: '$prediccion_output' },
          promedio_latencia: { $avg: '$latencia_ms' }
        }
      }
    ]);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/logs/drift', async (req, res) => {
  try {
    const dias = parseInt(req.query.dias) || 7;
    const desde = new Date();
    desde.setDate(desde.getDate() - dias);
    const stats = await Log.aggregate([
      { $match: { timestamp: { $gte: desde } } },
      {
        $group: {
          _id: {
            modelo_id: '$modelo_id',
            modelo_nombre: '$modelo_nombre',
            dia: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }
          },
          promedio_prediccion: { $avg: '$prediccion_output' },
          total: { $sum: 1 }
        }
      },
      { $sort: { '_id.dia': -1 } }
    ]);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log('MS3 running on port 3000');
});