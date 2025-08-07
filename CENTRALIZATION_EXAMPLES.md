# Centralization Implementation Examples

## Before vs After Examples

### 1. Navigation Component (Currently Duplicated)

**BEFORE**: Same navigation code in 10+ files
```typescript
// In /app/admin/page.tsx
<Link href="/" className="flex items-center gap-2 text-xl font-bold">
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"...>
    <circle cx="12" cy="12" r="1"/>
    <path d="M20.2 20.2c2.04-2.03..."/>
  </svg>
  OneDesigner
</Link>

// Theme toggle duplicated everywhere
<button onClick={toggleTheme} className="relative w-14 h-7...">
  {isDarkMode ? '🌙' : '☀️'}
</button>
```

**AFTER**: Single reusable component
```typescript
// /src/components/common/Navigation/Navigation.tsx
export const Navigation = () => {
  const { theme, isDarkMode, toggleTheme } = useTheme()
  
  return (
    <nav className="px-8 py-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Logo />
        <div className="flex items-center gap-8">
          <NavLinks />
          <UserMenu />
          <ThemeToggle />
        </div>
      </div>
    </nav>
  )
}

// Usage in any page:
import { Navigation } from '@/components/common'
<Navigation />
```

### 2. API Calls (Currently Scattered)

**BEFORE**: Direct fetch calls everywhere
```typescript
// In multiple files
const response = await fetch('/api/match/find', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ briefId }),
  credentials: 'include'
})
if (!response.ok) throw new Error('Failed')
const data = await response.json()
```

**AFTER**: Centralized service
```typescript
// /src/lib/services/api/match.service.ts
export const matchService = {
  async findMatch(briefId: string): Promise<Match> {
    return api.post('/match/find', { briefId })
  },
  
  async unlockMatch(matchId: string): Promise<UnlockResult> {
    return api.post(`/matches/${matchId}/unlock`)
  },
  
  async getMatches(): Promise<Match[]> {
    return api.get('/matches')
  }
}

// Usage:
const match = await matchService.findMatch(briefId)
```

### 3. Form Components (Currently Inline)

**BEFORE**: Form code repeated
```typescript
// Repeated in many files
<input
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  className="w-full px-6 py-4 rounded-xl..."
  style={{ backgroundColor: theme.nestedBg }}
/>
```

**AFTER**: Reusable form components
```typescript
// /src/components/forms/Input/Input.tsx
export const Input = ({ 
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  ...props 
}) => {
  const { theme } = useTheme()
  
  return (
    <div className="space-y-2">
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={cn(
          "w-full px-6 py-4 rounded-xl transition-all",
          error && "border-red-500"
        )}
        style={{ backgroundColor: theme.nestedBg }}
        {...props}
      />
      {error && <span className="text-red-500 text-sm">{error}</span>}
    </div>
  )
}

// Usage:
<Input
  type="email"
  value={email}
  onChange={setEmail}
  placeholder="Enter your email"
  error={errors.email}
/>
```

### 4. State Management (Currently Prop Drilling)

**BEFORE**: Passing user data through props
```typescript
// Parent component
const [user, setUser] = useState(null)
<ChildComponent user={user} />

// Child component  
<GrandchildComponent user={props.user} />

// Grandchild component
{props.user?.name}
```

**AFTER**: Global state management
```typescript
// /src/lib/core/state/user.store.ts
export const useUserStore = create((set) => ({
  user: null,
  isLoading: false,
  
  setUser: (user) => set({ user }),
  
  login: async (email, otp) => {
    set({ isLoading: true })
    try {
      const user = await authService.login(email, otp)
      set({ user, isLoading: false })
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },
  
  logout: () => {
    authService.logout()
    set({ user: null })
  }
}))

// Usage anywhere:
const { user, login, logout } = useUserStore()
```

### 5. Type Safety (Currently Loose)

**BEFORE**: Inconsistent types
```typescript
// Different files have different designer types
interface Designer {
  firstName?: string
  first_name?: string  // Snake case in some places
  lastname?: string    // Different naming
}
```

