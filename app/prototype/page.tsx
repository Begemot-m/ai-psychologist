import { PrototypeApp } from "@/components/prototype/PrototypeApp";

export default function PrototypePage() {
  return (
    <div className="flex min-h-screen justify-center bg-[#E9E4F7] sm:py-10">
      <div className="relative h-screen w-full overflow-hidden bg-white sm:h-[844px] sm:max-w-[390px] sm:rounded-[44px] sm:border sm:border-black/10 sm:shadow-2xl">
        <PrototypeApp />
      </div>
    </div>
  );
}
