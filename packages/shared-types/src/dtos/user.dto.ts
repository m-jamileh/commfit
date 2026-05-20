export type UserRole =
  | 'admin'
  | 'dispatcher'
  | 'account_manager'
  | 'finance'
  | 'sales'
  | 'technician'
  | 'customer_org_user';

export class CreateUserDto {
  email!: string;
  name!: string;
  phone?: string;
  role!: UserRole;
  metadata?: Record<string, unknown>;
}

export class UpdateUserDto {
  name?: string;
  phone?: string;
  role?: UserRole;
  status?: 'active' | 'archived';
  metadata?: Record<string, unknown>;
}

export class UserResponseDto {
  id!: string;
  email!: string;
  name!: string;
  phone?: string;
  role!: UserRole;
  status!: 'active' | 'archived';
  metadata!: Record<string, unknown>;
  createdAt!: Date;
  updatedAt!: Date;
}
