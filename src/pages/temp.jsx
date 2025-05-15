import React, { useState, useEffect } from "react";
import './chatspage.css';


const ChatsPage = () => {
    const currentUserId = "1";
    const [users, setUsers] = useState([]); // Single source of truth for users
    const [chats, setChats] = useState([ /* your stub chats */ ]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState("");

    const Mongo_id = localStorage.getItem("Mongo_id");

    // API Call to return list of available users
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('/api/login/users', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch users');
                }

                const result = await response.json();
                

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
    }, []);


    //useEffect to show conversations upon opening chats page

    useEffect(() => {

        const FindChats = async () => {
            try {
                
                if (!Mongo_id) {
                    console.error("Missing user ID");
                    return;
                }
    
                const response = await fetch('/api/message/getConvos', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userID: Mongo_id,
                    })
                });
        
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to find conversations');
                }
        
            const conversation = await response.json();
/*
            const targetArray = [];
            targetArray.push({ ...conversation });

            console.log(conversation);
            setChats(targetArray)*/
            const chatsArray = Array.isArray(conversations) ? conversations : [conversations];
            
            // Transform chats to consistent format
            const formattedChats = chatsArray.map(chat => ({
                _id: chat._id,
                members: chat.members || [], // Ensure members exists
                messages: chat.messages || [] // Ensure messages exists
            }));

            setChats(formattedChats);
            
        
            } catch (error) {
                console.error('Error starting new chat:', error);
                // Optionally show error to user
                throw error; 
            }
        };

        FindChats();


    }, []);

    //Stub data for chats
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

    // Load messages when a chat is selected
    const selectChat = async (chat) => {
        try {
            // 1. Set the selected chat first
            setSelectedChat(chat);
            
            // 2. Fetch messages from API
            const response = await fetch('/api/message/getmessages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ConvoID: chat._id // Use chat._id, not selectedChat._id (which isn't set yet)
                })
            });
    
            if (!response.ok) {
                throw new Error('Failed to fetch messages');
            }
    
            const messages = await response.json();
            console.log("Fetched messages:", messages);
            
            
            // 3. Update state with real messages
            
    
        } catch (error) {
            console.error('Error loading messages:', error);
            // Fallback to stub data if API fails
            setMessages(stubMessages[chat._id] || []);
        }
    };

    const startNewChat = async (recipientId) => {
        try {
            
            if (!Mongo_id || !recipientId) {
                console.error("Missing user IDs");
                return;
            }

            const response = await fetch('/api/message/CreateConvo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userID_1: Mongo_id,
                    userID_2: recipientId
                })
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create conversation');
            }
    
            const newConversation = await response.json();
            console.log("Created conversation:", newConversation);
    
            
            const newChat = {
                _id: newConversation._id /*|| `chat-${Date.now()}`*/, // Use server ID if available
                members: [Mongo_id, recipientId],
                messages: []
            };
    
            
            setSelectedChat(newChat);
            setMessages([]);

    
            return newChat;
    
        } catch (error) {
            console.error('Error starting new chat:', error);
            // Optionally show error to user
            throw error; 
        }
    };

    const sendNewMessage = async (e) => {
        e.preventDefault();
        if (!messageText.trim() || !selectedChat) return;

        // Create a new message
        const newMessage = {
            _id: `msg-${Date.now()}`,
            text: messageText,
            sender: currentUserId,
            timestamp: new Date().toISOString()
        };

        try {

            const response = await fetch('/api/message/sendmessage', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ConvoID: selectedChat._id,
                    text: messageText
                })
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to send message');
            }
    
            const newMessage = await response.json();

            console.log("Message sent :) ", newMessage);
        }
        catch(error){
            console.error('Error sending new message: ', error);
            throw error; 
        }

        // Add the message to the messages list
        setMessages(prev => [...prev, newMessage]);
        setMessageText("");
    };

    const getChatPartner = (chat) => {
        if (!chat || !chat.members) return null;
        
        // Find the member who is not the current user
        const partnerId = chat.members.find(memberId => memberId !== Mongo_id);
        
        if (!partnerId) return null;
        
        // Find the user object for the partner
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
                                .filter(user => user._id !== currentUserId)
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
                                    <li key={i} className={`message ${msg.sender === currentUserId ? 'sent' : 'received'}`}>
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

export default ChatsPage