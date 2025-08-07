# OneDesigner Centralization TODO List

## 1. 🧭 Navigation & Layout Components

### What to Centralize:
- **35+ duplicate navigation headers**
- **35+ theme toggle implementations**
- **Atom logo SVG (repeated 35 times)**

### How to Centralize:
```typescript
// Create: /src/components/layout/Navigation.tsx
export const Navigation = ({ 
  showUserMenu = true,
  showThemeToggle = true 
}) => {
  const { theme, isDarkMode, toggleTheme } = useTheme()
  const { user } = useAuth()
  
  return (
    <nav className="px-8 py-4">
      <Logo />
      {showUserMenu && <UserMenu user={user} />}
      {showThemeToggle && <ThemeToggle />}
    </nav>
  )
}

// Create: /src/components/layout/Logo.tsx
export const Logo = () => (
  <Link href="/" className="flex items-center gap-2">
    <AtomIcon /> {/* SVG defined once */}
    <span>OneDesigner</span>
  </Link>
)

// Create: /src/components/layout/ThemeToggle.tsx
export const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme()
  // Single implementation
}
```

## 2. 🎨 Theme & Styling System

### What to Centralize:
- **Theme state management (35+ duplicates)**
- **Color values (#f0ad4e hardcoded 40+ times)**
- **Animation classes scattered everywhere**

### How to Centralize:
```typescript
// Create: /src/providers/ThemeProvider.tsx
export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useLocalStorage('theme', true)
  const theme = getTheme(isDarkMode)
  
  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

// Create: /src/lib/ui/animations.ts
export const animations = {
  fadeIn: 'animate-fadeIn',
  slideUp: 'animate-slideUp',
  pulse: 'animate-pulse',
  spin: 'animate-spin',
  scale: 'hover:scale-[1.02]'
}

// Create: /src/lib/ui/constants.ts
export const COLORS = {
  accent: '#f0ad4e',
  dark: {
    bg: '#212121',
    card: '#323232'
  }
}
```

## 3. 📦 Configuration & Constants

### What to Centralize:
- **Pricing packages (duplicated 3x)**
- **Design styles (duplicated 6x)**
- **Project types (duplicated 4x)**
- **Industries list (duplicated 5x)**

### How to Centralize:
```typescript
// Create: /src/lib/core/constants/pricing.ts
export const PRICING_PACKAGES = [
  {
    id: 'STARTER_PACK',
    name: 'Starter Pack',
    price: 5,
    credits: 3,
    popular: false
  },
  // ... other packages
] as const

// Create: /src/lib/core/constants/design.ts
export const DESIGN_STYLES = [
  { id: 'minimal', label: 'Minimal & Clean', emoji: '⚪' },
  { id: 'modern', label: 'Modern & Bold', emoji: '🔥' },
  // ...
] as const

export const PROJECT_TYPES = [
  { id: 'brand-identity', label: 'Brand Identity', emoji: '🎯' },
  // ...
] as const

export const INDUSTRIES = [
  'SaaS', 'Fintech', 'E-commerce', 'Healthcare',
  // ...
] as const
```

## 4. 🔌 API Layer & Services

### What to Centralize:
- **15+ duplicate authentication flows**
- **12+ session check patterns**
- **24 API routes with similar patterns**

### How to Centralize:
```typescript
// Create: /src/lib/services/api/base.ts
class ApiClient {
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`/api${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      },
      credentials: 'include'
    })
    
    if (!response.ok) {
      throw new ApiError(response)
    }
    
    return response.json()
  }
  
  get = <T>(endpoint: string) => this.request<T>(endpoint)
  post = <T>(endpoint: string, data: any) => 
    this.request<T>(endpoint, { method: 'POST', body: JSON.stringify(data) })
}

// Create: /src/lib/services/auth.service.ts
export const authService = {
  sendOTP: (email: string) => 
    api.post('/auth/send-otp', { email }),
    
  verifyOTP: (email: string, token: string) =>
    api.post('/auth/verify-otp', { email, token }),
    
  checkSession: () => 
    api.get('/auth/session'),
    
  logout: () =>
    api.post('/auth/logout')
}

// Create: /src/hooks/useAuth.ts
export const useAuth = () => {
  const { user, setUser } = useUserStore()
  
  const checkAuth = async () => {
    try {
      const session = await authService.checkSession()
      setUser(session.user)
    } catch {
      setUser(null)
    }
  }
  
  return { user, checkAuth, login, logout }
}
```

## 5. 📝 Form Components

### What to Centralize:
- **OTP input components (3x duplicates)**
- **Email input patterns**
- **Submit button states (19+ duplicates)**

### How to Centralize:
```typescript
// Create: /src/components/forms/OTPInput.tsx
export const OTPInput = ({ 
  length = 6,
  onComplete,
  error 
}) => {
  const [otp, setOtp] = useState(Array(length).fill(''))
  const inputRefs = useRef<HTMLInputElement[]>([])
  
  // Single implementation of paste, keyboard nav, etc.
  return (
    <div className="flex gap-3">
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={el => inputRefs.current[index] = el}
          value={digit}
          onChange={handleChange(index)}
          // ... all logic centralized
        />
      ))}
    </div>
  )
}

