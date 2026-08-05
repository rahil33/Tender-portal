export type Step = 1 | 2 | 3 | 4;

export interface UploadedFile {
  name: string;
  size: string;
  type: 'pdf' | 'image';
}

export const TENDER_CATEGORIES = [
  'Office Supplies', 'Electronics & IT', 'Safety & PPE', 'Medical & Healthcare',
  'Electrical & Hardware', 'Infrastructure & Civil', 'Vehicles & Transport',
  'Furniture & Fixtures', 'Uniforms & Apparel', 'Other',
];
