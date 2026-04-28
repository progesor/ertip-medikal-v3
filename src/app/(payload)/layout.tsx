 
import configPromise from "@payload-config";
import "@payloadcms/next/css";
import { RootLayout, handleServerFunctions } from "@payloadcms/next/layouts";
import React from "react";

import { importMap } from "./admin/importMap";

type Args = {
  children: React.ReactNode;
};

// Payload 3.x Stabil sürümü için gereken Server Action sarmalayıcısı
const serverFunction = async function (args: any) {
  "use server";
  return handleServerFunctions({
    ...args,
    config: configPromise,
    importMap,
  });
};

const Layout = ({ children }: Args) => (
  <RootLayout
    config={configPromise}
    importMap={importMap}
    serverFunction={serverFunction}
  >
    {children}
  </RootLayout>
);

export default Layout;
