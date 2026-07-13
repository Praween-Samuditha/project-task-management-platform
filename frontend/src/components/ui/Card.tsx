interface CardProps {
  children: React.ReactNode;
  className?: string;
  noPad?: boolean;
}

export default function Card({ children, className = "", noPad = false }: CardProps) {
  return (
    <div className={`rounded-xl border border-card-border bg-card shadow-card ${noPad ? "" : "p-5"} ${className}`}>
      {children}
    </div>
  );
}
