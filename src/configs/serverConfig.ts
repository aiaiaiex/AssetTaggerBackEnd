import z from "zod";

import { zodParseNumber, zodSubstituteEmptyString } from "../utils/zodUtils";

const CorsOptionsSchema = z.object({
  allowedHeader: z.string().array(),
  credentials: z.stringbool({
    case: "sensitive",
    falsy: ["false"],
    truthy: ["true", ""], // Empty string defaults to true.
  }),
  maxAge: zodParseNumber(z.int().min(0), 600), // Empty string defaults to 600.
  methods: z.enum(["POST", "GET", "PATCH", "DELETE"]).array(),
  optionsSuccessStatus: zodParseNumber(z.int().min(200).max(299)),
  origin: zodSubstituteEmptyString(z.string().min(1), "http://localhost:5173"), // Empty string defaults to http://localhost:5173
  preflightContinue: z.boolean(),
});

const ServerConfigSchema = z.object({
  corsOptions: CorsOptionsSchema,
  // 0 <= port <= 65535
  // See more:
  // https://datatracker.ietf.org/doc/html/rfc6335#section-6
  port: zodParseNumber(z.int().min(0).max(65535), 3000), // Empty string defaults to 3000.
});

type ServerConfig = z.infer<typeof ServerConfigSchema>;

const serverConfig: ServerConfig = ServerConfigSchema.parse({
  corsOptions: {
    allowedHeader: ["Content-Type", "Cookie"],
    credentials: process.env.CORS_CREDENTIALS,
    maxAge: process.env.CORS_MAX_AGE,
    methods: ["POST", "GET", "PATCH", "DELETE"],
    optionsSuccessStatus: 204,
    origin: process.env.CORS_ORIGIN,
    preflightContinue: false,
  },
  port: process.env.SERVER_PORT,
});

export default serverConfig;

console.log(serverConfig);
