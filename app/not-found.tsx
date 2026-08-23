import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
      <h1 className="text-6xl font-black text-brand-primary mb-4">404</h1>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Sayfa Bulunamadı / Page Not Found</h2>
      <p className="text-gray-600 max-w-md mb-6">
        Aradığınız sayfa mevcut değil veya taşınmış olabilir.
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-brand-primary text-white font-medium rounded-xl hover:bg-orange-600 transition"
      >
        Ana Sayfaya Dön / Go Home
      </Link>
    </div>
  );
}
