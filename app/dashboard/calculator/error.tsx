"use client";

interface CalculatorErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function CalculatorError({
  error,
  reset,
}: CalculatorErrorProps) {
  console.error("[CalculatorError]", error);

  return (
    <div className="flex justify-center px-4 py-16">
      <div className="glass p-10 w-full max-w-md text-center">
        <div className="text-5xl mb-4 opacity-30">!</div>
        <h1 className="text-[24px] font-bold text-white mb-2">
          โหลดหน้าเครื่องคิดราคาไม่สำเร็จ
        </h1>
        <p className="text-secondary text-sm mb-8 leading-relaxed">
          ระบบไม่สามารถเตรียมข้อมูลสำหรับการคำนวณราคาได้ กรุณาลองใหม่อีกครั้ง
        </p>
        <button
          onClick={() => reset()}
          className="glass-btn px-6 py-2.5 text-sm font-medium"
        >
          ลองใหม่
        </button>
      </div>
    </div>
  );
}
