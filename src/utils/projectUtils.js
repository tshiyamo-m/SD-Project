import { toast } from "sonner";

export const findProject = async (Id) => {
    try {
        const response = await fetch('https://sd-project-qb1w.onrender.com/api/Projects/find', {
            method: 'POST',
            body: JSON.stringify({
                id: Id,
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error('Failed to find projects!');
        } else {
            return await response.json();
        }
    } catch(error) {
        console.error('Error finding projects:', error);
    }
}

export const findActiveProject = async () => {
    try {
        const response = await fetch('https://sd-project-qb1w.onrender.com/api/Projects/find_active_projects', {
            method: 'POST',
            body: JSON.stringify({ status: "Active" }),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to find projects!');
        }

        const userData = await response.json();
        if (!Array.isArray(userData) || userData.length === 0) {
            console.warn('API response is not a valid array:', userData);
            return null;
        }
        return userData;
    } catch (error) {
        console.error('Error finding projects:', error);
        return null;
    }
}

export const createProject = async (Project) => {
    try{
        const response = await fetch('https://sd-project-qb1w.onrender.com/api/Projects', {
            method: 'POST',
            body: JSON.stringify({
                ...Project
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error('Failed to create project');
        }
        else{
            //setProject_id(result._id);
            return result._id;
        }
    }
    catch(error) {
        console.error('Error creating project:', error);
    }
}

export const addProject = async (Data) => {
    try{
        const response = await fetch('https://sd-project-qb1w.onrender.com/api/Projects/addproject', {
            method: 'POST',
            body: JSON.stringify(Data),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        //const data = await response.json();

        if (!response.ok){
            throw new Error("Error with adding project!")
        }
        //console.log(response);

    }
    catch(error){
        console.error('Error adding project:', error);
    }
}

export const updateProject = async (Data) => {
    try {
        const response = await fetch('https://sd-project-qb1w.onrender.com/api/Projects/updateproject', {
            method: 'POST',
            body: JSON.stringify({
                Data
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to update project!');
        }

        toast.success("Project updated successfully", {
                        style: { backgroundColor: "green", color: "white" },
                        });
    }
    catch(error) {
        toast.error("Could not update project", {
                        style: { backgroundColor: "red", color: "white" },
                        });
        console.error('Error updating project:', error);
        
    }
}

export const getAllProjects = async (Data) => {
    try {
        const response = await fetch('https://sd-project-qb1w.onrender.com/api/Projects/get_all_users', {
            method: 'POST',
            body: JSON.stringify({
                id: Data,
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error('Failed to find projects!');
        } else {
            return await response.json();
        }
    } catch(error) {
        console.error('Error finding projects:', error);
    }
}