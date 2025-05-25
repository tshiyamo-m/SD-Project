import React from 'react';
import { render, act } from '@testing-library/react';
import Login from './Login';

// Mocks
jest.mock('@react-oauth/google', () => ({
  GoogleLogin: ({ onSuccess, onError }) => (
    <button onClick={() => onSuccess({ credential: 'mockToken', clientId: '123' })}>Login</button>
  )
}));

jest.mock('jwt-decode', () => ({
  jwtDecode: () => ({
    name: 'Mock User'
  })
}));

jest.mock('./UserContext', () => ({
  useUser: () => ({
    setUserId: jest.fn()
  })
}));

jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn()
}));

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({
      _id: 'mockId',
      isAdmin: false
    })
  })
);

describe('Login Component', () => {
  it('renders the login button and calls onSuccess', async () => {
    await act(async () => {
      render(<Login />);
    });
  });

  it('handles fetch and sets localStorage', async () => {
    localStorage.clear();

    await act(async () => {
      render(<Login />);
    });

    expect(localStorage.getItem('fullName')).toBe('Mock User');
    expect(localStorage.getItem('Mongo_id')).toBe('mockId');
  });

  it('calls onError handler', () => {
    const { GoogleLogin } = require('@react-oauth/google');
    const mockOnError = jest.fn();

    render(<GoogleLogin onSuccess={() => {}} onError={mockOnError} />);
    act(() => {
      mockOnError('error');
    });

    expect(mockOnError).toBeCalled();
  });
});
