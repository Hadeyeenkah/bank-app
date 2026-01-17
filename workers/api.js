import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

// CORS middleware - dynamic origin based on environment
app.use('*', cors({
  origin: (origin) => {
    if (!origin) return true
    
    // Allow Cloudflare Pages domains
    if (origin.includes('.pages.dev')) return origin
    
    // Allow localhost for local development
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) return origin
    
    // Production domain (set via env var)
    const allowedDomain = import.meta.env.FRONTEND_URL
    if (allowedDomain && origin === allowedDomain) return origin
    
    return false
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
}))

// Health check
app.get('/api/health', (c) => {
  return c.json({
    status: 'success',
    message: 'Bank API running on Cloudflare Workers',
    timestamp: new Date().toISOString(),
    environment: c.env.NODE_ENV || 'production',
  })
})

// Authentication Routes
app.post('/api/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json()
    
    if (!email || !password) {
      return c.json({ status: 'error', message: 'Email and password required' }, 400)
    }
    
    // TODO: Connect to MongoDB and verify credentials
    // For now, return placeholder
    return c.json({
      status: 'error',
      message: 'MongoDB connection required - configure MONGODB_URI secret',
    }, 503)
  } catch (error) {
    return c.json({ status: 'error', message: error.message }, 400)
  }
})

app.post('/api/auth/signup', async (c) => {
  try {
    const body = await c.req.json()
    
    if (!body.email || !body.password) {
      return c.json({ status: 'error', message: 'Email and password required' }, 400)
    }
    
    // TODO: Connect to MongoDB and create user
    return c.json({
      status: 'error',
      message: 'MongoDB connection required - configure MONGODB_URI secret',
    }, 503)
  } catch (error) {
    return c.json({ status: 'error', message: error.message }, 400)
  }
})

app.post('/api/auth/logout', (c) => {
  return c.json({ status: 'success', message: 'Logged out' })
})

app.post('/api/auth/refresh', (c) => {
  return c.json({ status: 'error', message: 'Token refresh endpoint - implement with JWT' }, 501)
})

// Transactions Routes (placeholder)
app.get('/api/transactions', (c) => {
  return c.json({ status: 'error', message: 'MongoDB connection required' }, 503)
})

app.post('/api/transactions', async (c) => {
  return c.json({ status: 'error', message: 'MongoDB connection required' }, 503)
})

// 404 Handler
app.all('*', (c) => {
  return c.json({ status: 'error', message: 'Route not found' }, 404)
})

// Error handler
app.onError((err, c) => {
  console.error('API Error:', err)
  return c.json({
    status: 'error',
    message: err.message || 'Internal server error',
  }, 500)
})
})

// Placeholder for other routes
app.get('/api/transactions', (c) => {
  return c.json({ message: 'Transactions endpoint - connect MongoDB here' })
})

app.get('/api/transfers', (c) => {
  return c.json({ message: 'Transfers endpoint - connect MongoDB here' })
})

app.get('/api/bills', (c) => {
  return c.json({ message: 'Bills endpoint - connect MongoDB here' })
})

// 404 handler
app.all('*', (c) => {
  return c.json({ error: 'Not found' }, 404)
})

export default app
