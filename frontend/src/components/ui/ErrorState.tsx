type ErrorStateProps = {
  message: string;
  onRetry?: () => void;
};

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <section className="rounded-lg border border-red-200 bg-red-50 p-4" role="alert">
      <h2 className="text-sm font-medium text-red-800">Something went wrong</h2>
      <p className="mt-1 text-sm text-red-700">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-800"
        >
          Try again
        </button>
      ) : null}
    </section>
  );
}
