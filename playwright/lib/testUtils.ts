import { createServer, IncomingMessage, ServerResponse } from "http";

export function randomString(length = 12) {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

type Request = IncomingMessage & { body?: unknown };
type RequestHandlerOptions = { req: Request; res: ServerResponse };
type RequestHandler = (opts: RequestHandlerOptions) => void;

export function createHttpServer(opts: { requestHandler?: RequestHandler } = {}) {
  const {
    requestHandler = ({ res }) => {
      console.log("responding");
      res.writeHead(200, { "Content-Type": "application/json" });
      res.write(JSON.stringify({}));
      res.end();
    },
  } = opts;
  const requestList: Request[] = [];
  const server = createServer((req, res) => {
    const buffer: unknown[] = [];

    req.on("data", (data) => {
      buffer.push(data);
    });
    req.on("end", () => {
      const _req: Request = req;
      // assume all incoming request bodies are json
      const json = buffer.length ? JSON.parse(buffer.join("")) : undefined;

      _req.body = json;
      requestList.push(_req);
      console.log("adding request", requestList.length);
      requestHandler({ req: _req, res });
    });
  });

  // listen on random port
  server.listen(0);
  const port: number = (server.address() as any).port;
  const url = `http://localhost:${port}`;
  return {
    port,
    close: () => server.close(),
    requestList,
    url,
  };
}

/**
 * When in need to wait for any period of time you can use waitFor, to wait for your expectations to pass.
 */
export async function waitFor(fn: () => Promise<unknown> | unknown) {
  let finished = false;
  while (!finished) {
    try {
      await fn();
      finished = true;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
}
