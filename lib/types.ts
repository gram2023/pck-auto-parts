// โครงสร้างข้อมูลหลักของร้าน — ออกแบบให้ตรงกับแผนเฟส 1 ข้อ 7
// เฟสนี้ใช้ข้อมูลจำลองใน lib/catalog-data.ts และจะย้ายไป PostgreSQL ในเฟสถัดไป

/** ยี่ห้อรถ (แยกจากแบรนด์ผู้ผลิตอะไหล่) */
export type CarMake = { id: string; name: string; nameTh: string };

export type BodyType = "sedan" | "hatchback" | "pickup" | "suv" | "ppv" | "mpv";

/** รถหนึ่งแบบ = ยี่ห้อ + รุ่น + ช่วงปี + เครื่องยนต์ */
export type Vehicle = {
  id: string;
  makeId: string;
  model: string;
  /** ชื่อรุ่นภาษาไทย (ถ้ามี) แสดงในวงเล็บ เช่น Sonic (โซนิค) */
  modelTh?: string;
  bodyType: BodyType;
  yearFrom: number;
  yearTo: number;
  engine: string; // เช่น "2.4 ดีเซล"
};

/** แบรนด์ผู้ผลิตอะไหล่ */
export type PartBrand = { id: string; name: string; country?: string };

export type Category = {
  slug: string;
  name: string;
  description: string;
  icon: CategoryIcon;
};

export type CategoryIcon =
  | "engine"
  | "brake"
  | "suspension"
  | "transmission"
  | "electrical"
  | "cooling"
  | "filter"
  | "body";

export type ProductType = "genuine" | "aftermarket" | "used";
export type StockStatus = "in_stock" | "preorder" | "out_of_stock";
export type SaleUnit = "piece" | "pair" | "set" | "liter";
export type Position = "front" | "rear" | "left" | "right" | "upper" | "lower";

export type SourceType =
  | "manufacturer_catalog" // แคตตาล็อกผู้ผลิตอะไหล่
  | "oem_reference" // ข้อมูลอ้างอิงศูนย์/อะไหล่แท้
  | "store_verified" // ร้านตรวจสอบหรือติดตั้งจริง
  | "demo"; // ข้อมูลตัวอย่าง ไม่ใช่ข้อมูลอ้างอิงจริง

export type Source = { type: SourceType; ref: string };

export type OemNumber = { number: string; makeId: string; source: Source };

export type FitmentResult = "fits" | "conditional" | "not_fit";

export type Fitment = {
  vehicleId: string;
  /** จำกัดช่วงปีให้แคบกว่ารถ (ถ้ามี) */
  yearFrom?: number;
  yearTo?: number;
  position?: Position[];
  conditions?: string;
  result: FitmentResult;
  source: Source;
  /** แสดงบนหน้าเว็บเฉพาะ verified */
  status: "draft" | "pending_review" | "verified";
};

export type Product = {
  slug: string;
  sku: string;
  partNumber: string;
  name: string;
  categorySlug: string;
  subcategory?: string;
  partBrandId: string;
  type: ProductType;
  price: number; // บาท ต่อ 1 หน่วยขาย
  unit: SaleUnit;
  /** จำนวนชิ้นใน 1 หน่วยขาย เช่น ชุดละ 4 ชิ้น */
  piecesPerUnit?: number;
  stock: StockStatus;
  preorderDays?: number;
  position?: Position[];
  specs: { label: string; value: string }[];
  description: string;
  warranty?: string;
  oemNumbers: OemNumber[];
  fitments: Fitment[];
  featured?: boolean;
};

/** รถที่ลูกค้าเลือก (vehicleId = null เมื่อไม่ทราบเครื่องยนต์) */
export type VehicleSelection = {
  makeId: string;
  model: string;
  year: number;
  vehicleId: string | null;
};

/** ผลตรวจความเข้ากันได้ที่แสดงกับลูกค้า */
export type FitmentCheck =
  | { kind: "fits"; fitment: Fitment }
  | { kind: "conditional"; fitment: Fitment }
  | { kind: "not_fit"; fitment: Fitment }
  | { kind: "unknown" };
