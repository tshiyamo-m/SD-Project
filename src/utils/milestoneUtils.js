export const createMilestone = async (milestone) => {
    try{
        const response = await fetch('https://sd-project-qb1w.onrender.com/api/Milestone', {
            method: 'POST',
            body: JSON.stringify({
                ...milestone
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error('Failed to create milestone');
        }
        else{
            return result._id;
        }
    }
    catch(error) {
        console.error('Error creating milestone:', error);
    }
}

export const getMilestone = async (id) => {
    try{
        const response = await fetch('https://sd-project-qb1w.onrender.com/api/Milestone/find', {
            method: 'POST',
            body: JSON.stringify({
                id: id,
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to find milestones!');
        }
        return await response.json();
    }
    catch(error) {
        console.error('Error finding milestones:', error);
        return [];
    }
}

export const updateStatus = async (update) => {
    try{
        const response = await fetch('https://sd-project-qb1w.onrender.com/api/Milestone/update', {
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
            throw new Error('Failed to update milestone!');
        }

        return await response.json();
    }
    catch(error) {
        console.log('Error updating milestone:', error);
    }
}