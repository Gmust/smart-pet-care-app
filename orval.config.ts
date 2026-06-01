export default {
  smartPetCare: {
    input: "docs/openapi.json",
    output: {
      target: "src/api/generated/index.ts",
      client: "react-query",
      httpClient: "axios",
    },
  },
};
