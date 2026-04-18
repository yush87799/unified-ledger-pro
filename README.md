# Unified Ledger Pro 📊

**Modern Enterprise Inventory Management, Billing & GST System.**

This is a comprehensive, high-velocity financial ecosystem built to synchronize inventory, handle intelligent billing, and maintain global tax compliance. We utilize a modern **Services Architecture** to ensure high availability, separation of concerns, and scalable deployments.

## 🌐 Live Deployment

- **Production Domain:** [https://unified-ledger-pro.vercel.app](https://unified-ledger-pro.vercel.app)
- **Latest Preview:** [https://unified-ledger-gzxbtvasw-pratyushs-projects-8cf4f6d2.vercel.app](https://unified-ledger-gzxbtvasw-pratyushs-projects-8cf4f6d2.vercel.app)

## 🚀 Tech Stack

**Frontend (`ULP-frontend`):**
- **Framework:** Next.js 15 (App Router)
- **Library:** React 19
- **Styling & UI:** Tailwind CSS, Radix UI & shadcn/ui
- **Icons:** Lucide React
- **State & Data:** React Hook Form + Zod, Recharts

**Backend (`ULP-backend`):**
- Node.js (v20+)
- TypeScript

## 🏗️ Project Structure

```text
/
├── ULP-frontend/               # Next.js App Router application
├── ULP-backend/
│   └── src/
│       └── services/
│           ├── dashboard/      # Analytics and aggregate data service
│           ├── inventory/      # Product and stock management service
│           ├── invoicing/      # Billing and GST generation service
│           └── settings/       # User preferences and tenant configurations
├── .github/                    # Monorepo CI/CD Workflows
└── README.md
```

## 📦 Getting Started

Make sure you have Node.js (v20+) installed. Each service is a separate package.

### Starting the Frontend

```bash
cd ULP-frontend
npm install
npm run dev
```
Open http://localhost:9002 to view the client application.

### Starting a Backend Service (Example: Inventory)

```bash
cd ULP-backend/src/services/inventory
npm install
npm run dev
```

> **Note:** To run all services at once, consider using a monorepo tool like [Turborepo](https://turbo.build/repo) or [Nx](https://nx.dev).

## 🤝 Contributing

We follow a feature-branch workflow. `main` is our stable/production branch, and `develop` is our active integration branch.

1.  **Checkout `develop`**
    ```bash
    git checkout develop
    git pull origin develop
    ```

2.  **Create a new branch**
    ```bash
    git checkout -b your-name/feature-name
    ```

3.  **Commit, Push, and Open a PR**
    Make your changes, commit, push your branch, and open a Pull Request against the `develop` branch on GitHub.
