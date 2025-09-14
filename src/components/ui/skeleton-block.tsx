type Props = {
  className?: string;
};

export function SkeletonBlock({ className }: Props) {
  return <div className={`animate-pulse rounded bg-neutral-700 ${className}`} />;
}
