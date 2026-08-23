"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";
import { AlertCircle, CheckCircle2, Image as ImageIcon, Plus, Trash2, ShieldAlert } from "lucide-react";

export interface ReturnItemOption {
  id: string;
  name: string;
  brand?: string;
  imageUrl?: string;
  price: number;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

export interface ReturnRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderNumber: string;
  items: ReturnItemOption[];
  preSelectedItemId?: string;
  onSuccess?: (createdReturn: any) => void;
}

const RETURN_REASONS = [
  { id: "defective", labelTR: "Kusurlu / Hasarlı Ürün", labelEN: "Defective / Damaged Item" },
  { id: "wrong_item", labelTR: "Yanlış Ürün Gönderildi", labelEN: "Wrong Item Sent" },
  { id: "size_issue", labelTR: "Beden / Numara Uymadı", labelEN: "Size / Fit Issue" },
  { id: "changed_mind", labelTR: "Beklentimi Karşılamadı / Vazgeçtim", labelEN: "Changed Mind / Expectation Not Met" },
  { id: "not_as_described", labelTR: "Ürün Açıklamayla Uyuşmuyor", labelEN: "Not as Described" },
];

export function ReturnRequestModal({
  isOpen,
  onClose,
  orderId,
  orderNumber,
  items,
  preSelectedItemId,
  onSuccess,
}: ReturnRequestModalProps) {
  const { language, currency } = useLanguage();

  const [selectedItemId, setSelectedItemId] = useState<string>(
    preSelectedItemId || (items.length > 0 ? items[0].id : "")
  );
  const [selectedReason, setSelectedReason] = useState<string>(RETURN_REASONS[0].labelTR);
  const [customReasonNote, setCustomReasonNote] = useState<string>("");
  const [evidenceImages, setEvidenceImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // Sync selected item if preSelectedItemId changes
  React.useEffect(() => {
    if (preSelectedItemId) {
      setSelectedItemId(preSelectedItemId);
    } else if (items.length > 0 && !selectedItemId) {
      setSelectedItemId(items[0].id);
    }
  }, [preSelectedItemId, items]);

  const activeItem = items.find((i) => i.id === selectedItemId) || items[0];
  const refundAmount = activeItem ? activeItem.price * activeItem.quantity : 0;

  const handleAddImage = () => {
    if (!newImageUrl || !newImageUrl.trim()) return;
    const trimmed = newImageUrl.trim();
    if (!evidenceImages.includes(trimmed)) {
      setEvidenceImages([...evidenceImages, trimmed]);
    }
    setNewImageUrl("");
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setEvidenceImages(evidenceImages.filter((_, idx) => idx !== indexToRemove));
  };

  const handleAddSampleImage = () => {
    const sample = `https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80`;
    if (!evidenceImages.includes(sample)) {
      setEvidenceImages([...evidenceImages, sample]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!activeItem) {
      setError(language === "en" ? "Please select an item to return." : "Lütfen iade edilecek ürünü seçiniz.");
      return;
    }

    if (!selectedReason) {
      setError(language === "en" ? "Please select a return reason." : "Lütfen bir iade gerekçesi seçiniz.");
      return;
    }

    const fullReason = customReasonNote
      ? `${selectedReason} - ${customReasonNote.trim()}`
      : selectedReason;

    try {
      setLoading(true);
      const res = await fetch("/api/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          orderItemId: activeItem.id,
          reason: fullReason,
          evidenceImages,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || (language === "en" ? "Failed to create return request." : "İade talebi oluşturulamadı."));
      }

      setSuccess(true);
      if (onSuccess) {
        onSuccess(data.returnRequest);
      }
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || (language === "en" ? "An error occurred." : "Bir hata oluştu."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={language === "en" ? `Return Request: #${orderNumber}` : `İade Talebi Oluştur: #${orderNumber}`}
      size="lg"
    >
      {success ? (
        <div className="py-8 flex flex-col items-center justify-center text-center gap-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 animate-in zoom-in" />
          <h4 className="text-base font-extrabold text-slate-900">
            {language === "en" ? "Return Request Submitted!" : "İade Talebiniz Alındı!"}
          </h4>
          <p className="text-xs text-slate-600 max-w-sm">
            {language === "en"
              ? "Your return request has been recorded. The seller will review your request shortly."
              : "İade talebiniz satıcıya iletildi. Talebinizin durumunu sipariş detay sayfanızdan takip edebilirsiniz."}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Item Selector */}
          <div className="flex flex-col gap-2">
            <label className="font-bold text-slate-700">
              {language === "en" ? "Select Item to Return" : "İade Edilecek Ürünü Seçin"}
            </label>
            {items.length > 1 ? (
              <select
                value={selectedItemId}
                onChange={(e) => setSelectedItemId(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-xs font-medium focus:ring-2 focus:ring-primary focus:border-transparent outline-hidden"
              >
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.brand ? `${item.brand} - ` : ""}{item.name} ({item.quantity} Adet - {formatCurrency(item.price * item.quantity, currency)})
                  </option>
                ))}
              </select>
            ) : null}

            {activeItem && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                {activeItem.imageUrl && (
                  <img
                    src={activeItem.imageUrl}
                    alt={activeItem.name}
                    className="w-14 h-16 object-cover rounded-md border border-slate-200 shrink-0"
                  />
                )}
                <div className="flex flex-col flex-1 min-w-0">
                  {activeItem.brand && (
                    <span className="font-bold text-[10px] text-primary uppercase">{activeItem.brand}</span>
                  )}
                  <span className="font-bold text-slate-900 truncate">{activeItem.name}</span>
                  <div className="flex items-center gap-2 text-slate-500 text-[11px] mt-0.5">
                    {activeItem.selectedColor && <span>Renk: {activeItem.selectedColor}</span>}
                    {activeItem.selectedSize && <span>Beden: {activeItem.selectedSize}</span>}
                    <span>Adet: {activeItem.quantity}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-500 block text-[10px]">İade Tutarı</span>
                  <span className="font-black text-slate-900 text-sm">{formatCurrency(refundAmount, currency)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Reason Selector */}
          <div className="flex flex-col gap-2">
            <label className="font-bold text-slate-700">
              {language === "en" ? "Return Reason" : "İade Gerekçesi"} *
            </label>
            <select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-xs font-medium focus:ring-2 focus:ring-primary focus:border-transparent outline-hidden"
            >
              {RETURN_REASONS.map((r) => (
                <option key={r.id} value={language === "en" ? r.labelEN : r.labelTR}>
                  {language === "en" ? r.labelEN : r.labelTR}
                </option>
              ))}
            </select>
          </div>

          {/* Additional Notes */}
          <div className="flex flex-col gap-2">
            <label className="font-bold text-slate-700">
              {language === "en" ? "Additional Explanation (Optional)" : "Detaylı Açıklama (İsteğe Bağlı)"}
            </label>
            <textarea
              rows={2}
              value={customReasonNote}
              onChange={(e) => setCustomReasonNote(e.target.value)}
              placeholder={
                language === "en"
                  ? "Describe the issue or condition of the product..."
                  : "Üründeki problemi veya iade nedeninizi kısaca açıklayınız..."
              }
              className="w-full border border-slate-300 rounded-lg p-2.5 bg-white text-xs font-normal focus:ring-2 focus:ring-primary focus:border-transparent outline-hidden resize-none"
            />
          </div>

          {/* Evidence Photos */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-primary" />
                <span>{language === "en" ? "Photo Evidence (URLs)" : "Fotoğraf Kanıtı (Görsel URL)"}</span>
              </label>
              <button
                type="button"
                onClick={handleAddSampleImage}
                className="text-[11px] text-primary hover:underline font-semibold"
              >
                + {language === "en" ? "Add Sample Photo" : "Örnek Fotoğraf Ekle"}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="https://example.com/hasar-fotografi.jpg"
                className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-primary focus:border-transparent outline-hidden"
              />
              <Button type="button" variant="outline" size="sm" onClick={handleAddImage} className="font-bold shrink-0">
                <Plus className="w-3.5 h-3.5 mr-1" />
                {language === "en" ? "Add" : "Ekle"}
              </Button>
            </div>

            {evidenceImages.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-2">
                {evidenceImages.map((url, idx) => (
                  <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-200 bg-slate-100 aspect-square">
                    <img src={url} alt={`Evidence ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 bg-rose-600 text-white p-1 rounded-full opacity-80 group-hover:opacity-100 hover:bg-rose-700 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Refund Notice */}
          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-900 flex items-start gap-2 text-[11px] leading-relaxed">
            <ShieldAlert className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">14 Günlük Koşulsuz İade Güvencesi</span>
              <span>
                Talebiniz onaylandıktan sonra anlaşmalı kargo kodu ile ürünü satıcıya ücretsiz gönderebilirsiniz. Kargo ulaştıktan sonra {formatCurrency(refundAmount, currency)} ödemeniz kartınıza iade edilecektir.
              </span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 mt-1">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading} className="font-bold">
              {language === "en" ? "Cancel" : "Vazgeç"}
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={loading}
              className="bg-primary hover:bg-primary/90 font-bold"
            >
              {loading
                ? (language === "en" ? "Submitting..." : "Gönderiliyor...")
                : (language === "en" ? "Submit Return Request" : "İade Talebini Gönder")}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
