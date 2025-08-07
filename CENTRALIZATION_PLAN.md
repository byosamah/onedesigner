# OneDesigner Centralization & Architecture Plan

## Executive Summary
This plan outlines a comprehensive approach to centralize and improve the OneDesigner codebase for better maintainability, scalability, and developer experience.

## Current State Analysis

### Pain Points Identified
1. **Duplicated Code**: Similar components and logic across client/designer/admin sections
2. **Scattered Configuration**: API keys, endpoints, and configs spread across files
3. **Inconsistent Patterns**: Different approaches for similar features
4. **Limited Reusability**: Components and utilities not easily shareable
5. **Type Safety Issues**: Some areas lacking proper TypeScript types
6. **State Management**: No centralized state management solution

## Proposed Centralized Architecture

### 1. Core Library Structure (`/src/lib`)
```
/src/lib/
├── core/
│   ├── config/           # All app configuration
│   ├── constants/        # App-wide constants
│   ├── types/           # Shared TypeScript types
│   └── utils/           # Utility functions
├── features/
│   ├── auth/            # Authentication logic
│   ├── matching/        # Match system
│   ├── payment/         # Payment processing
│   ├── designer/        # Designer features
│   ├── client/          # Client features
│   └── admin/           # Admin features
├── ui/
│   ├── components/      # Reusable components
│   ├── hooks/          # Custom React hooks
│   ├── layouts/        # Layout components
│   └── design-system/  # Theme & styling
└── services/
    ├── api/            # API client & utilities
    ├── database/       # Database utilities
    ├── email/          # Email service
    └── analytics/      # Analytics tracking
```

### 2. Centralized Components (`/src/components`)
```
/src/components/
├── common/
│   ├── Navigation/
│   ├── Footer/
│   ├── LoadingStates/
│   └── ErrorBoundaries/
├── forms/
│   ├── Input/
│   ├── Select/
│   ├── FileUpload/
│   └── FormBuilder/
├── data-display/
│   ├── Card/
│   ├── Table/
│   ├── List/
│   └── Stats/
└── feedback/
    ├── Toast/
    ├── Modal/
    ├── Alert/
    └── Progress/
```

### 3. Feature-Based Organization
```
/src/features/
├── matching/
│   ├── components/      # Match-specific components
│   ├── hooks/          # Match-specific hooks
│   ├── services/       # Match API calls
│   ├── types/          # Match types
│   └── utils/          # Match utilities
├── designer/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   └── types/
└── [other features...]
```

## Implementation Plan

### Phase 1: Foundation (Week 1)
1. **Create Core Structure**
   - Set up `/src/lib/core` with config, constants, types
   - Create centralized configuration system
   - Implement type definitions

2. **Centralize Configuration**
   ```typescript
   // /src/lib/core/config/index.ts
   export const config = {
     api: {
       baseUrl: process.env.NEXT_PUBLIC_API_URL,
       timeout: 30000,
     },
     features: {
       enableOptimizedMatching: true,
       enableProgressiveEnhancement: true,
     },
     design: {
       defaultTheme: 'dark',
       animations: true,
     }
   }
   ```

3. **Create Type System**
   ```typescript
   // /src/lib/core/types/index.ts
   export interface Designer { ... }
   export interface Client { ... }
   export interface Match { ... }
   export interface Brief { ... }
   ```

### Phase 2: Component Library (Week 2)
1. **Build Component System**
   - Extract common components
   - Create component documentation
   - Implement Storybook for component showcase

2. **Design System Enhancement**
   ```typescript
   // /src/lib/ui/design-system/theme.ts
   export const theme = {
     colors: { ... },
     spacing: { ... },
     typography: { ... },
     animations: { ... },
     components: {
       button: { ... },
       card: { ... },
       input: { ... }
     }
   }
   ```

3. **Create UI Kit**
   - Button variants
   - Form components
   - Layout components
   - Feedback components

### Phase 3: Service Layer (Week 3)
1. **API Client Centralization**
   ```typescript
   // /src/lib/services/api/client.ts
   export class ApiClient {
     private baseUrl: string
     private headers: HeadersInit
     
     async get<T>(endpoint: string): Promise<T> { ... }
     async post<T>(endpoint: string, data: any): Promise<T> { ... }
     async put<T>(endpoint: string, data: any): Promise<T> { ... }
     async delete(endpoint: string): Promise<void> { ... }
   }
   ```

