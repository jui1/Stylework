type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <section className="rounded-lg border border-dashed border-stone-300 bg-white p-8">
      <h2 className="text-base font-medium">{title}</h2>
      <p className="mt-1 text-sm text-stone-600">{description}</p>
    </section>
  );
}
