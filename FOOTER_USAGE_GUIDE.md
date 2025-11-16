# Footer Component Usage Guide

## Overview
The footer component has been created to match the Azimute design with:
- **Logo and tagline** section
- **4-column layout**: Empresa, Navegação, Contacto, Language/Social
- **Contact information** with icons (email, phone, location)
- **Social media links** (LinkedIn, Instagram, Facebook, YouTube)
- **Bottom bar** with copyright and legal links
- **Responsive design** that adapts to mobile, tablet, and desktop

## File Location
```
app/Footer/page.tsx
```

## How to Use This Footer

### Option 1: As a Reusable Component (Recommended)

1. **Create a components directory** (if not exists):
```powershell
mkdir components
```

2. **Move footer to components**:
```powershell
mv app/Footer/page.tsx components/Footer.tsx
```

3. **Update the export** in `components/Footer.tsx`:
```tsx
// Remove 'use client' if using in server components
// Keep it if you need client-side interactivity

export default function Footer() {
  // ... existing code
}
```

4. **Import and use in your layout** (`app/layout.tsx`):
```tsx
import Footer from '@/components/Footer';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Footer />
      </body>
    </html>
  );
}
```

### Option 2: Keep as Page Route

If you want to keep it at `/Footer`, just navigate to:
```
http://localhost:3000/Footer
```

But this is not recommended for footers - they should be components.

## Customization Options

### 1. Update Contact Information

Edit these lines in the footer component:

```tsx
// Email
<a href="mailto:info@azimute.pt">info@azimute.pt</a>
// Change to: your-email@example.com

// Phone
<a href="tel:+351123456789">+351 123 456 789</a>
// Change to: your phone number

// Location
<span>Lisboa, Portugal</span>
// Change to: your location
```

### 2. Update Social Media Links

```tsx
<a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
// Change to your LinkedIn URL

<a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
// Change to your Instagram URL

// Same for Facebook and YouTube
```

### 3. Update Navigation Links

Replace these with your actual routes:

```tsx
<Link href="/about">Sobre Nós</Link>
<Link href="/services">Serviços</Link>
<Link href="/testimonials">Testemunhos</Link>
<Link href="/contact">Contacto</Link>
```

### 4. Update Logo and Branding

```tsx
// Replace "azimute" with your brand name
<h2 className="text-2xl font-bold text-gray-900">azimute</h2>

// Replace tagline
<p className="text-gray-600 text-sm max-w-md">
  Transformação digital que realmente funciona.
</p>
```

### 5. Change Language Selector

The language dropdown currently shows "Português". To make it functional:

```tsx
const [language, setLanguage] = useState('Português');
const [showLanguageMenu, setShowLanguageMenu] = useState(false);

// Add click handler to button
<button 
  onClick={() => setShowLanguageMenu(!showLanguageMenu)}
  className="flex items-center gap-2..."
>
  {/* ... */}
</button>

// Add dropdown menu below button
{showLanguageMenu && (
  <div className="absolute top-full mt-2 bg-white border rounded-lg shadow-lg">
    <button onClick={() => setLanguage('Português')}>Português</button>
    <button onClick={() => setLanguage('English')}>English</button>
  </div>
)}
```

## Responsive Behavior

The footer automatically adjusts:
- **Mobile (< 768px)**: Single column stack
- **Tablet (768px - 1024px)**: 2 columns
- **Desktop (> 1024px)**: 4 columns

## Color Scheme

The footer uses:
- **Background**: Light gray gradient (`from-gray-50 to-white`)
- **Primary color**: Cyan/Blue (`cyan-500`, `blue-600`)
- **Text**: Gray scale (`gray-600`, `gray-700`, `gray-900`)
- **Borders**: Light gray (`gray-200`, `gray-300`)

To change to your brand colors, update all instances of:
- `cyan-500` → your primary color
- `blue-600` → your secondary color

## Removing the Footer Page Route

If you move the footer to components, delete the Footer directory:

```powershell
rmdir app/Footer
```

## Testing the Footer

1. **Start dev server**:
```powershell
npm run dev
```

2. **View options**:
   - As page: http://localhost:3000/Footer
   - In layout: Add to `app/layout.tsx` and view on any page

3. **Check responsiveness**:
   - Open browser DevTools (F12)
   - Toggle device toolbar
   - Test mobile (375px), tablet (768px), desktop (1920px)

## Integration Example

Here's a complete example of integrating the footer into your app:

### Step 1: Create `components/Footer.tsx`
```tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Footer() {
  // ... (copy all the code from app/Footer/page.tsx)
}
```

### Step 2: Update `app/layout.tsx`
```tsx
import Footer from '@/components/Footer';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
```

Now your footer will appear on every page!

## Additional Features You Can Add

### 1. Newsletter Signup
Add an email input in the 4th column:

```tsx
<div>
  <h3 className="text-gray-900 font-semibold text-base mb-4">Newsletter</h3>
  <form className="flex gap-2">
    <input 
      type="email" 
      placeholder="Your email"
      className="flex-1 px-3 py-2 border rounded-lg"
    />
    <button className="px-4 py-2 bg-cyan-500 text-white rounded-lg">
      Subscribe
    </button>
  </form>
</div>
```

### 2. Back to Top Button
Add at the bottom:

```tsx
<button
  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
  className="fixed bottom-8 right-8 w-12 h-12 bg-cyan-500 text-white rounded-full shadow-lg hover:bg-cyan-600"
>
  ↑
</button>
```

### 3. Dark Mode Support
Wrap the footer in a theme-aware container and update classes:

```tsx
<footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
  {/* Update all text colors with dark: variants */}
  <p className="text-gray-600 dark:text-gray-400">...</p>
</footer>
```

## Need Help?

If you need to customize anything specific or have questions about the footer implementation, let me know!
