import React, { useState } from "react";
import { Address } from "@/lib/orders/order-types";
import { MapPin, Plus, Check, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useLanguage } from "@/lib/i18n/language-context";

export interface AddressSelectorProps {
  addresses: Address[];
  selectedAddressId: string;
  onSelectAddress: (id: string) => void;
  onSaveAddress: (address: Address) => void;
}

export const AddressSelector: React.FC<AddressSelectorProps> = ({
  addresses,
  selectedAddressId,
  onSelectAddress,
  onSaveAddress,
}) => {
  const { language } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Partial<Address>>({});

  const handleOpenAddModal = () => {
    setEditingAddress({
      id: `addr-${Date.now()}`,
      title: "Yeni Adres",
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      city: "İstanbul",
      district: "Kadıköy",
      addressLine: "",
      country: "Türkiye",
      isDefault: false,
    });
    setIsModalOpen(true);
  };

  const handleModalSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAddress.addressLine || !editingAddress.city) return;
    onSaveAddress(editingAddress as Address);
    onSelectAddress(editingAddress.id as string);
    setIsModalOpen(false);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h2 className="text-sm font-extrabold text-text-main flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          <span>{language === "en" ? "Delivery Address" : "Teslimat Adresi"}</span>
        </h2>

        <Button
          variant="outline"
          size="sm"
          onClick={handleOpenAddModal}
          className="text-xs font-bold py-1 px-3"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          <span>{language === "en" ? "Add New Address" : "Yeni Adres Ekle"}</span>
        </Button>
      </div>

      {/* Address Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {addresses.map((addr) => {
          const isSelected = selectedAddressId === addr.id;

          return (
            <div
              key={addr.id}
              onClick={() => onSelectAddress(addr.id)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between gap-2 relative ${
                isSelected
                  ? "bg-primary-light/30 border-primary shadow-xs"
                  : "bg-slate-50 border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-text-main flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  {addr.title}
                </span>

                {isSelected && (
                  <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-0.5 text-xs text-text-muted">
                <span className="font-bold text-text-main">{addr.firstName} {addr.lastName} ({addr.phone})</span>
                <span className="line-clamp-2">{addr.addressLine}</span>
                <span className="font-semibold text-text-subtle">{addr.district} / {addr.city} - {addr.country}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Address Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Teslimat Adresi Ekle / Düzenle">
        <form onSubmit={handleModalSave} className="flex flex-col gap-3 text-xs p-1">
          <div className="flex flex-col gap-1">
            <label className="font-bold">Adres Başlığı (örn: Ev, İş):</label>
            <input
              type="text"
              value={editingAddress.title || ""}
              onChange={(e) => setEditingAddress({ ...editingAddress, title: e.target.value })}
              className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-primary"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-bold">İl / City:</label>
              <input
                type="text"
                value={editingAddress.city || ""}
                onChange={(e) => setEditingAddress({ ...editingAddress, city: e.target.value })}
                className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-primary"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-bold">İlçe / District:</label>
              <input
                type="text"
                value={editingAddress.district || ""}
                onChange={(e) => setEditingAddress({ ...editingAddress, district: e.target.value })}
                className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-primary"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold">Açık Adres / Address Line:</label>
            <textarea
              value={editingAddress.addressLine || ""}
              onChange={(e) => setEditingAddress({ ...editingAddress, addressLine: e.target.value })}
              className="p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-primary min-h-[80px]"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              İptal
            </Button>
            <Button variant="primary" size="sm" type="submit" className="font-bold">
              Kaydet
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
