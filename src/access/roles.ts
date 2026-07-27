type UserLike = {
  id?: string | number | null;
  role?: string | null;
};

type AccessArgs = {
  id?: string | number | null;
  req: {
    user?: UserLike | null;
  };
};

export function isAdmin(user: unknown): user is UserLike {
  return Boolean(
    user &&
      typeof user === "object" &&
      "role" in user &&
      (user as UserLike).role === "admin",
  );
}

export function isContentManager(user: unknown): user is UserLike {
  if (!user || typeof user !== "object" || !("role" in user)) return false;

  const role = (user as UserLike).role;
  return role === "admin" || role === "editor";
}

export function authenticated({ req }: AccessArgs) {
  return Boolean(req.user);
}

export function adminsOnly({ req }: AccessArgs) {
  return isAdmin(req.user);
}

export function contentManagers({ req }: AccessArgs) {
  return isContentManager(req.user);
}

export function adminOrSelf({ req }: AccessArgs) {
  if (isAdmin(req.user)) return true;
  if (!req.user?.id) return false;

  return {
    id: {
      equals: req.user.id,
    },
  };
}
