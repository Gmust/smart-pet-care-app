import { CreateReminderDrawer } from "./CreateReminderDrawer";
import { ReminderStatusDrawer } from "./ReminderStatusDrawer";

type ReminderDrawersProps = {
  isCreateOpen: boolean;
  setIsCreateOpen: (open: boolean) => void;
  editReminderId: string | null;
  setEditReminderId: (id: string | null) => void;
  statusReminderId: string | null;
  setStatusReminderId: (id: string | null) => void;
};

export function ReminderDrawers({
  isCreateOpen,
  setIsCreateOpen,
  editReminderId,
  setEditReminderId,
  statusReminderId,
  setStatusReminderId,
}: ReminderDrawersProps) {
  return (
    <>
      <CreateReminderDrawer isOpen={isCreateOpen} setIsOpen={setIsCreateOpen} />

      {editReminderId !== null && (
        <CreateReminderDrawer
          key={editReminderId}
          reminderId={editReminderId}
          isOpen
          setIsOpen={(open) => {
            if (!open) setEditReminderId(null);
          }}
        />
      )}

      {statusReminderId !== null && (
        <ReminderStatusDrawer
          key={statusReminderId}
          reminderId={statusReminderId}
          onClose={() => setStatusReminderId(null)}
        />
      )}
    </>
  );
}
