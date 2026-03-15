"use client";

interface PricingErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function PricingError({ error, reset }: PricingErrorProps) {
  console.error("[PricingError]", error);

  return (
    <div className="flex justify-center px-4 py-16">
      <div className="glass p-10 w-full max-w-md text-center">
        <div className="text-5xl mb-4 opacity-30">!</div>
        <h1 className="text-[24px] font-bold text-white mb-2">
          โหลดข้อมูลราคาไม่สำเร็จ
        </h1>
        <p className="text-secondary text-sm mb-8 leading-relaxed">
          กรุณากดปุ่มด้านล่างเพื่อลองโหลดหน้าราคาอีกครั้ง
        </p>
        <button
          onClick={() => reset()}
          className="glass-btn px-6 py-2.5 text-sm font-medium"
        >
          โหลดใหม่
        </button>
      </div>
    </div>
  );
}
