export type UserRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'SALES'
  | 'CASHIER'
  | 'COORDINATOR'
  | 'EMPLOYEE';

export interface PermissionMatrix {
  canManageTenants: boolean;
  canManageUsers: boolean;
  canManageSettings: boolean;
  canManageCustomers: boolean;
  canManageVenues: boolean;
  canManageCatalog: boolean;
  canManageQuotes: boolean;
  canApplyDiscounts: boolean;
  canConvertQuoteToReservation: boolean;
  canManageReservations: boolean;
  canManageEvents: boolean;
  canManagePayments: boolean;
  canIssueRefunds: boolean;
  canManageContracts: boolean;
  canManageSuppliers: boolean;
  canManageStaff: boolean;
  canManageInventory: boolean;
  canManageExpenses: boolean;
  canViewReports: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, PermissionMatrix> = {
  SUPER_ADMIN: {
    canManageTenants: true,
    canManageUsers: true,
    canManageSettings: true,
    canManageCustomers: true,
    canManageVenues: true,
    canManageCatalog: true,
    canManageQuotes: true,
    canApplyDiscounts: true,
    canConvertQuoteToReservation: true,
    canManageReservations: true,
    canManageEvents: true,
    canManagePayments: true,
    canIssueRefunds: true,
    canManageContracts: true,
    canManageSuppliers: true,
    canManageStaff: true,
    canManageInventory: true,
    canManageExpenses: true,
    canViewReports: true,
  },
  ADMIN: {
    canManageTenants: false,
    canManageUsers: true,
    canManageSettings: true,
    canManageCustomers: true,
    canManageVenues: true,
    canManageCatalog: true,
    canManageQuotes: true,
    canApplyDiscounts: true,
    canConvertQuoteToReservation: true,
    canManageReservations: true,
    canManageEvents: true,
    canManagePayments: true,
    canIssueRefunds: true,
    canManageContracts: true,
    canManageSuppliers: true,
    canManageStaff: true,
    canManageInventory: true,
    canManageExpenses: true,
    canViewReports: true,
  },
  SALES: {
    canManageTenants: false,
    canManageUsers: false,
    canManageSettings: false,
    canManageCustomers: true,
    canManageVenues: false,
    canManageCatalog: false,
    canManageQuotes: true,
    canApplyDiscounts: true,
    canConvertQuoteToReservation: true,
    canManageReservations: true,
    canManageEvents: false,
    canManagePayments: false,
    canIssueRefunds: false,
    canManageContracts: true,
    canManageSuppliers: false,
    canManageStaff: false,
    canManageInventory: false,
    canManageExpenses: false,
    canViewReports: false,
  },
  CASHIER: {
    canManageTenants: false,
    canManageUsers: false,
    canManageSettings: false,
    canManageCustomers: false,
    canManageVenues: false,
    canManageCatalog: false,
    canManageQuotes: false,
    canApplyDiscounts: false,
    canConvertQuoteToReservation: false,
    canManageReservations: false,
    canManageEvents: false,
    canManagePayments: true,
    canIssueRefunds: true,
    canManageContracts: false,
    canManageSuppliers: false,
    canManageStaff: false,
    canManageInventory: false,
    canManageExpenses: true,
    canViewReports: false,
  },
  COORDINATOR: {
    canManageTenants: false,
    canManageUsers: false,
    canManageSettings: false,
    canManageCustomers: false,
    canManageVenues: false,
    canManageCatalog: false,
    canManageQuotes: false,
    canApplyDiscounts: false,
    canConvertQuoteToReservation: false,
    canManageReservations: true,
    canManageEvents: true,
    canManagePayments: false,
    canIssueRefunds: false,
    canManageContracts: false,
    canManageSuppliers: true,
    canManageStaff: true,
    canManageInventory: true,
    canManageExpenses: true,
    canViewReports: false,
  },
  EMPLOYEE: {
    canManageTenants: false,
    canManageUsers: false,
    canManageSettings: false,
    canManageCustomers: false,
    canManageVenues: false,
    canManageCatalog: false,
    canManageQuotes: false,
    canApplyDiscounts: false,
    canConvertQuoteToReservation: false,
    canManageReservations: false,
    canManageEvents: false,
    canManagePayments: false,
    canIssueRefunds: false,
    canManageContracts: false,
    canManageSuppliers: false,
    canManageStaff: false,
    canManageInventory: false,
    canManageExpenses: false,
    canViewReports: false,
  },
};

export function hasPermission(role: string, permission: keyof PermissionMatrix): boolean {
  const typedRole = role as UserRole;
  if (!ROLE_PERMISSIONS[typedRole]) return false;
  return ROLE_PERMISSIONS[typedRole][permission] ?? false;
}
