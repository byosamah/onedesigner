/**
 * Client Brief Form Configuration
 * Edit this file to customize the client brief form fields and options
 */

import { DESIGN_CATEGORIES } from '@/lib/constants/design-categories'

export const BRIEF_FORM_CONFIG = {
  // Form metadata
  formTitle: "Tell us about your project",
  formDescription: "Help us understand your design needs to find the perfect match",
  totalSteps: 4,

  // Common fields across all categories
  commonFields: {
    step1: [
      {
        name: "design_category",
        label: "What type of design do you need?",
        type: "radio-cards",
        required: true,
        options: Object.entries(DESIGN_CATEGORIES).map(([key, category]) => ({
          value: key,
          label: category.name,
          description: category.description,
          icon: category.icon
        }))
      }
    ],
    step2: [
      {
        name: "company_name",
        label: "Company/Project Name",
        type: "text",
        required: true,
        placeholder: "Acme Inc."
      },
      {
        name: "industry",
        label: "Industry",
        type: "select",
        required: true,
        placeholder: "Select your industry",
        options: [
          { value: "saas", label: "SaaS/Software" },
          { value: "fintech", label: "Fintech" },
          { value: "ecommerce", label: "E-commerce" },
          { value: "healthcare", label: "Healthcare" },
          { value: "education", label: "Education" },
          { value: "crypto", label: "Crypto/Web3" },
          { value: "ai-ml", label: "AI/ML" },
          { value: "social-media", label: "Social Media" },
          { value: "gaming", label: "Gaming" },
          { value: "real-estate", label: "Real Estate" },
          { value: "food-beverage", label: "Food & Beverage" },
          { value: "fashion", label: "Fashion" },
          { value: "travel", label: "Travel & Hospitality" },
          { value: "nonprofit", label: "Non-profit" },
          { value: "other", label: "Other" }
        ]
      },
      {
        name: "project_description",
        label: "Project Description",
        type: "textarea",
        required: true,
        placeholder: "Describe your project in detail. What are you trying to achieve?",
        rows: 4,
        minLength: 50,
        maxLength: 1000
      },
      {
        name: "target_audience",
        label: "Target Audience",
        type: "text",
        required: true,
        placeholder: "Who is your target audience? (e.g., Young professionals, 25-35)"
      },
      {
        name: "brand_personality",
        label: "Brand Personality",
        type: "text",
        required: false,
        placeholder: "How would you describe your brand? (e.g., Professional, playful, innovative)"
      }
    ],
    step3: [
      {
        name: "timeline_type",
        label: "Project Timeline",
        type: "select",
        required: true,
        options: [
          { value: "urgent", label: "Urgent (Within 1 week)" },
          { value: "fast", label: "Fast (2-3 weeks)" },
          { value: "standard", label: "Standard (1 month)" },
          { value: "relaxed", label: "Relaxed (2+ months)" }
        ]
      },
      {
        name: "budget_range",
        label: "Budget Range",
        type: "select",
        required: true,
        options: [
          { value: "low", label: "$500 - $2,000" },
          { value: "mid", label: "$2,000 - $5,000" },
          { value: "high", label: "$5,000 - $10,000" },
          { value: "premium", label: "$10,000+" }
        ]
      },
      {
        name: "communication_channels",
        label: "Preferred Communication",
        type: "checkbox-group",
        required: true,
        minSelection: 1,
        options: [
          { value: "email", label: "Email" },
          { value: "slack", label: "Slack" },
          { value: "video", label: "Video Calls" },
          { value: "phone", label: "Phone" },
          { value: "project-tool", label: "Project Management Tool" }
        ]
      }
    ]
  },

  // Category-specific fields configuration
  categoryFields: {
    "branding-logo": {
      step2_additional: [
        {
          name: "brand_type",
          label: "Brand Identity Type",
          type: "select",
          required: true,
          options: [
            { value: "new-brand", label: "New Brand (Starting from scratch)" },
            { value: "rebrand", label: "Rebrand (Updating existing)" },
            { value: "refresh", label: "Brand Refresh (Minor updates)" }
          ]
        },
        {
          name: "deliverables",
          label: "Required Deliverables",
          type: "checkbox-group",
          required: true,
          minSelection: 1,
          options: [
            { value: "logo", label: "Logo Design" },
            { value: "color-palette", label: "Color Palette" },
            { value: "typography", label: "Typography" },
            { value: "brand-guidelines", label: "Brand Guidelines" },
            { value: "business-cards", label: "Business Cards" },
            { value: "letterhead", label: "Letterhead" },
            { value: "social-templates", label: "Social Media Templates" }
          ]
        },
        {
          name: "industry_sector",
          label: "Industry Sector",
          type: "text",
          required: false,
          placeholder: "Specific niche within your industry"
        },
        {
          name: "logo_style",
          label: "Preferred Logo Style",
          type: "checkbox-group",
          required: false,
          options: [
            { value: "wordmark", label: "Wordmark" },
            { value: "lettermark", label: "Lettermark" },
            { value: "pictorial", label: "Pictorial Mark" },
            { value: "abstract", label: "Abstract Mark" },
            { value: "mascot", label: "Mascot" },
            { value: "emblem", label: "Emblem" }
          ]
        }
      ],
      step3_additional: [
        {
          name: "brand_assets_status",
          label: "Existing Brand Assets",
          type: "select",
          required: true,
          options: [
            { value: "none", label: "No existing assets" },
            { value: "some", label: "Some assets to work with" },
            { value: "complete", label: "Complete set needs refresh" }
          ]
        }
      ]
    },
    "web-mobile": {
      step2_additional: [
        {
          name: "digital_product_type",
          label: "Digital Product Type",
          type: "select",
          required: true,
          options: [
            { value: "website", label: "Website" },
            { value: "mobile-app", label: "Mobile App" },
            { value: "web-app", label: "Web Application" },
            { value: "responsive-both", label: "Responsive Website & App" }
          ]
        },
        {
          name: "number_of_screens",
          label: "Estimated Number of Screens/Pages",
          type: "select",
          required: true,
          options: [
            { value: "1-5", label: "1-5 screens" },
            { value: "6-10", label: "6-10 screens" },
            { value: "11-20", label: "11-20 screens" },
            { value: "20+", label: "20+ screens" }
          ]
        },
        {
          name: "key_features",
          label: "Key Features/Functionality",
          type: "textarea",
          required: true,
          placeholder: "List the main features your product needs (e.g., user authentication, payment processing, dashboard)",
          rows: 3
        },
        {
          name: "design_inspiration",
          label: "Design Inspiration URLs",
          type: "textarea",
          required: false,
          placeholder: "Share links to websites/apps you like",
          rows: 2
        }
      ],
      step3_additional: [
        {
          name: "development_status",
          label: "Development Status",
          type: "select",
          required: true,
          options: [
            { value: "design-only", label: "Design only needed" },
            { value: "design-then-dev", label: "Design first, then development" },
            { value: "design-with-dev", label: "Design alongside development" },
            { value: "redesign-existing", label: "Redesigning existing product" }
          ]
        }
      ]
    },
    "social-media": {
      step2_additional: [
        {
          name: "social_platforms",
          label: "Social Media Platforms",
          type: "checkbox-group",
          required: true,
          minSelection: 1,
          options: [
            { value: "instagram", label: "Instagram" },
            { value: "facebook", label: "Facebook" },
            { value: "twitter", label: "Twitter/X" },
            { value: "linkedin", label: "LinkedIn" },
            { value: "tiktok", label: "TikTok" },
            { value: "youtube", label: "YouTube" },
            { value: "pinterest", label: "Pinterest" }
          ]
        },
        {
          name: "content_types",
          label: "Content Types Needed",
          type: "checkbox-group",
          required: true,
          minSelection: 1,
          options: [
            { value: "posts", label: "Feed Posts" },
            { value: "stories", label: "Stories" },
            { value: "reels", label: "Reels/Videos" },
            { value: "covers", label: "Cover Photos" },
            { value: "ads", label: "Ad Creatives" },
            { value: "carousel", label: "Carousel Posts" }
          ]
        },
        {
          name: "quantity_needed",
          label: "Quantity of Designs",
          type: "select",
          required: true,
          options: [
            { value: "1-10", label: "1-10 designs" },
            { value: "11-30", label: "11-30 designs" },
            { value: "31-50", label: "31-50 designs" },
            { value: "ongoing", label: "Ongoing monthly content" }
          ]
        }
      ],
      step3_additional: [
        {
          name: "brand_guidelines_exist",
          label: "Do you have brand guidelines?",
          type: "select",
          required: true,
          options: [
            { value: "yes-strict", label: "Yes, strict guidelines" },
            { value: "yes-flexible", label: "Yes, flexible guidelines" },
            { value: "no", label: "No guidelines yet" }
          ]
        },
        {
          name: "posting_frequency",
          label: "Posting Frequency",
          type: "select",
          required: false,
          options: [
            { value: "daily", label: "Daily" },
            { value: "few-week", label: "Few times a week" },
            { value: "weekly", label: "Weekly" },
            { value: "monthly", label: "Monthly" }
          ]
        }
      ]
    },
    "motion-graphics": {
      step2_additional: [
        {
          name: "motion_type",
          label: "Type of Motion Graphics",
          type: "checkbox-group",
          required: true,
          minSelection: 1,
          options: [
            { value: "explainer", label: "Explainer Video" },
            { value: "logo-animation", label: "Logo Animation" },
            { value: "social-video", label: "Social Media Videos" },
            { value: "product-demo", label: "Product Demo" },
            { value: "infographic", label: "Animated Infographic" },
            { value: "title-sequence", label: "Title Sequence" }
          ]
        },
        {
          name: "video_length",
          label: "Video Length",
          type: "select",
          required: true,
          options: [
            { value: "under-30s", label: "Under 30 seconds" },
            { value: "30-60s", label: "30-60 seconds" },
            { value: "1-2min", label: "1-2 minutes" },
            { value: "2-5min", label: "2-5 minutes" },
            { value: "over-5min", label: "Over 5 minutes" }
          ]
        },
        {
          name: "animation_style",
          label: "Animation Style",
          type: "select",
          required: true,
          options: [
            { value: "2d-flat", label: "2D Flat Design" },
            { value: "2d-character", label: "2D Character Animation" },
            { value: "3d", label: "3D Animation" },
            { value: "mixed-media", label: "Mixed Media" },
            { value: "kinetic-type", label: "Kinetic Typography" },
            { value: "whiteboard", label: "Whiteboard Animation" }
          ]
        }
      ],
      step3_additional: [
        {
          name: "voiceover_needed",
          label: "Voiceover Required?",
          type: "select",
          required: true,
          options: [
            { value: "yes-provided", label: "Yes, I'll provide" },
            { value: "yes-needed", label: "Yes, need help with this" },
            { value: "no", label: "No voiceover needed" }
          ]
        },
        {
          name: "music_sound",
          label: "Music/Sound Effects?",
          type: "select",
          required: true,
          options: [
            { value: "yes-provided", label: "Yes, I'll provide" },
            { value: "yes-needed", label: "Yes, need help with this" },
            { value: "no", label: "No audio needed" }
          ]
        }
      ]
    },
    "photography-video": {
      step2_additional: [
        {
          name: "visual_content_type",
          label: "Type of Visual Content",
          type: "checkbox-group",
          required: true,
          minSelection: 1,
          options: [
            { value: "product-photo", label: "Product Photography" },
            { value: "lifestyle-photo", label: "Lifestyle Photography" },
            { value: "corporate-photo", label: "Corporate Photography" },
            { value: "event-photo", label: "Event Photography" },
            { value: "promotional-video", label: "Promotional Video" },
            { value: "testimonial-video", label: "Testimonial Video" },
            { value: "behind-scenes", label: "Behind-the-Scenes" }
          ]
        },
        {
          name: "number_of_assets",
          label: "Number of Photos/Videos",
          type: "select",
          required: true,
          options: [
            { value: "1-10", label: "1-10 assets" },
            { value: "11-25", label: "11-25 assets" },
            { value: "26-50", label: "26-50 assets" },
            { value: "50+", label: "50+ assets" }
          ]
        },
        {
          name: "shoot_location",
          label: "Shoot Location",
          type: "select",
          required: true,
          options: [
            { value: "studio", label: "Studio" },
            { value: "on-location", label: "On Location" },
            { value: "multiple", label: "Multiple Locations" },
            { value: "remote", label: "Remote/Stock Assets" }
          ]
        }
      ],
      step3_additional: [
        {
          name: "editing_required",
          label: "Post-Production Editing",
          type: "select",
          required: true,
          options: [
            { value: "basic", label: "Basic editing" },
            { value: "advanced", label: "Advanced editing/retouching" },
            { value: "minimal", label: "Minimal editing" }
          ]
        },
        {
          name: "usage_rights",
          label: "Usage Rights Needed",
          type: "select",
          required: true,
          options: [
            { value: "web-only", label: "Web only" },
            { value: "print-digital", label: "Print & Digital" },
            { value: "unlimited", label: "Unlimited use" },
            { value: "limited-time", label: "Limited time period" }
          ]
        }
      ]
    },
    "presentations": {
      step2_additional: [
        {
          name: "presentation_type",
          label: "Presentation Type",
          type: "select",
          required: true,
          options: [
            { value: "pitch-deck", label: "Investor Pitch Deck" },
            { value: "sales-deck", label: "Sales Deck" },
            { value: "corporate-preso", label: "Corporate Presentation" },
            { value: "conference", label: "Conference/Keynote" },
            { value: "training", label: "Training Materials" },
            { value: "report", label: "Annual/Research Report" }
          ]
        },
        {
          name: "number_of_slides",
          label: "Number of Slides",
          type: "select",
          required: true,
          options: [
            { value: "10-15", label: "10-15 slides" },
            { value: "16-25", label: "16-25 slides" },
            { value: "26-40", label: "26-40 slides" },
            { value: "40+", label: "40+ slides" }
          ]
        },
        {
          name: "design_elements",
          label: "Design Elements Needed",
          type: "checkbox-group",
          required: true,
          minSelection: 1,
          options: [
            { value: "infographics", label: "Infographics" },
            { value: "charts-graphs", label: "Charts & Graphs" },
            { value: "icons", label: "Custom Icons" },
            { value: "illustrations", label: "Illustrations" },
            { value: "photo-editing", label: "Photo Editing" },
            { value: "animations", label: "Animations/Transitions" }
          ]
        }
      ],
      step3_additional: [
        {
          name: "content_status",
          label: "Content Status",
          type: "select",
          required: true,
          options: [
            { value: "ready", label: "Content is ready" },
            { value: "in-progress", label: "Content in progress" },
            { value: "needs-help", label: "Need help with content" }
          ]
        },
        {
          name: "presentation_software",
          label: "Preferred Software",
          type: "select",
          required: false,
          options: [
            { value: "powerpoint", label: "PowerPoint" },
            { value: "keynote", label: "Keynote" },
            { value: "google-slides", label: "Google Slides" },
            { value: "figma", label: "Figma" },
            { value: "no-preference", label: "No preference" }
          ]
        }
      ]
    }
  },

  // Step 3 common fields (style preferences)
  styleFields: [
    {
      name: "design_style_keywords",
      label: "Design Style Preferences",
      type: "checkbox-group",
      required: true,
      minSelection: 1,
      maxSelection: 5,
      options: [
        { value: "minimal", label: "Minimal & Clean" },
        { value: "modern", label: "Modern & Bold" },
        { value: "playful", label: "Playful & Fun" },
        { value: "corporate", label: "Corporate & Professional" },
        { value: "elegant", label: "Elegant & Sophisticated" },
        { value: "technical", label: "Technical & Data-driven" },
        { value: "retro", label: "Retro & Vintage" },
        { value: "organic", label: "Organic & Natural" },
        { value: "futuristic", label: "Futuristic" },
        { value: "artistic", label: "Artistic & Creative" }
      ]
    },
    {
      name: "color_preferences",
      label: "Color Preferences",
      type: "text",
      required: false,
      placeholder: "Any specific colors or color schemes you prefer?"
    },
    {
      name: "avoid_colors_styles",
      label: "Colors/Styles to Avoid",
      type: "text",
      required: false,
      placeholder: "Any colors or styles you definitely don't want?"
    },
    {
      name: "design_examples",
      label: "Inspiration/Examples",
      type: "textarea",
      required: false,
      placeholder: "Share links to designs you like or describe what inspires you",
      rows: 3
    },
    {
      name: "additional_notes",
      label: "Additional Notes",
      type: "textarea",
      required: false,
      placeholder: "Any other details or requirements for your project?",
      rows: 3
    }
  ],

  // Validation messages
  validationMessages: {
    required: "This field is required",
    minSelection: "Please select at least {min} option(s)",
    maxSelection: "Please select no more than {max} option(s)",
    minLength: "Must be at least {min} characters",
    maxLength: "Must be no more than {max} characters"
  },

  // Success messages
  successMessages: {
    submit: "Brief submitted successfully! Finding your perfect designer match...",
    save: "Brief saved as draft"
  }
}

export type BriefFormConfig = typeof BRIEF_FORM_CONFIG