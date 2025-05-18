// routes/chatRoutes.js
const express = require("express");
const router = express.Router();
const { getUserChats, getAllUsers, startChat } = require("../Controllers/ChatsController");
const auth = require("../middleware/authMiddleware");

router.use(auth);

router.get("/get_chats", getUserChats);         // GET /api/chats
router.get("/users", getAllUsers);    // GET /api/chats/users
router.post("/", startChat);

module.exports = router;
