import styles from '@/app/(dashboard)/dashboard.module.css';

interface SummaryCardProps {
  label: string;
  amount: number;
  note: string;
  icon: React.ReactNode;
}

export function SummaryCard({ label, amount, note, icon }: SummaryCardProps) {
  const isNegative = amount < 0;
  const sign = amount >= 0 ? '+' : '';

  return (
    <div className={`${styles.summaryCard} ${isNegative ? styles.negative : styles.positive}`}>
      <div className={styles.summaryLabel}>
        {icon}
        {label}
      </div>
      <div className={`${styles.summaryAmount} ${isNegative ? styles.negative : styles.positive}`}>
        {sign}${Math.abs(amount).toFixed(2)}
      </div>
      <div className={styles.summaryNote}>{note}</div>
    </div>
  );
}
