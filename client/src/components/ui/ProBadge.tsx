import { cn } from '~/utils';

export const proBadgeStyles = "inline-flex shrink-0 items-center rounded-md bg-amber-100/60 px-1.5 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-900/60 dark:text-amber-200";

interface ProBadgeProps {
  className?: string;
}

export const ProBadge = ({ className }: ProBadgeProps) => (
  <span className={cn(proBadgeStyles, className)}>
    PRO
  </span>
);

export default ProBadge; 