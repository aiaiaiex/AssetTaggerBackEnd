import z from "zod";

import {
  zodCombineUnionErrorMessages,
  zodParseNumber,
} from "../utils/zodUtils";

// See more:
// https://expressjs.com/en/5x/api.html#res.cookie
const CookieOptionsConfigSchema = z.object({
  httpOnly: z.stringbool({
    case: "sensitive",
    falsy: ["false"],
    truthy: ["true", ""], // Empty strings default to true.
  }),
  maxAge: zodParseNumber(z.int().min(1), 1)
    .transform((input) => {
      // input (hours) * 60 minutes * 60 seconds * 1000 milliseconds.
      return input * 60 * 60 * 1000; // Empty strings default to 1 hour.
    })
    .pipe(z.int()),
  sameSite: z.xor(
    [
      z.stringbool({
        case: "sensitive",
        falsy: ["false"],
        truthy: ["true", ""], // Empty strings default to true.
      }),
      z.enum(["lax", "strict", "none"]),
    ],
    { error: zodCombineUnionErrorMessages },
  ),
  secure: z.stringbool({
    case: "sensitive",
    falsy: ["false", ""], // Empty strings default to false.
    truthy: ["true"],
  }),
});

const AuthenticationConfigSchema = z.object({
  algorithms: z
    .string()
    .transform((input) => {
      return input.length > 0 ? input : "HS512"; // Empty strings default to HS512.
    })
    .pipe(z.enum(["HS256", "HS384", "HS512"])),
  cookieAccessTokenName: z
    .string()
    .transform((input) => {
      return input.length > 0 ? input : "assetTaggerAccessToken";
    })
    .pipe(z.string().min(1)),
  cookieOptions: CookieOptionsConfigSchema,
  expiresIn: zodParseNumber(z.int().min(1), 1).transform((input) => {
    // input (hours) * 60 minutes * 60 seconds.
    return input * 60 * 60; // Empty strings default to 1 hour.
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
    salt: process.env.PASSWORD_SALT,
    secret: process.env.JWT_SECRET,
  });

export default authenticationConfig;
