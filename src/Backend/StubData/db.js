const users = [
    { _id: "1", name: "Alice", email: "alice@example.com" },
    { _id: "2", name: "Bob", email: "bob@example.com" },
    { _id: "3", name: "Charlie", email: "charlie@example.com" }
];

const chats = [
    {
        _id: "chat1",
        members: ["1", "2"],
        messages: [
            { sender: "1", text: "Hey Bob!" },
            { sender: "2", text: "Hi Alice!" }
        ]
    }
];

const messages = []; // optional for now

module.exports = { users, chats, messages };
