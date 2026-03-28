import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from "@/lib/prisma"

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  user: {
    additionalFields: {
      slug: {
        type: "string",
        required: true,
        defaultValue: "",
        input: true,
      },
      phone: {
        type: "string",
        required: false,
        defaultValue: "",
        input: true,
      },
      address: {
        type: "string",
        required: false,
        defaultValue: "",
        input: true,
      },
      description: {
        type: "string",
        required: false,
        defaultValue: "",
        input: true,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,     // refresh daily
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  trustedOrigins: [process.env.BETTER_AUTH_URL ?? "http://localhost:3000"],
})

export type Session = typeof auth.$Infer.Session
