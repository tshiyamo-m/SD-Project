import React, { useEffect, useState, useCallback } from "react";
import './chatspage.css';
import { getChatters, createConvo, sendmesssage, retrieveConvos } from "../utils/chatsUtils";

const ChatsPage = () => {
    const currentUserId = localStorage.getItem("Mongo_id");
    const [users, setUsers] = useState({});
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messageText, setMessageText] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [MessageTimeout, setMessageTimeout] = useState(false);
    const [isLoadingMessages, setIsLoadingMessages] = useState(true);
    //const [ConvoID, setConvoID] = useState(null);


    const fetchUsers = useCallback(async () => {
        try {
            const response = await getChatters(currentUserId);
            const filteredUsers = { ...response }; // create copy first
            delete filteredUsers[currentUserId];
            
            const usersObj = Array.isArray(filteredUsers)
                ? Object.fromEntries(response.map(user => [user._id, user]))
                : response || {};
        
            setUsers(usersObj);
            return usersObj;
        } catch (error) {
            console.error("Error:", error);
            // Handle error case as needed
        }
    }, [currentUserId, /*getChatters,*/ setUsers]); // Include all dependencies

    const fetchConvos = useCallback(async (userID) => {
        try {
            return await retrieveConvos(currentUserId);
        } catch (error) {
            console.error("Error:", error);
            // Consider returning a default value or re-throwing the error
            return null; // or throw error;
        }
    }, [currentUserId, /*retrieveConvos*/]); // Dependencies

    const initializeChats = useCallback((usersData, userChats) => {
        if (userChats) {
            const setUserChats = userChats.map(chat => ({
                ...chat,
                partner: usersData[chat.members.find(id => id !== currentUserId)] || { name: "Unknown User" }
            }));
            setChats(setUserChats);
        } else {
            const initialChats = [
                {
                    _id: "chat1",
                    members: [currentUserId, "2"],
                    messages: [
                        { _id: "m1", text: "Hey, how are you?", sender: "2", timestamp: new Date(Date.now() - 3600000).toISOString() },
                        { _id: "m2", text: "I'm good, thanks!", sender: currentUserId, timestamp: new Date(Date.now() - 1800000).toISOString() }
                    ]
                },
                {
                    _id: "chat2",
                    members: [currentUserId, "3"],
                    messages: [
                        { _id: "m3", text: "Can we meet tomorrow?", sender: "3", timestamp: new Date(Date.now() - 7200000).toISOString() },
                        { _id: "m4", text: "Sure, what time?", sender: currentUserId, timestamp: new Date(Date.now() - 3600000).toISOString() }
                    ]
                }
            ].map(chat => ({
                ...chat,
                partner: usersData[chat.members.find(id => id !== currentUserId)] || { name: "Unknown User" }
            }));

            setChats(initialChats);
        }
    }, [currentUserId, setChats]); // Dependencies

    const loadData = async () => { //If linter error, wrap whole function in useCallback()
        try {
            const fetchedUsers = await fetchUsers();
            const fetchedConvos = await fetchConvos();

            const FormattedConvos = fetchedConvos.map(chat => ({ 
                _id: chat._id,
                members: [chat.userID_1, chat.userID_2],
                messages: Array.isArray(chat.Messages) && chat.Messages.length > 0
                    ? chat.Messages.map(message => ({
                        _id: message._id,
                        text: message.text,
                        sender: message.sender,
                        timestamp: message.timestamp
                    }))
                    : []
            }));

            initializeChats(fetchedUsers, FormattedConvos);
        } catch(error) {
            console.error("Could not fetch messages: ", error);
        } finally {
            setIsLoadingMessages(false);
        }
    };

    useEffect(() => { 

        loadData();

    }, [currentUserId, fetchConvos, fetchUsers, initializeChats]);


 
    const getAvailableUsers = () => {
        return Object.values(users).filter(user => user._id !== currentUserId);
        
    };

    const CreateConvo = async (id_1, id_2) => {
        try {
            const response = await createConvo(id_1, id_2);
            if(!response.ok){
                throw new Error();
            }
        } catch (error) {
            console.error("Error:", error());
        }       
    };


    const startNewChat = async (userId) => {
        const existingChat = chats.find(chat => //find chats
            chat.members.includes(currentUserId) && chat.members.includes(userId)
        );
        
        if (existingChat) {
            setSelectedChat(existingChat);
            return;
        }
        

        const newChat = {
            _id: `chat-${Date.now()}`,
            members: [currentUserId, userId],
            messages: [],
            partner: users[userId] || { name: "Unknown User" }
        };

        try{
            await CreateConvo(currentUserId, userId);

        }
        catch(error) {
        console.error('Error creating conversation:', error);
        }


        
        //console.log(userId);
        setChats([...chats, newChat]);
        setSelectedChat(newChat);
    };

    const Send_Message_To_DB = async (text, sender, partnerID) => {
        
        try {
            await sendmesssage(text, sender, partnerID);

        }
        catch (error){
            console.error("Error:", error);
        }
        
    }


    const sendMessage = async (e) => {
        let sender;/* = selectedChat.members[0];*/
        let partnerID; /*= selectedChat.members[1];*/
        setMessageTimeout(true);
        setMessageText("");

        e.preventDefault();
        if (!messageText.trim() || !selectedChat) return;

        const newMessage = {
            _id: `msg-${Date.now()}`,
            text: messageText,
            sender: currentUserId,
            timestamp: new Date().toISOString()
        };


        if (selectedChat.members[0] === currentUserId){
            sender = selectedChat.members[0];
            partnerID = selectedChat.members[1];
        }
        else{
            sender = selectedChat.members[1];
            partnerID = selectedChat.members[0];
        }

        try{
            
            await Send_Message_To_DB(messageText, sender, partnerID);
        }
        catch (error){
            console.error("Error sending message:", error);
        }
        finally{
            setMessageTimeout(false);
        }

        setChats(prevChats => prevChats.map(chat => 
        chat._id === selectedChat._id
            ? { ...chat, messages: [...chat.messages, newMessage] }
            : chat
        ));      
        // After updating chats, also update selectedChat
        setSelectedChat(prevSelected => ({
        ...prevSelected,
        messages: [...prevSelected.messages, newMessage]
        }));  
/*
        setChats(chats.map(chat => 
            chat._id === selectedChat._id
                ? { ...chat, messages: [...chat.messages, newMessage] }
                : chat
        ));*/
        
        
        //console.log(chats)
        
    };

    return (
        <main className="chat-container">
            {!selectedChat ? (
                <section className="chat-list-section">
                    <header className="chat-header">
                        <h1>Your Chats</h1>
                        <button
                            onClick={() => setSelectedChat({ new: true })}
                            className="new-chat-btn"
                        >
                            + New Chat
                        </button>
                    </header>

                    <nav>
                        <h2>Existing chats</h2>
                        <ul className="chat-list">
                            {isLoadingMessages ? (
                               
                                <figure className="loading-spinner-container">
                                    <svg 
                                        className="loading-spinner" 
                                        viewBox="0 0 50 50" 
                                        aria-hidden="true"
                                        focusable="false"
                                    >
                                        <circle 
                                            cx="25" 
                                            cy="25" 
                                            r="20" 
                                            fill="none" 
                                            stroke="#4e73df"
                                            strokeWidth="5"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <figcaption className="visually-hidden">Loading Chats...</figcaption>
                                </figure>
                                
                            ) : chats.map(chat => (
                                <li key={chat._id} className="chat-item">
                                    <button
                                        onClick={() => setSelectedChat(chat)}
                                        className="chat-btn"
                                    >
                                        <strong>{chat.partner.name}</strong>
                                        {chat.messages.length > 0 && (
                                            <em> - {chat.messages[chat.messages.length - 1].text}</em>
                                        )}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </section>
            ) : selectedChat.new ? (
                <section className="new-chat-section">
                    <header className="chat-header">
                        <h1>Start New Chat</h1>
                        <button
                            onClick={() => setSelectedChat(null)}
                            className="back-btn"
                        >
                            ← Back
                        </button>
                    </header>

                    <nav>
                        <h2>Available users</h2>
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />

                        <ul className="user-list">
                            {getAvailableUsers()
                                .filter(user => 
                                    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    user.email.toLowerCase().includes(searchTerm.toLowerCase())
                                )
                                .map(user => (
                                <li key={user._id} className="user-item">
                                    <button
                                        onClick={() => startNewChat(user._id)}
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
                <article className="active-chat">
                    <header className="chat-header">
                        <button
                            onClick={() => setSelectedChat(null)}
                            className="back-btn"
                        >
                            ← Back
                        </button>
                        <h2>
                            Chat with {selectedChat.partner?.name || "Unknown User"}
                        </h2>
                    </header>

                    <section className="message-area">
                        {selectedChat.messages.length === 0 ? (
                            <p className="no-messages">No messages yet. Start the conversation!</p>
                        ) : (
                            <ul className="message-list">
                                {selectedChat.messages.map((msg) => (
                                    <li 
                                        key={msg._id} 
                                        className={`message ${msg.sender === currentUserId ? 'sent' : 'received'}`}
                                    >
                                        <article className="message-content">
                                            <p>{msg.text}</p>
                                            <time className="message-time">
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </time>
                                        </article>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    <form onSubmit={sendMessage} className="message-form">
                        <input
                            type="text"
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            placeholder="Type your message..."
                            required
                        />
                        <button type="submit" disable={MessageTimeout.toString()}>Send</button>
                    </form>
                </article>
            )}
        </main>
    );
};

export default ChatsPage;