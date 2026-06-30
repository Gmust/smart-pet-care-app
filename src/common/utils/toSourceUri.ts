export const toSourceUri = (uri: string) =>
  /^[a-z][a-z0-9+.-]*:\/\//i.test(uri) ? uri : `file://${uri}`;
