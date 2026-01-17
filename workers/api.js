import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

// CORS middleware
app.use('*', cors({
  origin: (origin) => {
    // Allow Pages domains and localhost for testing
    if (!origin) return true
    if (origin.includes('.pages.dev') || origin.includes('localhost')) {
      return origin
    }
    return false
  },
  credentials: true,
}))

// Health check
app.get('/api/health', (c) => {
  return c.json({
    status: 'success',
    message: 'Bank API running on Cloudflare Workers',
    timestamp: new Date().toISOString(),
  })
})

// Simple auth routes (replace with your actual logic)
app.post('/api/auth/login', async (c) => {
  const { email, password } = await c.req.json()
  
  // TODO: Replace with actual authentication logic
  return c.json({
    message: 'Login endpoint - connect MongoDB here',
    email,
  })
})

app.post('/api/auth/signup', async (c) => {
  const body = await c.req.json()
  
  // TODO: Replace with actual signup logic
  return c.json({
    message: 'Signup endpoint - connect MongoDB here',
    ...body,
  })
})

app.get('/api/auth/logout', (c) => {
  return c.json({ message: 'Logged out' })
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
