import { expect, describe, test } from "vitest";
import { ensureCanWithIdentity } from "./permissions.server";
import { subject } from "@casl/ability";

const READ = "read";
const EDIT = "edit";
const MANAGE = "manage";

const user = {
  anonymous: null,
  user: {
    user: {
      id: "user-1",
      role: "user",
    },
    organization: {
      id: "organization-1",
      role: "member",
    },
  } as any,
  admin: {
    user: {
      id: "admin-1",
      role: "admin",
    },
    organization: {
      id: "organization-1",
      role: "admin",
    },
  } as any,
};

const product = {
  productOfUser: subject("Product", {
    id: "product-1",
    userId: "user-1",
  }),
  productOfOtherUser: subject("Product", {
    id: "product-2",
    userId: "user-2",
  }),
};

describe("As a not logged in user", () => {
  test("I can't read products", () => {
    expect(() => ensureCanWithIdentity(user.anonymous, READ, "Product")).toThrow();
  });
});

describe("As a regular user", () => {
  test("I can read products", () => {
    expect(() => ensureCanWithIdentity(user.user, READ, "Product")).not.toThrow();
  });

  test("I can't manage products I don't own", () => {
    expect(() => ensureCanWithIdentity(user.user, EDIT, product.productOfOtherUser)).toThrow();
  });

  test("I can manage my own product", () => {
    expect(() => ensureCanWithIdentity(user.user, MANAGE, product.productOfUser)).not.toThrow();
  });

  test("I can't manage users", () => {
    expect(() => ensureCanWithIdentity(user.user, EDIT, "User")).toThrow();
  });
});

describe("As an admin user", () => {
  test("I can manage all products", () => {
    expect(() => ensureCanWithIdentity(user.admin, EDIT, product.productOfUser)).not.toThrow();
  });

  test("I can manage users", () => {
    expect(() => ensureCanWithIdentity(user.admin, EDIT, "User")).not.toThrow();
  });

  test("I can read products", () => {
    expect(() => ensureCanWithIdentity(user.admin, READ, "Product")).not.toThrow();
  });
});
