const { BlobServiceClient } = require('@azure/storage-blob');
const formidable = require('formidable');
const fs = require('fs');

module.exports = async function (context, req) {
    try {
        // 1. Parse multipart/form-data (ignore fields since we only need files)
        const form = new formidable.IncomingForm();
        const { files } = await new Promise((resolve, reject) => {
            form.parse(req, (err, _, files) => {  // Use `_` to ignore fields
                if (err) reject(err);
                resolve({ files });
            });
        });

        // 2. Check for uploaded file
        if (!files.fileDocument) {
            context.res = {
                status: 400,
                body: { error: "No file uploaded" }
            };
            return;
        }

        const file = files.fileDocument;
        const fileStream = fs.createReadStream(file.filepath);

        // 3. Upload to Azure Blob Storage
        const blobServiceClient = BlobServiceClient.fromConnectionString(
            process.env.AZURE_STORAGE_CONNECTION_STRING
        );
        const containerClient = blobServiceClient.getContainerClient(
            process.env.AZURE_STORAGE_CONTAINER_NAME || "documents"
        );
        await containerClient.createIfNotExists();

        const blobClient = containerClient.getBlockBlobClient(file.originalFilename);
        const uploadResponse = await blobClient.uploadStream(fileStream);

        // 4. Clean up temp file
        fs.unlinkSync(file.filepath);

        context.res = {
            status: 201,
            body: {
                message: "File uploaded successfully",
                fileId: uploadResponse.requestId,
                filename: file.originalFilename
            }
        };

    } catch (error) {
        context.res = {
            status: 500,
            body: { error: "Error uploading file: " + error.message }
        };
    }
};