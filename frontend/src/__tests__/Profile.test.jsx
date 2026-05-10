import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Profile from '../pages/Profile';

// Mock localStorage
const localStorageMock = (() => {
  let store = { token: 'fake-token' };
  return {
    getItem: (key) => store[key],
    removeItem: (key) => { delete store[key] },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Frontend Profile UI', () => {
  beforeEach(() => {
    // A smart mock that returns different data depending on the URL!
    global.fetch = jest.fn((url) => {
      if (url === '/api/auth/me') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ name: 'Real User', email: 'real@user.com', joinDate: 'Oct 2025' }),
        });
      }
      if (url === '/api/notes') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([{}, {}, {}]), // 3 Fake Notes
        });
      }
      return Promise.reject(new Error('API Not Found'));
    });
  });

  it('renders real user data and note stats from APIs', async () => {
    render(
      <MemoryRouter initialEntries={['/profile']}>
        <Routes>
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for the loader to vanish and data to appear
    await waitFor(() => {
      expect(screen.getByText('Real User')).toBeInTheDocument();
      expect(screen.getByText('real@user.com')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument(); // The 3 notes!
    });
  });

  it('removes token and navigates away when Sign Out is clicked', async () => {
    render(
      <MemoryRouter initialEntries={['/profile']}>
        <Routes>
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Sign Out of Account')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Sign Out of Account'));

    // Verify token was destroyed
    expect(localStorage.getItem('token')).toBeUndefined();
  });
});