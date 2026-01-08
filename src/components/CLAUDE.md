# Component Architecture - CLAUDE.md

## Overview
OneDesigner's component system (`/src/components/`) implements a modern, reusable React component architecture with TypeScript, consistent design system integration, and role-based component organization.

## Component Structure

### Admin Components (`/admin/`)
**Purpose**: Administrative interface components for platform management

#### Key Components:
- **`AdminLoginForm.tsx`** - Admin authentication with OTP
- **`DesignerProfileModal.tsx`** - Detailed designer profile viewing
- **`DesignersTable.tsx`** - Paginated designer management table
- **`ApprovalActions.tsx`** - Designer approval/rejection controls

**Features**:
- Admin-specific styling and interactions
- Integrated approval workflow with EmailService
- Real-time status updates via DataService
- Comprehensive designer profile display with portfolio

#### Integration Example:
```typescript
const DesignersTable = () => {
  const [designers, setDesigners] = useState([])
  
  const handleApproval = async (designerId: string, approved: boolean) => {
    const response = await fetch(`/api/admin/designers/${designerId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ approved })
    })
    // Triggers EmailService notification to designer
    if (response.ok) refreshDesigners()
  }
  
  return (
    <Table>
      {designers.map(designer => (
        <DesignerRow 
          key={designer.id}
          designer={designer}
          onApprove={(approved) => handleApproval(designer.id, approved)}
        />
      ))}
    </Table>
  )
}
```

### Designer Components (`/designer/`)
**Purpose**: Designer dashboard and application flow components

#### Key Components:
- **`DesignerDashboard.tsx`** - Main dashboard with project requests
- **`ApplicationForm.tsx`** - 6-step designer application process
- **`WorkingRequestCard.tsx`** - Project request management
- **`ProfileEditor.tsx`** - Profile editing (triggers re-approval)

**Application Flow**:
1. **Step 1**: Basic information (name, email, title)
2. **Step 2**: Experience and expertise areas
3. **Step 3**: Portfolio URL and work samples
4. **Step 4**: Design categories and specializations  
5. **Step 5**: Tools and software proficiency
6. **Step 6**: Availability and pricing preferences

#### Working Request System:
```typescript
const WorkingRequestCard = ({ request }: { request: ProjectRequest }) => {
  const [timeRemaining, setTimeRemaining] = useState(
    calculateTimeRemaining(request.response_deadline)
  )
  
  const handleResponse = async (status: 'accepted' | 'declined') => {
    await fetch(`/api/designer/project-requests/${request.id}/respond`, {
      method: 'POST',
      body: JSON.stringify({ status })
    })
    // Triggers EmailService notification to client
  }
  
  return (
    <Card className="working-request-card">
      <div className="countdown-timer">
        Respond within: {formatTimeRemaining(timeRemaining)}
      </div>
      <BriefSnapshot brief={request.brief_snapshot} />
      <div className="actions">
        <Button onClick={() => handleResponse('accepted')}>Accept</Button>
        <Button onClick={() => handleResponse('declined')}>Decline</Button>
      </div>
    </Card>
  )
}
```

### Form Components (`/forms/`)
**Purpose**: Reusable form components with validation and state management

#### Key Components:
- **`BriefForm.tsx`** - Client brief creation (6 design categories)
- **`LoginForm.tsx`** - Universal login with OTP
- **`SignupForm.tsx`** - Registration flow
- **`OTPInput.tsx`** - 6-digit OTP input with auto-focus

#### Form Configuration Integration:
```typescript
// Uses centralized form config from /src/config/forms/
import { briefFormConfig } from '@/config/forms/brief.config'
import { designerFormConfig } from '@/config/forms/designer.config'

