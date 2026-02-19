import z from "zod";

const ServerConfigSchema = z.object({
  // 0 <= port <= 65535
  // See more:
  // https://datatracker.ietf.org/doc/html/rfc6335#section-6
  port: z
    .string()
    .transform((x) => {
      return x.trim().length > 0 ? Number(x) : 3000;
    })
    .pipe(z.int().gte(0).lte(65535)),
});

type ServerConfig = z.infer<typeof ServerConfigSchema>;

const serverConfig: ServerConfig = ServerConfigSchema.parse({
  port: process.env.SERVER_PORT,
});

export default serverConfig;
