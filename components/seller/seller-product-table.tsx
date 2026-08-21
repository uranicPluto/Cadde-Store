import React, { useState } from "react";
import Link from "next/link";
import { DetailedProductMock } from "@/lib/catalog/product-repository";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";
import { Edit2, Trash2, Eye, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface SellerProductTableProps {
  products: DetailedProductMock[];
  onDeleteProduct: (id: string) => void;
}

export const SellerProductTable: React.FC<SellerProductTableProps> = ({
  products,
  onDeleteProduct,
}) => {
  const { language, currency } = useLanguage();
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  const filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase());
    const matchesCat = filterCategory === "all" || p.categorySlug === filterCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col gap-4 p-5">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ürün adı veya marka ara..."
            className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-primary focus:bg-white font-medium"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg font-bold outline-none"
          >
            <option value="all">Tüm Kategoriler</option>
            <option value="men">Erkek Giyim</option>
            <option value="women">Kadın Giyim</option>
            <option value="electronics">Elektronik</option>
            <option value="shoes-bags">Ayakkabı & Çanta</option>
            <option value="home-living">Ev & Yaşam</option>
          </select>

          <Link href="/seller/dashboard/products/new">
            <Button variant="primary" size="sm" className="font-extrabold text-xs shrink-0">
              <Plus className="w-4 h-4 mr-1" />
              <span>Yeni Ürün</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Table Area */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-text-muted font-extrabold uppercase tracking-wider">
              <th className="p-3">Ürün</th>
              <th className="p-3">Kategori</th>
              <th className="p-3">Fiyat</th>
              <th className="p-3">Stok</th>
              <th className="p-3">Durum</th>
              <th className="p-3 text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-text-muted">
                  Herhangi bir ürün bulunamadı.
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img src={p.imageUrl} alt="" className="w-10 h-12 object-cover rounded border border-slate-200 shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <span className="font-extrabold text-primary text-[11px] uppercase">{p.brand}</span>
                        <span className="font-bold text-text-main line-clamp-1">{p.name}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-text-muted font-bold">{p.categoryName}</td>
                  <td className="p-3 font-extrabold text-text-main">{formatCurrency(p.price, currency)}</td>
                  <td className="p-3 font-bold">
                    <span className={p.stock > 10 ? "text-emerald-700" : "text-amber-600"}>
                      {p.stock} Adet
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-extrabold">
                      Yayında
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/product/${p.slug}`} title="Vitrinde Gör" className="p-1.5 text-slate-400 hover:text-primary">
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link href={`/seller/dashboard/products/${p.id}/edit`} title="Düzenle" className="p-1.5 text-slate-400 hover:text-indigo-600">
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => onDeleteProduct(p.id)}
                        title="Sil"
                        className="p-1.5 text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
