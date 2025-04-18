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
        return data;
    } catch (error) {
        console.error('Error fetching user role:', error);
        return { error: 'Failed to fetch user role' };
    }
}

export async function userMinistryID(authid: string) {
    try {
        const result = await fetch('http://localhost:3000/api/user-ministryID', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({authid}),
        });
        const data = await result.json();
        console.log('Ministry ID:', data);
        return data;
    }
    catch (error) {
        console.error('Error fetching user ministry ID:', error);
        return { error: 'Failed to fetch user ministry ID' };
    }
}

export async function newUser(auth_ID: string) {
    console.log('Auth ID:', auth_ID);
    try {
        const result = await fetch('http://localhost:3000/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({authid: auth_ID}),
        });

        const data = await result.json();
        if (data.length === 0 ) {
            return false;
        } else {
            return true;
        }
    } catch (error) {
        console.error('Error inserting user:', error);
        return { error: 'Failed to insert user' };
    }
}