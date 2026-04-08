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
  lineUserId: string;
  stateFilePath: string;
  githubRepo: string;
  deeplApiKey: string;
  dryRun: boolean;
}
