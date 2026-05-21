import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';

// Mock the localStorage
const localStorageMock = (() => {
  let store = { token: 'fake-token' };
  return {
    getItem: (key) => store[key],
    setItem: (key, value) => { store[key] = value.toString() },
    removeItem: (key) => { delete store[key] },
    clear: () => { store = {} }
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Frontend Dashboard UI', () => {
  beforeEach(() => {
    // Reset the fetch mock before each test
    global.fetch = jest.fn();
  });

  it('renders the empty state when there are no notes', async () => {
    // Mock a successful API call returning an empty array
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue([]),
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    // Wait for the loader to disappear and empty state to appear
    await waitFor(() => {
      expect(screen.getByText('No notes found')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your search or create a new note.')).toBeInTheDocument();
    });
  });

  it('renders a grid of notes when data is returned', async () => {
    // Mock a successful API call returning fake notes
    const mockNotes = [
      { _id: '1', title: 'My First Note', content: 'Hello World', createdAt: '2025-10-12T00:00:00.000Z' },
      { _id: '2', title: 'Project Ideas', content: 'MERN Stack App', createdAt: '2025-10-13T00:00:00.000Z' },
    ];

    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue(mockNotes),
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('My First Note')).toBeInTheDocument();
      expect(screen.getByText('Project Ideas')).toBeInTheDocument();
      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });
  });
});