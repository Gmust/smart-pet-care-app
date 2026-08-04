export const careQueryKeys = {
  meals: (petId: string) => ["care", "meals", petId] as const,
  careRules: (petId: string) => ["care", "careRules", petId] as const,
  foodTracker: (petId: string) => ["care", "foodTracker", petId] as const,
};
