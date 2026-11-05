import type {
  NextConfig,
} from "next";


const nextConfig: NextConfig = {
  /*
   * Admin pages depend on:
   * - cookies
   * - current Supabase session
   * - live database data
   *
   * We don't need Cache Components here.
   */
  cacheComponents: false,


  /*
   * IMPORTANT:
   *
   * create-next-app 16.4.x uses the
   * Tailwind Turbopack loader.
   *
   * Without this rule, Tailwind utility
   * classes will not be compiled.
   */
  turbopack: {
    rules: {
      "*.css": {
        loaders: [
          "@tailwindcss/turbopack",
        ],

        as: "*.css",
      },
    },
  },
};


export default nextConfig;