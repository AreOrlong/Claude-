export type ToolCategory =
  | 'cutting'
  | 'measuring'
  | 'holding'
  | 'grinding'
  | 'drilling'
  | 'turning'
  | 'milling'
  | 'other';

export type ToolCondition = 'new' | 'good' | 'fair' | 'worn' | 'damaged' | 'retired';

export type ToolStatus = 'available' | 'in-use' | 'maintenance' | 'checked-out' | 'retired';

export interface Tool {
  id: string;
  name: string;
  partNumber: string;
  serialNumber?: string;
  category: ToolCategory;
  subcategory?: string;
  manufacturer?: string;
  locationId: string;
  status: ToolStatus;
  condition: ToolCondition;
  quantity: number;
  minQuantity: number;
  lastUsed?: string;
  addedDate: string;
  notes?: string;
  specs: Record<string, string>;
  checkoutHistory: CheckoutEntry[];
  maintenanceHistory: MaintenanceEntry[];
}

export interface CheckoutEntry {
  id: string;
  toolId: string;
  checkedOutBy: string;
  checkedOutAt: string;
  returnedAt?: string;
  purpose?: string;
}

export interface MaintenanceEntry {
  id: string;
  toolId: string;
  date: string;
  type: 'inspection' | 'repair' | 'calibration' | 'sharpening' | 'replacement';
  notes: string;
  performedBy: string;
}

export interface StorageLocation {
  id: string;
  name: string;
  description?: string;
  cabinet?: string;
  row?: string;
  capacity: number;
}

export interface ScanLog {
  id: string;
  toolId: string;
  toolName: string;
  action: 'checkout' | 'return' | 'inspect' | 'view';
  timestamp: string;
  performedBy: string;
  notes?: string;
}

export interface CategoryMeta {
  id: ToolCategory;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export type Page = 'tools' | 'scan';
