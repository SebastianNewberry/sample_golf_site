# Toski Golf Academy Homepage

This document provides information about the homepage implementation and how to customize it.

## Overview

The homepage has been built using Next.js, TypeScript, and shadcn/ui components. It closely follows the mockup designs in the `mock/` folder while providing a modern, responsive user experience.

## Component Structure

The homepage is composed of several reusable components located in `app/components/`:

- **Navigation**: Sticky navigation bar with logo, menu links, and contact button
- **Hero**: Large hero section with golf course background and call-to-action
- **WinterPrograms**: Information about winter golf instruction programs
- **ProgramCards**: Three-column layout showcasing different program offerings
- **AcademyLocations**: Interactive map section showing summer and winter facilities
- **Footer**: Contact information and copyright notice

## Adding a Hero Image

To add a custom hero image to replace the gradient background:

1. Place your golf course photo at `public/golf-course-hero.jpg`
2. Recommended dimensions: 1920x1080 pixels (or higher)
3. Recommended format: JPEG with 80-90% quality
4. Uncomment the image line in `app/components/Hero.tsx`:
   ```tsx
   <div className="absolute inset-0 bg-[url('/golf-course-hero.jpg')] bg-cover bg-center opacity-90" />
   ```

## Customization

### Colors

The theme uses shadcn/ui color variables plus custom Toski Golf Academy colors defined in `app/globals.css`:

- `--golf-orange`: Primary accent color (#F97316)
- `--golf-green`: Primary green color (#15803D)
- `--golf-green-dark`: Darker green shade (#14532D)

These can be adjusted in the CSS variables section.

### Contact Information

Update the contact information throughout the components:

1. **Navigation**: Phone number in `app/components/Navigation.tsx`
2. **WinterPrograms**: Location and contact details in `app/components/WinterPrograms.tsx`
3. **Footer**: Email and contact button in `app/components/Footer.tsx`
4. **AcademyLocations**: Map embed URLs in `app/components/AcademyLocations.tsx`

### Maps

The `AcademyLocations` component uses Google Maps embed. To customize the maps:

1. Visit Google Maps and find your location
2. Click "Share" → "Embed a map"
3. Copy the embed code and extract the `src` URL
4. Replace the `mapUrl` in the component

## Professional Associations

The `ProgramCards` component currently shows placeholder logos for:

- PGA of America
- U.S. Kids Golf
- Titleist
- TrackMan

Replace these with actual logo images by:

1. Adding logo files to `public/logos/`
2. Updating the placeholder divs with actual `<img>` tags or Next.js `<Image>` components

## Next Steps

To continue building the website:

1. **Add Images**: Place your actual images in the `public/` folder
2. **Create Additional Pages**: Use the Navigation and Footer components consistently
3. **Add Server Actions**: Implement forms for scheduling lessons and contact
4. **Connect Database**: Use Drizzle ORM for managing bookings and inquiries
5. **Add Authentication**: Integrate better-auth for user accounts

## Development

Run the development server:

```bash
npm run dev
```

Visit `http://localhost:3000` to see the homepage.

## Design Notes

The implementation follows these design principles:

- **High Fidelity**: Closely matches the mockups in layout and structure
- **Modern UX**: Uses shadcn/ui for consistent, accessible components
- **Responsive**: Works well on mobile, tablet, and desktop
- **Performant**: Optimized images and efficient component structure
- **Maintainable**: Clear component separation and TypeScript typing

### Shadcn/ui Components Used

- **Button**: With custom variants (orange, orangeOutline) for brand consistency
- **Icons**: Lucide React icons for the navigation flag icon

You can add more shadcn/ui components as needed:

```bash
npx shadcn@latest add <component-name>
```

For example:

```bash
npx shadcn@latest add card dialog input textarea
```
