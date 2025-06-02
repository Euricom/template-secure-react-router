# Secure React Router Template

A secure, production-ready React application template with built-in authentication, authorization, and organization management.

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm
- PostgreSQL

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/template-secure-react-router.git
cd template-secure-react-router
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

Edit `.env` with your configuration.

4. Set up the database:

```bash
# Generate Prisma client
pnpm prisma:generate

# Run database migrations
pnpm prisma:migrate
```

5. Start the development server:

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`.

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm test` - Run tests
- `pnpm typecheck` - Type check the application
- `pnpm format` - Format code with Prettier
- `pnpm prisma:studio` - Open Prisma Studio (database UI)

## Documentation

For detailed documentation, please refer to the [docs](./docs) directory:

- [Getting Started](./docs/index.md#getting-started)
- [Security & Authentication](./docs/index.md#security--authentication)
- [Features](./docs/index.md#features)
- [Development](./docs/index.md#development)
