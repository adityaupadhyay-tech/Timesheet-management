# TikTikTow - Timesheet Management System

A modern, role-based timesheet management application built with Next.js, TypeScript, Tailwind CSS, and Shadcn/UI components.

## Features

### Phase 1 - Frontend Foundation ✅

- **Authentication Pages**: Login and Registration with form validation
- **Role-Based Dashboard**: Different views for Admin, Manager, and Employee roles
- **Modern UI**: Built with Shadcn/UI components and Tailwind CSS
- **Responsive Design**: Mobile-first approach with responsive navigation
- **TypeScript**: Full type safety throughout the application

### Role-Based Features

#### Admin Dashboard

- User management overview
- Project management statistics
- System health monitoring
- Pending approvals tracking
- Quick actions for user and project creation

#### Manager Dashboard

- Team member overview
- Pending approvals for team
- Team hours tracking
- Team management tools

#### Employee Dashboard

- Personal time tracking
- Leave balance display
- Current project status
- Quick time logging

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/UI
- **Icons**: Lucide React
- **State Management**: React Hooks (ready for Context/Redux)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/adityaupadhyay-tech/TikTikTow.git
cd TikTikTow
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Dashboard page
│   ├── login/            # Login page
│   ├── register/         # Registration page
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page (redirects to login)
├── components/           # Reusable components
│   ├── ui/              # Shadcn/UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── label.tsx
│   └── Navigation.tsx   # Main navigation component
├── lib/                 # Utility functions
│   └── utils.ts         # Class name utilities
└── types/               # TypeScript type definitions
    └── index.ts         # Application types
```

## Development Notes

### TODO: Backend Integration

The application currently uses placeholder data and simulated API calls. The following areas need backend integration:

- **Authentication**: Replace placeholder login/register with real API calls
- **User Management**: Connect user data to backend services
- **Timesheet Data**: Integrate with timesheet tracking APIs
- **Leave Management**: Connect leave request system
- **Role-Based Access**: Implement proper authorization

### Testing Different Roles

To test different dashboard views, modify the `currentUser.role` in `src/app/dashboard/page.tsx`:

```typescript
const [currentUser] = useState({
  name: "John Doe",
  role: "admin" as UserRole, // Change to: 'admin', 'manager', or 'employee'
  email: "john.doe@company.com",
});
```

### Styling

The application uses a custom theme based on Shadcn/UI with:

- CSS variables for consistent theming
- Dark mode support (ready for implementation)
- Responsive design patterns
- Accessible component structure

## Future Phases

### Phase 2 - Backend Integration

- API development with Node.js/Express or Next.js API routes
- Database integration (PostgreSQL/MongoDB)
- Authentication system (JWT/OAuth)
- Real-time notifications

### Phase 3 - Advanced Features

- Time tracking with timer functionality
- Project management tools
- Reporting and analytics
- Mobile app development

### Phase 4 - Enterprise Features

- Multi-tenant support
- Advanced reporting
- Integration with HR systems
- API for third-party integrations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support and questions, please open an issue in the repository.
