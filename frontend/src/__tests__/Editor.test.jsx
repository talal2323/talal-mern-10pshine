import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom'; // Changed BrowserRouter to MemoryRouter
import Editor from '../pages/Editor';

// 1. Mock React Quill so Jest doesn't crash on its complex DOM math
jest.mock('react-quill-new', () => {
  return function DummyQuill({ value, onChange, placeholder }) {
    return (
      <textarea
        data-testid="quill-editor"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    );
  };
});

describe('Frontend Editor UI', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it('renders the Create Note UI correctly when ID is "new"', () => {
    render(
      // MemoryRouter lets us trick the test into starting exactly at /editor/new
      <MemoryRouter initialEntries={['/editor/new']}>
        <Routes>
          <Route path="/editor/:id" element={<Editor />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText('Note Title...')).toBeInTheDocument();
    expect(screen.getByText('Save Note')).toBeInTheDocument();
  });

  it('attempts to save a note when Save is clicked', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({ message: 'Success' }),
    });

    render(
      <MemoryRouter initialEntries={['/editor/new']}>
        <Routes>
          <Route path="/editor/:id" element={<Editor />} />
        </Routes>
      </MemoryRouter>
    );

    // Fill out the form
    fireEvent.change(screen.getByPlaceholderText('Note Title...'), {
      target: { value: 'Test Title' },
    });
    
    fireEvent.change(screen.getByTestId('quill-editor'), {
      target: { value: '<p>Test Content</p>' },
    });

    // Click Save
    fireEvent.click(screen.getByText('Save Note'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith('/api/notes', expect.any(Object));
    });
  });
});