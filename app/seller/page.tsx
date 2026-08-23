"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MarketplaceHeader } from "@/components/layout/marketplace-header";
import { Footer } from "@/components/layout/footer";
import { useLanguage } from "@/lib/i18n/language-context";
import { Button } from "@/components/ui/button";
import {
  Store,
  ShieldCheck,
  TrendingUp,
  Truck,
  ArrowRight,
  CheckCircle2,
  FileText,
  Building,
  UserCheck,
  CreditCard,
  Sparkles,
} from "lucide-react";

export default function SellerOnboardingPage() {
  const { t, language } = useLanguage();
  const isEn = language === "en";

  // Application Form State
  const [storeName, setStoreName] = useState("");
  const [legalName, setLegalName] = useState("");
  const [companyType, setCompanyType] = useState("LTD");
  const [taxNumber, setTaxNumber] = useState("");
  const [taxOffice, setTaxOffice] = useState("");
  const [category, setCategory] = useState("kadin");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("İstanbul");
  const [district, setDistrict] = useState("");
  const [address, setAddress] = useState("");
  const [iban, setIban] = useState("");
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedKvkk, setAgreedKvkk] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [appRefNumber, setAppRefNumber] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedTerms || !agreedKvkk) {
      setErrorMsg(
        isEn
          ? "Please accept the Seller Agreement and KVKK disclosure."
          : "Lütfen Satıcı Sözleşmesi ve KVKK metnini onaylayınız."
      );
      return;
    }

    if (!storeName.trim() || !taxNumber.trim() || !contactName.trim() || !email.trim()) {
      setErrorMsg(
        isEn
          ? "Please fill in all required application fields."
          : "Lütfen tüm zorunlu başvuru alanlarını doldurunuz."
      );
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);

    setTimeout(() => {
      const refNo = `BASVURU-${Date.now().toString().slice(-6)}`;
      setAppRefNumber(refNo);
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-text-main">
      <MarketplaceHeader />

      <main className="flex-1 flex flex-col gap-12 pb-12">
        {/* Hero Banner Section */}
        <section className="bg-slate-900 text-white py-16 sm:py-20 px-4 sm:px-6 relative overflow-hidden border-b border-slate-800">
          <div className="max-w-wide mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-7 flex flex-col gap-4">
              <span className="text-xs font-black text-amber-400 uppercase tracking-widest bg-amber-400/10 px-3 py-1 rounded-full w-max border border-amber-400/30">
                {t("seller.onboarding.badge")}
              </span>

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                {t("seller.onboarding.heroTitle")}
              </h1>

              <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed max-w-xl">
                {t("seller.onboarding.heroDesc")}
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <a href="#application-form">
                  <Button
                    variant="primary"
                    size="lg"
                    className="font-extrabold px-8 py-3.5 bg-primary hover:bg-primary-hover shadow-lg text-sm"
                  >
                    <Store className="w-5 h-5 mr-2" />
                    <span>{isEn ? "Apply Now to Sell" : "Hemen Satıcı Ol"}</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </a>
                <Link href="/seller/trend-fashion-magazasi">
                  <Button
                    variant="outline"
                    size="lg"
                    className="font-bold border-slate-700 text-white hover:bg-slate-800 text-sm"
                  >
                    {t("seller.onboarding.viewSampleStore")}
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Hero Visual Card */}
            <div className="lg:col-span-5 bg-slate-800/80 border border-slate-700 rounded-2xl p-6 sm:p-8 flex flex-col gap-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-700 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center font-black">
                    CS
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm">{t("seller.onboarding.guaranteeTitle")}</span>
                    <span className="text-xs text-amber-400">{t("seller.onboarding.guaranteeBadge")}</span>
                  </div>
                </div>
                <ShieldCheck className="w-8 h-8 text-emerald-400" />
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/60">
                  <span className="text-slate-400">{t("seller.onboarding.dailyVisitors")}</span>
                  <p className="text-lg font-black text-white mt-1">2.5M+</p>
                </div>
                <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/60">
                  <span className="text-slate-400">{t("seller.onboarding.activeSellers")}</span>
                  <p className="text-lg font-black text-amber-400 mt-1">15.000+</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Grid Section */}
        <section className="max-w-wide mx-auto w-full px-4 sm:px-6 flex flex-col gap-8">
          <div className="text-center flex flex-col gap-2 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-text-main tracking-tight">
              {t("seller.onboarding.whySellTitle")}
            </h2>
            <p className="text-xs sm:text-sm text-text-muted">
              {t("seller.onboarding.whySellSubtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary-light text-primary flex items-center justify-center font-bold">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-base text-text-main">{t("seller.onboarding.benefit1Title")}</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                {t("seller.onboarding.benefit1Desc")}
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-base text-text-main">{t("seller.onboarding.benefit2Title")}</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                {t("seller.onboarding.benefit2Desc")}
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-base text-text-main">{t("seller.onboarding.benefit3Title")}</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                {t("seller.onboarding.benefit3Desc")}
              </p>
            </div>
          </div>
        </section>

        {/* Interactive Seller Application Form */}
        <section id="application-form" className="max-w-4xl mx-auto w-full px-4 sm:px-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-sm flex flex-col gap-6">
            <div className="flex flex-col gap-2 border-b border-slate-100 pb-4">
              <span className="text-xs font-black text-primary uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>{isEn ? "Seller Portal Onboarding" : "Satıcı Başvuru Formu"}</span>
              </span>
              <h2 className="text-2xl font-black text-text-main">
                {isEn ? "Join Cadde Store Marketplace" : "Cadde Store Pazaryerine Katılın"}
              </h2>
              <p className="text-xs text-text-muted font-medium">
                {isEn
                  ? "Complete the business details below to start selling to millions of customers across Turkey."
                  : "Türkiye genelindeki milyonlarca müşteriye ulaşmak için aşağıdaki şirket ve mağaza bilgilerinizi doldurunuz."}
              </p>
            </div>

            {isSubmitted ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 flex flex-col items-center text-center gap-4 animate-in fade-in zoom-in-95 duration-300">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-xl font-black text-emerald-900">
                    {isEn ? "Application Submitted Successfully!" : "Başvurunuz Başarıyla Alındı!"}
                  </h3>
                  <p className="text-xs text-emerald-700 max-w-md">
                    {isEn
                      ? "Your seller application has been registered. Our marketplace compliance team will review your business credentials within 24 hours."
                      : "Satıcı başvurunuz sisteme kaydedildi. Pazaryeri denetim ekibimiz vergi ve şirket bilgilerinizi 24 saat içinde inceleyecektir."}
                  </p>
                </div>

                <div className="bg-white border border-emerald-200 rounded-xl p-4 flex flex-col gap-1 text-xs w-full max-w-sm">
                  <span className="text-slate-500 font-bold">{isEn ? "Application Reference" : "Başvuru Takip No"}:</span>
                  <span className="text-base font-black text-emerald-800 font-mono tracking-wider">{appRefNumber}</span>
                  <span className="text-[11px] text-slate-400 mt-1">
                    {isEn ? "Status: Under Compliance Review" : "Durum: Ön Onay Sürecinde"}
                  </span>
                </div>

                <div className="flex gap-3 pt-2">
                  <Link href="/seller/dashboard">
                    <Button variant="primary" size="md" className="font-extrabold px-6 bg-emerald-600 hover:bg-emerald-700">
                      {isEn ? "Go to Seller Dashboard" : "Satıcı Paneline Git"}
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => {
                      setIsSubmitted(false);
                      setStoreName("");
                    }}
                    className="font-bold"
                  >
                    {isEn ? "Submit Another Application" : "Yeni Başvuru Yap"}
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6 text-xs font-medium">
                {errorMsg && (
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-xs font-bold text-rose-700">
                    {errorMsg}
                  </div>
                )}

                {/* Section 1: Business Identity */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800 border-b border-slate-100 pb-2">
                    <Building className="w-4 h-4 text-primary" />
                    <span>{isEn ? "1. Business & Company Details" : "1. Şirket ve Vergi Bilgileri"}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-slate-600">
                        {isEn ? "Store Brand Name" : "Mağaza Adı"} *
                      </label>
                      <input
                        type="text"
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        placeholder="Örn: Trend Butik"
                        className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-primary font-bold"
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-slate-600">
                        {isEn ? "Legal Business Title" : "Resmi Şirket Unvanı"} *
                      </label>
                      <input
                        type="text"
                        value={legalName}
                        onChange={(e) => setLegalName(e.target.value)}
                        placeholder="Örn: Trend Tekstil Tic. Ltd. Şti."
                        className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-primary font-bold"
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-slate-600">
                        {isEn ? "Company Type" : "Şirket Türü"} *
                      </label>
                      <select
                        value={companyType}
                        onChange={(e) => setCompanyType(e.target.value)}
                        className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-primary font-bold"
                      >
                        <option value="LTD">Limited Şirket (LTD)</option>
                        <option value="AS">Anonim Şirket (A.Ş.)</option>
                        <option value="SAHIS">Şahıs Şirketi</option>
                        <option value="KOOP">Kooperatif</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-slate-600">
                        {isEn ? "Tax Identification Number (VKN/TCKN)" : "Vergi Kimlik No (VKN / TCKN)"} *
                      </label>
                      <input
                        type="text"
                        value={taxNumber}
                        onChange={(e) => setTaxNumber(e.target.value)}
                        placeholder="10 veya 11 haneli numara"
                        className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-primary font-mono font-bold"
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-slate-600">
                        {isEn ? "Tax Office" : "Vergi Dairesi"} *
                      </label>
                      <input
                        type="text"
                        value={taxOffice}
                        onChange={(e) => setTaxOffice(e.target.value)}
                        placeholder="Örn: Beşiktaş Vergi Dairesi"
                        className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-primary font-bold"
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-slate-600">
                        {isEn ? "Primary Selling Category" : "Ana Satış Kategorisi"} *
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-primary font-bold"
                      >
                        <option value="kadin">Kadın Giyim & Moda</option>
                        <option value="erkek">Erkek Giyim & Moda</option>
                        <option value="elektronik">Elektronik & Teknoloji</option>
                        <option value="ayakkabi-canta">Ayakkabı & Çanta</option>
                        <option value="ev-yasam">Ev & Mobilya</option>
                        <option value="kozmetik">Kozmetik & Kişisel Bakım</option>
                        <option value="supermarket">Gıda & Süpermarket</option>
                        <option value="spor">Spor & Outdoor</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 2: Contact & Payout Info */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800 border-b border-slate-100 pb-2">
                    <UserCheck className="w-4 h-4 text-primary" />
                    <span>{isEn ? "2. Authorized Contact & Financial Settlement" : "2. Yetkili İletişim ve Banka Bilgileri"}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-slate-600">
                        {isEn ? "Contact Full Name" : "Yetkili Adı Soyadı"} *
                      </label>
                      <input
                        type="text"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="Örn: Ahmet Yılmaz"
                        className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-primary font-bold"
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-slate-600">
                        {isEn ? "Official Email Address" : "Kurumsal E-posta Adresi"} *
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="satis@sirketiniz.com"
                        className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-primary font-bold"
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-slate-600">
                        {isEn ? "Mobile Phone Number" : "Cep Telefonu"} *
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="0532 123 4567"
                        className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-primary font-bold"
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-slate-600">
                        {isEn ? "City" : "İl"} *
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="İstanbul"
                        className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-primary font-bold"
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-1 sm:col-span-2">
                      <label className="font-bold text-slate-600">
                        {isEn ? "Company Official Address" : "Şirket Açık Adresi"} *
                      </label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Mahalle, Cadde, Sokak, No, İlçe"
                        className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-primary font-medium"
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-1 sm:col-span-2">
                      <label className="font-bold text-slate-600 flex items-center gap-1">
                        <CreditCard className="w-3.5 h-3.5 text-primary" />
                        <span>{isEn ? "Turkish Bank IBAN (TRY Payouts)" : "Banka IBAN Numarası (Hakediş Ödemeleri)"} *</span>
                      </label>
                      <input
                        type="text"
                        value={iban}
                        onChange={(e) => setIban(e.target.value)}
                        placeholder="TR00 0000 0000 0000 0000 0000 00"
                        className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-primary font-mono font-bold"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Legal Consents */}
                <div className="flex flex-col gap-3 pt-3 border-t border-slate-100">
                  <label className="flex items-start gap-2 cursor-pointer text-xs text-slate-700">
                    <input
                      type="checkbox"
                      checked={agreedTerms}
                      onChange={(e) => setAgreedTerms(e.target.checked)}
                      className="mt-0.5 w-4 h-4 text-primary rounded"
                      required
                    />
                    <span>
                      <strong className="text-primary hover:underline">Cadde Store Pazaryeri Satıcı Sözleşmesi</strong>
                      &apos;ni okudum, anladım ve kabul ediyorum.
                    </span>
                  </label>

                  <label className="flex items-start gap-2 cursor-pointer text-xs text-slate-700">
                    <input
                      type="checkbox"
                      checked={agreedKvkk}
                      onChange={(e) => setAgreedKvkk(e.target.checked)}
                      className="mt-0.5 w-4 h-4 text-primary rounded"
                      required
                    />
                    <span>
                      <strong className="text-primary hover:underline">6698 sayılı KVKK Aydınlatma Metni</strong>
                      &apos;ni okudum, ticari elektronik ileti almayı onaylıyorum.
                    </span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-100">
                  <Button
                    variant="primary"
                    size="lg"
                    type="submit"
                    disabled={isSubmitting}
                    className="font-black px-10 py-3.5 bg-primary hover:bg-primary-hover shadow-lg text-sm"
                  >
                    {isSubmitting ? (
                      <span>{isEn ? "Submitting Application..." : "Başvuru Gönderiliyor..."}</span>
                    ) : (
                      <>
                        <span>{isEn ? "Complete Application" : "Başvuruyu Tamamla"}</span>
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="max-w-wide mx-auto w-full px-4 sm:px-6">
          <div className="bg-slate-900 text-white rounded-2xl p-8 sm:p-12 text-center flex flex-col items-center gap-4 shadow-xl">
            <h2 className="text-2xl sm:text-3xl font-black">{t("seller.onboarding.ctaTitle")}</h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md">
              {t("seller.onboarding.ctaDesc")}
            </p>
            <Link href="/seller/dashboard">
              <Button
                variant="primary"
                size="lg"
                className="font-black px-10 py-3.5 bg-primary hover:bg-primary-hover shadow-lg text-sm mt-2"
              >
                {t("seller.onboarding.ctaButton")}
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
