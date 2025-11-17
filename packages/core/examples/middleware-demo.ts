/**
 * Comprehensive Middleware Example
 * Demonstrates all built-in middlewares in CurisJS
 */

import {
  createApp,
  helmet,
  rateLimiter,
  csrf,
  sanitizer,
  bodyParser,
  compression,
  session,
  apiVersion,
  logger,
  cors,
  json,
  z,
} from '@curisjs/core';

const app = createApp();

// 1. Security Headers (should be first)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  }
}));

// 2. CORS (if needed)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

// 3. Compression
app.use(compression({
  threshold: 1024,
  preferredEncoding: 'gzip',
}));

// 4. Body Parser
app.use(bodyParser({
  json: { limit: 2 * 1024 * 1024 }, // 2MB
  form: true,
  text: true,
}));

// 5. Sanitizer (after body parser)
app.use(sanitizer({
  body: true,
  query: true,
  params: true,
  stripTags: true,
  escapeHtml: true,
}));

// 6. Session Management
app.use(session({
  secret: 'your-secret-key-here',
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 86400, // 24 hours
  }
}));

// 7. CSRF Protection
app.use(csrf({
  cookieName: '_csrf',
  headerName: 'x-csrf-token',
}));

// 8. Rate Limiting
app.use(rateLimiter({
  max: 100,
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: 'Too many requests from this IP',
}));

// 9. API Versioning
app.use(apiVersion({
  strategy: 'header',
  header: 'api-version',
  versions: ['1', '2'],
  default: '1',
}));

// 10. Logger (should be early but after parsers)
app.use(logger());

// Example Routes

// Simple GET endpoint
app.get('/api/health', (ctx) => {
  return json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: ctx.state.apiVersion,
  });
});

// POST with validation (manually call validator inside)
const createUserSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  age: z.number().min(18).max(120).optional(),
  role: z.enum(['user', 'admin']).default('user'),
});

app.post('/api/users', async (ctx) => {
  // Manual validation
  const result = createUserSchema.safeParse(await ctx.json());

  if (!result.success) {
    return json({
      error: 'Validation failed',
      issues: result.error.issues,
    }, { status: 422 });
  }

  const userData = result.data;

  // Access session (typed cast for example)
  const session = ctx.state.session as any;
  if (session) {
    session.lastAction = 'create_user';
  }

  return json({
    message: 'User created successfully',
    user: userData,
    sessionId: ctx.state.sessionId,
  });
});

// Query parameter validation
const searchSchema = z.object({
  q: z.string().min(1),
  page: z.string().optional(),
  limit: z.string().optional(),
  sort: z.enum(['asc', 'desc']).default('asc'),
});

app.get('/api/search', async (ctx) => {
  const url = new URL(ctx.request.url);
  const queryParams = Object.fromEntries(url.searchParams);

  const result = searchSchema.safeParse(queryParams);

  if (!result.success) {
    return json({
      error: 'Invalid query parameters',
      issues: result.error.issues,
    }, { status: 422 });
  }

  const { q, page, limit, sort } = result.data;

  return json({
    query: q,
    page: page ? parseInt(page) : 1,
    limit: limit ? Math.min(parseInt(limit), 100) : 20,
    sort,
    results: [], // Your search results here
  });
});

// API Versioning Example
app.get('/api/users/:id', (ctx) => {
  const version = ctx.state.apiVersion;
  const userId = ctx.params.id;

  if (version === '2') {
    // V2 response format
    return json({
      data: {
        id: userId,
        type: 'user',
        attributes: {
          name: 'John Doe',
          email: 'john@example.com',
        }
      },
      meta: {
        version: '2.0'
      }
    });
  }

  // V1 response format
  return json({
    id: userId,
    name: 'John Doe',
    email: 'john@example.com',
  });
});

// Protected route with session
app.get('/api/profile', (ctx) => {
  const session = ctx.state.session as any;

  if (!session?.userId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  return json({
    userId: session.userId,
    lastAction: session.lastAction,
  });
});

// CSRF token endpoint
app.get('/api/csrf-token', (ctx) => {
  return json({
    csrfToken: ctx.state.csrfToken,
  });
});

// Error handling middleware
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    console.error('Error:', error);

    return json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
});

export default app;