2. **Service Modules**
   ```typescript
   // /src/lib/services/api/services/match.service.ts
   export class MatchService {
     async findMatch(briefId: string): Promise<Match> { ... }
     async unlockMatch(matchId: string): Promise<void> { ... }
     async getMatchHistory(clientId: string): Promise<Match[]> { ... }
   }
   ```

3. **State Management**
   ```typescript
   // /src/lib/core/state/store.ts
   import { create } from 'zustand'
   
   export const useAppStore = create((set) => ({
     user: null,
     theme: 'dark',
     setUser: (user) => set({ user }),
     setTheme: (theme) => set({ theme }),
   }))
   ```

### Phase 4: Feature Modules (Week 4)
1. **Refactor Features**
   - Move feature-specific code to `/src/features`
   - Create feature facades
   - Implement feature flags

2. **Create Feature APIs**
   ```typescript
   // /src/features/matching/index.ts
   export { MatchingProvider } from './context'
   export { useMatching } from './hooks'
   export { MatchCard, MatchList } from './components'
   export { matchingService } from './services'
   ```

### Phase 5: Testing & Documentation (Week 5)
1. **Testing Infrastructure**
   - Unit tests for utilities
   - Component tests
   - Integration tests
   - E2E tests

2. **Documentation**
   - API documentation
   - Component documentation
   - Architecture guide
   - Developer onboarding

## Benefits of Centralization

### 1. **Improved Maintainability**
- Single source of truth for components
- Easier to fix bugs and add features
- Consistent patterns across the app

### 2. **Better Developer Experience**
- Clear project structure
- Reusable components and utilities
- Type safety throughout

### 3. **Performance Optimization**
- Reduced bundle size through code sharing
- Better caching strategies
- Optimized rendering

### 4. **Scalability**
- Easy to add new features
- Modular architecture
- Clear separation of concerns

## Migration Strategy

### Step 1: Parallel Development
- Keep existing code working
- Build new centralized versions alongside
- Test thoroughly before switching

### Step 2: Gradual Migration
- Migrate one feature at a time
- Start with low-risk areas
- Monitor for issues

### Step 3: Cleanup
- Remove old code
- Update documentation
- Train team on new structure

## Code Examples

### Centralized Component Example
```typescript
// /src/components/common/Button/Button.tsx
import { theme } from '@/lib/ui/design-system'

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: React.ReactNode
  onClick?: () => void
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  onClick
}) => {
  const styles = theme.components.button[variant][size]
  
  return (
    <button
      className={styles}
      onClick={onClick}
      disabled={loading}
    >
      {loading ? <Spinner /> : children}
    </button>
  )
}
```

### Centralized Hook Example
```typescript
// /src/lib/ui/hooks/useTheme.ts
export const useTheme = () => {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const theme = getTheme(isDarkMode)
  
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    localStorage.setItem('theme', isDarkMode ? 'light' : 'dark')
  }
  
  return { theme, isDarkMode, toggleTheme }
}
```

### Centralized Service Example
```typescript
// /src/lib/services/api/base.service.ts
export abstract class BaseService {
  protected api: ApiClient
  
  constructor(api: ApiClient) {
    this.api = api
  }
  
  protected handleError(error: any): never {
    console.error('API Error:', error)
    throw new ApiError(error.message || 'An error occurred')
  }
}
```

## Success Metrics

1. **Code Reduction**: 30-40% less duplicated code
2. **Development Speed**: 2x faster feature development
3. **Bug Reduction**: 50% fewer bugs from consistency
4. **Type Coverage**: 100% type safety
5. **Test Coverage**: 80%+ test coverage

## Timeline

- **Week 1**: Foundation & Configuration
- **Week 2**: Component Library
- **Week 3**: Service Layer
- **Week 4**: Feature Modules
- **Week 5**: Testing & Documentation
- **Week 6**: Migration & Cleanup

## Next Steps

1. Review and approve this plan
2. Set up development branch
3. Begin Phase 1 implementation
4. Schedule weekly progress reviews
5. Prepare team training materials

---

This centralization will transform OneDesigner into a more maintainable, scalable, and developer-friendly codebase while preserving all existing functionality.