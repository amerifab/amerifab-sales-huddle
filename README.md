# AmeriFab Sales Huddle

A customer intelligence and sales preparation platform for AmeriFab Inc. Built to help sales reps "Know Before You Go" by maintaining comprehensive customer dossiers and AI-generated narratives.

## Features

### Customer Management
- **Customer Directory**: View and search all customers with filtering by name, location, or rep
- **Customer Profiles**: Track company details, contacts, assigned rep, and account type (Key Account, Growth, Prospect)
- **Insights Timeline**: Chronological view of all customer intelligence

### Insights System
Four types of insights to capture customer intelligence:
- **Context**: What's happening in their world (market conditions, company news, etc.)
- **Need**: Unstated pain points they haven't explicitly asked us to solve
- **Action**: How we've helped them or steps we've taken
- **Dossier**: Key facts to remember (contacts, preferences, history)

### The Whole Story (AI-Powered)
- **AI-Generated Narratives**: Claude synthesizes all customer insights into a cohesive story
- **Persistent Storage**: Stories are saved and load instantly on return visits
- **Auto-Update**: When new insights are added, the story automatically updates to incorporate new information
- **Regenerate Option**: Full rewrite available when needed

### Sales Huddle Check-In
- Quick-entry form for capturing insights before/after customer meetings
- Batch save multiple insight types at once
- Auto-fills rep name from logged-in user

### Export & Search
- **Global Search**: Find customers or insights by keyword
- **Export**: Download customer dossiers as Text or JSON
- **Print**: Print-friendly formatting for check-in forms

### Role-Based Access
- **ADMIN**: Full access including user management
- **MANAGER**: Can view and edit all insights
- **REP**: Can view all customers, can only edit own insights

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5 (Auth.js)
- **AI**: Claude API (Anthropic) for story generation
- **Styling**: Tailwind CSS with inline styles
- **Deployment**: AWS Amplify

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Anthropic API key (for AI features)

### Installation

```bash
# Clone the repository
git clone https://github.com/amerifab/amerifab-sales-huddle.git
cd amerifab-sales-huddle

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your values

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Seed the database (optional)
npm run db:seed

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file with:

```env
# Database (PostgreSQL connection string)
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

# NextAuth
AUTH_SECRET="generate-a-random-secret-here"
AUTH_TRUST_HOST=true
AUTH_URL="https://your-domain.com"  # Production only

# Claude API (for "The Whole Story" feature)
ANTHROPIC_API_KEY="sk-ant-api03-..."
```

Generate AUTH_SECRET with:
```bash
openssl rand -base64 32
```

## Database Schema

### User
| Field | Type | Description |
|-------|------|-------------|
| id | String | Unique identifier |
| email | String | Login email (unique) |
| password | String | Hashed password |
| name | String | Display name |
| role | String | REP, MANAGER, or ADMIN |

### Customer
| Field | Type | Description |
|-------|------|-------------|
| id | String | Unique identifier |
| name | String | Company name |
| location | String? | City/State |
| contact | String? | Primary contact name |
| rep | String? | Assigned sales rep |
| type | String | Key Account, Growth, or Prospect |
| notes | String? | General notes |
| story | String? | AI-generated narrative |
| storyGeneratedAt | DateTime? | When story was last updated |

### Insight
| Field | Type | Description |
|-------|------|-------------|
| id | String | Unique identifier |
| type | String | context, need, action, or dossier |
| content | String | The insight text |
| rep | String? | Rep who added it |
| date | DateTime | When it was recorded |
| customerId | String | Related customer |
| createdBy | String? | User who created it |

## API Endpoints

### Authentication
- `POST /api/auth/callback/credentials` - Login

### Customers
- `GET /api/customers` - List all customers
- `POST /api/customers` - Create customer
- `GET /api/customers/[id]` - Get customer details
- `PUT /api/customers/[id]` - Update customer
- `DELETE /api/customers/[id]` - Delete customer

### Insights
- `POST /api/customers/[id]/insights` - Add insight(s)
- `DELETE /api/insights/[id]` - Delete insight

### Story
- `GET /api/customers/[id]/story` - Get saved story
- `POST /api/customers/[id]/story` - Generate/regenerate story

### Health
- `GET /api/health` - Check database and env status

## Deployment (AWS Amplify)

### Setup

1. Connect your GitHub repository to AWS Amplify
2. Set the platform to **WEB_COMPUTE** (SSR)
3. Add environment variables at the **branch level**:
   - `DATABASE_URL`
   - `AUTH_SECRET`
   - `AUTH_URL`
   - `AUTH_TRUST_HOST=true`
   - `ANTHROPIC_API_KEY`

### Build Settings

The `amplify.yml` file handles:
- Creating `.env` file from environment variables during build
- Copying env file to `.next/server/` for runtime access

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - printenv | grep -E "^(DATABASE_URL|AUTH_|ANTHROPIC)" > .env
        - npm run build
        - cp .env .next/server/.env
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
```

### Database (RDS)

1. Create a PostgreSQL RDS instance
2. Configure security group to allow connections from Amplify
3. Run migrations: `npx prisma db push`

## Scripts

```bash
# Development
npm run dev          # Start dev server

# Database
npm run db:seed      # Seed sample data
npm run db:studio    # Open Prisma Studio
npm run db:migrate   # Run migrations
npm run db:generate  # Regenerate Prisma client

# Production
npm run build        # Build for production
npm run start        # Start production server
```

## Import Scripts

Located in `/scripts/`:

- `import-users.ts` - Import user accounts
- `import-customers.ts` - Import customer data from Q1 Rep Assignments

Run with:
```bash
DATABASE_URL="your-connection-string" npx tsx scripts/import-users.ts
```

## User Accounts

Default password for all users: `AmeriFab2026!`

| Name | Email | Role |
|------|-------|------|
| Ryan Spence | rspence@amerifabinc.com | ADMIN |
| Andrew Akers | aakers@amerifabinc.com | REP |
| Todd Soja | tsoja@amerifabinc.com | REP |
| Sean Collins | scollins@amerifabinc.com | REP |
| Kirby Roudebush | kroudebush@amerifabinc.com | REP |

## Customer Data

99 customers imported from Q1 Rep Assignments:

| Rep | Customers |
|-----|-----------|
| Collins | 39 |
| Roudebush | 25 |
| Akers | 18 |
| Soja | 17 |

Distribution by type:
- Key Account: 21
- Growth: 32
- Prospect: 46

## The Whole Story - How It Works

1. **Generate**: Click "Generate The Whole Story" to create an AI narrative from all insights
2. **Persist**: Story is saved to the customer record for instant loading
3. **Auto-Update**: When new insights are added via the app, the story automatically updates in the background
4. **Regenerate**: Use "Regenerate" for a complete rewrite from scratch

The AI uses Amazon's Customer Obsession leadership principle as a guide, structuring the story as:
- Who They Are
- Their World Right Now
- The Pain We Can Address
- Our Opportunity to Obsess
- The Trust-Building Path

## License

Proprietary - AmeriFab Inc.

---

Built with Claude Code
