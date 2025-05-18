const mongoose = require("mongoose");

//delete file

const deleteFile =  async (req, res) => {

  const { fileId } = req.body;
  //console.log('Received delete request for fileId:', fileId);

  if (!fileId) {
    return res.status(400).json({ error: "fileId is required" });
  }
  try{

    const objectId = new mongoose.Types.ObjectId(fileId);

    await bucket.delete(objectId);
    res.json({ success: true, message: "File deleted" });
  }
  catch(err){
    console.error("Delete error:", err);
    res.status(500).json({ error: "Failed to delete file" });
  }
};

const fetchFiles = async (req, res) => {
  try {
    const { projectID } = req.body;
    
    if (!projectID) {
      return res.status(400).json({ error: "projectID is required" });
    }

    const objectId = new ObjectId(projectID);
    
    
    // Find all files with matching ProjectId in metadata
    const files = await mongoose.connection.db
      .collection('User_Files.files')
      .find({ 'metadata.ProjectId': projectID }) // Query metadata field
      .toArray();

    if (!files) {
      return res.status(404).json({ error: "No files found for this project" });
    }
    else if (files.length == 0){
      res.json([])
    }
    else{
      res.json(files);
    }

  } catch (err) {
    console.error('Error retrieving documents:', err);
    res.status(400).json({ 
      error: err.message.includes('ObjectId') 
        ? "Invalid projectID format" 
        : "Server error" 
    });
  }
};

const downloadDoc =  async (req, res) => {

  const { fileId } = req.body;
  //console.log('Received download request for fileId:', fileId);

  if (!fileId) {
    return res.status(400).json({ error: "fileId is required" });
  }
  try{

    const objectId = new mongoose.Types.ObjectId(fileId);

    const fileInfo = await mongoose.connection.db
    .collection('User_Files.files')
    .findOne({ _id: objectId });

    //console.log(fileInfo);
    
    if (!fileInfo) {
      console.log("File not found");
      return res.status(404).json({ error: "File not found" });
    } 

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${fileInfo.filename}"`);
    
    const downloadStream = bucket.openDownloadStream(objectId);
    downloadStream.pipe(res);
    
    downloadStream.on('error', () => {
        res.status(500).json({ error: "Error downloading file" });
    });


  }
  catch(err){
    console.error('Error downloading document:', err);
    res.status(400).json({ error: "Invalid file ID format" });

  }
}


module.exports = {
    fetchFiles,
    deleteFile,
    downloadDoc
};