// Create: /src/components/forms/SubmitButton.tsx
export const SubmitButton = ({ 
  loading,
  loadingText,
  children,
  ...props 
}) => {
  const { theme } = useTheme()
  
  return (
    <button
      disabled={loading}
      className={cn(
        "font-bold py-4 px-12 rounded-xl",
        animations.scale,
        loading && "opacity-50 cursor-not-allowed"
      )}
      style={{ backgroundColor: theme.accent }}
      {...props}
    >
      {loading ? (
        <LoadingSpinner text={loadingText} />
      ) : (
        children
      )}
    </button>
  )
}
```

## 6. 🔄 Loading & Error States

### What to Centralize:
- **Loading button patterns (19+ duplicates)**
- **Error handling blocks (21+ duplicates)**
- **Loading page states**

### How to Centralize:
```typescript
// Create: /src/components/feedback/LoadingSpinner.tsx
export const LoadingSpinner = ({ 
  size = 'md',
  text 
}) => (
  <div className="flex items-center gap-2">
    <span className={cn("animate-spin", sizeMap[size])}>⚡</span>
    {text && <span>{text}</span>}
  </div>
)

// Create: /src/hooks/useErrorHandler.ts
export const useErrorHandler = () => {
  const { showToast } = useToast()
  
  const handleError = useCallback((error: unknown, context?: string) => {
    console.error(`Error in ${context}:`, error)
    
    const message = error instanceof Error 
      ? error.message 
      : 'An unexpected error occurred'
      
    showToast({
      type: 'error',
      title: 'Error',
      description: message
    })
  }, [showToast])
  
  return { handleError }
}

// Create: /src/components/feedback/ErrorBoundary.tsx
export class ErrorBoundary extends Component {
  // Global error boundary for React errors
}
```

## 7. 🗄️ Database & Supabase

### What to Centralize:
- **24 createServiceClient() calls**
- **Repeated query patterns**
- **Error handling for DB operations**

### How to Centralize:
```typescript
// Create: /src/lib/db/client.ts
export const db = {
  client: null as SupabaseClient | null,
  
  getClient() {
    if (!this.client) {
      this.client = createServiceClient()
    }
    return this.client
  },
  
  async query<T>(
    table: string,
    query: (q: any) => any
  ): Promise<T> {
    const { data, error } = await query(
      this.getClient().from(table)
    )
    
    if (error) throw new DatabaseError(error)
    return data
  }
}

// Create: /src/lib/db/repositories/designer.repo.ts
export const designerRepo = {
  findApproved: () =>
    db.query('designers', q => 
      q.select('*').eq('is_approved', true)
    ),
    
  findById: (id: string) =>
    db.query('designers', q => 
      q.select('*').eq('id', id).single()
    ),
    
  approve: (id: string) =>
    db.query('designers', q =>
      q.update({ is_approved: true }).eq('id', id)
    )
}
```

## 8. 🧪 Remove Test Duplicates

### What to Centralize:
- **15+ files in /test-redesign/**
- **Nearly identical to production files**

### How to Centralize:
```typescript
// Create: /src/lib/core/config/features.ts
export const FEATURES = {
  useRedesign: process.env.NEXT_PUBLIC_USE_REDESIGN === 'true'
}

// In components, use feature flags:
import { FEATURES } from '@/lib/core/config'

export const PurchasePage = () => {
  if (FEATURES.useRedesign) {
    return <RedesignedPurchase />
  }
  return <StandardPurchase />
}
```

## 9. 🎯 State Management

### What to Centralize:
- **User state across components**
- **Theme state**
- **Match data**
- **Client credits**

### How to Centralize:
```typescript
// Create: /src/store/index.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAppStore = create(
  persist(
    (set) => ({
      // User state
      user: null,
      setUser: (user) => set({ user }),
      
      // Theme state
      isDarkMode: true,
      toggleTheme: () => set(state => ({ 
        isDarkMode: !state.isDarkMode 
      })),
      
      // Match state
      currentMatch: null,
      setCurrentMatch: (match) => set({ currentMatch: match }),
      
      // Client state
      credits: 0,
      setCredits: (credits) => set({ credits })
    }),
    {
      name: 'onedesigner-storage'
    }
  )
)
```

## 10. 🛠️ Utility Functions

### What to Centralize:
- **Date formatting**
- **Number formatting**
- **Validation patterns**
- **String utilities**

### How to Centralize:
```typescript
// Create: /src/lib/utils/format.ts
export const format = {
  currency: (amount: number) => 
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount),
    
  date: (date: Date) =>
    new Intl.DateTimeFormat('en-US').format(date),
    
  percentage: (value: number) =>
    `${Math.round(value)}%`
}

// Create: /src/lib/utils/validation.ts
export const validate = {
  email: (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    
  otp: (otp: string) =>
    /^\d{6}$/.test(otp)
}
```

## Implementation Priority Order

### Phase 1: Core Infrastructure (Week 1)
1. ✅ ThemeProvider & useTheme hook
2. ✅ Navigation component
3. ✅ API client base class
4. ✅ Error handling system

### Phase 2: Common Components (Week 2)
5. ✅ Form components (OTPInput, SubmitButton)
6. ✅ Loading states
7. ✅ Constants & configurations

### Phase 3: Services & State (Week 3)
8. ✅ Auth service & hooks
9. ✅ State management (Zustand)
10. ✅ Database repository pattern

### Phase 4: Feature Migration (Week 4)
11. ✅ Match features
12. ✅ Designer features
13. ✅ Client features
14. ✅ Admin features

### Phase 5: Cleanup (Week 5)
15. ✅ Remove test-redesign duplicates
16. ✅ Update all imports
17. ✅ Remove old code
18. ✅ Add tests

## Success Metrics
- **Code reduction**: 60-70% less duplicate code
- **File count**: Reduce from ~100 to ~40 main files
- **Bundle size**: 40% smaller JavaScript bundle
- **Development speed**: 3x faster to add features
- **Bug reduction**: 60% fewer UI inconsistencies