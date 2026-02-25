import z from "zod";

import { zodStringToNumber } from "../utils/zodUtils";

const ServerConfigSchema = z.object({
  // 0 <= port <= 65535
  // See more:
  // https://datatracker.ietf.org/doc/html/rfc6335#section-6
  port: zodStringToNumber(z.int().min(0).max(65535), undefined, 3000),
});

type ServerConfig = z.infer<typeof ServerConfigSchema>;

const serverConfig: ServerConfig = ServerConfigSchema.parse({
  port: process.env.SERVER_PORT,
});

export default serverConfig;
