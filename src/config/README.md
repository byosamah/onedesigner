# OneDesigner Configuration System

This directory contains all configuration files for the OneDesigner platform. You can edit these files to customize the platform without touching the core code.

## 📁 Directory Structure

```
/src/config/
├── matching/              # AI matching configuration
│   └── prompt.config.ts   # AI prompts and scoring rules
├── forms/                 # Form configurations
│   ├── designer.config.ts # Designer application form
│   └── brief.config.ts    # Client brief form
└── index.ts              # Main export file
```

## 🎯 Matching Configuration (`matching/prompt.config.ts`)

Controls how the AI matches designers to clients.

### Key Settings:

1. **System Role** - The AI's personality and approach
   ```typescript
   systemRole: "You are an elite designer-client matchmaker AI..."
   ```

2. **Scoring Weights** (must total 100)
   ```typescript
   scoringWeights: {
     categoryMastery: 30,      // Expertise weight
     styleAlignment: 25,       // Style match weight
     projectFit: 20,          // Industry/scale weight
     workingCompatibility: 15, // Communication weight
     valueFactors: 10         // Budget/availability weight
   }
   ```

3. **Elimination Criteria** - Filters that designers must pass
   ```typescript
   eliminationCriteria: {
     correctSpecialization: { enabled: true, ... },
     withinBudget: { enabled: true, tolerance: 0.2 },
     // Add or modify criteria here
   }
   ```

4. **Thresholds** - Minimum scores and messages
   ```typescript
   thresholds: {
     minimumScore: 70,        // Minimum to be considered
     excellentMatch: 85,      // Excellent match threshold
     perfectMatch: 95,        // Perfect match threshold
   }
   ```

5. **Custom Rules** - Business logic without code changes
   ```typescript
   customRules: [
     {
       id: "premium_client_rule",
       condition: "budget >= 10000",
       action: "prioritize_designers_with_rating >= 4.8",
       enabled: true
     }
   ]
   ```

### How to Edit:
1. Open `matching/prompt.config.ts`
2. Modify the desired settings
3. Ensure scoring weights total 100
4. Save the file - changes take effect immediately

## 📝 Designer Form Configuration (`forms/designer.config.ts`)

Defines all fields in the designer application form.

### Structure:
```typescript
steps: [
  {
    id: "basic-info",
    title: "Basic Information",
    fields: [
      {
        name: "firstName",
        label: "First Name",
        type: "text",
        required: true,
        validation: { ... }
      }
    ]
  }
]
```

### Field Types:
- `text` - Single line text input
- `textarea` - Multi-line text input
- `email` - Email input with validation
- `tel` - Phone number input
- `number` - Numeric input
- `select` - Dropdown selection
- `checkbox-group` - Multiple checkboxes
- `radio` - Radio button selection
- `url` - URL input with validation

### Adding a New Field:
```typescript
{
  name: "newField",
  label: "New Field Label",
  type: "text",
  required: true,
  placeholder: "Enter value...",
  validation: {
    minLength: 2,
    maxLength: 50,
    pattern: "^[a-zA-Z]+$",
    message: "Invalid input"
  }
}
```

## 📋 Brief Form Configuration (`forms/brief.config.ts`)

Defines all fields in the client brief form.

### Structure:
- **Common Fields** - Shown for all project types
- **Category Fields** - Specific to each design category
- **Style Fields** - Design preference fields

### Category-Specific Fields:
Each design category can have additional fields:
```typescript
categoryFields: {
  "branding-logo": {
    step2_additional: [...],  // Additional fields for step 2
    step3_additional: [...]   // Additional fields for step 3
  },
  "web-mobile": { ... },
  // Add more categories
}
```

### Adding a New Category:
1. Add the category to `DESIGN_CATEGORIES` in constants
2. Add category-specific fields in `categoryFields`
3. The form will automatically show these fields when the category is selected

## 🔧 Common Customizations

### 1. Change AI Matching Behavior
Edit `matching/prompt.config.ts`:
- Adjust `scoringWeights` to prioritize different factors
- Modify `systemRole` to change AI personality
- Add `customRules` for specific business logic

### 2. Add New Form Fields
Edit `forms/designer.config.ts` or `forms/brief.config.ts`:
- Add field to appropriate step in `steps` array
- Include validation rules if needed
- Update database schema if storing new data

### 3. Change Available Options
Update option arrays in form configs:
- Industries
- Design styles
- Project types
- Budget ranges
- Timelines

### 4. Adjust Matching Thresholds
Edit `matching/prompt.config.ts`:
- Change `minimumScore` to be more/less selective
- Modify score interpretations
- Update no-match messages

## 🚀 Testing Changes

1. **Validate Configuration**
   ```typescript
   import { validateConfig } from '@/config'
   const { valid, errors } = validateConfig()
   ```

2. **Test Matching**
   - Create a test brief
   - Run matching with different designers
   - Check if scores align with expectations

3. **Test Forms**
   - Fill out forms with new fields
   - Verify validation works
   - Check data is saved correctly

## ⚠️ Important Notes

1. **Scoring Weights** must always total 100
2. **Temperature** should be between 0 (deterministic) and 1 (creative)
3. **Required Fields** in forms need database columns
4. **Field Names** must match database column names (camelCase → snake_case conversion happens automatically)
5. **Custom Rules** are evaluated but need implementation in matching logic

## 📚 Examples

### Example: Prioritize Local Designers
```typescript
// In matching/prompt.config.ts
customRules: [
  {
    id: "prefer_local",
    condition: "client.country === designer.country",
    action: "add_bonus_score(10)",
    enabled: true
  }
]
```

### Example: Add Portfolio Review Field
```typescript
// In forms/designer.config.ts
{
  name: "portfolioReviewScore",
  label: "Portfolio Review Score",
  type: "number",
  required: false,
  min: 1,
  max: 10,
  placeholder: "Rate your portfolio 1-10"
}
```

### Example: Add Rush Project Option
```typescript
// In forms/brief.config.ts
{
  name: "isRushProject",
  label: "Rush Project?",
  type: "checkbox",
  required: false,
  helperText: "Need it done ASAP (additional fees may apply)"
}
```

## 🤝 Need Help?

- Check existing configurations for examples
- Validate your changes with `validateConfig()`
- Test thoroughly before deploying to production
- Keep backups of working configurations