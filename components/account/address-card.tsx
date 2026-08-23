import React from "react";
import { Address } from "@/lib/orders/order-types";
import { MapPin, Edit2, Trash2, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

export interface AddressCardProps {
  address: Address;
  onEdit: (address: Address) => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
}

export const AddressCard: React.FC<AddressCardProps> = ({
  address,
  onEdit,
  onDelete,
  onSetDefault,
}) => {
  const { language } = useLanguage();

  return (
    <div
      className={`bg-white border-2 rounded-xl p-5 shadow-xs flex flex-col justify-between gap-4 transition-all relative ${
        address.isDefault ? "border-primary bg-primary-light/10" : "border-slate-200 hover:border-slate-300"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="font-extrabold text-sm text-text-main">{address.title}</span>
        </div>

        {address.isDefault ? (
          <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {language === "en" ? "Default Address" : "Varsayılan Adres"}
          </span>
        ) : (
          <button
            type="button"
            onClick={() => onSetDefault(address.id)}
            className="text-[11px] font-bold text-primary hover:underline"
          >
            {language === "en" ? "Set as Default" : "Varsayılan Yap"}
          </button>
        )}
      </div>

      <div className="flex flex-col gap-1 text-xs text-text-muted">
        <span className="font-bold text-text-main text-sm">{address.firstName} {address.lastName}</span>
        <span className="text-text-subtle">{address.phone} • {address.email}</span>
        <p className="line-clamp-2 mt-1 text-slate-700 font-medium">{address.addressLine}</p>
        <span className="font-bold text-text-main mt-0.5">
          {address.district} / {address.city} - {address.country}
        </span>
      </div>

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 text-xs">
        <button
          type="button"
          onClick={() => onEdit(address)}
          className="text-slate-600 hover:text-primary font-bold flex items-center gap-1 transition-colors"
        >
          <Edit2 className="w-3.5 h-3.5" />
          <span>{language === "en" ? "Edit" : "Düzenle"}</span>
        </button>

        <button
          type="button"
          onClick={() => onDelete(address.id)}
          className="text-slate-400 hover:text-rose-600 font-bold flex items-center gap-1 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>{language === "en" ? "Delete" : "Sil"}</span>
        </button>
      </div>
    </div>
  );
};
