'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Group } from '@/types';

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchGroups() {
      try {
        const response = await fetch('/api/groups');
        if (!response.ok) throw new Error('Failed to fetch groups');
        const data = await response.json();
        setGroups(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchGroups();
  }, []);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Groups</h1>

      {error && (
        <div style={{
          background: '#fee',
          color: '#c33',
          padding: '1rem',
          borderRadius: '0.375rem',
          marginBottom: '1rem',
        }}>
          {error}
        </div>
      )}

      {groups.length === 0 ? (
        <p>No groups yet. Create one to get started.</p>
      ) : (
        <ul style={{ listStyle: 'none', lineHeight: '2' }}>
          {groups.map((group) => (
            <li key={group.id}>
              <Link href={`/groups/${group.id}`}>
                {group.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
