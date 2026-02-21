'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAdminToken, removeAdminToken } from '@/lib/auth';
import styles from './admin.module.css';

const SIDEBAR_LINKS = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/posts', label: 'Posts & Candidates', icon: '📋' },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLoginPage = pathname === '/admin/login';
  const token = mounted ? getAdminToken() : null;

  useEffect(() => {
    if (!mounted) return;
    if (!isLoginPage && !token) {
      router.replace('/admin/login');
    }
  }, [mounted, isLoginPage, token, router]);

  const handleLogout = () => {
    removeAdminToken();
    router.replace('/admin/login');
  };

  if (!mounted) {
    return (
      <div className={styles.loading}>
        <span>Loading...</span>
      </div>
    );
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!token) {
    return null;
  }

  return (
    <div className={styles.wrapper}>
      <aside className={styles.aside}>
        <div className={styles.brand}>
          <span className={styles.brandIcon}>⚙</span>
          <span className={styles.brandText}>Admin</span>
        </div>
        <nav className={styles.nav}>
          {SIDEBAR_LINKS.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className={pathname === href || (href === '/admin' && pathname === '/admin') ? styles.navLinkActive : styles.navLink}
            >
              <span className={styles.navIcon}>{icon}</span>
              <span>{label}</span>
            </Link>
          ))}
        </nav>
        <div className={styles.asideFooter}>
          <Link href="/" className={styles.backLink}>
            ← Back to site
          </Link>
          <button type="button" onClick={handleLogout} className={styles.logoutBtn}>
            Sign out
          </button>
        </div>
      </aside>
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
}
