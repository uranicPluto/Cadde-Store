import { Address } from "../orders/order-types";

const ADDRESSES_STORAGE_KEY = "cadde-store-addresses";

export const DEFAULT_MOCK_ADDRESSES: Address[] = [
  {
    id: "addr-1",
    title: "Ev Adresi",
    firstName: "Ahmet",
    lastName: "Yılmaz",
    phone: "0532 123 4567",
    email: "ahmet.yilmaz@example.com",
    city: "İstanbul",
    district: "Kadıköy",
    addressLine: "Bağdat Caddesi No: 142 Daire: 8",
    buildingNo: "142",
    apartmentNo: "8",
    postalCode: "34728",
    country: "Türkiye",
    isDefault: true,
  },
  {
    id: "addr-2",
    title: "İş Adresi",
    firstName: "Ahmet",
    lastName: "Yılmaz",
    phone: "0532 123 4567",
    email: "ahmet.yilmaz@company.com",
    city: "İstanbul",
    district: "Maslak",
    addressLine: "Büyükdere Caddesi Plaza No: 205 Kat: 12",
    buildingNo: "205",
    apartmentNo: "12",
    postalCode: "34398",
    country: "Türkiye",
    isDefault: false,
  },
];

export function getSavedAddresses(): Address[] {
  if (typeof window === "undefined") return DEFAULT_MOCK_ADDRESSES;
  try {
    const saved = localStorage.getItem(ADDRESSES_STORAGE_KEY);
    if (!saved) {
      localStorage.setItem(ADDRESSES_STORAGE_KEY, JSON.stringify(DEFAULT_MOCK_ADDRESSES));
      return DEFAULT_MOCK_ADDRESSES;
    }
    return JSON.parse(saved);
  } catch (e) {
    console.error("Failed to load addresses from localStorage", e);
    return DEFAULT_MOCK_ADDRESSES;
  }
}

export function saveAddress(address: Address): Address[] {
  const current = getSavedAddresses();
  const index = current.findIndex((a) => a.id === address.id);
  let updated: Address[];

  if (index > -1) {
    updated = current.map((a) => (a.id === address.id ? address : a));
  } else {
    updated = [...current, address];
  }

  if (address.isDefault) {
    updated = updated.map((a) => ({ ...a, isDefault: a.id === address.id }));
  }

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(ADDRESSES_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save address to localStorage", e);
    }
  }
  return updated;
}
