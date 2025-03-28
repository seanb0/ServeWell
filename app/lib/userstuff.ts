export async function userStuff(authid: string) {
    try {
        const result = await fetch('http://localhost:3000/api/guard', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({authid}),
        });

        const data = await result.json();
        console.log("Role: ", data);
        return data;
    } catch (error) {
        console.error('Error fetching user role:', error);
        return { error: 'Failed to fetch user role' };
    }
}

export async function newUser(auth_ID: string) {
    try {
        console.log("AuthID: ", auth_ID);
        const result = await fetch('http://localhost:3000/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({authid: auth_ID}),
        });

        const data = await result.json();
        console.log("Users: ", data);
        if (result.length === 0 ) {
            return false;
        } else {
            return true;
        }
    } catch (error) {
        console.error('Error inserting user:', error);
        return { error: 'Failed to insert user' };
    }
}