import AdminShell from './AdminShell';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container" style={{ paddingTop: '1rem', paddingBottom: '2rem' }}>
      <AdminShell>{children}</AdminShell>
    </div>
  );
}
