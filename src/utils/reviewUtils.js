export const submitReview = async (review) => {
    try{
        const response = await fetch('https://sd-project-qb1w.onrender.com/api/Review', {
            method: 'POST',
            body: JSON.stringify({
                ...review
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to create review');
        }

        return await response.json();
    }
    catch(error) {
        console.error('Error creating review:', error);
    }
}

export const findReviewer = async (id) => {
    try{
        const response = await fetch('https://sd-project-qb1w.onrender.com/api/Review/find_research', {
            method: 'POST',
            body: JSON.stringify({
                id: id
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to find reviews');
        }

        return await response.json();
    }
    catch(error) {
        console.error('Error finding reviews:', error);
    }
}

export const getAllReviews = async () => {
    try{
        const response = await fetch('https://sd-project-qb1w.onrender.com/api/Review/get_all_reviews', {
            method: 'POST',
            body: JSON.stringify({}),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to find reviews!');
        }

        return await response.json();
    }
    catch(error) {
        console.error('Error finding reviews:', error);
        return [];
    }
}