declare namespace NodeJS {
  interface ProcessEnv {
    readonly API_KEY: string;
    readonly OMDB_API_KEY: string;
  }
}