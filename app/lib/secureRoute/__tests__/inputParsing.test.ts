import { describe, expect, it } from "vitest";
import { z } from "zod";
import { parseInputs } from "../inputParsing";

describe("inputParsing", () => {
  describe("parseInputs", () => {
    const paramSchema = z.object({
      id: z.string(),
      slug: z.string(),
    });

    const querySchema = z.object({
      page: z.string().transform(Number),
      limit: z.string().transform(Number),
    });

    const formSchema = z.object({
      name: z.string(),
      email: z.string().email(),
    });

    const createArgs = (params: Record<string, string>, request: Request) => ({
      params,
      request,
      context: {},
    });

    it("should parse params, query, and form data correctly", async () => {
      const request = new Request("http://example.com/posts/123/my-post?page=1&limit=10", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          name: "John Doe",
          email: "john@example.com",
        }),
      });

      const args = createArgs(
        {
          id: "123",
          slug: "my-post",
        },
        request
      );

      const result = await parseInputs(args, paramSchema, querySchema, formSchema);

      expect(result.params).toEqual({
        data: {
          id: "123",
          slug: "my-post",
        },
      });

      expect(result.query).toEqual({
        data: {
          page: 1,
          limit: 10,
        },
      });

      expect(result.form).toEqual({
        data: {
          name: "John Doe",
          email: "john@example.com",
        },
      });
    });

    it("should handle missing schemas", async () => {
      const request = new Request("http://example.com/posts/123/my-post?page=1&limit=10");
      const args = createArgs(
        {
          id: "123",
          slug: "my-post",
        },
        request
      );

      const result = await parseInputs(args);

      expect(result.params).toEqual({ data: null });
      expect(result.query).toEqual({ data: null });
      expect(result.form).toEqual({ data: null });
    });

    it("should handle invalid params", async () => {
      const request = new Request("http://example.com/posts/123/my-post");
      const args = createArgs(
        {
          id: "123",
          // missing slug
        },
        request
      );

      const result = await parseInputs(args, paramSchema);

      expect(result.params).toEqual({
        error: expect.any(Error),
      });
      expect(result.params.error?.message).toContain("slug");
    });

    it("should handle invalid query params", async () => {
      const request = new Request("http://example.com/posts/123/my-post?page=invalid");
      const args = createArgs(
        {
          id: "123",
          slug: "my-post",
        },
        request
      );

      const result = await parseInputs(args, paramSchema, querySchema);

      expect(result.query).toEqual({
        error: expect.any(Error),
      });
      expect(result.query.error?.message).toContain("limit");
    });

    it("should handle invalid form data", async () => {
      const request = new Request("http://example.com/posts/123/my-post", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          name: "John Doe",
          email: "invalid-email",
        }),
      });

      const args = createArgs(
        {
          id: "123",
          slug: "my-post",
        },
        request
      );

      const result = await parseInputs(args, paramSchema, querySchema, formSchema);

      expect(result.form).toEqual({
        error: expect.any(Error),
        fieldErrors: expect.objectContaining({
          email: expect.any(Array),
        }),
      });
      expect(result.form.error?.message).toContain("email");
    });

    it("should handle missing form data when schema is provided", async () => {
      const request = new Request("http://example.com/posts/123/my-post");
      const args = createArgs(
        {
          id: "123",
          slug: "my-post",
        },
        request
      );

      const result = await parseInputs(args, paramSchema, querySchema, formSchema);

      expect(result.form).toEqual({ data: null });
    });

    it("should handle empty params object", async () => {
      const request = new Request("http://example.com/posts");
      const args = createArgs({}, request);

      const result = await parseInputs(args, paramSchema);

      expect(result.params).toEqual({
        error: expect.any(Error),
      });
      expect(result.params.error?.message).toContain("id");
    });

    it("should handle empty query string", async () => {
      const request = new Request("http://example.com/posts/123/my-post");
      const args = createArgs(
        {
          id: "123",
          slug: "my-post",
        },
        request
      );

      const result = await parseInputs(args, paramSchema, querySchema);

      expect(result.query).toEqual({
        error: expect.any(Error),
      });
      expect(result.query.error?.message).toContain("page");
    });

    it("should handle optional fields in schemas", async () => {
      const optionalParamSchema = z.object({
        id: z.string(),
        slug: z.string().optional(),
      });

      const request = new Request("http://example.com/posts/123");
      const args = createArgs(
        {
          id: "123",
        },
        request
      );

      const result = await parseInputs(args, optionalParamSchema);

      expect(result.params).toEqual({
        data: {
          id: "123",
        },
      });
    });

    it("should handle custom transformations in schemas", async () => {
      const customSchema = z.object({
        date: z.string().transform((str) => new Date(str)),
        number: z.string().transform((str) => Number.parseInt(str, 10)),
        boolean: z.string().transform((str) => str === "true"),
      });

      const formData = new URLSearchParams();
      formData.append("date", "2024-03-20");
      formData.append("number", "42");
      formData.append("boolean", "true");

      const request = new Request("http://example.com/posts/123/my-post", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      const args = createArgs(
        {
          id: "123",
          slug: "my-post",
        },
        request
      );

      const result = await parseInputs(args, paramSchema, querySchema, customSchema);

      expect(result.form).toEqual({
        data: {
          date: expect.any(Date),
          number: 42,
          boolean: true,
        },
      });
    });

    it("should handle validation with custom error messages", async () => {
      const customErrorSchema = z.object({
        age: z
          .string()
          .transform((str) => Number.parseInt(str, 10))
          .refine((val): val is number => val >= 18, {
            message: "Must be at least 18 years old",
          }),
      });

      const formData = new URLSearchParams();
      formData.append("age", "16");

      const request = new Request("http://example.com/posts/123/my-post", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      const args = createArgs(
        {
          id: "123",
          slug: "my-post",
        },
        request
      );

      const result = await parseInputs(args, paramSchema, querySchema, customErrorSchema);

      expect(result.form).toEqual({
        error: expect.any(Error),
        fieldErrors: expect.objectContaining({
          age: expect.arrayContaining(["Must be at least 18 years old"]),
        }),
      });
    });
  });
});
