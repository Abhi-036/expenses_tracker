import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  IconGrid,
  IconList,
  IconTarget,
  IconTag,
  IconFileText,
  IconRepeat,
  IconUser,
  IconBook,
  IconLogOut,
} from './icons.jsx';

const links = [
  { to: '/', label: 'Dashboard', icon: IconGrid, end: true },
  { to: '/transactions', label: 'Transactions', icon: IconList },
  { to: '/budgets', label: 'Budgets', icon: IconTarget },
  { to: '/categories', label: 'Categories', icon: IconTag },
  { to: '/reports', label: 'Reports', icon: IconFileText },
  { to: '/recurring', label: 'Recurring', icon: IconRepeat },
  { to: '/profile', label: 'Profile', icon: IconUser },
  { to: '/docs', label: 'How It Works', icon: IconBook },
];

export default function Sidebar({ open, onClose }) {
  const { logout } = useAuth();

  return (
    <>
      <div
        className={`sidebar-backdrop ${open ? 'open' : ''}`}
        onClick={onClose}
      />

      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="logo-mark">W</div>
          <span>Wealthline</span>
        </div>

        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onClose}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <Icon className="sidebar-icon" />
            {label}
          </NavLink>
        ))}

        <div className="sidebar-footer">
          <button
            className="sidebar-link"
            style={{
              width: '100%',
              border: 'none',
              background: 'none',
            }}
            onClick={logout}
          >
            <IconLogOut className="sidebar-icon" />
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}
