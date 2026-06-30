export const toSourceUri = (uri: string) => (/^\w+:\/\//.test(uri) ? uri : `file://${uri}`);
