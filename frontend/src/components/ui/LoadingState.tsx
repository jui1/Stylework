type LoadingStateProps = {
  label: string;
};

export function LoadingState({ label }: LoadingStateProps) {
  return <p className="text-sm text-stone-500">{label}</p>;
}
