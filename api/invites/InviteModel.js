//This is a mongoose model to create an invite document(an entry into the Invites collection in MongoDB)
const mongoose = require('mongoose');

const inviteSchema = new mongoose.Schema({
  collection: 'invites',
  email: { type: String, required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  projectTitle: { type: String, required: true },
  token: { type: String, required: true },
  status: { type: String, enum: ['pending', 'accepted'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('Invite', inviteSchema);
