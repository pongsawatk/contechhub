"use client";

interface RootErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RootError({ error, reset }: RootErrorProps) {
  console.error("[AppError]", error);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass p-10 w-full max-w-md text-center">
        <div className="text-5xl mb-4 opacity-30">!</div>
        <h1 className="text-[24px] font-bold text-white mb-2">
          เกิดข้อผิดพลาดบางอย่าง
        </h1>
        <p className="text-secondary text-sm mb-8 leading-relaxed">
          ระบบไม่สามารถโหลดหน้านี้ได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง
        </p>
        <button
          onClick={() => reset()}
          className="glass-btn px-6 py-2.5 text-sm font-medium"
        >
          ลองใหม่อีกครั้ง
        </button>
      </div>
    </div>
  );
}
