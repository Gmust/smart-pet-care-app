import type { IFormFile } from "@/api/generated";

type RNFile = { uri: string; name: string; type: string };

/**
 * React Native serializes multipart file parts from `{ uri, name, type }`
 * objects via its native networking layer. The generated OpenAPI type is the
 * web `Blob` (`IFormFile = Blob`), which RN's networking cannot serialize.
 * This cast is the platform boundary between the two file shapes.
 */
export const asFormFile = (file: RNFile): IFormFile => file as unknown as IFormFile;
