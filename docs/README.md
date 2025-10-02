# Documentation Index

This directory contains all project documentation, guides, and implementation notes.

## 📋 Quick Links

### 🏗️ Architecture & Design
- [ARCHITECTURE_GUIDE.md](./ARCHITECTURE_GUIDE.md) - Overall application architecture
- [DATA_FLOW.md](./DATA_FLOW.md) - Data flow between components and services
- [ROUTE_STRUCTURE_GUIDE.md](./ROUTE_STRUCTURE_GUIDE.md) - Route configuration and guards
- [PROJECT_INFO.md](./PROJECT_INFO.md) - Project overview and structure

### 🔐 Authentication & Security
- [AUTH_GUARD_RACE_CONDITION_FIX.md](./AUTH_GUARD_RACE_CONDITION_FIX.md) - **CRITICAL** Auth guard timing fix
- [FIREBASE_SESSION_MANAGEMENT.md](./FIREBASE_SESSION_MANAGEMENT.md) - Firebase Auth session persistence
- [AUTH_INITIALIZATION_FIX.md](./AUTH_INITIALIZATION_FIX.md) - Auth initialization improvements
- [AUTH_SESSION_FIX.md](./AUTH_SESSION_FIX.md) - Session handling fixes
- [LOGOUT_FIX.md](./LOGOUT_FIX.md) - Logout functionality implementation
- [FIREBASE_AUTH_TESTING.md](./FIREBASE_AUTH_TESTING.md) - Firebase Auth testing guide

### 🔥 Firebase Integration
- [FIREBASE_USAGE_GUIDE.md](./FIREBASE_USAGE_GUIDE.md) - Firebase setup and usage
- [FIRESTORE_COLLECTIONS_DESIGN.md](./FIRESTORE_COLLECTIONS_DESIGN.md) - Firestore data structure
- [FIRESTORE_QUERY_OPTIMIZATION.md](./FIRESTORE_QUERY_OPTIMIZATION.md) - Query optimization techniques
- [COLLECTIONS_STRUCTURE.md](./COLLECTIONS_STRUCTURE.md) - Collection schemas
- [NORMALIZED_STRUCTURE.md](./NORMALIZED_STRUCTURE.md) - Data normalization patterns

### 📅 Booking System
- [NEW_BOOKING_SYSTEM.md](./NEW_BOOKING_SYSTEM.md) - Booking system implementation
- [BOOKING_MODAL_IMPLEMENTATION.md](./BOOKING_MODAL_IMPLEMENTATION.md) - Booking modal details
- [BOOKING_TABLE_LOADING_FIX.md](./BOOKING_TABLE_LOADING_FIX.md) - Loading state improvements
- [VIEW_APPOINTMENTS_REDESIGN.md](./VIEW_APPOINTMENTS_REDESIGN.md) - Appointments view redesign
- [SLOT_SEEDING_GUIDE.md](./SLOT_SEEDING_GUIDE.md) - Time slot seeding script

### 🎨 UI Components & Modals
- [MODAL_CHANGE_DETECTION_FIX.md](./MODAL_CHANGE_DETECTION_FIX.md) - Modal change detection fixes
- [MODAL_TROUBLESHOOTING.md](./MODAL_TROUBLESHOOTING.md) - Modal debugging guide
- [ERROR_MODAL_DOCUMENTATION.md](./ERROR_MODAL_DOCUMENTATION.md) - Error modal implementation
- [SUCCESS_MODAL_DOCUMENTATION.md](./SUCCESS_MODAL_DOCUMENTATION.md) - Success modal implementation
- [SUCCESS_MODAL_FIX.md](./SUCCESS_MODAL_FIX.md) - Success modal fixes
- [SKELETON_LOADERS_GUIDE.md](./SKELETON_LOADERS_GUIDE.md) - Loading skeleton implementation