const BriefForm = ({ category }: { category: DesignCategory }) => {
  const formConfig = briefFormConfig[category] // Category-specific fields
  const [formData, setFormData] = useState(formConfig.defaultValues)
  
  return (
    <Form onSubmit={handleSubmit}>
      {formConfig.fields.map(field => (
        <FormField 
          key={field.name}
          config={field}
          value={formData[field.name]}
          onChange={(value) => updateField(field.name, value)}
        />
      ))}
    </Form>
  )
}
```

#### Design Categories Supported:
1. **Branding & Logo Design** - Brand identity, style guides
2. **Web & Mobile Design** - UI/UX, responsive design  
3. **Social Media Graphics** - Posts, stories, promotional content
4. **Motion Graphics** - Animations, video editing
5. **Photography & Video** - Product shots, marketing videos
6. **Presentations** - Pitch decks, corporate presentations

### Match Components (`/match/`)
**Purpose**: Designer matching and display components

#### Key Components:
- **`MatchCard.tsx`** - Designer match display with scoring
- **`MatchGrid.tsx`** - Grid layout for multiple matches
- **`ScoreIndicator.tsx`** - Visual AI match scoring (50-85%)
- **`UnlockButton.tsx`** - Credit-based designer unlock

#### AI Match Integration:
```typescript
const MatchCard = ({ match }: { match: DesignerMatch }) => {
  const [isUnlocking, setIsUnlocking] = useState(false)
  
  const handleUnlock = async () => {
    setIsUnlocking(true)
    const response = await fetch(`/api/client/matches/${match.id}/unlock`, {
      method: 'POST'
    })
    
    if (response.ok) {
      // BusinessRules validates credit deduction
      // DataService handles unlock tracking
      setMatch({ ...match, unlocked: true })
    }
    setIsUnlocking(false)
  }
  
  return (
    <Card className="match-card">
      <DesignerAvatar 
        src={match.unlocked ? match.designer.avatar_url : null}
        name={match.unlocked ? match.designer.name : `Designer ${match.designer.initials}`}
      />
      <ScoreIndicator score={match.score} reasons={match.reasons} />
      {!match.unlocked && (
        <UnlockButton 
          onClick={handleUnlock}
          loading={isUnlocking}
          cost={1} // 1 credit per unlock
        />
      )}
    </Card>
  )
}
```

### Modal Components (`/modals/`)
**Purpose**: Dialog and overlay components for complex interactions

#### Key Components:
- **`WorkingRequestModal.tsx`** - Send working requests to designers
- **`BriefViewerModal.tsx`** - Display complete project briefs
- **`SuccessModal.tsx`** - Success confirmations with auto-hide
- **`ContactDesignerModal.tsx`** - Designer contact interface

#### Working Request Flow:
```typescript
const WorkingRequestModal = ({ match, onClose }: WorkingRequestModalProps) => {
  const [message, setMessage] = useState(
    generateDefaultMessage(match.brief, match.designer)
  )
  
  const suggestedMessages = CONTACT_MESSAGES[match.brief.project_type] || []
  
  const handleSendRequest = async () => {
    const response = await fetch(`/api/client/matches/${match.id}/contact`, {
      method: 'POST',
      body: JSON.stringify({ message })
    })
    
    if (response.ok) {
      // Creates project_request with 72-hour deadline
      // Sends email notification via EmailService
      showSuccess('Working request sent successfully!')
      onClose()
    }
  }
  
  return (
    <Modal title="Send Working Request" onClose={onClose}>
      <div className="brief-context">
        <h4>{match.brief.project_type}</h4>
        <p>Budget: {match.brief.budget} | Timeline: {match.brief.timeline}</p>
      </div>
      
      <div className="suggested-messages">
        {suggestedMessages.map(suggestion => (
          <Button 
            key={suggestion}
            onClick={() => setMessage(suggestion)}
            variant="outline"
          >
            Use: "{suggestion.substring(0, 50)}..."
          </Button>
        ))}
      </div>
      
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Describe your project and what you're looking for..."
      />
      
      <div className="actions">
        <Button onClick={handleSendRequest} disabled={!message.trim()}>
          Send Working Request
        </Button>
        <Button onClick={onClose} variant="ghost">Cancel</Button>
      </div>
    </Modal>
  )
}
```

### Shared Components (`/shared/`)
**Purpose**: Reusable UI components used throughout the application

#### Core UI Components:
- **`Button.tsx`** - Variants: primary, secondary, outline, ghost
- **`Input.tsx`** - Form inputs with validation states
- **`Card.tsx`** - Container component with consistent styling
- **`Loading.tsx`** - Loading states and skeletons
- **`Avatar.tsx`** - User avatars with fallback initials
- **`Badge.tsx`** - Status indicators and labels

#### Theme Integration:
```typescript
// All shared components use centralized design system
import { theme } from '@/lib/design-system'

