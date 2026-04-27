# Changelog

All notable changes to this project are documented in this file.

## 2026-04-27

### Added
- Admin controls for program display fields in both views:
  - Table field visibility toggles.
  - Card field visibility toggles.
- Branding controls in admin settings:
  - Portal name and slogan.
  - Logo upload/remove with 2MB validation.
- Forced first-login password update flow for admin-created agents:
  - `mustChangePassword` user flag.
  - Agent redirect to change-password page.
  - Change password API with old/new/confirm validation.
- Direct admin agent creation endpoint and settings form.
- Notification center integration and read-state persistence improvements.

### Changed
- Portal branding updated to:
  - Name: Student On Board
  - Slogan: Plan Today, Study Tomorrow, Succeed Forever
- Programs page hero redesigned for cleaner layout and logo placement.
- PDF output redesigned:
  - Compact card-style layout.
  - Up to 3 programs per page.
  - Better page-space utilization and grouped ordering by university.
- Programs table usability improved with sticky column headers and scroll behavior fixes.

### Fixed
- Data-source consistency between dashboard catalog counts and notification metrics.
- Sticky table header regressions caused by overflow wrappers and stacking contexts.
- Signup and admin-create field validation mismatches.
- Supabase/Prisma connection and build-time issues addressed in previous updates.

## 2026-04-26

### Added
- Admin agent access management:
  - Revoke/restore access.
  - Password reset actions.
- Agent approval workflow enhancements.
- Signup form expanded with professional and location details.

### Changed
- Login/signup UI redesign for a cleaner centered experience.
- Light theme palette adjusted to reduce excessive brightness.

### Fixed
- Production PDF download/navigation issues.
- Build/type issues in settings/auth/import flows.
- Notification unread badge behavior after viewing notifications.
