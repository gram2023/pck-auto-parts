"use client";

// เก็บ "รถของฉัน" ในเบราว์เซอร์ (ลูกค้าที่ไม่สมัครสมาชิก)
// เฟสระบบสมาชิกจะซิงก์กับบัญชีผู้ใช้

import { useSyncExternalStore } from "react";
import type { VehicleSelection } from "./types";

const KEY = "pck.vehicle";
const EVENT = "pck-vehicle-change";

function read(): string | null {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function saveVehicle(sel: VehicleSelection | null) {
  try {
    if (sel) window.localStorage.setItem(KEY, JSON.stringify(sel));
    else window.localStorage.removeItem(KEY);
  } catch {
    // เบราว์เซอร์ปิดการเก็บข้อมูล — ยังใช้งานผ่าน URL ได้
  }
  window.dispatchEvent(new Event(EVENT));
}

export function useSelectedVehicle(): VehicleSelection | null {
  const raw = useSyncExternalStore(subscribe, read, () => null);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as VehicleSelection;
  } catch {
    return null;
  }
}
