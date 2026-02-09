# FurAdopt Authentication Changes

## Overview
This document outlines the changes made to implement a single shelter account system while removing the ability for shelters to register themselves.

## Changes Made

### Backend Changes

1. **Created Shelter Creation Script** (`createShelter.js`)
   - Similar to `createAdmin.js` but creates a single shelter account
   - Creates account with email: `shelter@furadopt.com`
   - Default password: `shelter123` (change in production)
   - Account is pre-verified

2. **Updated Auth Controller** (`auth.controller.js`)
   - Simplified signup to only accept user registrations
   - Removed role parameter handling
   - Updated comments for clarity

3. **Updated Admin Controller** (`admin.controller.js`)
   - Removed `createShelter` function
   - Updated `updateUserRole` to prevent changing shelter roles
   - Updated `deleteUser` to prevent deletion of shelter accounts
   - Removed unused imports

4. **Updated Admin Routes** (`admin.routes.js`)
   - Removed shelter creation endpoint `/admin/shelters`
   - Updated imports

### Frontend Changes

1. **Updated Auth Store** (`authStore.js`)
   - Simplified `signup` method to only handle user registration
   - Removed shelter-specific parameters

2. **Updated Signup Component** (`Signup.jsx`)
   - Removed role parameter from signup call

3. **Updated Admin Users Component** (`AdminUsers.jsx`)
   - Removed all shelter creation functionality
   - Removed create shelter button and modal
   - Disabled role changes for shelter accounts
   - Prevented deletion of shelter accounts
   - Added protection UI for shelter account

4. **Updated Admin Store** (`adminStore.js`)
   - Removed `createShelter` function

5. **Updated CSS** (`AdminUsers.css`)
   - Added styling for disabled/protected elements

## How to Set Up

1. **Create Admin Account** (if not already created):
   ```bash
   cd backend
   node createAdmin.js
   ```

2. **Create Shelter Account**:
   ```bash
   cd backend
   node createShelter.js
   ```

## Account Credentials

### Admin Account
- Email: `admin@furadopt.com`
- Password: `admin123`

### Shelter Account
- Email: `shelter@furadopt.com`
- Password: `shelter123`
- Shelter Name: "FurAdopt Shelter"

**⚠️ Important:** Change default passwords in production!

## Current User Roles

- **User**: Regular users can register themselves and adopt pets
- **Shelter**: Single pre-created shelter account that manages pets
- **Admin**: Can manage all users (except shelter deletion) and view system statistics

## What Changed

### Before
- Shelters could register themselves through admin panel
- Multiple shelter accounts were possible
- Admin could create unlimited shelter accounts

### After
- Only one shelter account exists (pre-created)
- Users can only register as regular users
- Admin cannot delete or change the role of the shelter account
- Shelter registration is completely removed from the system