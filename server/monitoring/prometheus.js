// server/monitoring/prometheus.js
import prometheus from 'prom-client';

// Create metric collectors
const collectDefaultMetrics = prometheus.collectDefaultMetrics;
collectDefaultMetrics({ timeout: 5000 });

export const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

export const databaseQueryDuration = new prometheus.Histogram({
  name: 'db_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation', 'collection'],
  buckets: [0.01, 0.1, 0.5, 1, 2]
});

export const activeWebsockets = new prometheus.Gauge({
  name: 'active_websockets',
  help: 'Number of currently active WebSocket connections'
});

// Middleware to track request metrics
export const monitoringMiddleware = (req, res, next) => {
  const end = httpRequestDuration.startTimer();
  res.on('finish', () => {
    end({ 
      method: req.method, 
      route: req.route?.path || req.path, 
      status: res.statusCode 
    });
  });
  next();
};