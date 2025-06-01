import { useLoaderData, Link, useSearchParams } from "react-router";
import { DataTable } from "~/components/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { formatDate } from "~/lib/date";
import { Badge } from "~/components/ui/badge";
import { Header } from "~/components/header";
import prisma from "~/lib/prismaClient";
import { Prisma } from "@prisma/client";
import { Can } from "~/components/providers/permission.provider";
import { Button } from "~/components/ui/button";
import { createProtectedLoader } from "~/lib/secureRoute";
import { z } from "zod";

export const loader = createProtectedLoader({
  queryValidation: z.object({
    page: z.number().min(1).default(1),
    limit: z.number().min(1).default(10),
    search: z.string().optional(),
    sortBy: z.string().optional().default("createdAt"),
    sortDirection: z.enum(["asc", "desc"]).optional(),
  }),
  function: async ({ query }) => {
    if (query.error) {
      throw new Response(query.error.message, { status: 400 });
    }
    const { page, limit, search, sortBy, sortDirection } = query.data;

    // Build the where clause for searching
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { role: { contains: search, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : {};

    // Get total count for pagination
    const total = await prisma.user.count({ where });

    // Get paginated and sorted users
    const users = await prisma.user.findMany({
      where,
      orderBy: {
        [sortBy]: sortDirection,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      users: users.map((user) => ({
        ...user,
        role: user.role ? user.role.split(",").map((role) => role.trim()) : null,
      })),
      total,
      page,
      limit,
      sortBy,
      sortDirection,
    };
  },
});

export default function UsersPage() {
  const { users, total, page, limit, sortBy, sortDirection } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

  const columns: ColumnDef<(typeof users)[0]>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <Link to={user.id} className="hover:underline">
            {user.name}
          </Link>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "role",
      header: "Roles",
      cell: ({ row }) => {
        const roles = row.original.role;
        return roles ? (
          <div className="flex flex-wrap gap-1">
            {roles.map((role, index) => (
              <Badge key={index} variant={role === "admin" ? "default" : "secondary"}>
                {role}
              </Badge>
            ))}
          </div>
        ) : (
          <Badge variant="outline">No roles</Badge>
        );
      },
    },
    {
      accessorKey: "banned",
      header: "Status",
      cell: ({ row }) => {
        const user = row.original;
        if (user.banned) {
          return <Badge variant="destructive">Banned</Badge>;
        }
        return <Badge variant="default">Active</Badge>;
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
  ];

  const handleSearch = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("search", value);
    params.set("page", "1"); // Reset to first page on search
    setSearchParams(params);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    setSearchParams(params);
  };

  const handleLimitChange = (newLimit: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("limit", newLimit.toString());
    params.set("page", "1"); // Reset to first page on limit change
    setSearchParams(params);
  };

  const handleSortChange = (field: string, order: "asc" | "desc") => {
    const params = new URLSearchParams(searchParams);
    params.set("sortBy", field);
    params.set("sortDirection", order);
    params.set("page", "1"); // Reset to first page on sort change
    setSearchParams(params);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Header title="Users">
        <Can I="create" a="User">
          <Link to="create">
            <Button>Create User</Button>
          </Link>
        </Can>
      </Header>
      <DataTable
        columns={columns}
        data={users}
        searchColumn="any value"
        page={page}
        total={total}
        limit={limit}
        sortField={sortBy}
        sortOrder={sortDirection}
        onSearch={handleSearch}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        onSortChange={handleSortChange}
      />
    </div>
  );
}
