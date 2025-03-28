'use client';
import '@/app/globals.css';
import { LoginButton } from './components/buttons/LoginButton';
import { ChurchCreationButton } from './components/buttons/ChurchCreationButton';
import AssignmentRequestButton from './components/buttons/AssignmentRequestButton';
import Image from 'next/image';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useEffect, useState } from 'react';


export default function Home() {
  // fetch user session
  const { user, error, isLoading } = useUser();

  // insert new users into users table if they don't already exist
  useEffect(() => {
    if (user) {
      const insertUser = async () => {
        try {
          await fetch('/api/admin/insert-admins', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nickname: user.nickname, auth0_id: user.sub, email: user.email }),
          });
        } catch (err) {
          console.error('Failed to insert new user:', err);
        }
      };
      insertUser();
    }
  }, [user]);

  const auth0_id = user?.sub;
  const [users, setUsers] = useState([]);
  useEffect(() => {
    if (!auth0_id) {
      return;
    }

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/userChurch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ auth0_id }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user churches');
            }
            const data = await response.json();
            if (data.length === 0) {
              setUsers(null);
            } else {
              const userChurch = data[0].church_id;
              setUsers(userChurch);
            }
        } catch (error) {
            console.error('Error fetching user church:', error);
        }
    };

    fetchUsers();
}, [auth0_id]); 

  // if no session (i.e. user is not logged in), show login button
  if (!user) {
    return (
      <section className="t-20 min-h-screen flex flex-col">
        <div className="t-15 flex-1 flex flex-col bg-gradient-to-t from-blue-300 to-blue-600 p-30">
          <div className="flex-1 flex flex-col items-center justify-center">
            <Image src="/Servewell.png" width={500} height={500} alt="Logo"/>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
              <ChurchCreationButton />
              <LoginButton />
            </div>
          </div>
        </div>
      </section>
    );
  } else {
    // If user session exists (i.e. user is logged in), check if user is assigned to a church
    // If user is not assigned to a church, show assignment request button
    if (users === null){
      return (
        <section className="t-20 min-h-screen flex flex-col">
          <div className="t-15 flex-1 flex flex-col bg-gradient-to-t from-blue-300 to-blue-600 p-30">
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="flex flex-row items-center text-center space-x-6">
                <h1 className="text-4xl font-bold text-white">Welcome, {user.nickname}</h1>
                <Image src="/Servewell.png" width={500} height={500} alt="Logo"/>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                <ChurchCreationButton />
                <AssignmentRequestButton />
              </div>
            </div>
          </div>
        </section>
      );
    }
    return (
      <section className="t-20 min-h-screen flex flex-col">
        <div className="t-15 flex-1 flex flex-col bg-gradient-to-t from-blue-300 to-blue-600 p-30">
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="flex flex-row items-center text-center space-x-6">
              <h1 className="text-4xl font-bold text-white">Welcome, {user.nickname}</h1>
              <Image src="/Servewell.png" width={500} height={500} alt="Logo"/>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
              <ChurchCreationButton />
              <LoginButton />
            </div>
          </div>
        </div>
      </section>
    );
  }
}