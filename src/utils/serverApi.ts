import { GymData, SyncServerConfig } from '../types';

export interface ServerDataEnvelope {
  schemaVersion: number;
  revision: number;
  updatedAt: string;
  contentHash: string;
  data: GymData;
}

const metadataByServer = new Map<string, Pick<ServerDataEnvelope, 'revision' | 'contentHash'>>();

function baseUrl(serverUrl: string): string {
  return serverUrl.trim().replace(/\/+$/, '');
}

function authHeaders(syncConfig: SyncServerConfig): Record<string, string> {
  const token = syncConfig.authToken?.trim();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(syncConfig: SyncServerConfig, path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${baseUrl(syncConfig.serverUrl)}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...authHeaders(syncConfig),
      ...(init.headers || {}),
    },
    signal: init.signal || AbortSignal.timeout(5000),
  });
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const error = new Error(body?.error || `server_http_${response.status}`) as Error & { status?: number; body?: unknown };
    error.status = response.status;
    error.body = body;
    throw error;
  }
  return body as T;
}

export async function checkServerHealth(serverUrl: string): Promise<{ status: string; version: string }> {
  return request({ serverUrl, authToken: '', port: 0, deviceId: '', deviceName: '', deviceType: 'windows_desktop', pairingCode: '', autoSync: false, conflictResolution: 'ask' }, '/api/health');
}

export async function pullServerData(syncConfig: SyncServerConfig): Promise<ServerDataEnvelope> {
  const envelope = await request<ServerDataEnvelope>(syncConfig, '/api/data');
  metadataByServer.set(baseUrl(syncConfig.serverUrl), envelope);
  return envelope;
}

export async function pushServerData(syncConfig: SyncServerConfig, data: GymData): Promise<ServerDataEnvelope> {
  const metadata = metadataByServer.get(baseUrl(syncConfig.serverUrl));
  const envelope = await request<ServerDataEnvelope>(syncConfig, '/api/data', {
    method: 'POST',
    body: JSON.stringify({
      schemaVersion: 1,
      revision: metadata?.revision,
      contentHash: metadata?.contentHash,
      data,
    }),
  });
  metadataByServer.set(baseUrl(syncConfig.serverUrl), envelope);
  return envelope;
}