const Button = ({ variant = 'primary', ...props }: ButtonProps) => {
  const classes = cn(
    'px-4 py-2 rounded-lg font-medium transition-colors',
    {
      'bg-orange-400 text-white hover:bg-orange-500': variant === 'primary',
      'bg-gray-100 text-gray-900 hover:bg-gray-200': variant === 'secondary',
      'border border-gray-300 bg-transparent hover:bg-gray-50': variant === 'outline',
      'bg-transparent hover:bg-gray-100': variant === 'ghost'
    }
  )
  
  return <button className={classes} {...props} />
}
```

#### Status Components:
```typescript
const StatusBadge = ({ status }: { status: ApprovalStatus }) => {
  const config = {
    pending: { color: 'yellow', text: 'Under Review' },
    approved: { color: 'green', text: 'Approved' },
    rejected: { color: 'red', text: 'Rejected' },
    edited: { color: 'orange', text: 'Re-approval Required' }
  }
  
  const { color, text } = config[status]
  
  return (
    <Badge className={`bg-${color}-100 text-${color}-800`}>
      {text}
    </Badge>
  )
}
```

## Design System Integration

### Theme Provider
```typescript
// All components wrapped with theme context
<ThemeProvider theme={designSystem}>
  <Component />
</ThemeProvider>
```

### Consistent Styling
- **Colors**: Primary orange (#f0ad4e), grays, semantic colors
- **Typography**: System fonts with clear hierarchy
- **Spacing**: 4px base unit with consistent scale
- **Animations**: Subtle transitions and hover effects
- **Responsive**: Mobile-first with Tailwind breakpoints

### Component Variants
- **Size Variants**: sm, md, lg, xl for scalable components
- **State Variants**: default, hover, active, disabled, loading
- **Theme Variants**: light/dark mode support (ready)
- **Context Variants**: Different styling per user role

## State Management Integration

### Form State
```typescript
// Uses Jotai for global state management
import { useAtom } from 'jotai'
import { briefAtom, designerApplicationAtom } from '@/lib/atoms'

