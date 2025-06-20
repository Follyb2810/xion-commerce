import { parentPort } from "worker_threads";
import { connectDb } from "../../config/db";

//Todo compile becuase node.js does not directly support .ts

(async () => {
  try {
    await connectDb();
  } catch (error: any) {
    parentPort?.postMessage({ status: "error", error: error.message });
  }
})();

const jobHandlers: Record<string, (data: any) => Promise<any>> = {
  saveToDatabase: async (data) =>
    (await import("./jobs/saveToDatabase")).default(data),
  deployContract: async (data) =>
    (await import("./jobs/deployContract")).default(data),
  sendEmail: async (data) => (await import("./jobs/sendEmail")).default(data),
};

parentPort?.on('message', async (message: any) => {
  const { type, data } = message;

  const handler = jobHandlers[type];
  if (!handler) {
    return parentPort?.postMessage({
      status: 'error',
      error: `Unknown job type: ${type}`,
    });
  }

  try {
    const result = await handler(data);
    parentPort?.postMessage({ status: 'success', txData: result });
  } catch (error: any) {
    parentPort?.postMessage({ status: 'error', error: error.message });
  }
});
