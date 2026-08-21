import React from "react";
import { User, Mail, Phone } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

export interface CustomerFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface CustomerFormProps {
  data: CustomerFormData;
  onChange: (data: CustomerFormData) => void;
  errors?: Partial<Record<keyof CustomerFormData, string>>;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({
  data,
  onChange,
  errors = {},
}) => {
  const { language } = useLanguage();

  const handleFieldChange = (field: keyof CustomerFormData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-4">
      <h2 className="text-sm font-extrabold text-text-main flex items-center gap-2 pb-3 border-b border-slate-100">
        <User className="w-4 h-4 text-primary" />
        <span>{language === "en" ? "Customer Information" : "Müşteri Bilgileri"}</span>
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* First Name */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-text-muted">
            {language === "en" ? "First Name" : "Ad"} <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={data.firstName}
            onChange={(e) => handleFieldChange("firstName", e.target.value)}
            placeholder="Ahmet"
            className={`h-10 px-3 text-xs bg-slate-50 border rounded-lg outline-none focus:bg-white transition-all ${
              errors.firstName ? "border-rose-400 focus:border-rose-500" : "border-slate-200 focus:border-primary"
            }`}
          />
          {errors.firstName && <span className="text-[11px] text-rose-500 font-semibold">{errors.firstName}</span>}
        </div>

        {/* Last Name */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-text-muted">
            {language === "en" ? "Last Name" : "Soyad"} <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={data.lastName}
            onChange={(e) => handleFieldChange("lastName", e.target.value)}
            placeholder="Yılmaz"
            className={`h-10 px-3 text-xs bg-slate-50 border rounded-lg outline-none focus:bg-white transition-all ${
              errors.lastName ? "border-rose-400 focus:border-rose-500" : "border-slate-200 focus:border-primary"
            }`}
          />
          {errors.lastName && <span className="text-[11px] text-rose-500 font-semibold">{errors.lastName}</span>}
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-text-muted">
            {language === "en" ? "Email" : "E-posta"} <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="email"
              value={data.email}
              onChange={(e) => handleFieldChange("email", e.target.value)}
              placeholder="ahmet@example.com"
              className={`w-full h-10 pl-9 pr-3 text-xs bg-slate-50 border rounded-lg outline-none focus:bg-white transition-all ${
                errors.email ? "border-rose-400 focus:border-rose-500" : "border-slate-200 focus:border-primary"
              }`}
            />
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>
          {errors.email && <span className="text-[11px] text-rose-500 font-semibold">{errors.email}</span>}
        </div>

        {/* Phone */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-text-muted">
            {language === "en" ? "Phone" : "Telefon"} <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="tel"
              value={data.phone}
              onChange={(e) => handleFieldChange("phone", e.target.value)}
              placeholder="0532 123 4567"
              className={`w-full h-10 pl-9 pr-3 text-xs bg-slate-50 border rounded-lg outline-none focus:bg-white transition-all ${
                errors.phone ? "border-rose-400 focus:border-rose-500" : "border-slate-200 focus:border-primary"
              }`}
            />
            <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>
          {errors.phone && <span className="text-[11px] text-rose-500 font-semibold">{errors.phone}</span>}
        </div>
      </div>
    </div>
  );
};
