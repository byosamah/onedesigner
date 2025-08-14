# OneDesigner Email Branding Standards

## 📧 **Official Email Branding Guidelines**

### **🎯 Golden Rules (NEVER CHANGE):**
1. ✅ **Golden OneDesigner text**: `color: #f0ad4e` in all email headers
2. ✅ **No logos**: Simple text-only branding (email client compatible)
3. ✅ **team@onedesigner.app**: Default sender for all emails
4. ✅ **Sender names**: "OneDesigner" for OTP, "Hala from OneDesigner" for others

---

## 🎨 **Visual Standards**

### **Header Design:**
```html
<div style="text-align: center; padding: 32px; border-bottom: 1px solid #F3F4F6;">
  <span style="font-size: 24px; font-weight: 700; color: #f0ad4e; letter-spacing: -0.02em;">OneDesigner</span>
</div>
```

### **Color Palette:**
- **Primary Brand**: `#f0ad4e` (Golden OneDesigner text)
- **Text Primary**: `#111827` (Main content)
- **Text Secondary**: `#4B5563` (Supporting text)
- **Background**: `#FAFAFA` (Email background)
- **White**: `#FFFFFF` (Content containers)
- **Border**: `#F3F4F6` (Subtle separators)

---

## 📤 **Sender Standards**

### **Email Addresses:**
- **Default**: `team@onedesigner.app`
- **Environment Override**: `process.env.EMAIL_FROM_ADDRESS`

### **Sender Names:**
```typescript
// OTP and verification emails
"OneDesigner <team@onedesigner.app>"

// All other emails (welcome, approval, project requests, etc.)
"Hala from OneDesigner <team@onedesigner.app>"
```

---

## 📁 **Implementation Files**

### **Core Services:**
- `/src/lib/core/email-service.ts` - Main email service with sender logic
- `/src/lib/email/components/logo.ts` - Golden header component

### **Templates:**
- `/src/lib/email/templates/marc-lou-style.ts` - Marc Lou style templates
- `/src/lib/email/template-base.ts` - Original template base
- `/src/lib/email/send-email.ts` - Direct email sender
- `/src/lib/email/send-otp.ts` - OTP emails

### **Usage Example:**
```typescript
import { getEmailLogoHeader } from '@/lib/email/components/logo'

const emailHtml = `
<html>
<body>
  ${getEmailLogoHeader()}
  <!-- Email content -->
</body>
</html>
`
```

---

## ✅ **Quality Checklist**

Before sending any email, ensure:
- [ ] Golden OneDesigner header (`#f0ad4e`)
- [ ] Correct sender (`team@onedesigner.app`)
- [ ] Appropriate sender name (OneDesigner vs Hala from OneDesigner)
- [ ] No logos or images (email client compatibility)
- [ ] Consistent typography and spacing
- [ ] Marc Lou casual tone (where appropriate)

---

## 🚫 **What NOT to Do**

❌ **Never use:**
- SVG logos (blocked by Gmail)
- Base64 images (blocked by most clients)
- Complex CSS transforms (inconsistent rendering)
- noreply@onedesigner.app (old address)
- magic@onedesigner.app (test address)

❌ **Never change:**
- The golden color `#f0ad4e`
- The sender email `team@onedesigner.app`
- The simple text-only header design

---

## 🔄 **Future Email Creation**

### **For New Email Templates:**
1. Copy structure from `/src/lib/email/templates/marc-lou-style.ts`
2. Use golden header: `getEmailLogoHeader()`
3. Apply appropriate sender name logic
4. Test in Gmail, Outlook, and Apple Mail
5. Follow Marc Lou's casual, direct copywriting style

### **For Emergency Fixes:**
If emails aren't displaying correctly:
1. Remove all images/SVG/complex CSS
2. Use simple HTML tables for layout
3. Inline all CSS styles
4. Test with golden text header only

---

**Last Updated**: August 14, 2025  
**Status**: ✅ ACTIVE STANDARD  
**Next Review**: When email client compatibility changes