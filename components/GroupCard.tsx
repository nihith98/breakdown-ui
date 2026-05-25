'use client';

import { Group } from '@/types';
import Link from 'next/link';

interface GroupCardProps {
  group: Group;
}

export function GroupCard({ group }: GroupCardProps) {
  return (
    <div
      style={{
        border: '1px solid #ddd',
        borderRadius: '0.375rem',
        padding: '1rem',
        marginBottom: '1rem',
      }}
    >
      <h3>
        <Link href={`/groups/${group.id}`}>{group.name}</Link>
      </h3>
      {group.description && <p>{group.description}</p>}
      <p style={{ fontSize: '0.9rem', color: '#666' }}>
        {group.members.length} members
      </p>
    </div>
  );
}
