
const Submit_Document = async (req, res) => {

    const fileStream = fs.createReadStream(req.file.path);
    const uploadStream = bucket.openUploadStream(req.file.originalname);
    
    fileStream.pipe(uploadStream);
    
    uploadStream.on('error', () => {
      res.status(500).json({ error: "Error uploading file" });
    });
    
    uploadStream.on('finish', () => {
      fs.unlinkSync(req.file.path); // Delete temp file
      res.status(201).json({
        message: "File uploaded successfully",
        fileId: uploadStream.id,
        filename: req.file.originalname
      });
    });
  
};


module.exports = {
    //Submit_Document
};