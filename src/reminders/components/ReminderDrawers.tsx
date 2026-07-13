import { CreateReminderDrawer } from "./CreateReminderDrawer";
import { ReminderDescriptionDrawer } from "./ReminderDescriptionDrawer";
import { ReminderStatusDrawer } from "./ReminderStatusDrawer";

type ReminderDrawersProps = {
  isCreateOpen: boolean;
  setIsCreateOpen: (open: boolean) => void;
  editReminderId: string | null;
  setEditReminderId: (id: string | null) => void;
  statusReminderId: string | null;
  setStatusReminderId: (id: string | null) => void;
  descriptionReminderId: string | null;
  setDescriptionReminderId: (id: string | null) => void;
};

export function ReminderDrawers({
  isCreateOpen,
  setIsCreateOpen,
  editReminderId,
  setEditReminderId,
  statusReminderId,
  setStatusReminderId,
  descriptionReminderId,
  setDescriptionReminderId,
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

      {descriptionReminderId !== null && (
        <ReminderDescriptionDrawer
          key={descriptionReminderId}
          reminderId={descriptionReminderId}
          onClose={() => setDescriptionReminderId(null)}
        />
      )}
    </>
  );
}
