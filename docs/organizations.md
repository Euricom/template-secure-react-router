# Organization Documentation

## Overview

The organization system provides multi-tenant capabilities, allowing users to collaborate within organizational contexts. Each organization can have multiple members with different roles and permissions.

## Security Considerations

1. **Organization Access**

   - Organization-specific data isolation
   - Role-based access control within organizations
   - Invitation-based membership system

2. **Member Management**

   - Secure invitation process
   - Email verification for new members
   - Role-based permissions

3. **Data Isolation**
   - Organization-specific data boundaries
   - Cross-organization data protection
   - Secure data sharing mechanisms

## Features

### Organization Management

#### Organization Creation

- Create new organizations
- Set organization details
- Configure organization settings

#### Member Management

- Invite new members
- Manage member roles
- Remove members
- View member list

### Member Roles

At this moment we support three roles:

- `admin`
- `member`
- `owner`

The `owner` role is the owner of the organization. The `admin` role is an admin of the organization. The `member` role is a member of the organization.

## Authorization Integration

The organization system integrates with the authorization system to provide comprehensive access control. For detailed information about the authorization system, see the [Authorization Documentation](./authorization.md).

### Organization Context in Protected Routes

The organization context is automatically included in the identity provided by protected routes. This means that when you access a protected route, you'll have access to:

```typescript
interface ProtectedRouteContext {
  user: {
    id: string;
    // ... other user properties
  };
  organization: {
    id: string;
    role: "owner" | "admin" | "member";
    // ... other organization properties
  };
}
```

### Using Organization Context with Secure Routes

The secure routes system (`app/lib/secureRoute.ts`) provides type-safe access to organization context in both loaders and actions:

```typescript
import { createProtectedLoader, createProtectedAction } from "~/lib/secureRoute";
import { z } from "zod";

// Protected loader with organization context
export const loader = createProtectedLoader({
  permissions: {
    action: "read",
    subject: "Organization",
  },
  function: async ({ identity }) => {
    // identity.organization is fully typed
    return {
      organization: identity.organization,
      role: identity.organization.role,
    };
  },
});

// Protected action with organization context
export const action = createProtectedAction({
  permissions: {
    action: "update",
    subject: "Organization",
  },
  formValidation: z.object({
    name: z.string().min(2),
  }),
  function: async ({ identity, form }) => {
    if (form.error) {
      return { error: form.error.message };
    }

    // Only owners can update organization name
    if (identity.organization.role !== "owner") {
      throw new Response("Only organization owners can update the name", {
        status: 403,
      });
    }

    await updateOrganization(identity.organization.id, form.data.name);
    return { success: true };
  },
});
```

### Best Practices

1. **Authorization Checks**

   - Use the secure routes system for all organization-related routes
   - Leverage the built-in permission system
   - Check organization roles when needed

2. **Error Handling**

   - Use appropriate HTTP status codes
   - Provide clear error messages
   - Handle organization-specific errors

3. **Type Safety**
   - Use the provided type-safe context
   - Validate all parameters and form data
   - Leverage TypeScript for compile-time checks

For more detailed information about the secure routes system, refer to the [Secure Routes Documentation](./secureroutes.md).
