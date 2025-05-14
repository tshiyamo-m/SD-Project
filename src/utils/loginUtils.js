export const submitUser = async (user) => {
    try{
        const response = await fetch('/api/login', {
            method: 'POST',
            body: JSON.stringify({
                ...user
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error('Failed to create user');
        }
        else{
            return result._id;
        }
    }
    catch(error) {
        console.error('Error creating user:', error);
    }
}

export const getUser = async (id) => {
    try {
        const response = await fetch('/api/login/getUser', {
            method: 'POST',
            body: JSON.stringify({
                findId: id
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to find user!');
        }

        return await response.json();

    } catch (error) {
        console.error('Error finding user:', error);
        return null;
    }
}

export const getAllUsers = async () => {
    try {
        const response = await fetch('/api/login/getAllUsers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch users!');
        }

        return await response.json();

    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

export const updateIsReviewer = async (update) => {
    try{
        const response = await fetch('/api/login/update_is_reviewer', {
            method: 'POST',
            body: JSON.stringify({
                ...update
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            //console.log("mayne");
            throw new Error('Failed to update project!');
        }

        return await response.json();
    }
    catch(error) {
        console.log('Error updating project:', error);
    }
}

export const makeAdmin = async (id) => {
    try {
        const response = await fetch('/api/login/makeAdmin', {
            method: 'POST',
            body: JSON.stringify({
                userId: id,
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to make user an admin!');
        }

        return await response.json();

    } catch (error) {
        console.error('Error making user admin:', error);
    }
}