const BriefForm = () => {
  const [brief, setBrief] = useAtom(briefAtom)
  
  // Persistent across page navigation
  // Automatically saved to localStorage
  return <Form value={brief} onChange={setBrief} />
}
```

### Session State
- **Authentication**: User session data via React context
- **User Type**: Client, designer, admin role persistence
- **Preferences**: Theme, language, dashboard settings
- **Cache**: Component-level caching for performance

## Accessibility Implementation

### ARIA Support
- **Screen Readers**: Proper ARIA labels and descriptions
- **Keyboard Navigation**: Tab order and focus management
- **Color Contrast**: WCAG AA compliant color combinations
- **Form Accessibility**: Proper form labeling and error states

### Component Examples:
```typescript
const AccessibleButton = ({ 
  children, 
  onClick, 
  disabled = false,
  'aria-label': ariaLabel,
  ...props 
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel || children}
      className={`focus:outline-none focus:ring-2 focus:ring-orange-400 ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}
      {...props}
    >
      {children}
    </button>
  )
}
```

## Performance Optimization

### Component Optimization
- **React.memo**: Prevent unnecessary re-renders
- **useMemo/useCallback**: Memoize expensive calculations
- **Lazy Loading**: Dynamic imports for large components
- **Code Splitting**: Route-based component splitting

### Image Optimization
```typescript
import Image from 'next/image'

const OptimizedAvatar = ({ src, alt, size = 40 }) => {
  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className="rounded-full"
      loading="lazy"
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,..." // Generated blur placeholder
    />
  )
}
```

### Bundle Optimization
- **Tree Shaking**: Import only used components
- **Dynamic Loading**: Load components on demand
- **Asset Optimization**: Compressed images and icons
- **CSS Purging**: Remove unused Tailwind classes

## Testing Strategy

### Component Testing
```typescript
// Jest + React Testing Library
import { render, screen, fireEvent } from '@testing-library/react'
import { WorkingRequestModal } from './WorkingRequestModal'

describe('WorkingRequestModal', () => {
  const mockMatch = {
    id: 'match-1',
    designer: { name: 'John Doe' },
    brief: { project_type: 'Branding', budget: '$1000-$2500' }
  }
  
  it('sends working request with message', async () => {
    const onClose = jest.fn()
    
    render(<WorkingRequestModal match={mockMatch} onClose={onClose} />)
    
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'I need help with my branding project' }
    })
    
    fireEvent.click(screen.getByText('Send Working Request'))
    
    expect(fetch).toHaveBeenCalledWith('/api/client/matches/match-1/contact', {
      method: 'POST',
      body: JSON.stringify({ message: 'I need help with my branding project' })
    })
  })
})
```

### Visual Testing
- **Storybook**: Component documentation and visual testing
- **Chromatic**: Visual regression testing
- **Accessibility Testing**: axe-core integration

## Error Boundary Integration

### Global Error Handling
```typescript
const ComponentErrorBoundary = ({ children }) => {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        // Integration with LoggingService
        logger.error('Component error', error, {
          componentStack: errorInfo.componentStack,
          errorBoundary: true
        })
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <div className="error-fallback">
      <h2>Something went wrong</h2>
      <p>{error.message}</p>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  )
}
```

## Mobile Responsiveness

### Responsive Design Patterns
- **Mobile-First**: Tailwind mobile-first breakpoint system
- **Touch Targets**: 44px minimum touch targets
- **Responsive Typography**: Fluid text scaling
- **Flexible Layouts**: Flex and grid with responsive breakpoints

### Component Adaptations:
```typescript
const ResponsiveMatchGrid = ({ matches }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {matches.map(match => (
        <MatchCard key={match.id} match={match} />
      ))}
    </div>
  )
}

const MobileWorkingRequestModal = ({ ...props }) => {
  const isMobile = useMediaQuery('(max-width: 768px)')
  
  return (
    <Modal 
      fullScreen={isMobile}
      position={isMobile ? 'bottom' : 'center'}
      {...props}
    />
  )
}
```

## Integration with Centralized Services

### DataService Integration
```typescript
const useDesignerMatches = (clientId: string) => {
  const [matches, setMatches] = useState([])
  
  useEffect(() => {
    const fetchMatches = async () => {
      // Uses DataService with caching
      const response = await fetch(`/api/client/matches?clientId=${clientId}`)
      const data = await response.json()
      setMatches(data.matches)
    }
    
    fetchMatches()
  }, [clientId])
  
  return matches
}
```

### ErrorManager Integration
```typescript
const useApiCall = () => {
  const [error, setError] = useState(null)
  
  const callApi = async (endpoint: string, options?: RequestInit) => {
    try {
      const response = await fetch(endpoint, options)
      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error) // Structured error from ErrorManager
        return null
      }
      return await response.json()
    } catch (err) {
      setError({ message: 'Network error occurred' })
      return null
    }
  }
  
  return { callApi, error, clearError: () => setError(null) }
}
```

This component architecture provides a robust, maintainable foundation for OneDesigner's user interface with comprehensive integration of centralized services, modern React patterns, and excellent user experience across all device types.