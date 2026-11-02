// ฟังก์ชันช่วยเรื่องรถ ใช้ได้ทั้งฝั่งเซิร์ฟเวอร์และเบราว์เซอร์

import type { CarMake, Vehicle, VehicleSelection } from "./types";

export type VehicleCatalog = { makes: CarMake[]; vehicles: Vehicle[] };

export function vehicleQuery(sel: VehicleSelection): string {
  const p = new URLSearchParams({ make: sel.makeId, model: sel.model, year: String(sel.year) });
  if (sel.vehicleId) p.set("engine", sel.vehicleId);
  return p.toString();
}

export function describeVehicle(sel: VehicleSelection, cat: VehicleCatalog): string {
  const make = cat.makes.find((m) => m.id === sel.makeId)?.name ?? sel.makeId;
  const engine = sel.vehicleId
    ? cat.vehicles.find((v) => v.id === sel.vehicleId)?.engine
    : "ไม่ทราบเครื่องยนต์";
  return `${make} ${sel.model} ปี ${sel.year} · ${engine ?? ""}`.trim();
}

export function describeVehicleRecord(v: Vehicle, cat: VehicleCatalog): string {
  const make = cat.makes.find((m) => m.id === v.makeId)?.name ?? v.makeId;
  return `${make} ${v.model}`;
}
