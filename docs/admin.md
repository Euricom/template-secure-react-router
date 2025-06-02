# Admin Documentation

## Overview

The admin section provides administrative capabilities for managing users, their sessions, and roles within the application. This section is protected and only accessible to users with appropriate administrative privileges.

## Security Considerations

The admin section implements several security measures:

1. **Authentication & Authorization**

   - Protected by better-auth's admin plugin
   - Requires appropriate role-based access control
   - All actions are logged for audit purposes

2. **Session Management**

   - Ability to view and manage user sessions
   - Session revocation capabilities
   - IP and User Agent tracking

3. **User Management**
   - User banning/unbanning
   - Role management
   - Account deletion with verification
   - Session revocation

## Features

### User Management

#### User List (`/admin/users`)

- View all users in the system
- Search and filter capabilities
- Quick access to user details

#### User Details (`/admin/users/:id`)

- Comprehensive user information
- Session management
- Role management
- Account actions

### Available Actions

1. **Ban User** (`/admin/users/:id/ban`)

   - Temporarily restrict user access
   - Requires reason for banning
   - Automatic notification to user

2. **Unban User** (`/admin/users/:id/unban`)

   - Restore user access
   - Requires reason for unbanning
   - Automatic notification to user

3. **Delete User** (`/admin/users/:id/delete`)

   - Permanent account removal
   - Requires verification
   - Data cleanup process

4. **Session Management**

   - **Revoke All Sessions** (`/admin/users/:id/revoke-all`)
     - Force logout from all devices
     - Requires confirmation
   - **Revoke Specific Session** (`/admin/users/:id/revoke/:sessionId`)
     - Remove specific device access
     - Session details available

5. **Role Management** (`/admin/users/:id/set-role`)
   - Modify user roles
   - Role hierarchy enforcement
   - Audit logging
