import { Worker } from 'worker_threads';
import path from 'path';

export type JobType = string;

export interface JobMessage {
  type: JobType;
  data: any; 
}


interface WorkerResult {
  status: 'success' | 'error';
  txData?: any;
  error?: string;
}


interface Task {
  data: JobMessage;
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
}


const taskQueue: Task[] = [];
let activeWorkers = 0;
const MAX_CONCURRENT_WORKERS = 5;

export const handleJob = (data: JobMessage): Promise<any> => {
  return new Promise((resolve, reject) => {
    taskQueue.push({ data, resolve, reject });
    processNextTask();
  });
};


const processNextTask = (): void => {
  if (activeWorkers < MAX_CONCURRENT_WORKERS && taskQueue.length > 0) {
    const { data, resolve, reject } = taskQueue.shift()!;
    runWorker(data)
      .then(resolve)
      .catch(reject)
      .finally(() => {
        activeWorkers--;
        processNextTask();
      });
  }
};

const runWorker = (data: JobMessage): Promise<any> => {
  return new Promise((resolve, reject) => {
    activeWorkers++;
    const worker = new Worker(path.join(__dirname, '/workerHelper.js'));

    worker.postMessage(data);

    worker.on('message', (result: WorkerResult) => {
      if (result.status === 'success') {
        resolve(result.txData);
      } else {
        reject(new Error(result.error));
      }
    });

    worker.on('error', (error) => reject(error));
    worker.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Worker exited with code ${code}`));
      }
    });
  });
};
