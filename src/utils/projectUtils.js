export const submitProject = async (submitData) => {

    return 0;
}

export const findProject = async (Id) => {
    try {
        const response = await fetch('/api/Projects/find', {
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

export const findActiveProject = async (Id) => {
    try {
        const response = await fetch('/api/Projects/find_active_projects', {
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