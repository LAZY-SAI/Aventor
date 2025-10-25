import { ArrowRight } from "lucide-react";
import { twMerge } from "tailwind-merge";

export function Button({ children, className, ...props }) {
  return (
    <button
      className={twMerge(
        "group bg-background relative w-auto cursor-pointer overflow-hidden rounded-full border p-2 px-6 text-center font-semibold",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2">
        <div className="bg-blue-500 h-2 w-2 rounded-full transition-all text-black duration-300 group-hover:scale-[100.8] "></div>
        <span className="inline-block transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0">
          {children}
        </span>
      </div>
      <div className=" absolute top-0 z-10 flex h-full w-full translate-x-12 items-center justify-center gap-2 opacity-0 transition-all duration-300 group-hover:-translate-x-5 group-hover:opacity-100 text-black">
        <span >{children}</span>
        <ArrowRight className="text-white" />
      </div>
    </button>
  );
}
