import { CreateReminderDrawer } from "./CreateReminderDrawer";
import { ReminderDescriptionDrawer } from "./ReminderDescriptionDrawer";
import { ReminderRunsDrawer } from "./ReminderRunsDrawer";
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
  historyReminderId: string | null;
  setHistoryReminderId: (id: string | null) => void;
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
  historyReminderId,
  setHistoryReminderId,
}: ReminderDrawersProps) {
  return (
    <>
      <CreateReminderDrawer isOpen={isCreateOpen} setIsOpen={setIsCreateOpen} />

      {!!editReminderId && (
        <CreateReminderDrawer
          key={editReminderId}
          reminderId={editReminderId}
          isOpen
          setIsOpen={(open) => {
            if (!open) setEditReminderId(null);
          }}
        />
      )}

      {!!statusReminderId && (
        <ReminderStatusDrawer
          key={statusReminderId}
          reminderId={statusReminderId}
          onClose={() => setStatusReminderId(null)}
        />
      )}

      {!!descriptionReminderId && (
        <ReminderDescriptionDrawer
          key={descriptionReminderId}
          reminderId={descriptionReminderId}
          onClose={() => setDescriptionReminderId(null)}
        />
      )}

      {!!historyReminderId && (
        <ReminderRunsDrawer
          key={historyReminderId}
          reminderId={historyReminderId}
          onClose={() => setHistoryReminderId(null)}
        />
      )}
    </>
  );
}
