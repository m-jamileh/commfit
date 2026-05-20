export abstract class WarrantyService {
  abstract checkStatus(equipmentId: string): Promise<{
    inWarranty: boolean;
    warrantyEnd?: Date;
    supplierContact?: string;
  }>;
}
