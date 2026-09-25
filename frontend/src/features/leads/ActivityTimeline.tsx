import { EmptyState } from "@/components/ui/EmptyState";
import type { Activity } from "@/types/lead";

type ActivityTimelineProps = {
  activities: Activity[];
};

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  if (activities.length === 0) {
    return <EmptyState title="No activity" description="This lead has no recorded activity yet." />;
  }

  return (
    <section>
      <h2 className="text-lg font-medium">Activity</h2>
      <ol className="mt-4 space-y-4 border-l border-stone-300 pl-4">
        {activities.map((activity) => (
          <li key={activity.id}>
            <p className="text-sm font-medium">{activity.type.replaceAll("_", " ")}</p>
            <p className="text-sm text-stone-700">{activity.description}</p>
            <time className="text-xs text-stone-500" dateTime={activity.createdAt}>
              {activity.createdAt}
            </time>
          </li>
        ))}
      </ol>
    </section>
  );
}
