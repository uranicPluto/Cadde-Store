"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="min-h-screen flex flex-col items-center justify-center text-center p-6">
        <h1 className="text-6xl font-black text-red-600 mb-4">500</h1>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Bir Hata Oluştu / System Error</h2>
        <p className="text-gray-600 max-w-md mb-6">
          Beklenmeyen bir sunucu hatası oluştu. Lütfen tekrar deneyin.
        </p>
        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-brand-primary text-white font-medium rounded-xl hover:bg-orange-600 transition"
        >
          Tekrar Dene / Try Again
        </button>
      </body>
    </html>
  );
}
