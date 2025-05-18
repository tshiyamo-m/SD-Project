
export const getChatters = async (_id) => {
    try {
        const response = await fetch('https://sd-project-qb1w.onrender.com/api/message/getUsers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                _id: _id
            })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch users!');
        }

        return await response.json();

    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

export const retrieveConvos = async (userID) => {

    try {
        const response = await fetch('https://sd-project-qb1w.onrender.com/api/message/getConvos', {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/json'
            },
            body: JSON.stringify({
                userID: userID
            })
        })

      
        return await response.json();



    }
    catch (error) {
        console.error('Error fetching users:', error);
    }
}

export const retrieveAConvo = async (userID_1, userID_2) => {

    try {
        const response = await fetch('https://sd-project-qb1w.onrender.com/api/message/getConvo', {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/json'
            },
            body: JSON.stringify({
                userID_1: userID_1,
                userID_2: userID_2
            })
        })

        return await response.json();

    }
    catch (error) {
        console.error('Error fetching users:', error);
    }
}

export const createConvo = async (userID_1, userID_2) => {
    try {
        // Validate input before sending
        if (!userID_1 || !userID_2) {
            throw new Error('Both user IDs are required');
        }

        if (userID_1 === userID_2) {
            throw new Error('Cannot create conversation with yourself');
        }

        const response = await fetch('/api/message/CreateConvo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userID_1: userID_1.trim(),
                userID_2: userID_2.trim()
            })
        });

        if (!response.ok) {
            throw new Error('Failed to create Convo');
        }

        return await response.json();

    } catch (error) {
        console.error('Error creating conversation:', error);
    }
}

export const sendmesssage = async (messageText, sender, partnerID) => {

    try {
        const response = await fetch('https://sd-project-qb1w.onrender.com/api/message/sendmessage', {
        
            method: 'POST',
            headers: {
                'Content-Type' : 'application/json'
            },
            body: JSON.stringify({
               sender: sender,
               partnerID: partnerID,
               text: messageText
            })
        })
                    if(!response.ok){
                throw new Error();
            }

    }
    catch (error) {
        console.error('Error fetching users:', error);
    }
}