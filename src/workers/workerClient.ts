import {
  WorkerCommand,
  WorkerCommandType,
  WorkerResponse,
  ParseResultData,
} from '../types/worker';
import { TablePageQuery, TablePageResult } from '../types/dataset';

type ProgressHandler = (progress: number, message: string) => void;

interface PendingRequest {
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
  onProgress?: ProgressHandler;
}

class DataWorkerClient {
  private worker: Worker | null = null;
  private pendingRequests = new Map<string, PendingRequest>();
  private requestIdCounter = 0;

  constructor() {
    this.initWorker();
  }

  private initWorker() {
    try {
      this.worker = new Worker(new URL('./data.worker.ts', import.meta.url), {
        type: 'module',
      });

      this.worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        this.handleMessage(event.data);
      };

      this.worker.onerror = (error) => {
        console.error('Data Worker error:', error);
        this.rejectAllPending(`Worker system error: ${error.message || 'Unknown worker fault'}`);
      };
    } catch (e) {
      console.error('Failed to initialize Web Worker:', e);
    }
  }

  private handleMessage(response: WorkerResponse) {
    const pending = this.pendingRequests.get(response.id);
    if (!pending) return;

    if (response.status === 'progress') {
      if (pending.onProgress) {
        pending.onProgress(response.progress, response.message);
      }
    } else if (response.status === 'success') {
      this.pendingRequests.delete(response.id);
      pending.resolve(response.data);
    } else if (response.status === 'error') {
      this.pendingRequests.delete(response.id);
      pending.reject(new Error(response.error));
    }
  }

  private rejectAllPending(reason: string) {
    for (const [id, req] of this.pendingRequests.entries()) {
      req.reject(new Error(reason));
      this.pendingRequests.delete(id);
    }
  }

  public sendCommand<T = any>(
    type: WorkerCommandType,
    payload: any,
    onProgress?: ProgressHandler
  ): Promise<T> {
    if (!this.worker) {
      this.initWorker();
      if (!this.worker) {
        return Promise.reject(new Error('Web Worker is unavailable in this environment'));
      }
    }

    return new Promise((resolve, reject) => {
      const id = `req_${++this.requestIdCounter}_${Date.now()}`;
      this.pendingRequests.set(id, { resolve, reject, onProgress });

      const command: WorkerCommand = {
        id,
        type,
        payload,
      };

      this.worker!.postMessage(command);
    });
  }

  public async ping(): Promise<boolean> {
    try {
      const res = await this.sendCommand('PING', {});
      return res?.status === 'ready';
    } catch {
      return false;
    }
  }

  public async loadSample(csvString: string, onProgress?: ProgressHandler): Promise<ParseResultData> {
    return this.sendCommand<ParseResultData>('LOAD_SAMPLE', { csvString }, onProgress);
  }

  public async parseFile(file: File, onProgress?: ProgressHandler): Promise<ParseResultData> {
    return this.sendCommand<ParseResultData>('PARSE_FILE', { file }, onProgress);
  }

  public async selectSheet(sheetName: string, onProgress?: ProgressHandler): Promise<ParseResultData> {
    return this.sendCommand<ParseResultData>('SELECT_SHEET', { sheetName }, onProgress);
  }

  public async getPage(query: TablePageQuery): Promise<TablePageResult> {
    return this.sendCommand<TablePageResult>('GET_PAGE', query);
  }

  public async reset(): Promise<void> {
    await this.sendCommand('RESET', {});
  }

  public terminate() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.pendingRequests.clear();
  }
}

export const workerClient = new DataWorkerClient();
