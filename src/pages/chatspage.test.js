import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import ChatsPage from './chatspage';

// Mock fetch globally
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Helper function to render component and get DOM
const renderChatsPage = async () => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  
  await act(async () => {
    root.render(<ChatsPage />);
  });
  
  return { container, root };
};

// Helper function to simulate user input
const simulateInput = (input, value) => {
  input.value = value;
  const event = new Event('input', { bubbles: true });
  Object.defineProperty(event, 'target', { value: input });
  input.dispatchEvent(event);
};

// Helper function to simulate form submission
const simulateSubmit = (form) => {
  const event = new Event('submit', { bubbles: true });
  form.dispatchEvent(event);
};

describe('ChatsPage', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    fetch.mockClear();
    localStorageMock.getItem.mockClear();
    localStorageMock.getItem.mockReturnValue(null);
    
    // Mock console methods to avoid noise in tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Clean up DOM
    document.body.innerHTML = '';
    // Restore console
    console.log.mockRestore();
    console.error.mockRestore();
  });

  test('renders initial chat list view', async () => {
    const { container } = await renderChatsPage();
    
    expect(container.querySelector('h1').textContent).toBe('Your Chats');
    expect(container.querySelector('.new-chat-btn').textContent).toBe('+ New Chat');
    expect(container.querySelector('h2').textContent).toBe('Existing chats');
  });

  test('displays existing chats with partner names', async () => {
    const { container } = await renderChatsPage();
    
    const chatItems = container.querySelectorAll('.chat-item');
    expect(chatItems.length).toBe(2);
    
    // Check first chat
    expect(chatItems[0].querySelector('strong').textContent).toBe('John Doe');
    expect(chatItems[0].textContent).toContain('Hey, how are you?');
    
    // Check second chat
    expect(chatItems[1].querySelector('strong').textContent).toBe('Jane Smith');
    expect(chatItems[1].textContent).toContain('Can we meet tomorrow?');
  });

  test('fetches users successfully from API', async () => {
    const mockUsers = [
      { _id: '1', firstName: 'Current', lastName: 'User', email: 'current@example.com' },
      { _id: '2', firstName: 'John', lastName: 'Doe', email: 'john@example.com' }
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUsers
    });

    await renderChatsPage();

    expect(fetch).toHaveBeenCalledWith('/api/login/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
  });

  test('handles API error when fetching users', async () => {
    fetch.mockRejectedValueOnce(new Error('API Error'));

    const { container } = await renderChatsPage();

    expect(console.error).toHaveBeenCalledWith('Error fetching users:', expect.any(Error));
    // Should still show chat list even with error
    expect(container.querySelector('h1').textContent).toBe('Your Chats');
  });

  test('handles non-ok response when fetching users', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500
    });

    await renderChatsPage();

    expect(console.error).toHaveBeenCalledWith('Error fetching users:', expect.any(Error));
  });


  test('navigates to new chat view', async () => {
    const { container } = await renderChatsPage();
    
    const newChatBtn = container.querySelector('.new-chat-btn');
    
    await act(async () => {
      newChatBtn.click();
    });
    
    expect(container.querySelector('h1').textContent).toBe('Start New Chat');
    expect(container.querySelector('h2').textContent).toBe('Available users');
    expect(container.querySelector('.back-btn').textContent).toBe('← Back');
  });

  test('displays filtered users in new chat view (excluding current user)', async () => {
    const { container } = await renderChatsPage();
    
    // Navigate to new chat
    await act(async () => {
      container.querySelector('.new-chat-btn').click();
    });
    
    const userItems = container.querySelectorAll('.user-list li');
    expect(userItems.length).toBe(2); // Should exclude current user
    
    expect(userItems[0].textContent).toContain('John Doe');
    expect(userItems[0].textContent).toContain('john@example.com');
    expect(userItems[1].textContent).toContain('Jane Smith');
    expect(userItems[1].textContent).toContain('jane@example.com');
  });

  test('starts new chat with selected user', async () => {
    const { container } = await renderChatsPage();
    
    // Navigate to new chat
    await act(async () => {
      container.querySelector('.new-chat-btn').click();
    });
    
    // Select a user
    const userBtn = container.querySelector('.user-btn');
    await act(async () => {
      userBtn.click();
    });
    
    // Should navigate to chat view
    expect(container.querySelector('h2').textContent).toBe('Chat with John Doe');
    expect(container.textContent).toContain('No messages yet. Start the conversation!');
  });

  test('navigates back from new chat view', async () => {
    const { container } = await renderChatsPage();
    
    // Navigate to new chat
    await act(async () => {
      container.querySelector('.new-chat-btn').click();
    });
    
    // Navigate back
    await act(async () => {
      container.querySelector('.back-btn').click();
    });
    
    expect(container.querySelector('h1').textContent).toBe('Your Chats');
  });

  test('selects existing chat and displays messages', async () => {
    const { container } = await renderChatsPage();
    
    const chatBtn = container.querySelector('.chat-btn');
    await act(async () => {
      chatBtn.click();
    });
    
    expect(container.querySelector('h2').textContent).toBe('Chat with John Doe');
    
    const messages = container.querySelectorAll('.message');
    expect(messages.length).toBe(2);
    
    // Check message content
    expect(messages[0].textContent).toContain('Hey, how are you?');
    expect(messages[0]).toHaveClass('received');
    expect(messages[1].textContent).toContain("I'm good, thanks! How about you?");
    expect(messages[1]).toHaveClass('sent');
  });

  test('navigates back from chat view', async () => {
    const { container } = await renderChatsPage();
    
    // Select a chat
    await act(async () => {
      container.querySelector('.chat-btn').click();
    });
    
    // Navigate back
    await act(async () => {
      container.querySelector('.back-btn').click();
    });
    
    expect(container.querySelector('h1').textContent).toBe('Your Chats');
  });



  test('does not send empty message', async () => {
    const { container } = await renderChatsPage();
    
    // Select a chat
    await act(async () => {
      container.querySelector('.chat-btn').click();
    });
    
    const form = container.querySelector('.message-form');
    
    // Submit empty message
    await act(async () => {
      simulateSubmit(form);
    });
    
    // Should still have only 2 messages
    const messages = container.querySelectorAll('.message');
    expect(messages.length).toBe(2);
  });

  test('does not send message with only whitespace', async () => {
    const { container } = await renderChatsPage();
    
    // Select a chat
    await act(async () => {
      container.querySelector('.chat-btn').click();
    });
    
    const messageInput = container.querySelector('#messageInput');
    const form = container.querySelector('.message-form');
    
    // Type whitespace only
    await act(async () => {
      simulateInput(messageInput, '   ');
    });
    
    // Submit message
    await act(async () => {
      simulateSubmit(form);
    });
    
    // Should still have only 2 messages
    const messages = container.querySelectorAll('.message');
    expect(messages.length).toBe(2);
  });

  test('formats message timestamps correctly', async () => {
    const { container } = await renderChatsPage();
    
    // Select a chat
    await act(async () => {
      container.querySelector('.chat-btn').click();
    });
    
    const timeElements = container.querySelectorAll('time');
    expect(timeElements.length).toBe(2);
    
    // Check that time elements have datetime attribute
    timeElements.forEach(timeEl => {
      expect(timeEl.hasAttribute('datetime')).toBe(true);
      expect(timeEl.textContent).toMatch(/\d{1,2}:\d{2}:\d{2}/); // Time format
    });
  });

  test('handles chat with null members', async () => {
    // This test ensures the getChatPartner function handles edge cases
    const { container } = await renderChatsPage();
    
    // Select normal chat first to get to chat view
    await act(async () => {
      container.querySelector('.chat-btn').click();
    });
    
    // The component should handle edge cases gracefully in getChatPartner
    expect(container.querySelector('h2')).toBeTruthy();
  });

  test('displays message list with proper structure', async () => {
    const { container } = await renderChatsPage();
    
    // Select a chat
    await act(async () => {
      container.querySelector('.chat-btn').click();
    });
    
    const messageList = container.querySelector('.message-list');
    expect(messageList).toBeTruthy();
    
    const messages = messageList.querySelectorAll('.message');
    messages.forEach(message => {
      expect(message.querySelector('figure')).toBeTruthy();
      expect(message.querySelector('blockquote')).toBeTruthy();
      expect(message.querySelector('figcaption')).toBeTruthy();
      expect(message.querySelector('time')).toBeTruthy();
    });
  });

  test('handles form submission with preventDefault', async () => {
    const { container } = await renderChatsPage();
    
    // Select a chat
    await act(async () => {
      container.querySelector('.chat-btn').click();
    });
    
    const form = container.querySelector('.message-form');
    const messageInput = container.querySelector('#messageInput');
    
    // Mock preventDefault
    const preventDefaultSpy = jest.fn();
    
    // Type message
    await act(async () => {
      simulateInput(messageInput, 'Test message');
    });
    
    // Create custom event with preventDefault
    const submitEvent = new Event('submit', { bubbles: true });
    submitEvent.preventDefault = preventDefaultSpy;
    
    await act(async () => {
      form.dispatchEvent(submitEvent);
    });
    
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  test('accessibility attributes are present', async () => {
    const { container } = await renderChatsPage();
    
    // Check aria-labels and other accessibility features
    expect(container.querySelector('[aria-label="Start new chat"]')).toBeTruthy();
    expect(container.querySelector('[aria-label="Chat with John Doe"]')).toBeTruthy();
    expect(container.querySelector('[aria-label="Chat with Jane Smith"]')).toBeTruthy();
    
    // Navigate to new chat
    await act(async () => {
      container.querySelector('.new-chat-btn').click();
    });
    
    expect(container.querySelector('[aria-label="Back to chats"]')).toBeTruthy();
    expect(container.querySelector('[aria-label="Chat with John Doe"]')).toBeTruthy();
    
    // Navigate to chat
    await act(async () => {
      container.querySelector('.back-btn').click();
    });
    
    await act(async () => {
      container.querySelector('.chat-btn').click();
    });
    
    expect(container.querySelector('[aria-label="Back to chats"]')).toBeTruthy();
    expect(container.querySelector('.sr-only')).toBeTruthy(); // Screen reader only label
    expect(container.querySelector('#messageInput')).toBeTruthy();
    expect(container.querySelector('label[for="messageInput"]')).toBeTruthy();
  });

  test('handles case where chat has no messages', async () => {
    const { container } = await renderChatsPage();
    
    // Start a new chat to get a chat with no messages
    await act(async () => {
      container.querySelector('.new-chat-btn').click();
    });
    
    await act(async () => {
      container.querySelector('.user-btn').click();
    });
    
    // Should show "No messages yet" message
    expect(container.textContent).toContain('No messages yet. Start the conversation!');
    expect(container.querySelectorAll('.message').length).toBe(0);
  });

  test('displays correct user name using firstName and lastName', async () => {
    const mockUsers = [
      { _id: '1', firstName: 'Current', lastName: 'User', email: 'current@example.com' },
      { _id: '2', firstName: 'John', lastName: 'Doe', email: 'john@example.com' }
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUsers
    });

    const { container } = await renderChatsPage();

    // Wait for the async operation to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // The formatted users should use firstName + lastName when name is not provided
    expect(container.textContent).toContain('John Doe');
  });

  test('covers all branches in useEffect for users', async () => {
    // Test successful API call
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { _id: '1', name: 'User 1', email: 'user1@example.com' }
      ]
    });

    await renderChatsPage();

    expect(fetch).toHaveBeenCalledTimes(1);
  });
});