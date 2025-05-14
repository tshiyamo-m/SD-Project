export const createFinance = async (finance) => {
    try {
        const response = await fetch('/api/Finance/add', {
            method: 'POST',
            body: JSON.stringify({
                ...finance
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to add fund');
        }

        return await response.json();
    }
    catch (error) {
        console.error('Error creating finance record:', error);
    }
}

export const getFinance = async (financeId) => {
    try {
        const response = await fetch('/api/Finance/find', {
            method: 'POST',
            body: JSON.stringify({
                id: financeId,
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to find funds!');
        }
        return await response.json();
    }
    catch(error) {
        console.error('Error finding funds:', error);
        //return [];
    }
}

export const updateFinance = async (update) => {
    try {
        const response = await fetch('/api/Finance/update', {
            method: 'POST',
            body: JSON.stringify({
                ...update
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to update fund');
        }
        return await response.json();
    }
    catch (error) {
        console.error('Error updating funds:', error);
    }
}