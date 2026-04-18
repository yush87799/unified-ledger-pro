export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 w-full min-w-0 p-6 md:p-8">
      {children}
    </div>
  );
}
