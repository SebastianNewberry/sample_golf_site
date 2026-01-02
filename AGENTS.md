# Toski Golf Academy - Project Overview

## Project Description

This is a golf website for Toski Golf Academy. The website serves as an informational and promotional platform for the golf academy's services, programs, and offerings.

## Mockups and Design Guidelines

**Location of Mockups**: `mock/` folder

The project includes several mockup images that serve as design references:
- `Toski_Golf_HomePage.png`
- `Toski_Golf_HomePage2.png`
- `Toski_Golf_HomePage3.png`

### Design Implementation Guidelines

When implementing pages and components, follow these guidelines:

1. **High Fidelity Implementation**: Webpages should look very similar to the mockups provided in the `mock/` folder. Use the mockups as the primary reference for layout, content placement, and overall visual structure.

2. **Design Enhancements**: While maintaining similarity to the mockups, you may make slight adjustments to styling to improve the overall user experience, such as:
   - Enhanced spacing and typography
   - Improved color contrast and accessibility
   - Smoother animations and transitions
   - Better responsiveness and mobile optimization
   - Modern UI patterns where appropriate

3. **Core Principles**:
   - Preserve the overall look, feel, and functionality shown in the mockups
   - Maintain content hierarchy and information architecture
   - Ensure visual consistency across the site
   - Prioritize user experience and usability improvements

## Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: CSS (with globals.css) + shadcn/ui components
- **Database ORM**: Drizzle ORM
- **Form Handling**: react-hook-form + Zod validation
- **Authentication**: Guest account system (no auth library)

## Design System & Theming

### shadcn/ui Integration

This project uses **shadcn/ui** as the primary UI component library and design system. All components should be built using shadcn/ui components and follow shadcn theming conventions.

**Key Principles**:
- Use shadcn/ui components (Button, Card, Dialog, etc.) as building blocks
- Follow shadcn's design patterns and styling conventions
- Utilize shadcn's theming system with CSS custom properties
- Components should be created with shadcn's component structure

### Theme Customization

The project includes custom color variables in `app/globals.css` to match Toski Golf Academy branding:
- `--golf-orange`: Primary accent color (orange)
- `--golf-green`: Primary green color (for golf theme)
- `--golf-green-dark`: Darker green shade

These custom colors are integrated with shadcn's theming system and can be used alongside standard shadcn color variables.

### Design Fidelity

**When creating UI components**:
1. **Primary Approach**: Follow shadcn/ui themes and design patterns for consistency and modern aesthetics
2. **Mockup Fidelity**: When trying to match the original mockups exactly, prioritize matching the visual design shown in the mockups while still using shadcn components as the foundation
3. **Balance**: Use shadcn components as the base, but customize styling when necessary to achieve high fidelity with mockups

**Example**: Use shadcn's `<Button>` component, but apply custom variants and colors to match the mockup's orange button style.

## Form Handling & Validation

This project uses **react-hook-form** with **Zod** validation for all form handling. This combination provides type-safe forms with automatic validation.

### Required Packages

```bash
npm install react-hook-form @hookform/resolvers zod
```

### Form Implementation Pattern

All forms should follow this pattern:

1. **Define Zod Schema** - Create validation schema for the form
2. **Create React Hook Form** - Initialize form with Zod resolver
3. **Build Form UI** - Use shadcn/ui Form components
4. **Submit to Server Action** - Pass validated data to server action

### Example: Junior Registration Form

```typescript
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerJunior } from '@/app/actions/junior-registration';

// 1. Define Zod Schema
const juniorRegistrationSchema = z.object({
  // Parent/Guardian Information
  primaryContactFirstName: z.string().min(1, 'First name is required'),
  primaryContactLastName: z.string().min(1, 'Last name is required'),
  primaryContactEmail: z.string().email('Invalid email address'),
  primaryContactPhone: z.string().min(10, 'Phone number must be at least 10 digits'),
  phoneType: z.enum(['mobile', 'home', 'work']),
  preferredContactMethod: z.enum(['text', 'email']),

  // Child Information
  childFirstName: z.string().min(1, 'Child first name is required'),
  childLastName: z.string().min(1, 'Child last name is required'),
  childAge: z.number().min(5).max(18),
  childExperienceLevel: z.string().min(1, 'Experience level is required'),
  hasOwnClubs: z.boolean(),
  friendsToGroupWith: z.string().optional(),

  // Program Information
  programId: z.string().uuid(),
  programSessionId: z.string().uuid().optional(),
});

type JuniorRegistrationFormValues = z.infer<typeof juniorRegistrationSchema>;

// 2. Create React Hook Form component
export function JuniorRegistrationForm({ programId }: { programId: string }) {
  const form = useForm<JuniorRegistrationFormValues>({
    resolver: zodResolver(juniorRegistrationSchema),
    defaultValues: {
      primaryContactFirstName: '',
      primaryContactLastName: '',
      primaryContactEmail: '',
      primaryContactPhone: '',
      phoneType: 'mobile',
      preferredContactMethod: 'email',
      childFirstName: '',
      childLastName: '',
      childAge: 0,
      childExperienceLevel: '',
      hasOwnClubs: false,
      friendsToGroupWith: '',
      programId: programId,
    },
  });

  const onSubmit = async (data: JuniorRegistrationFormValues) => {
    // 4. Submit to Server Action
    const result = await registerJunior(data);

    if (result.success) {
      // Handle success
    } else {
      // Handle error
    }
  };

  // 3. Build Form UI using shadcn/ui components
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Parent Contact Fields */}
        <FormField
          control={form.control}
          name="primaryContactFirstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Primary Contact First Name *</FormLabel>
              <FormControl>
                <Input placeholder="John" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* More form fields... */}

        <Button type="submit">Register</Button>
      </form>
    </Form>
  );
}
```

