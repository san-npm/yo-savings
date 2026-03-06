'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { usePrivy } from '@privy-io/react-auth';
import { cn } from '@/lib/utils';

/* ── Filled / stylised icons ── */

const HomeIcon = ({ active }: { active: boolean }) =>
  active ? (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10.707 2.293a1 1 0 0 1 1.414 0l7 7A1 1 0 0 1 19 11h-1v8a2 2 0 0 1-2 2h-3v-5h-2v5H8a2 2 0 0 1-2-2v-8H5a1 1 0 0 1-.707-1.707l7-7Z" />
    </svg>
  ) : (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m3 12 2-2m0 0 7-7 7 7M5 10v10a1 1 0 0 0 1 1h3m10-11 2 2m-2-2v10a1 1 0 0 1-1 1h-3m-6 0a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1m-6 0h6" />
    </svg>
  );

const AccountsIcon = ({ active }: { active: boolean }) =>
  active ? (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm0 4v8h16V8H4Zm2 4h2v2H6v-2Zm4 0h2v2h-2v-2Zm4 0h2v2h-2v-2Z" />
    </svg>
  ) : (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path strokeLinecap="round" d="M2 10h20" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 15h1m4 0h1" />
    </svg>
  );

const ActivityIcon = ({ active }: { active: boolean }) =>
  active ? (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 3h2v18H3V3Zm4 8h2v10H7V11Zm4-4h2v14h-2V7Zm4 6h2v8h-2v-8Zm4-8h2v16h-2V5Z" />
    </svg>
  ) : (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2Zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z" />
    </svg>
  );

const SettingsIcon = ({ active }: { active: boolean }) =>
  active ? (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 0 0-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 0 0-2.282.819l-.922 1.597a1.875 1.875 0 0 0 .432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 0 0 0 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 0 0-.432 2.385l.922 1.597a1.875 1.875 0 0 0 2.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 0 0 2.28-.819l.923-1.597a1.875 1.875 0 0 0-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 0 0 0-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 0 0-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 0 0-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 0 0-1.85-1.567h-1.843ZM12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z" clipRule="evenodd" />
    </svg>
  ) : (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

const allNavItems = [
  { href: '/', Icon: HomeIcon, label: 'Home', requiresAuth: false },
  { href: '/accounts', Icon: AccountsIcon, label: 'Accounts', requiresAuth: true },
  { href: '/activity', Icon: ActivityIcon, label: 'Activity', requiresAuth: true },
  { href: '/settings', Icon: SettingsIcon, label: 'Settings', requiresAuth: true },
];

export function BottomNav() {
  const pathname = usePathname();
  const { authenticated } = usePrivy();

  if (
    pathname.startsWith('/onboard') ||
    pathname.startsWith('/deposit') ||
    pathname.startsWith('/withdraw')
  ) {
    return null;
  }

  const navItems = authenticated
    ? allNavItems
    : allNavItems.filter((item) => !item.requiresAuth);

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E9ECEF] safe-area-pb"
      style={{ boxShadow: '0 -4px 20px rgba(0,0,0,0.06)' }}
    >
      <div className="flex items-center justify-around px-4 py-2">
        {navItems.map(({ href, Icon, label }) => {
          const isActive =
            pathname === href ||
            (href === '/accounts' && pathname.startsWith('/accounts')) ||
            (href === '/activity' && pathname.startsWith('/activity')) ||
            (href === '/settings' && pathname.startsWith('/settings'));

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 rounded-xl relative select-none',
                isActive ? 'text-[#10B981]' : 'text-[#ADB5BD]'
              )}
            >
              {/* tap scale animation */}
              <motion.div
                className="mb-1 flex items-center justify-center"
                whileTap={{ scale: 0.8 }}
                animate={isActive ? { scale: [1, 1.12, 1] } : { scale: 1 }}
                transition={
                  isActive
                    ? { duration: 0.3, ease: 'easeOut' }
                    : { duration: 0.15 }
                }
              >
                <Icon active={isActive} />
              </motion.div>

              <span
                className={cn(
                  'text-xs font-medium truncate transition-colors duration-200',
                  isActive ? 'text-[#10B981]' : 'text-[#ADB5BD]'
                )}
              >
                {label}
              </span>

              {/* Active indicator dot */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#10B981]"
                  style={{ boxShadow: '0 0 6px 2px rgba(16,185,129,0.5)' }}
                  transition={{ layout: { type: 'spring', stiffness: 500, damping: 30 } }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
}
