# Unified Ledger Pro 📊

**Modern Enterprise Inventory Management, Billing & GST System.**

This is a comprehensive, high-velocity financial ecosystem built to synchronize inventory, handle intelligent billing, and maintain global tax compliance. 

## 🌐 Live Deployment

- **Production Domain:** [https://unified-ledger-pro.vercel.app](https://unified-ledger-pro.vercel.app)
- **Latest Preview:** [https://unified-ledger-gzxbtvasw-pratyushs-projects-8cf4f6d2.vercel.app](https://unified-ledger-gzxbtvasw-pratyushs-projects-8cf4f6d2.vercel.app)

## 🚀 Tech Stack

This project is built with a modern frontend stack:

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Library:** [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [Radix UI](https://www.radix-ui.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Forms & Validation:** [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Charts:** [Recharts](https://recharts.org/)

## 📦 Getting Started

First, make sure you have Node.js (v20+) installed. Then, install the dependencies:

```bash
npm install
```

Next, run the development server:

```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the application.

## 🏗️ Project Structure

- `/src/app` - Next.js App Router pages, layouts, and API routes.
- `/src/components` - Reusable UI components (buttons, dialogs, charts).
- `/src/data` - Local mock data (e.g., inventory).
- `/src/lib` - Utility functions, roles, and configuration.

## 🤝 Contributing

We follow a feature-branch workflow. `main` is our stable/production branch, and `develop` is our active integration branch.

1. Checkout the `develop` branch and make sure it's up to date:
   ```bash
   git checkout develop
   git pull origin develop
   ```
2. Create a new branch for your work (using your name and the feature you are building):
   ```bash
   git checkout -b your-name/feature-name
   ```
3. Make your changes, commit, and push your branch:
   ```bash
   git push -u origin your-name/feature-name
   ```
4. Open a **Pull Request (PR)** against the **`develop`** branch on GitHub.