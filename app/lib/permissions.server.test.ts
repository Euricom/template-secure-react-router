import { expect, describe, test } from "vitest";
import { ensureCan, ensureCanWithIdentity } from "./permissions.server";
import { subject } from "@casl/ability";

const READ = "read";
const EDIT = "edit";
const MANAGE = "manage";

const user = {
  anonymous: null,
  user: {
    id: "user-1",
    role: "user",
    organizationId: "organization-1",
    organizationRole: "member",
  } as any,
  admin: {
    id: "admin-1",
    role: "admin",
    organizationId: "organization-1",
    organizationRole: "admin",
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
    expect(() => ensureCanWithIdentity(user.anonymous, READ, "Product")).toThrow(
      "User does not have permission to perform this action"
    );
  });
});

describe("As a regular user", () => {
  test("I can read products", () => {
    expect(() => ensureCanWithIdentity(user.user, READ, "Product")).not.toThrow();
  });

  test("I can't manage products I don't own", () => {
    expect(() => ensureCanWithIdentity(user.user, EDIT, product.productOfOtherUser)).toThrow(
      "User does not have permission to perform this action"
    );
  });

  test("I can manage my own product", () => {
    expect(() => ensureCanWithIdentity(user.user, MANAGE, product.productOfUser)).not.toThrow();
  });

  test("I can't manage users", () => {
    expect(() => ensureCanWithIdentity(user.user, EDIT, "User")).toThrow(
      "User does not have permission to perform this action"
    );
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
