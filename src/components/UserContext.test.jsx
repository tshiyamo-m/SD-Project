import React from 'react';
import { render, screen } from '@testing-library/react';
import { UserProvider, useUser } from './UserContext';
import userEvent from '@testing-library/user-event';

const TestComponent = () => {
  const { userId, setUserId } = useUser();

  return (
    <div>
      <p data-testid="user-id">{userId || 'No ID'}</p>
      <button onClick={() => setUserId('12345')}>Set User ID</button>
    </div>
  );
};

describe('UserContext', () => {
  it('renders children inside UserProvider', () => {
    render(
      <UserProvider>
        <div data-testid="child">Hello</div>
      </UserProvider>
    );
    expect(screen.getByTestId('child')).toHaveTextContent('Hello');
  });

  it('provides default value as null and updates userId', async () => {
    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    expect(screen.getByTestId('user-id')).toHaveTextContent('No ID');

    await userEvent.click(screen.getByText('Set User ID'));

    expect(screen.getByTestId('user-id')).toHaveTextContent('12345');
  });
});
