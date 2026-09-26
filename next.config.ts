import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /**
     * Product imagery is uploaded through the admin panel and served from
     * Cloudinary, so next/image has to be told that host is allowed. Without an
     * entry here every product image responds 400 — Next refuses to optimize a
     * remote URL it has not been configured for, by design.
     *
     * Scoped to this account's cloud name rather than all of res.cloudinary.com.
     * That host is shared by every Cloudinary customer, so a bare hostname would
     * let anyone hand our optimizer an arbitrary image and have it served from
     * our domain, on our bandwidth.
     *
     * `search: ""` rejects query strings: a delivery URL carries its
     * transformation in the path, so a query string on one means something
     * appended it.
     *
     * Images still held in public/ are unaffected — a root-relative path is
     * local and never consults this list.
     */
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/renmheqy/**",
        search: "",
      },
    ],
  },
};

export default nextConfig;