**AFTER**: Single source of truth
```typescript
// /src/lib/core/types/models.ts
export interface Designer {
  id: string
  firstName: string
  lastName: string
  email: string
  isApproved: boolean
  createdAt: Date
  // ... all fields properly typed
}

// /src/lib/core/types/api.ts
export interface ApiResponse<T> {
  data: T
  error?: string
  message?: string
}

// Usage with full type safety:
const response: ApiResponse<Designer> = await api.get('/designer/profile')
```

### 6. Error Handling (Currently Inconsistent)

**BEFORE**: Different error handling everywhere
```typescript
try {
  // do something
} catch (error) {
  console.error(error)
  alert('Something went wrong')
}
```

**AFTER**: Centralized error handling
```typescript
// /src/lib/core/errors/index.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message)
  }
}

// /src/lib/ui/hooks/useErrorHandler.ts
export const useErrorHandler = () => {
  const { showToast } = useToast()
  
  const handleError = (error: Error) => {
    if (error instanceof AppError) {
      showToast({
        type: 'error',
        title: 'Error',
        message: error.message
      })
    } else {
      showToast({
        type: 'error',
        title: 'Unexpected Error',
        message: 'Something went wrong. Please try again.'
      })
    }
    
    // Log to error tracking service
    errorTracker.log(error)
  }
  
  return { handleError }
}
```

### 7. Loading States (Currently Ad-hoc)

**BEFORE**: Different loading UI everywhere
```typescript
{isLoading && <div>Loading...</div>}
```

**AFTER**: Consistent loading components
```typescript
// /src/components/feedback/LoadingStates/index.tsx
export const LoadingSpinner = ({ size = 'md' }) => (
  <div className={cn('animate-spin', sizeClasses[size])}>
    <SpinnerIcon />
  </div>
)

export const LoadingCard = () => (
  <Card className="animate-pulse">
    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2" />
    <div className="h-4 bg-gray-300 rounded w-1/2" />
  </Card>
)

export const LoadingPage = ({ message = "Loading..." }) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <LoadingSpinner size="lg" />
      <p className="mt-4">{message}</p>
    </div>
  </div>
)
```

### 8. Configuration (Currently Hardcoded)

**BEFORE**: Magic numbers and strings everywhere
```typescript
// Hardcoded in files
const MATCH_SCORE_THRESHOLD = 70
const MAX_RETRIES = 3
const API_TIMEOUT = 30000
```

**AFTER**: Centralized configuration
```typescript
// /src/lib/core/config/constants.ts
export const MATCH_CONFIG = {
  SCORE_THRESHOLD: 70,
  MIN_CONFIDENCE: 0.8,
  MAX_ALTERNATIVES: 3,
  CACHE_TTL: 3600 // 1 hour
} as const

export const API_CONFIG = {
  TIMEOUT: 30000,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000
} as const

// /src/lib/core/config/features.ts
export const FEATURES = {
  PROGRESSIVE_MATCHING: process.env.NEXT_PUBLIC_ENABLE_PROGRESSIVE === 'true',
  DARK_MODE: true,
  ANALYTICS: process.env.NODE_ENV === 'production'
} as const
```

## Implementation Priority

### Quick Wins (1-2 days each)
1. Extract Navigation component
2. Create ThemeProvider
3. Centralize API configuration
4. Create common Button/Input components

### Medium Effort (3-5 days each)
1. Build service layer for API calls
2. Implement error handling system
3. Create form component library
4. Set up state management

### Long Term (1-2 weeks each)
1. Full feature modularization
2. Complete type system overhaul
3. Testing infrastructure
4. Documentation system

## Migration Checklist

- [ ] Set up new folder structure
- [ ] Create base components
- [ ] Implement theme system
- [ ] Build API service layer
- [ ] Add state management
- [ ] Create type definitions
- [ ] Write migration guide
- [ ] Update import paths
- [ ] Remove duplicate code
- [ ] Add tests
- [ ] Update documentation

This approach will make the codebase much more maintainable and scalable!