### Form Best Practices

1. **Always use Zod schemas** for type safety and validation
2. **Use shadcn/ui Form components** for consistent styling
3. **Mark required fields clearly** in the UI (with `*` indicator)
4. **Provide helpful error messages** in the Zod schema
5. **Handle loading states** during form submission
6. **Display success/error feedback** to users after submission
7. **Validate on submit** rather than on blur for better UX

### Form State Management

When handling form submissions with server actions:

```typescript
const [isSubmitting, setIsSubmitting] = useState(false);
const [submitError, setSubmitError] = useState<string | null>(null);
const [submitSuccess, setSubmitSuccess] = useState(false);

const onSubmit = async (data: FormData) => {
  setIsSubmitting(true);
  setSubmitError(null);
  setSubmitSuccess(false);

  try {
    const result = await registerJunior(data);

    if (result.success) {
      setSubmitSuccess(true);
      form.reset();
    } else {
      setSubmitError(result.error || 'Registration failed');
    }
  } catch (error) {
    setSubmitError('An unexpected error occurred');
  } finally {
    setIsSubmitting(false);
  }
};

// In the form JSX
{submitSuccess && (
  <div className="text-green-600">
    Registration successful!
  </div>
)}

{submitError && (
  <div className="text-red-600">
    {submitError}
  </div>
)}

<Button type="submit" disabled={isSubmitting}>
  {isSubmitting ? 'Registering...' : 'Register'}
</Button>
```

## Backend Architecture

The backend follows a layered architecture with clear separation of concerns:

### 1. Data Access Layer
- **Purpose**: Contains all database operations using Drizzle ORM
- **Location**: Recommended location: `/db` or similar
- **Contents**: Pure database queries and data manipulation functions
- **Rules**:
  - No business logic beyond data retrieval/persistence
  - Functions are server-only
  - Direct interaction with Drizzle schema and queries
  - No "use server" directives (unless part of server actions layer)

Example structure:
```
/db
  ├── queries/
  │   ├── users.ts          # User-related queries
  │   ├── bookings.ts       # Booking-related queries
  │   └── lessons.ts        # Lesson-related queries
  └── schema.ts              # Drizzle schema definitions
```

### 2. Server Layer

The server layer is split into two distinct approaches for different HTTP methods:

#### API Routes (GET Requests)
- **Purpose**: Handle GET requests via standard Next.js API routes
- **Location**: `app/api/` directory
- **Usage**: Public data fetching, read-only operations
- **Rules**:
  - Must NOT use functions defined with "use server" directive
  - Must use functions from the data access layer (server-only files)
  - No cross-dependency with server actions
- **Example**:
  ```
  app/api/
    ├── users/
    │   └── route.ts         # GET /api/users
    ├── lessons/
    │   └── route.ts         # GET /api/lessons
    └── bookings/
        └── route.ts         # GET /api/bookings
  ```

#### Server Actions (POST Requests)
- **Purpose**: Handle POST requests and mutations using Next.js Server Actions
- **Location**: Can be in component files or separate action files
- **Usage**: Form submissions, data mutations, write operations
- **Rules**:
  - Functions use the "use server" directive
  - Functions use their own implementation in the data access layer
  - Must NOT share functions with API routes
  - No cross-dependency with API routes

### 3. Separation of Concerns

**Critical Rule**: API routes and server actions should have separate business logic layers but can share the same data access functions.

- **API Routes** use: Data access functions for read operations with their own business logic layer
- **Server Actions** use: The same data access functions for write operations but with separate business logic functions

