export type RouteParams<T extends Record<string, string | string[]>> = Promise<T>;

export type NextSearchParams = Promise<{
  [key: string]: string | string[] | undefined;
}>;

export type PayloadAdminSearchParams = Promise<{
  [key: string]: string | string[];
}>;
