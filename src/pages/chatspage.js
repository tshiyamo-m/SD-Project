import React, { useState, useEffect } from "react";
import './chatspage.css';

const ChatsPage = () => {
    const currentUserId = "1";
    const [users, setUsers] = useState([]);
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState("");

    const Mongo_id = localStorage.getItem("Mongo_id"); // Fallback to stub user if not in localStorage

    // Stub data for users
    const stubUsers = [
        { _id: "1", name: "Current User", email: "current@example.com" },
        { _id: "2", name: "John Doe", email: "john@example.com" },
        { _id: "3", name: "Jane Smith", email: "jane@example.com" }
    ];

    useEffect(() => {
            const fetchUsers = async () => {
                try {
                    const response = await fetch('/api/login/users', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
    
                    if (!response.ok) {
                        throw new Error('Failed to fetch users');
                    }
    
                    const result = await response.json();
                    console.log("res". result)
    
                    const formattedUsers = result.map(user => ({
                        _id: user._id, 
                        name: user.name || `${user.firstName} ${user.lastName}`,
                        email: user.email
                    }));
                    //console.log("Successfully found users: ", formattedUsers);
                    
                    setUsers(formattedUsers);
                } catch (error) {
                    console.error('Error fetching users:', error);
                    // Optionally set some error state here
                }
            };
    
            fetchUsers();
        }, 
    []);

    // Stub data for chats
    const stubChats = [
        {
            _id: "chat1",
            members: ["1", "2"],
            messages: [
                { text: "Hey, how are you?", sender: "2", timestamp: new Date().toISOString() }
            ]
        },
        {
            _id: "chat2",
            members: ["1", "3"],
            messages: [
                { text: "Can we meet tomorrow?", sender: "3", timestamp: new Date().toISOString() }
            ]
        }
    ];

    // Stub data for messages in a selected chat
    const stubMessages = {
        "chat1": [
            { _id: "m1", text: "Hey, how are you?", sender: "2", timestamp: new Date(Date.now() - 60000).toISOString() },
            { _id: "m2", text: "I'm good, thanks! How about you?", sender: "1", timestamp: new Date().toISOString() }
        ],
        "chat2": [
            { _id: "m3", text: "Can we meet tomorrow?", sender: "3", timestamp: new Date(Date.now() - 120000).toISOString() },
            { _id: "m4", text: "Sure, what time works for you?", sender: "1", timestamp: new Date(Date.now() - 60000).toISOString() },
            { _id: "m5", text: "How about 2pm?", sender: "3", timestamp: new Date().toISOString() }
        ]
    };

    // API Call to return list of available users - using stub data
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                // In a real app, you would make the API call here
                // const response = await fetch('/api/login/users', {...});
                // const result = await response.json();
                
                // Using stub data instead
                setUsers(stubUsers);
            } catch (error) {
                console.error('Error fetching users:', error);
                // Fallback to stub data
                setUsers(stubUsers);
            }
        };

        fetchUsers();
    }, []);

    // useEffect to show conversations upon opening chats page - using stub data
    useEffect(() => {
        const FindChats = async () => {
            try {
                // In a real app, you would make the API call here
                // const response = await fetch('/api/message/getConvos', {...});
                // const conversations = await response.json();
                
                // Using stub data instead
                setChats(stubChats);
            } catch (error) {
                console.error('Error finding conversations:', error);
                // Fallback to stub data
                setChats(stubChats);
            }
        };

        FindChats();
    }, [Mongo_id]);

    // Load messages when a chat is selected - using stub data
    const selectChat = async (chat) => {
        try {
            setSelectedChat(chat);
            
            // In a real app, you would make the API call here
            // const response = await fetch('/api/message/getmessages', {...});
            // const messages = await response.json();
            
            // Using stub data instead
            setMessages(stubMessages[chat._id] || []);
        } catch (error) {
            console.error('Error loading messages:', error);
            // Fallback to stub data
            setMessages(stubMessages[chat._id] || []);
        }
    };

    const startNewChat = async (recipientId) => {
        try {
            if (!Mongo_id || !recipientId) {
                console.error("Missing user IDs");
                return;
            }

            // In a real app, you would make the API call here
            // const response = await fetch('/api/message/CreateConvo', {...});
            // const newConversation = await response.json();
            
            // Using stub data instead
            const newChatId = `chat-${Date.now()}`;
            const newChat = {
                _id: newChatId,
                members: [Mongo_id, recipientId],
                messages: []
            };
            
            // Update chats list
            setChats(prev => [...prev, newChat]);
            setSelectedChat(newChat);
            setMessages([]);

            // Update stubMessages for the new chat
            stubMessages[newChatId] = [];

            return newChat;
        } catch (error) {
            console.error('Error starting new chat:', error);
            throw error;
        }
    };

    const sendNewMessage = async (e) => {
        e.preventDefault();
        if (!messageText.trim() || !selectedChat) return;

        const newMessage = {
            _id: `msg-${Date.now()}`,
            text: messageText,
            sender: Mongo_id,
            timestamp: new Date().toISOString()
        };

        try {
            // In a real app, you would make the API call here
            // const response = await fetch('/api/message/sendmessage', {...});
            
            // Using stub data instead
            setMessages(prev => [...prev, newMessage]);
            
            // Update the chat's messages in the chats array
            setChats(prev => prev.map(chat => 
                chat._id === selectedChat._id 
                    ? { ...chat, messages: [...chat.messages, newMessage] } 
                    : chat
            ));
            
            // Update stub data
            if (!stubMessages[selectedChat._id]) {
                stubMessages[selectedChat._id] = [];
            }
            stubMessages[selectedChat._id].push(newMessage);
            
            setMessageText("");
        } catch(error) {
            console.error('Error sending new message: ', error);
            throw error; 
        }
    };

    const getChatPartner = (chat) => {
        if (!chat || !chat.members) return null;
        const partnerId = chat.members.find(memberId => memberId !== Mongo_id);
        if (!partnerId) return null;
        return users.find(user => user._id === partnerId);
    };

    return (
        <main>
            {!selectedChat ? (
                <section>
                    <header>
                        <h1>Your Chats</h1>
                        <button
                            onClick={() => setSelectedChat({ new: true })}
                            aria-label="Start new chat"
                            className="new-chat-btn"
                        >
                            + New Chat
                        </button>
                    </header>

                    <nav>
                        <h2>Existing chats</h2>
                        <ul className="chat-list">
                            {chats.map(chat => {
                                const partner = getChatPartner(chat);
                                return (
                                    <li key={chat._id} className="chat-item">
                                        <button
                                            onClick={() => selectChat(chat)}
                                            aria-label={`Chat with ${partner?.name || "user"}`}
                                            className="chat-btn"
                                        >
                                            <strong>{partner?.name || "Unknown User"}</strong>
                                            {chat.messages.length > 0 && (
                                                <em> - {chat.messages[chat.messages.length - 1].text}</em>
                                            )}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>
                </section>
            ) : selectedChat.new ? (
                <section>
                    <header>
                        <h1>Start New Chat</h1>
                        <button
                            onClick={() => setSelectedChat(null)}
                            aria-label="Back to chats"
                            className="back-btn"
                        >
                            ← Back
                        </button>
                    </header>

                    <nav>
                        <h2>Available users</h2>
                        <ul className="user-list">
                            {users
                                .filter(user => user._id !== Mongo_id)
                                .map(user => (
                                    <li key={user._id}>
                                        <button
                                            onClick={() => startNewChat(user._id)}
                                            aria-label={`Chat with ${user.name}`}
                                            className="user-btn"
                                        >
                                            {user.name} <small>({user.email})</small>
                                        </button>
                                    </li>
                                ))}
                        </ul>
                    </nav>
                </section>
            ) : (
                <article>
                    <header>
                        <button
                            onClick={() => setSelectedChat(null)}
                            aria-label="Back to chats"
                            className="back-btn"
                        >
                            ← Back
                        </button>
                        <h2>
                            Chat with {getChatPartner(selectedChat)?.name || "Unknown User"}
                        </h2>
                    </header>

                    <section>
                        {messages.length === 0 ? (
                            <p>No messages yet. Start the conversation!</p>
                        ) : (
                            <ul className="message-list">
                                {messages.map((msg, i) => (
                                    <li key={i} className={`message ${msg.sender === Mongo_id ? 'sent' : 'received'}`}>
                                        <figure>
                                            <blockquote cite={`#msg-${i}`}>
                                                <p>{msg.text}</p>
                                            </blockquote>
                                            <figcaption>
                                                <time dateTime={msg.timestamp}>
                                                    {new Date(msg.timestamp).toLocaleTimeString()}
                                                </time>
                                            </figcaption>
                                        </figure>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    <form onSubmit={sendNewMessage} className="message-form">
                        <label htmlFor="messageInput" className="sr-only">Your message:</label>
                        <input
                            id="messageInput"
                            type="text"
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            placeholder="Type your message..."
                            required
                        />
                        <button type="submit">Send</button>  
                    </form>
                </article>
            )}
        </main>
    );
};

export default ChatsPage;