This separation ensures:
- Clear boundaries between read and write operations
- Independent maintenance and testing
- Avoids confusion about execution context
- Better code organization and maintainability

**Example Implementation Pattern**:

```typescript
// /db/queries/users.ts (Data Access Layer - shared by both)
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function getUserById(id: string) {
  // Pure Drizzle query - shared
  return await db.select().from(users).where(eq(users.id, id));
}

export async function insertUser(data: { name: string; email: string }) {
  // Pure Drizzle query - shared
  return await db.insert(users).values(data);
}

// app/api/users/[id]/route.ts (API Route - GET)
import { getUserById } from '@/db/queries/users';

export async function GET(request: Request) {
  // Business logic for API route - uses shared data access
  const user = await getUserById(params.id);
  if (!user) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }
  return Response.json(user);
}

// app/actions/users.ts (Server Actions - POST)
'use server';

import { insertUser } from '@/db/queries/users';

export async function createUser(formData: FormData) {
  // Separate business logic - uses shared data access function
  const name = formData.get('name');
  const email = formData.get('email');

  // Proper type checking instead of "as string"
  if (typeof name !== 'string' || typeof email !== 'string') {
    return { error: 'Name and email are required' };
  }

  const result = await insertUser({ name, email });
  return { success: true, result };
}
```

## Authentication & User Management

This project uses a **guest account system** based on email addresses, without requiring traditional authentication. Users are automatically created when they register for programs.

### User Management Workflow

1. **New User Registration**: When a user submits a form with an email that doesn't exist, a new user account is created automatically
2. **Returning Users**: When a user with an existing email submits a form, their existing account is used
3. **No Login Required**: Users can register multiple times without needing to log in
4. **Email-Based Identification**: Email addresses uniquely identify users

### User Account Structure

The `user` table serves as a master table for:
- **Adult Program Registrations**: Direct link for adult participants
- **Junior Program Registrations**: Parent/guardian contact information for junior participants

### Example Workflow

```typescript
// Server action automatically handles user creation
export async function registerUser(formData: UserFormData) {
  // Step 1: Get or create user by email
  const user = await getOrCreateUser({
    firstName: formData.firstName,
    lastName: formData.lastName,
    email: formData.email,
    phoneNumber: formData.phoneNumber,
  });

  // Step 2: Create registration linked to user
  const registration = await createRegistration({
    userId: user.id,
    // ... other fields
  });

  return { success: true, userId: user.id };
}
```

This approach provides a frictionless user experience while maintaining data integrity through proper foreign key relationships.

## Development Guidelines

1. **Always reference the mockups** before implementing any UI changes
2. **Maintain consistency** with the established design system
3. **Follow the backend architecture** strictly to maintain separation of concerns
4. **Write TypeScript** with proper typing throughout the codebase
5. **Avoid using "as any" type assertions** - Instead, properly type your variables, create proper interfaces, or use type guards. Using "as any" defeats the purpose of TypeScript's type safety and should only be used as a last resort when dealing with unavoidable external libraries.
6. **Ensure responsive design** works across all device sizes
7. **Use Next.js Link component** - All navigation links within the site should use Next.js `<Link>` component from `next/link` instead of standard `<a>` tags. The only exception is external links or `tel:`/`mailto:` links. This provides better performance with client-side navigation and proper SEO.

## Project Structure (Recommended)

```
toskigolfacademy/
├── app/
│   ├── actions/          # Server Actions (POST requests)
│   ├── api/              # API Routes (GET requests)
│   ├── components/       # Reusable components
│   │   └── forms/       # Form components using react-hook-form
│   ├── junior-programs/  # Junior program pages
│   ├── adult-programs/   # Adult program pages
│   ├── lib/             # Utility functions
│   └── mock/            # Design mockups
├── db/
│   ├── queries/          # Data Access Layer (Drizzle queries)
│   │   ├── users.ts     # User-related queries
│   │   └── junior-registrations.ts  # Junior registration queries
│   ├── schema.ts         # Drizzle schema definitions
│   └── index.ts         # Database connection
├── drizzle/             # Migration files
├── public/              # Static assets
└── AGENTS.md           # This file
```

## Notes

- Mock images are design references; implement the design faithfully but don't hesitate to improve UX where possible
- The backend architecture ensures clean separation between read (API routes) and write (server actions) operations
- All data access should go through the dedicated data access layer
- No mixing of API route and server action implementations
- All forms must use react-hook-form with Zod validation for type safety and consistent user experience
- User accounts are automatically created based on email - no manual account creation needed
- Forms should follow the established pattern: Zod schema → React Hook Form → shadcn/ui components → Server action