### 📊 Performance & Metrics
- [METRICS_CHANGE_DETECTION_FIX.md](./METRICS_CHANGE_DETECTION_FIX.md) - Metrics UI update fixes
- [METRICS_FALLBACK_FIX.md](./METRICS_FALLBACK_FIX.md) - Metrics fallback handling
- [PERFORMANCE_OPTIMIZATION_GUIDE.md](./PERFORMANCE_OPTIMIZATION_GUIDE.md) - Performance optimization techniques

### 🚀 Server-Side Rendering (SSR)
- [SSR_IMPLEMENTATION_GUIDE.md](./SSR_IMPLEMENTATION_GUIDE.md) - SSR setup and configuration
- [SSR_TIME_SELECTOR_IMPLEMENTATION.md](./SSR_TIME_SELECTOR_IMPLEMENTATION.md) - SSR time selector component

### 🔄 Migrations & Refactoring
- [CONTROL_FLOW_MIGRATION.md](./CONTROL_FLOW_MIGRATION.md) - Angular control flow migration
- [REFACTORING_SUMMARY.md](./REFACTORING_SUMMARY.md) - Major refactoring changes
- [SUPABASE_REMOVAL_SUMMARY.md](./SUPABASE_REMOVAL_SUMMARY.md) - Supabase to Firebase migration
- [SUPABASE_DATA_STRUCTURE.md](./SUPABASE_DATA_STRUCTURE.md) - Legacy Supabase structure

### 👤 User Management
- [REGISTRATION_IMPLEMENTATION.md](./REGISTRATION_IMPLEMENTATION.md) - User registration flow

## 📚 Reading Order for New Developers

If you're new to this project, read the documentation in this order:

1. **[PROJECT_INFO.md](./PROJECT_INFO.md)** - Start here for project overview
2. **[ARCHITECTURE_GUIDE.md](./ARCHITECTURE_GUIDE.md)** - Understand the architecture
3. **[FIREBASE_USAGE_GUIDE.md](./FIREBASE_USAGE_GUIDE.md)** - Firebase setup and usage
4. **[AUTH_GUARD_RACE_CONDITION_FIX.md](./AUTH_GUARD_RACE_CONDITION_FIX.md)** - Critical auth implementation
5. **[ROUTE_STRUCTURE_GUIDE.md](./ROUTE_STRUCTURE_GUIDE.md)** - Routing and navigation
6. **[NEW_BOOKING_SYSTEM.md](./NEW_BOOKING_SYSTEM.md)** - Core booking functionality
7. **[DATA_FLOW.md](./DATA_FLOW.md)** - How data flows through the app

## 🔍 Quick Reference

### Common Issues & Solutions
- **Auth not persisting?** → [AUTH_GUARD_RACE_CONDITION_FIX.md](./AUTH_GUARD_RACE_CONDITION_FIX.md)
- **Logout not working?** → [LOGOUT_FIX.md](./LOGOUT_FIX.md)
- **Modal not updating?** → [MODAL_CHANGE_DETECTION_FIX.md](./MODAL_CHANGE_DETECTION_FIX.md)
- **Metrics not showing?** → [METRICS_CHANGE_DETECTION_FIX.md](./METRICS_CHANGE_DETECTION_FIX.md)
- **Slow queries?** → [FIRESTORE_QUERY_OPTIMIZATION.md](./FIRESTORE_QUERY_OPTIMIZATION.md)
- **SSR issues?** → [SSR_IMPLEMENTATION_GUIDE.md](./SSR_IMPLEMENTATION_GUIDE.md)

## 📝 Documentation Standards

All documentation in this directory follows these standards:
- Clear problem statement
- Root cause analysis
- Solution with code examples
- Testing instructions
- Related files and dependencies

## 🔄 Keep Documentation Updated

When making significant changes:
1. Update relevant documentation files
2. Add new documentation for new features
3. Keep this index updated with new files
4. Use clear, descriptive filenames
5. Include code examples where helpful

---

**Last Updated**: December 2024  
**Total Documents**: 35
