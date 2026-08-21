"use client";

import React, { useState, useEffect } from "react";
import { MarketplaceHeader } from "@/components/layout/marketplace-header";
import { Footer } from "@/components/layout/footer";
import { AccountSidebar } from "@/components/account/account-sidebar";
import { AddressCard } from "@/components/account/address-card";
import { getSavedAddresses, saveAddress, deleteAddress, setDefaultAddress } from "@/lib/checkout/address-utils";
import { Address } from "@/lib/orders/order-types";
import { useLanguage } from "@/lib/i18n/language-context";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { MapPin, Plus, AlertTriangle } from "lucide-react";

export default function AddressManagerPage() {
  const { language, t } = useLanguage();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Partial<Address>>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    setAddresses(getSavedAddresses());
  }, []);

  const handleOpenAdd = () => {
    setEditingAddress({
      id: `addr-${Date.now()}`,
      title: "Yeni Adres",
      firstName: "Ahmet",
      lastName: "Yılmaz",
      phone: "0532 123 4567",
      email: "ahmet.yilmaz@example.com",
      city: "İstanbul",
      district: "Kadıköy",
      addressLine: "",
      country: "Türkiye",
      isDefault: addresses.length === 0,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (addr: Address) => {
    setEditingAddress(addr);
    setIsModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAddress.addressLine || !editingAddress.city) return;
    const updated = saveAddress(editingAddress as Address);
    setAddresses(updated);
    setIsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmId) {
      const updated = deleteAddress(deleteConfirmId);
      setAddresses(updated);
      setDeleteConfirmId(null);
    }
  };

  const handleSetDefault = (id: string) => {
    const updated = setDefaultAddress(id);
    setAddresses(updated);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-text-main">
      <MarketplaceHeader />

      <main className="max-w-wide mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6 flex-1">
        <Breadcrumb
          items={[
            { label: language === "en" ? "My Account" : "Hesabım", href: "/account" },
            { label: language === "en" ? "My Addresses" : "Adreslerim" },
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-3 sticky top-24">
            <AccountSidebar />
          </div>

          <div className="lg:col-span-9 flex flex-col gap-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-xl font-black text-text-main flex items-center gap-2">
                    <span>{language === "en" ? "My Addresses" : "Adreslerim"}</span>
                    <span className="text-xs bg-emerald-600 text-white font-extrabold px-2 py-0.5 rounded-full">
                      {addresses.length} Adres
                    </span>
                  </h1>
                  <span className="text-xs text-text-muted">
                    Teslimat ve fatura adreslerinizi kolayca güncelleyin.
                  </span>
                </div>
              </div>

              <Button variant="primary" size="sm" onClick={handleOpenAdd} className="font-bold text-xs bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4 mr-1" />
                <span>Yeni Adres Ekle</span>
              </Button>
            </div>

            {/* Address Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <AddressCard
                  key={addr.id}
                  address={addr}
                  onEdit={handleOpenEdit}
                  onDelete={setDeleteConfirmId}
                  onSetDefault={handleSetDefault}
                />
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Add / Edit Address Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Teslimat Adresi Ekle / Düzenle">
        <form onSubmit={handleSaveModal} className="flex flex-col gap-3 text-xs p-1">
          <div className="flex flex-col gap-1">
            <label className="font-bold">Adres Başlığı (örn: Ev, İş):</label>
            <input
              type="text"
              value={editingAddress.title || ""}
              onChange={(e) => setEditingAddress({ ...editingAddress, title: e.target.value })}
              className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-primary font-bold"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-bold">Ad:</label>
              <input
                type="text"
                value={editingAddress.firstName || ""}
                onChange={(e) => setEditingAddress({ ...editingAddress, firstName: e.target.value })}
                className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-primary"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-bold">Soyad:</label>
              <input
                type="text"
                value={editingAddress.lastName || ""}
                onChange={(e) => setEditingAddress({ ...editingAddress, lastName: e.target.value })}
                className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-primary"
                required
              />
            </div>
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
            <label className="font-bold">Açık Adres:</label>
            <textarea
              value={editingAddress.addressLine || ""}
              onChange={(e) => setEditingAddress({ ...editingAddress, addressLine: e.target.value })}
              className="p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-primary min-h-[70px]"
              required
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isDefaultCheck"
              checked={editingAddress.isDefault || false}
              onChange={(e) => setEditingAddress({ ...editingAddress, isDefault: e.target.checked })}
              className="w-4 h-4 text-primary rounded"
            />
            <label htmlFor="isDefaultCheck" className="font-bold cursor-pointer">
              Varsayılan Adresim Olsun
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              İptal
            </Button>
            <Button variant="primary" size="sm" type="submit" className="font-bold bg-emerald-600 hover:bg-emerald-700">
              Adresi Kaydet
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} title="Adres Silme Onayı">
        <div className="flex flex-col gap-4 text-xs p-1">
          <div className="flex items-center gap-3 text-rose-600 bg-rose-50 p-3 rounded-lg border border-rose-100 font-medium">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>Bu adresi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.</span>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setDeleteConfirmId(null)}>
              Vazgeç
            </Button>
            <Button variant="primary" size="sm" onClick={handleConfirmDelete} className="bg-rose-600 hover:bg-rose-700 font-bold">
              Evet, Sil
            </Button>
          </div>
        </div>
      </Modal>

      <Footer />
    </div>
  );
}
