import { type NotificationItem } from '../../lib/notifications.ts';
import { Pagination } from '../Pagination.tsx';
import { NotificationRow } from './NotificationRow.tsx';

export function NotificationsList({
  notifications,
  onPage,
  onRead,
  page,
  totalPages,
}: {
  notifications: NotificationItem[];
  onPage: (page: number) => void;
  onRead: (id: string) => Promise<void>;
  page: number;
  totalPages: number;
}) {
  return (
    <div className="mt-2 grid gap-4">
      {totalPages > 1 && (
        <div className="flex justify-end">
          <Pagination page={page} totalPages={totalPages} onPage={onPage} />
        </div>
      )}
      <section>
        {notifications.map((item) => (
          <NotificationRow key={item.id} item={item} onRead={onRead} />
        ))}
      </section>
      {totalPages > 1 && (
        <div className="flex justify-end">
          <Pagination page={page} totalPages={totalPages} onPage={onPage} />
        </div>
      )}
    </div>
  );
}
