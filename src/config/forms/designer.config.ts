/**
 * Designer Application Form Configuration
 * Edit this file to add/remove/modify designer application fields
 */

export const DESIGNER_FORM_CONFIG = {
  // Form metadata
  formTitle: "Designer Application",
  formDescription: "Complete your profile to get matched with clients",
  totalSteps: 6,
  
  // Form steps configuration
  steps: [
    {
      id: "basic-info",
      number: 1,
      title: "Basic Information",
      description: "Let's start with your basic details",
      fields: [
        {
          name: "firstName",
          label: "First Name",
          type: "text",
          required: true,
          placeholder: "John",
          validation: {
            minLength: 2,
            maxLength: 50,
            pattern: "^[a-zA-Z\\s-']+$",
            message: "Please enter a valid first name"
          }
        },
        {
          name: "lastName",
          label: "Last Name",
          type: "text",
          required: true,
          placeholder: "Doe",
          validation: {
            minLength: 2,
            maxLength: 50,
            pattern: "^[a-zA-Z\\s-']+$",
            message: "Please enter a valid last name"
          }
        },
        {
          name: "email",
          label: "Email",
          type: "email",
          required: true,
          readonly: true, // Pre-filled from authentication
          placeholder: "john@example.com"
        },
        {
          name: "phone",
          label: "Phone Number",
          type: "tel",
          required: false,
          placeholder: "+1 (555) 123-4567",
          validation: {
            pattern: "^[\\+]?[(]?[0-9]{1,4}[)]?[-\\s\\.]?[(]?[0-9]{1,4}[)]?[-\\s\\.]?[0-9]{1,9}$",
            message: "Please enter a valid phone number"
          }
        }
      ]
    },
    {
      id: "professional-info",
      number: 2,
      title: "Professional Information",
      description: "Tell us about your professional experience",
      fields: [
        {
          name: "title",
          label: "Professional Title",
          type: "text",
          required: true,
          placeholder: "Senior UI/UX Designer",
          suggestions: [
            "UI/UX Designer",
            "Graphic Designer",
            "Brand Designer",
            "Product Designer",
            "Creative Director",
            "Motion Designer",
            "Web Designer"
          ]
        },
        {
          name: "yearsExperience",
          label: "Years of Experience",
          type: "select",
          required: true,
          options: [
            { value: "0-2", label: "0-2 years" },
            { value: "3-5", label: "3-5 years" },
            { value: "6-10", label: "6-10 years" },
            { value: "10+", label: "10+ years" }
          ]
        },
        {
          name: "websiteUrl",
          label: "Portfolio/Website URL",
          type: "url",
          required: true,
          placeholder: "https://yourportfolio.com",
          validation: {
            pattern: "^https?://.*",
            message: "Please enter a valid URL starting with http:// or https://"
          }
        },
        {
          name: "projectPriceFrom",
          label: "Minimum Project Budget ($)",
          type: "number",
          required: true,
          placeholder: "1000",
          min: 100,
          max: 100000,
          step: 100
        },
        {
          name: "projectPriceTo",
          label: "Maximum Project Budget ($)",
          type: "number",
          required: true,
          placeholder: "10000",
          min: 100,
          max: 1000000,
          step: 100
        }
      ]
    },
    {
      id: "location-availability",
      number: 3,
      title: "Location & Availability",
      description: "Where are you located and when can you work?",
      fields: [
        {
          name: "country",
          label: "Country",
          type: "select",
          required: true,
          searchable: true,
          placeholder: "Select your country",
          // This would be populated from a countries list
          dynamicOptions: "COUNTRIES_LIST"
        },
        {
          name: "city",
          label: "City",
          type: "select",
          required: true,
          searchable: true,
          placeholder: "Select your city",
          // Cities depend on selected country
          dependsOn: "country",
          dynamicOptions: "CITIES_BY_COUNTRY"
        },
        {
          name: "timezone",
          label: "Timezone",
          type: "text",
          required: true,
          readonly: true, // Auto-filled based on city
          placeholder: "UTC+0"
        },
        {
          name: "availability",
          label: "Current Availability",
          type: "select",
          required: true,
          options: [
            { value: "immediate", label: "Immediately available" },
            { value: "1_week", label: "Available within 1 week" },
            { value: "2_weeks", label: "Available within 2 weeks" },
            { value: "1_month", label: "Available within 1 month" },
            { value: "busy", label: "Currently busy" }
          ]
        }
      ]
    },
    {
      id: "style-expertise",
      number: 4,
      title: "Style & Expertise",
      description: "What's your design style and expertise?",
      fields: [
        {
          name: "styles",
          label: "Design Styles",
          type: "checkbox-group",
          required: true,
          minSelection: 1,
          maxSelection: 5,
          options: [
            { value: "minimal", label: "Minimal & Clean", emoji: "⚪" },
            { value: "modern", label: "Modern & Bold", emoji: "🔥" },
            { value: "playful", label: "Playful & Fun", emoji: "🎨" },
            { value: "corporate", label: "Corporate & Professional", emoji: "💼" },
            { value: "elegant", label: "Elegant & Sophisticated", emoji: "✨" },
            { value: "technical", label: "Technical & Data-driven", emoji: "📊" },
            { value: "retro", label: "Retro & Vintage", emoji: "📻" },
            { value: "organic", label: "Organic & Natural", emoji: "🌿" }
          ]
        },
        {
          name: "projectTypes",
          label: "Project Types",
          type: "checkbox-group",
          required: true,
          minSelection: 1,
          maxSelection: 6,
          options: [
            { value: "brand-identity", label: "Brand Identity", emoji: "🎯" },
            { value: "web-design", label: "Web Design", emoji: "🌐" },
            { value: "app-design", label: "App Design", emoji: "📱" },
            { value: "dashboard", label: "Dashboard/SaaS", emoji: "📊" },
            { value: "marketing", label: "Marketing Design", emoji: "📢" },
            { value: "illustration", label: "Illustration", emoji: "🎨" },
            { value: "motion", label: "Motion Graphics", emoji: "🎬" },
            { value: "packaging", label: "Packaging Design", emoji: "📦" }
          ]
        },
        {
          name: "industries",
          label: "Industry Experience",
          type: "checkbox-group",
          required: true,
          minSelection: 1,
          maxSelection: 5,
          options: [
            { value: "saas", label: "SaaS" },
            { value: "fintech", label: "Fintech" },
            { value: "ecommerce", label: "E-commerce" },
            { value: "healthcare", label: "Healthcare" },
            { value: "education", label: "Education" },
            { value: "crypto", label: "Crypto/Web3" },
            { value: "ai-ml", label: "AI/ML" },
            { value: "social-media", label: "Social Media" },
            { value: "gaming", label: "Gaming" },
            { value: "real-estate", label: "Real Estate" }
          ]
        },
        {
          name: "bio",
          label: "Professional Bio",
          type: "textarea",
          required: true,
          placeholder: "Tell us about yourself, your design philosophy, and what makes you unique...",
          minLength: 100,
          maxLength: 500,
          rows: 5,
          helperText: "Min 100 characters, max 500 characters"
        }
      ]
    },
    {
      id: "portfolio-skills",
      number: 5,
      title: "Portfolio & Skills",
      description: "Showcase your skills and portfolio",
      fields: [
        {
          name: "portfolioUrl",
          label: "Additional Portfolio URL",
          type: "url",
          required: false,
          placeholder: "https://portfolio.com"
        },
        {
          name: "dribbbleUrl",
          label: "Dribbble Profile",
          type: "url",
          required: false,
          placeholder: "https://dribbble.com/username"
        },
        {
          name: "behanceUrl",
          label: "Behance Profile",
          type: "url",
          required: false,
          placeholder: "https://behance.net/username"
        },
        {
          name: "linkedinUrl",
          label: "LinkedIn Profile",
          type: "url",
          required: false,
          placeholder: "https://linkedin.com/in/username"
        },
        {
          name: "specializations",
          label: "Specializations",
          type: "checkbox-group",
          required: true,
          minSelection: 1,
          options: [
            { value: "user-research", label: "User Research" },
            { value: "wireframing", label: "Wireframing" },
            { value: "prototyping", label: "Prototyping" },
            { value: "design-systems", label: "Design Systems" },
            { value: "accessibility", label: "Accessibility" },
            { value: "animation", label: "Animation" },
            { value: "3d-design", label: "3D Design" },
            { value: "typography", label: "Typography" }
          ]
        },
        {
          name: "softwareSkills",
          label: "Software Proficiency",
          type: "checkbox-group",
          required: true,
          minSelection: 1,
          options: [
            { value: "figma", label: "Figma" },
            { value: "sketch", label: "Sketch" },
            { value: "adobe-xd", label: "Adobe XD" },
            { value: "photoshop", label: "Photoshop" },
            { value: "illustrator", label: "Illustrator" },
            { value: "after-effects", label: "After Effects" },
            { value: "framer", label: "Framer" },
            { value: "webflow", label: "Webflow" }
          ]
        }
      ]
    },
    {
      id: "experience-preferences",
      number: 6,
      title: "Experience & Preferences",
      description: "Tell us about your work style and preferences",
      fields: [
        {
          name: "previousClients",
          label: "Notable Previous Clients",
          type: "textarea",
          required: false,
          placeholder: "List any notable clients or projects you've worked on...",
          rows: 3
        },
        {
          name: "projectPreferences",
          label: "Project Preferences",
          type: "textarea",
          required: true,
          placeholder: "What types of projects excite you most? What's your ideal project?",
          rows: 3
        },
        {
          name: "workingStyle",
          label: "Working Style",
          type: "textarea",
          required: true,
          placeholder: "Describe your typical design process and how you collaborate with clients...",
          rows: 3
        },
        {
          name: "communicationStyle",
          label: "Communication Style",
          type: "select",
          required: true,
          options: [
            { value: "direct", label: "Direct & Efficient" },
            { value: "collaborative", label: "Collaborative & Inclusive" },
            { value: "detailed", label: "Detailed & Thorough" },
            { value: "flexible", label: "Flexible & Adaptive" }
          ]
        },
        {
          name: "remoteExperience",
          label: "Remote Work Experience",
          type: "textarea",
          required: true,
          placeholder: "Describe your experience working remotely with international clients...",
          rows: 3
        },
        {
          name: "teamCollaboration",
          label: "Team Collaboration",
          type: "textarea",
          required: false,
          placeholder: "How do you work with other team members (developers, marketers, etc.)?",
          rows: 3
        }
      ]
    }
  ],

  // Validation messages
  validationMessages: {
    required: "This field is required",
    email: "Please enter a valid email address",
    url: "Please enter a valid URL",
    minLength: "Must be at least {min} characters",
    maxLength: "Must be no more than {max} characters",
    minSelection: "Please select at least {min} option(s)",
    maxSelection: "Please select no more than {max} option(s)",
    pattern: "Please enter a valid value"
  },

  // Success messages
  successMessages: {
    submit: "Application submitted successfully!",
    update: "Profile updated successfully!",
    draft: "Draft saved successfully!"
  }
}

export type DesignerFormConfig = typeof DESIGNER_FORM_CONFIG