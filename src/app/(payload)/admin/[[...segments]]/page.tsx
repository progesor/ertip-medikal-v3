import type { Metadata } from "next";
import configPromise from "@payload-config";
import { RootPage, generatePageMetadata } from "@payloadcms/next/views";
import type {
  PayloadAdminSearchParams,
  RouteParams,
} from "@/types/next";

import { importMap } from "../importMap";

type Args = {
  params: RouteParams<{
    segments: string[];
  }>;
  searchParams: PayloadAdminSearchParams;
};

export const generateMetadata = ({
  params,
  searchParams,
}: Args): Promise<Metadata> =>
  // generatePageMetadata sadece config, params ve searchParams alır
  generatePageMetadata({ config: configPromise, params, searchParams });

const Page = ({ params, searchParams }: Args) =>
  RootPage({ config: configPromise, params, searchParams, importMap });

export default Page;
