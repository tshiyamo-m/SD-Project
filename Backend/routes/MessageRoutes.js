// routes/messageRoutes.js
const express = require("express");
const router = express.Router();
const { getMessages, 
        sendMessage, 
        createConversation,
        retrieveConversations,
        get_chatters,
        fetchConversation} = require("../Controllers/MessageController");
//const auth = require("../middleware/authMiddleware");


//router.use(auth);


router.post("/getmessages", getMessages);  // GET /api/messages/:chatId
router.post("/sendmessage", sendMessage); // POST /api/messages/:chatId       // POST /api/messages/:chatId
router.post("/CreateConvo", createConversation);
router.post("/getConvos", retrieveConversations);
router.post("/getUsers", get_chatters);
router.post("/getConvo", fetchConversation);

module.exports = router;
