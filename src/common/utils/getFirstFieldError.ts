// TanStack Form with a Standard Schema validator keeps the raw issue objects in
// `field.state.meta.errors`; the first message is what a single helper line shows.
export const getFirstFieldError = (errors: ReadonlyArray<unknown>): string | undefined => {
  for (const error of errors) {
    if (typeof error === "string") return error;
    if (error && typeof error === "object" && "message" in error) {
      if (typeof error.message === "string") return error.message;
    }
  }
  return undefined;
};
