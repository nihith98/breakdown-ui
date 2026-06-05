'use server';

import { redirect } from 'next/navigation';

export async function logoutAction() {
  try {
    const response = await fetch('http://localhost:3000/api/auth/logout', {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Logout failed');
    }

    // Clear any client-side auth state if needed
    redirect('/login');
  } catch (error) {
    console.error('Logout error:', error);
    // Still redirect to login on error (idempotent behavior)
    redirect('/login');
  }
}
