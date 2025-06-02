# Authorization

This project implements a robust authorization system using CASL (Conditional Access Specification Language) for managing permissions and access control.

## Overview

The authorization system is built on several key components:

1. **Role-Based Access Control (RBAC)**

   - User roles (admin, user)
   - Organization roles (owner, admin, member)
   - Granular permissions for different resources

2. **Permission Management**

   - Centralized permission definitions
   - Conditional access rules
   - Resource-specific permissions

3. **Protected Routes**
   - Server-side permission validation
   - Client-side permission checks
   - Type-safe permission handling

> **Note**: For detailed information about protected routes and their implementation, please refer to the [Secure Routes Documentation](./secureroutes.md).

## Permission System

### Core Concepts

The permission system is defined in `app/lib/permissions.server.ts` and uses CASL's ability system:

```ts
const ability = (user?: UserType) => {
  const { can, cannot, build } = new AbilityBuilder(createMongoAbility);

  if (!user) {
    return build();
  }

  // Basic user permissions
  cannot("read", "User");
  can("read", "User", { id: user.id });

  // Organization permissions
  cannot("read", "Organization");
  can("read", "Organization", { id: user.organizationId });
  can("create", "Organization");
  can("accept", "Organization:Members:Invite");

  // Admin permissions
  if (user.role === "admin") {
    can("manage", "Product");
    can("manage", "User");
    can("manage", "Organization");
  }

  return build();
};
```

### Permission Structure

Permissions are defined using three main components:

1. **Action**: The operation being performed

   - `read`: View resources
   - `create`: Create new resources
   - `update`: Modify existing resources
   - `delete`: Remove resources
   - `manage`: Full control over resources

2. **Subject**: The resource being accessed

   - `User`: User accounts
   - `Organization`: Organization resources
   - `Product`: Product resources
   - `Organization:Members`: Organization membership

3. **Conditions**: Optional rules that must be met
   - Resource ownership
   - Organization membership
   - Role requirements

## Client-Side Authorization

The client-side authorization is handled through a React context provider:

```tsx
<PermissionProvider permissions={permissions}>
  <Can I="read" a="Organization">
    {/* Protected content */}
  </Can>
</PermissionProvider>
```

### Usage in Components

```tsx
import { Can } from "~/components/providers/permission.provider";

function MyComponent() {
  return (
    <Can I="read" a="Organization">
      <div>Protected content</div>
    </Can>
  );
}
```

## Common Use Cases

1. **Protecting Routes**

   ```ts
   export const loader = createProtectedLoader({
     permissions: {
       action: "read",
       subject: "Organization",
     },
     function: async ({ identity }) => {
       // Your loader logic
     },
   });
   ```

2. **Checking Permissions in Components**

   ```tsx
   <Can I="manage" a="Organization">
     <AdminPanel />
   </Can>
   ```

3. **Server-Side Permission Checks**
   ```ts
   ensureCanWithIdentity(identity, "create", "Organization");
   ```

## Advanced CASL Usage

CASL allows for complex permission rules using conditions. Here are common scenarios and how to implement them:

### Resource Ownership

```ts
const ability = (user?: UserType) => {
  const { can, cannot, build } = new AbilityBuilder(createMongoAbility);

  // Users can only manage their own posts
  cannot("manage", "Post");
  can("manage", "Post", { authorId: user.id });

  // Users can only edit their own comments
  cannot("update", "Comment");
  can("update", "Comment", { userId: user.id });

  return build();
};
```

### Organization Scoped Resources

```ts
const ability = (user?: UserType) => {
  const { can, cannot, build } = new AbilityBuilder(createMongoAbility);

  // Users can only access documents in their organization
  cannot("read", "Document");
  can("read", "Document", { organizationId: user.organizationId });

  // Organization admins can manage all documents in their org
  if (user.organizationRole === "admin") {
    can("manage", "Document", { organizationId: user.organizationId });
  }

  return build();
};
```

### Time-Based Permissions

```ts
const ability = (user?: UserType) => {
  const { can, cannot, build } = new AbilityBuilder(createMongoAbility);

  // Users can only edit their posts within 24 hours
  can("update", "Post", {
    authorId: user.id,
    createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  });

  return build();
};
```

### Complex Conditions

```ts
const ability = (user?: UserType) => {
  const { can, cannot, build } = new AbilityBuilder(createMongoAbility);

  // Users can only delete their own comments if:
  // 1. The comment is not pinned
  // 2. The comment is not the last one in a thread
  can("delete", "Comment", {
    userId: user.id,
    isPinned: false,
    isLastInThread: false,
  });

  return build();
};
```

### Field-Level Permissions

```ts
const ability = (user?: UserType) => {
  const { can, cannot, build } = new AbilityBuilder(createMongoAbility);

  // Users can update their profile but not their role
  can("update", "User", { id: user.id }, ["name", "email", "avatar"]);
  cannot("update", "User", { id: user.id }, ["role"]);

  return build();
};
```

### Combining Multiple Conditions

```ts
const ability = (user?: UserType) => {
  const { can, cannot, build } = new AbilityBuilder(createMongoAbility);

  // Users can manage projects if they are:
  // 1. The project owner OR
  // 2. A project admin AND the project is not archived
  can("manage", "Project", {
    $or: [
      { ownerId: user.id },
      {
        $and: [{ "members.userId": user.id }, { "members.role": "admin" }, { isArchived: false }],
      },
    ],
  });

  return build();
};
```

### Dynamic Conditions

```ts
const ability = (user?: UserType) => {
  const { can, cannot, build } = new AbilityBuilder(createMongoAbility);

  // Users can access premium content if they have an active subscription
  if (user.hasActiveSubscription) {
    can("read", "PremiumContent");
  }

  // Users can access beta features if they are beta testers
  if (user.isBetaTester) {
    can("access", "BetaFeature");
  }

  return build();
};
```

### Checking Permissions in Code

```ts
// Server-side permission check
ensureCanWithIdentity(identity, "update", "Post", {
  authorId: identity.user.id,
  isPublished: false
});

// Client-side permission check
<Can I="update" a="Post" this={{ authorId: user.id, isPublished: false }}>
  <EditButton />
</Can>
```

### Common Patterns

1. **Resource Ownership**

   ```ts
   can("manage", "Resource", { ownerId: user.id });
   ```

2. **Organization Scoping**

   ```ts
   can("read", "Resource", { organizationId: user.organizationId });
   ```

3. **Role-Based Access**

   ```ts
   if (user.role === "admin") {
     can("manage", "Resource");
   }
   ```

4. **Time-Based Access**

   ```ts
   can("update", "Resource", {
     createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
   });
   ```

5. **Status-Based Access**
   ```ts
   can("delete", "Resource", { status: "draft" });
   ```

### Best Practices

1. **Start with Restrictions**

   ```ts
   cannot("manage", "Resource");
   can("manage", "Resource", {
     /* conditions */
   });
   ```

2. **Use Specific Actions**

   ```ts
   can("read", "Resource");
   can("create", "Resource");
   can("update", "Resource");
   can("delete", "Resource");
   ```

3. **Combine Conditions Carefully**

   ```ts
   can("manage", "Resource", {
     $and: [{ organizationId: user.organizationId }, { status: "active" }],
   });
   ```

4. **Use Field-Level Permissions**

   ```ts
   can("update", "User", { id: user.id }, ["name", "email"]);
   ```

5. **Consider Performance**
   ```ts
   // Use indexes for frequently checked conditions
   can("read", "Resource", { organizationId: user.organizationId });
   ```
