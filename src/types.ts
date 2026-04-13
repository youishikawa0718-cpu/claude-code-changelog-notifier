export interface Release {
  tagName: string;
  version: string;
  publishedAt: string;
  body: string;
}

export interface AppState {
  lastSeenVersion: string;
  lastSeenPublishedAt: string;
  lastCheckedAt: string;
}

export interface Config {
  lineChannelAccessToken: string;
  stateFilePath: string;
  githubRepo: string;
  deeplApiKey: string;
  dryRun: boolean;
}
