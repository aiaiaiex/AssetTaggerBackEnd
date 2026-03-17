import z from "zod";

import {
  zodParseNumber,
  zodSubstituteEmptyString,
  zodXOR,
} from "../utils/zodUtils";

// See more:
// https://expressjs.com/en/5x/api.html#res.cookie
const CookieOptionsConfigSchema = z.object({
  httpOnly: z.stringbool({
    case: "sensitive",
    falsy: ["false"],
    truthy: ["true", ""], // Empty string defaults to true.
  }),
  maxAge: zodParseNumber(z.int().min(1), 1)
    .transform((input) => {
      // input (hours) * 60 minutes * 60 seconds * 1000 milliseconds.
      return input * 60 * 60 * 1000; // Empty string defaults to 1 hour.
    })
    .pipe(z.int()),
  sameSite: zodXOR([
    z.stringbool({
      case: "sensitive",
      falsy: ["false"],
      truthy: ["true", ""], // Empty string defaults to true.
    }),
    z.enum(["lax", "strict", "none"]),
  ]),
  secure: z.stringbool({
    case: "sensitive",
    falsy: ["false", ""], // Empty string defaults to false.
    truthy: ["true"],
  }),
});

const AuthenticationConfigSchema = z.object({
  algorithms: zodSubstituteEmptyString(
    z.enum(["HS256", "HS384", "HS512"]),
    "HS512", // Empty string defaults to HS512.
  ),
  cookieAccessTokenName: zodSubstituteEmptyString(
    z.string().min(1),
    "assetTaggerAccessToken", // Empty string defaults to assetTaggerAccessToken.
  ),
  cookieOptions: CookieOptionsConfigSchema,
  expiresIn: zodParseNumber(z.int().min(1), 1).transform((input) => {
    // input (hours) * 60 minutes * 60 seconds.
    return input * 60 * 60; // Empty string defaults to 1 hour.
  }),
  ipInPayload: z.stringbool({
    case: "sensitive",
    falsy: ["false", ""], // Empty string defaults to false.
    truthy: ["true"],
  }),
  salt: z.string(),
  secret: z.string().min(1),
});

type AuthenticationConfig = z.infer<typeof AuthenticationConfigSchema>;

const authenticationConfig: AuthenticationConfig =
  AuthenticationConfigSchema.parse({
    algorithms: process.env.JWT_ALGORITHMS,
    cookieAccessTokenName: process.env.COOKIE_ACCESS_TOKEN_NAME,
    cookieOptions: {
      httpOnly: process.env.COOKIE_HTTP_ONLY,
      maxAge: process.env.COOKIE_MAX_AGE,
      sameSite: process.env.COOKIE_SAME_SITE,
      secure: process.env.COOKIE_SECURE,
    },
    expiresIn: process.env.JWT_EXPIRES_IN,
    ipInPayload: process.env.IP_IN_PAYLOAD,
    salt: process.env.PASSWORD_SALT,
    secret: process.env.JWT_SECRET,
  });

export default authenticationConfig;
