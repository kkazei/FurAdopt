# Admin System Documentation

## Overview
The FurAdopt admin system provides comprehensive administrative control over the platform. Admins have full access to manage users, pets, shelters, and adoption requests across the entire platform.

## Admin User Creation
A default admin user has been created with the following credentials:
- **Email**: `admin@furadopt.com`
- **Password**: `admin123`

**⚠️ IMPORTANT**: Change the default password after first login for security.

### Creating Additional Admin Users
1. Login as an existing admin
2. Navigate to User Management
3. Find the user you want to promote
4. Change their role to "admin" using the role dropdown

## Admin Features

### 1. Dashboard
- **Statistics Overview**: View total counts of users, shelters, pets, and successful adoptions
- **Quick Actions**: Direct links to all management sections
- **System Health**: Platform usage overview

### 2. User Management (`/admin/users`)
- **View All Users**: Complete list of platform users including regular users, shelters, and admins
- **Search & Filter**: Search by name/email and filter by role
- **Role Management**: Change user roles (user ↔ shelter ↔ admin)
- **User Deletion**: Remove users from the platform
- **Verification Status**: See which users have verified their email addresses

### 3. Pet Management (`/admin/pets`)
- **All Pets Overview**: View pets from all shelters
- **Search & Filter**: Search by name/breed and filter by species and status
- **Pet Details**: Complete pet information including images, descriptions, and shelter
- **Pet Deletion**: Remove pets (also removes associated adoption requests)
- **Status Monitoring**: Track adoption statuses across all pets

### 4. Adoption Management (`/admin/adoptions`)
- **All Adoption Requests**: View adoption requests across all shelters
- **Detailed Information**: See applicant details, pet information, and adoption status
- **Search & Filter**: Find specific requests by applicant, pet, or shelter name
- **Application Review**: See experience, living situation, and other application details

## API Endpoints

### Authentication
All admin endpoints require:
1. Valid authentication token
2. User role must be "admin"

### Dashboard
- `GET /api/admin/dashboard-stats` - Get platform statistics

### User Management
- `GET /api/admin/users` - Get all users
- `DELETE /api/admin/users/:userId` - Delete a user
- `PUT /api/admin/users/:userId/role` - Update user role

### Pet Management
- `GET /api/admin/pets` - Get all pets with shelter information
- `DELETE /api/admin/pets/:petId` - Delete a pet

### Adoption Management
- `GET /api/admin/adoption-requests` - Get all adoption requests with detailed info

## Security Features

### Role-Based Access Control
- Admin routes are protected by middleware that verifies admin role
- Frontend routes automatically redirect non-admins to dashboard
- All admin API endpoints return 403 for non-admin users

### Data Protection
- User passwords and sensitive tokens are excluded from API responses
- Cascade deletion ensures data integrity when removing users/pets
- Admin activities are logged for security monitoring

## Technical Implementation

### Frontend Components
- `AdminDashboard.jsx` - Main admin dashboard with statistics
- `AdminUsers.jsx` - User management interface
- `AdminPets.jsx` - Pet management interface
- `AdminAdoptions.jsx` - Adoption request monitoring
- `adminStore.js` - Zustand store for admin state management

### Backend Structure
- `admin.controller.js` - Admin API logic
- `admin.routes.js` - Admin route definitions with middleware
- Admin middleware for role verification

### Database Changes
- User model updated to support "admin" role
- Cascade deletion rules for data integrity

## Usage Instructions

### First Time Setup
1. Start the application: `npm run dev`
2. Login with admin credentials: `admin@furadopt.com` / `admin123`
3. Navigate to admin dashboard via the navigation menu
4. Change the default password in your profile

### Daily Administration Tasks
1. **Monitor New Registrations**: Check User Management for new users requiring verification
2. **Review Adoption Activity**: Monitor adoption requests and success rates
3. **Content Moderation**: Review pet listings for inappropriate content
4. **User Support**: Handle user role changes and account issues

### Emergency Actions
- **Malicious User**: Delete user account from User Management
- **Inappropriate Content**: Remove pets from Pet Management
- **System Issues**: Use dashboard statistics to identify problems

## Best Practices

1. **Regular Monitoring**: Check the admin dashboard regularly for system health
2. **Role Management**: Be cautious when assigning admin roles
3. **Data Backup**: Ensure regular backups before performing bulk deletions
4. **User Communication**: Inform users before making significant changes to their accounts
5. **Security**: Regularly update admin passwords and monitor access logs

## Troubleshooting

### Access Issues
- Ensure user role is set to "admin" in database
- Clear browser cache and cookies
- Check authentication token validity

### Performance Issues
- Monitor dashboard statistics for unusual patterns
- Check database indices for large datasets
- Consider pagination for large user/pet lists

### Data Inconsistencies
- Use the admin interface to verify user-pet-adoption relationships
- Check for orphaned records after deletions
- Ensure cascade deletions are working properly

## Future Enhancements

Potential future admin features could include:
- Audit logs for all admin actions
- Bulk operations for users and pets
- Advanced analytics and reporting
- Email notifications for critical events
- System configuration management
- Automated backup management