'use client';

export const FAMILY_COLORS: readonly string[] = [
  '#E07B54',
  '#5B9BD5',
  '#4CAF7D',
  '#B877DB',
  '#E8B84B',
  '#E85D8A',
  '#4DBFBF',
  '#8CB87E',
];

interface Props {
  familyName: string;
  familyHex: string;
}

export function FamilyTag({ familyName, familyHex }: Props) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        fontFamily: 'var(--font-mono)',
        fontSize: '10px',
        color: familyHex,
        backgroundColor: `${familyHex}22`,
        border: `1px solid ${familyHex}55`,
        borderRadius: 'var(--radius-sm)',
        padding: '1px 6px',
        whiteSpace: 'nowrap',
        flexShrink: 0,
        lineHeight: '1.4',
      }}
    >
      {familyName}
    </span>
  );
}
