import React, { useState } from 'react';
import MainLayout from '../layouts/MainLayout.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { authService } from '../services/authService.js';
import { getErrorMessage } from '../services/api.js';

const currencies = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD'];

const avatarColors = [
  '#a13d5f',
  '#c9184a',
  '#d8a24a',
  '#5390d9',
  '#4caf7d',
  '#9d4edd'
];

export default function Profile() {
  const { user, updateUser, logout } = useAuth();

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    currency: user?.currency || 'USD',
    avatarColor: user?.avatarColor || '#a13d5f'
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: ''
  });

  const [profileMsg, setProfileMsg] = useState(null);
  const [passwordMsg, setPasswordMsg] = useState(null);

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    setProfileMsg(null);
    setSavingProfile(true);

    try {
      const res = await authService.updateProfile(profileForm);

      updateUser(res.user);

      setProfileMsg({
        type: 'success',
        text: 'Profile updated successfully.'
      });
    } catch (err) {
      setProfileMsg({
        type: 'error',
        text: getErrorMessage(err)
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    setPasswordMsg(null);
    setSavingPassword(true);

    try {
      await authService.changePassword(passwordForm);

      setPasswordMsg({
        type: 'success',
        text: 'Password changed successfully.'
      });

      setPasswordForm({
        currentPassword: '',
        newPassword: ''
      });
    } catch (err) {
      setPasswordMsg({
        type: 'error',
        text: getErrorMessage(err)
      });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <MainLayout title="Profile">

      <div className="page-header">
        <div>
          <h1>Profile & Account</h1>
          <p>
            Manage your personal information and security settings.
          </p>
        </div>
      </div>

      <div className="grid grid-2">

        {/* Profile Information */}
        <div className="card">
          <h3 className="section-title">
            Profile Information
          </h3>

          {profileMsg && (
            <div className={`alert alert-${profileMsg.type}`}>
              {profileMsg.text}
            </div>
          )}

          <form onSubmit={handleProfileSubmit}>

            <div className="form-group">
              <label>Full Name</label>

              <input
                className="input"
                value={profileForm.name}
                onChange={(e) =>
                  setProfileForm((f) => ({
                    ...f,
                    name: e.target.value
                  }))
                }
              />
            </div>

            <div className="form-group">
              <label>Email</label>

              <input
                className="input"
                value={user?.email || ''}
                disabled
                style={{ opacity: 0.6 }}
              />
            </div>

            <div className="form-group">
              <label>Preferred Currency</label>

              <select
                className="input"
                value={profileForm.currency}
                onChange={(e) =>
                  setProfileForm((f) => ({
                    ...f,
                    currency: e.target.value
                  }))
                }
              >
                {currencies.map((currency) => (
                  <option
                    key={currency}
                    value={currency}
                  >
                    {currency}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Avatar Color</label>

              <div style={{
                display: 'flex',
                gap: 10
              }}>
                {avatarColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() =>
                      setProfileForm((f) => ({
                        ...f,
                        avatarColor: color
                      }))
                    }
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      background: color,
                      border:
                        profileForm.avatarColor === color
                          ? '2px solid #fff'
                          : '2px solid transparent',
                      cursor: 'pointer'
                    }}
                  />
                ))}
              </div>
            </div>

            <button
              className="btn btn-primary"
              type="submit"
              disabled={savingProfile}
            >
              {savingProfile
                ? 'Saving...'
                : 'Save Changes'}
            </button>

          </form>
        </div>


        {/* Password */}
        <div className="card">

          <h3 className="section-title">
            Change Password
          </h3>

          {passwordMsg && (
            <div className={`alert alert-${passwordMsg.type}`}>
              {passwordMsg.text}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit}>

            <div className="form-group">
              <label>Current Password</label>

              <input
                className="input"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm((f) => ({
                    ...f,
                    currentPassword: e.target.value
                  }))
                }
              />
            </div>

            <div className="form-group">
              <label>New Password</label>

              <input
                className="input"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm((f) => ({
                    ...f,
                    newPassword: e.target.value
                  }))
                }
              />
            </div>

            <button
              className="btn btn-primary"
              type="submit"
              disabled={savingPassword}
            >
              {savingPassword
                ? 'Updating...'
                : 'Change Password'}
            </button>

          </form>


          {/* Danger Zone */}
          <div
            style={{
              marginTop: 28,
              paddingTop: 20,
              borderTop:
                '1px solid var(--border-subtle)'
            }}
          >

            <h3
              className="section-title"
              style={{
                color: 'var(--danger)'
              }}
            >
              Danger Zone
            </h3>

            <p
              className="text-muted"
              style={{
                fontSize: 13,
                marginBottom: 12
              }}
            >
              Log out of your account on this device.
            </p>

            <button
              className="btn btn-danger"
              onClick={logout}
            >
              Log Out
            </button>

          </div>

        </div>

      </div>

    </MainLayout>
  );
}

