import { toast } from "sonner";

export const fetchFiles = async (ProjectID) => {
    try {
        if (!ProjectID || typeof ProjectID !== 'string') {
            throw new Error('Invalid project ID');
        }

        const response = await fetch('/Bucket/retrievedocs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({projectID: ProjectID}) ///////
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Download failed with status:', response.status, errorData);
            throw new Error('Failed to download file');
        }

        const fileData = await response.json();

        if (!(fileData == null)){
            return fileData.map(file => ({
                id: file._id.toString(),
                name: file.filename,
                type: file.filename.split('.').pop().toUpperCase(),
                uploadedBy: file.uploadedBy,
                uploadDate: new Date(file.uploadDate).toLocaleDateString(),
                size: `${(file.length / 1024).toFixed(1)} KB`,
                metadata: file.metadata
            }));
        }
        else{
            return [];
        }

    } catch (error) {
        console.error('Error fetching documents:', error);
        toast.error("Could not get documents", {
                        style: { backgroundColor: "red", color: "white" },
                        });
        throw error;
    }
};

export const uploadFiles = async (formData) => {

    try {
        const response = await fetch('/Bucket/submitdoc', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        toast.success("Document uploaded successfully", {
                        style: { backgroundColor: "green", color: "white" },
                        });
        console.log('Upload successful:', data);

    } catch (error) {
        console.error('Upload error:', error);
        toast.error("Could not upload document", {
                        style: { backgroundColor: "red", color: "white" },
                        });
    }
}

export const deleteFile = async (strDocId) => {

    try {
        const response = await fetch('/Bucket/delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({fileId: strDocId})
        });

        if (!response.ok) {
            throw new Error('Failed to delete file');
        }

        toast.success("Document deleted successfully", {
                        style: { backgroundColor: "green", color: "white" },
                        });

    } 
    catch (error) {
        console.error('Delete error:', error);
        toast.error("Could not delete document", {
                        style: { backgroundColor: "red", color: "white" },
                        });
    }
}

export const downloadFile = async (strDocId, docName) => {

    try {
        const response = await fetch('/Bucket/download', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({fileId: strDocId})
        });

        if (!response.ok) {
            throw new Error('Failed to download file'); 
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = docName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();

        toast.success("Document downloaded successfully", {
                        style: { backgroundColor: "green", color: "white" },
                        });

    } catch (error) {
        console.error('Download error:', error);
        toast.error("Could not download document", {
                        style: { backgroundColor: "red", color: "white" },
                        });
    }
}
