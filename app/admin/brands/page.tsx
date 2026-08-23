"use client";

import React, { useState, useEffect } from "react";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { useLanguage } from "@/lib/i18n/language-context";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Award, Plus, Edit2, Trash2, Search, Star, ExternalLink, CheckCircle, Image as ImageIcon } from "lucide-react";
import { Footer } from "@/components/layout/footer";

interface BrandItem {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
  bannerUrl?: string | null;
  descriptionTR?: string | null;
  descriptionEN?: string | null;
  isFeatured: boolean;
  status: string;
  _count?: { products: number };
}

export default function AdminBrandsPage() {
  const { language } = useLanguage();
  const isEn = language === "en";

  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Partial<BrandItem>>({});
  const [saving, setSaving] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/brands?all=true");
      const data = await res.json();
      if (data.brands) {
        setBrands(data.brands);
      }
    } catch (e) {
      console.error("Failed to load brands:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleOpenAdd = () => {
    setEditingBrand({
      name: "",
      slug: "",
      logoUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80",
      descriptionTR: "",
      descriptionEN: "",
      isFeatured: true,
      status: "ACTIVE",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (brand: BrandItem) => {
    setEditingBrand({ ...brand });
    setIsModalOpen(true);
  };

  const generateTurkishSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleNameChange = (name: string) => {
    const slug = generateTurkishSlug(name);
    setEditingBrand((prev) => ({
      ...prev,
      name,
      slug: prev?.id ? prev.slug : slug,
    }));
  };

  const handleToggleFeatured = async (brand: BrandItem) => {
    try {
      const res = await fetch(`/api/brands/${brand.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !brand.isFeatured }),
      });
      if (res.ok) {
        showFeedback(
          !brand.isFeatured
            ? isEn ? "Brand marked as featured" : "Marka öne çıkarıldı"
            : isEn ? "Brand removed from featured" : "Marka öne çıkanlardan kaldırıldı"
        );
        await fetchBrands();
      }
    } catch (e) {
      console.error("Toggle featured error:", e);
    }
  };

  const handleToggleStatus = async (brand: BrandItem) => {
    const newStatus = brand.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      const res = await fetch(`/api/brands/${brand.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        showFeedback(
          newStatus === "ACTIVE"
            ? isEn ? "Brand activated" : "Marka aktif edildi"
            : isEn ? "Brand deactivated" : "Marka pasife alındı"
        );
        await fetchBrands();
      }
    } catch (e) {
      console.error("Toggle status error:", e);
    }
  };

  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBrand.name || !editingBrand.slug || !editingBrand.logoUrl) return;

    setSaving(true);
    try {
      if (editingBrand.id) {
        // Update existing brand
        const res = await fetch(`/api/brands/${editingBrand.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingBrand),
        });
        if (res.ok) {
          showFeedback(isEn ? "Brand updated successfully" : "Marka başarıyla güncellendi");
          await fetchBrands();
          setIsModalOpen(false);
        } else {
          const err = await res.json();
          alert(err.error || (isEn ? "Failed to update brand" : "Marka güncellenemedi"));
        }
      } else {
        // Create new brand
        const res = await fetch("/api/brands", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingBrand),
        });
        if (res.ok) {
          showFeedback(isEn ? "Brand created successfully" : "Marka başarıyla oluşturuldu");
          await fetchBrands();
          setIsModalOpen(false);
        } else {
          const err = await res.json();
          alert(err.error || (isEn ? "Failed to create brand" : "Marka oluşturulamadı"));
        }
      }
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBrand = async (id: string) => {
    if (!confirm(isEn ? "Are you sure you want to delete this brand?" : "Bu markayı silmek istediğinizden emin misiniz?")) return;

    try {
      const res = await fetch(`/api/brands/${id}`, { method: "DELETE" });
      if (res.ok) {
        showFeedback(isEn ? "Brand deleted" : "Marka silindi");
        setBrands((prev) => prev.filter((b) => b.id !== id));
      } else {
        const err = await res.json();
        alert(err.error || (isEn ? "Failed to delete brand" : "Marka silinemedi"));
      }
    } catch (e) {
      console.error("Delete error:", e);
    }
  };

  const filteredBrands = brands.filter(
    (b) =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between">
      <div>
        <AdminHeader />

        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <AdminSidebar />
            </div>

            <div className="md:col-span-3 space-y-6">
              {/* Toast Feedback */}
              {feedbackMessage && (
                <div className="bg-emerald-600/90 border border-emerald-500 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center justify-between text-xs font-bold animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-white" />
                    <span>{feedbackMessage}</span>
                  </div>
                </div>
              )}

              {/* Header Card */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-md">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-600/20 text-orange-400 flex items-center justify-center border border-orange-500/30">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h1 className="text-xl font-extrabold text-white">
                        {isEn ? "Brand Directory Management" : "Marka Yönetim Merkezi"}
                      </h1>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {isEn
                          ? "Manage global and local brands, logos, featured badges, and product associations."
                          : "Pazaryerindeki resmi markaları, logoları, öne çıkarılan etiketleri ve ürün ilişkilerini yönetin."}
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleOpenAdd}
                  className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-md transition-all shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isEn ? "Add New Brand" : "Yeni Marka Ekle"}</span>
                </Button>
              </div>

              {/* Search and Filters */}
              <div className="flex items-center gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={isEn ? "Search brand by name or slug..." : "Marka adı veya slug ara..."}
                    className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div className="text-xs text-slate-400 font-semibold px-2">
                  {filteredBrands.length} {isEn ? "Brands" : "Marka"}
                </div>
              </div>

              {/* Brands Grid Table */}
              <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-md">
                {loading ? (
                  <div className="p-12 text-center text-slate-400 text-xs">
                    <div className="animate-spin w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-3" />
                    {isEn ? "Loading brands..." : "Markalar yükleniyor..."}
                  </div>
                ) : filteredBrands.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 text-xs">
                    <Award className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="font-bold text-sm text-slate-300">{isEn ? "No Brands Found" : "Marka Bulunamadı"}</p>
                    <p className="mt-1 text-slate-500">{isEn ? "Try adjusting your search criteria." : "Arama kriterlerinizi değiştirmeyi deneyin."}</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800">
                    {filteredBrands.map((brand) => (
                      <div
                        key={brand.id}
                        className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-900/50 transition-colors"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          {/* Logo Preview */}
                          <div className="w-14 h-14 rounded-xl bg-white p-1.5 flex items-center justify-center border border-slate-700 shrink-0 shadow-xs overflow-hidden">
                            <img
                              src={brand.logoUrl}
                              alt={brand.name}
                              className="max-h-full max-w-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&q=80";
                              }}
                            />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-sm font-extrabold text-white truncate">{brand.name}</h3>

                              <button
                                type="button"
                                onClick={() => handleToggleFeatured(brand)}
                                className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md cursor-pointer border transition-colors ${
                                  brand.isFeatured
                                    ? "bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30"
                                    : "bg-slate-800 text-slate-500 border-slate-700 hover:bg-slate-700 hover:text-slate-300"
                                }`}
                                title={isEn ? "Click to toggle featured" : "Öne çıkarma durumunu değiştir"}
                              >
                                <Star className={`w-3 h-3 ${brand.isFeatured ? "fill-amber-400" : ""}`} />
                                {brand.isFeatured ? (isEn ? "Featured" : "Öne Çıkan") : (isEn ? "Standard" : "Standart")}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleToggleStatus(brand)}
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md cursor-pointer border transition-colors ${
                                  brand.status === "ACTIVE"
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                                    : "bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20"
                                }`}
                                title={isEn ? "Click to toggle status" : "Durumu değiştir"}
                              >
                                {brand.status}
                              </button>
                            </div>

                            <p className="text-xs text-slate-400 font-mono mt-0.5">/brand/{brand.slug}</p>

                            <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                              {isEn ? brand.descriptionEN || brand.descriptionTR : brand.descriptionTR || brand.descriptionEN}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          <span className="text-xs text-slate-400 bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded-lg font-bold">
                            {brand._count?.products || 0} {isEn ? "Products" : "Ürün"}
                          </span>

                          <Button
                            onClick={() => handleOpenEdit(brand)}
                            variant="outline"
                            className="bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300 hover:text-white p-2 rounded-lg cursor-pointer"
                            title={isEn ? "Edit Brand" : "Düzenle"}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>

                          <Button
                            onClick={() => handleDeleteBrand(brand.id)}
                            variant="outline"
                            className="bg-slate-900 hover:bg-red-950 border-slate-700 hover:border-red-800 text-slate-400 hover:text-red-400 p-2 rounded-lg cursor-pointer"
                            title={isEn ? "Delete Brand" : "Sil"}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Brand Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBrand?.id ? (isEn ? "Edit Brand Details" : "Marka Bilgilerini Düzenle") : (isEn ? "Register New Brand" : "Yeni Marka Kaydı")}
      >
        <form onSubmit={handleSaveBrand} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-bold mb-1">
                {isEn ? "Brand Name *" : "Marka Adı *"}
              </label>
              <input
                type="text"
                required
                value={editingBrand.name || ""}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Örn: Nike, Zara, Karaca"
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-semibold focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">
                {isEn ? "URL Slug *" : "URL Slug *"}
              </label>
              <input
                type="text"
                required
                value={editingBrand.slug || ""}
                onChange={(e) => setEditingBrand((p) => ({ ...p, slug: e.target.value }))}
                placeholder="Örn: nike, zara"
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">
              {isEn ? "Brand Logo URL (Square PNG/SVG Recommended) *" : "Marka Logo URL (Kare PNG/SVG) *"}
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="url"
                required
                value={editingBrand.logoUrl || ""}
                onChange={(e) => setEditingBrand((p) => ({ ...p, logoUrl: e.target.value }))}
                placeholder="https://..."
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
              />
              {editingBrand.logoUrl && (
                <div className="w-10 h-10 rounded-lg bg-white p-1 flex items-center justify-center shrink-0 border border-slate-700 overflow-hidden">
                  <img
                    src={editingBrand.logoUrl}
                    alt="preview"
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&q=80";
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">
              {isEn ? "Brand Banner URL (Optional)" : "Marka Vitrin Banner URL (Opsiyonel)"}
            </label>
            <input
              type="url"
              value={editingBrand.bannerUrl || ""}
              onChange={(e) => setEditingBrand((p) => ({ ...p, bannerUrl: e.target.value }))}
              placeholder="https://..."
              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-bold mb-1">
                {isEn ? "Turkish Description" : "Türkçe Açıklama"}
              </label>
              <textarea
                rows={2}
                value={editingBrand.descriptionTR || ""}
                onChange={(e) => setEditingBrand((p) => ({ ...p, descriptionTR: e.target.value }))}
                placeholder="Marka hakkında kısa tanıtım metni..."
                className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">
                {isEn ? "English Description" : "İngilizce Açıklama"}
              </label>
              <textarea
                rows={2}
                value={editingBrand.descriptionEN || ""}
                onChange={(e) => setEditingBrand((p) => ({ ...p, descriptionEN: e.target.value }))}
                placeholder="Brief English introduction..."
                className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-500 resize-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={editingBrand.isFeatured || false}
                onChange={(e) => setEditingBrand((p) => ({ ...p, isFeatured: e.target.checked }))}
                className="w-4 h-4 rounded text-orange-600 bg-slate-900 border-slate-700 focus:ring-orange-500"
              />
              <span className="font-bold text-slate-200">
                {isEn ? "Featured Brand on Homepage" : "Ana Sayfada Öne Çıkarılan Marka"}
              </span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={editingBrand.status === "ACTIVE"}
                onChange={(e) => setEditingBrand((p) => ({ ...p, status: e.target.checked ? "ACTIVE" : "INACTIVE" }))}
                className="w-4 h-4 rounded text-emerald-600 bg-slate-900 border-slate-700 focus:ring-emerald-500"
              />
              <span className="font-bold text-slate-200">
                {isEn ? "Active in Marketplace" : "Pazaryerinde Aktif"}
              </span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="bg-slate-900 border-slate-700 text-slate-300 hover:text-white"
            >
              {isEn ? "Cancel" : "Vazgeç"}
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-orange-600 hover:bg-orange-500 text-white font-bold px-5"
            >
              {saving ? (isEn ? "Saving..." : "Kaydediliyor...") : isEn ? "Save Brand" : "Markayı Kaydet"}
            </Button>
          </div>
        </form>
      </Modal>

      <Footer />
    </div>
  );
}
