import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { IconSearch, IconMenu } from './icons.jsx';

export default function Navbar({
  onMenuClick,
  title,
  subtitle,
  search,
  onSearchChange,
}) {
  const { user } = useAuth();
  const initial = user?.name?.charAt(0)?.toUpperCase() || '?';

  return (
    <div className="navbar">
      <button
        className="mobile-menu-toggle"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <IconMenu width={18} height={18} />
      </button>

      {onSearchChange ? (
        <div className="navbar-search">
          <IconSearch />

          <input
            className="input"
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      ) : (
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>
            {title}
          </div>

          {subtitle && (
            <div
              className="text-muted"
              style={{ fontSize: 12.5 }}
            >
              {subtitle}
            </div>
          )}
        </div>
      )}

      <div className="navbar-right">
        <div className="user-chip">
          <div
            className="avatar"
            style={{
              background: user?.avatarColor || '#a13d5f',
            }}
          >
            {initial}
          </div>

          <span
            style={{
              fontSize: 13.5,
              fontWeight: 600,
            }}
          >
            {user?.name}
          </span>
        </div>
      </div>
    </div>
  );
}
