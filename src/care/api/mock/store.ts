/**
 * TODO(care-backend): This entire mock layer is a stand-in for the real
 * Care API. Swap by replacing `createMockCollection` usages in
 * `care/api/mock/*.mock.ts` with real query/mutation calls in
 * `care/queries/*` — this file itself can be deleted once nothing imports
 * it.
 */
const DEFAULT_DELAY_MS = 300;

function delay(ms: number = DEFAULT_DELAY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateId(): string {
  return `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

type WithIdAndPet = { id: string; petId: string };

/**
 * In-memory collection scoped by petId, standing in for a future REST
 * resource. Only `care/api/mock/*.mock.ts` files import this — query hooks
 * never touch it directly, so swapping to the real generated client later
 * means changing the `queryFn`/`mutationFn` in `care/queries/*` only.
 */
export function createMockCollection<T extends WithIdAndPet>(seed: T[] = []) {
  let records: T[] = [...seed];

  return {
    async list(petId: string): Promise<T[]> {
      await delay();
      return records.filter((record) => record.petId === petId);
    },
    async create(input: Omit<T, "id">): Promise<T> {
      await delay();
      const created = { ...input, id: generateId() } as T;
      records = [...records, created];
      return created;
    },
    async update(id: string, patch: Partial<Omit<T, "id" | "petId">>): Promise<T> {
      await delay();
      const index = records.findIndex((record) => record.id === id);
      if (index === -1) {
        throw new Error(`Mock record ${id} not found`);
      }
      const updated = { ...records[index], ...patch };
      records = [...records.slice(0, index), updated, ...records.slice(index + 1)];
      return updated;
    },
    async remove(id: string): Promise<void> {
      await delay();
      records = records.filter((record) => record.id !== id);
    },
  };
}
