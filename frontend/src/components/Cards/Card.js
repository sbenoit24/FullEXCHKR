import * as Icons from "lucide-react";

export default function Card({
  bgColor = "#FFFFFF", // HEX card background
  title,
  value,
  subtitle,
  icon, // required
  bgIcon = "#2563EB", // HEX icon background
  subIcon,
  bgSubIcon,
  width = "md",
}) {
  const LucideIcon = icon ? Icons[icon] : null;
  const LucideSubIcon = subIcon ? Icons[subIcon] : null;

  const widthClasses = {
    sm: "w-48", // ~192px
    md: "w-64", // ~256px (default)
    lg: "w-80", // ~320px
    full: "w-full",
  };

  return (
    <div
      className={`
        rounded-2xl
        p-4
        shadow-sm
        transition
        duration-300
        ease-out
        transform
        hover:scale-105
        hover:shadow-xl
        cursor-pointer
        ${widthClasses[width]}
      `}
      style={{ backgroundColor: bgColor }}
    >
      {/* Top Row */}
      <div className="flex justify-between items-center mb-2">
        <p className="text-[#122B5B70] text-[14px] font-normal">{title}</p>

        {/* Icon */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ backgroundColor: bgIcon }}
        >
          {LucideIcon && (
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: bgIcon }}
            >
              <LucideIcon size={16} color="#FFFFFF" />
            </div>
          )}
        </div>
      </div>

      {/* Value */}
      <p className="text-[#122B5B] text-[30px] font-normal leading-none">
        {value}
      </p>

      {/* Subtitle */}
      <p className="flex items-center gap-1 text-[#122B5B70] text-[12px] font-normal mt-1">
        {LucideSubIcon && <LucideSubIcon size={10} color={bgSubIcon} />}
        <span>{subtitle}</span>
      </p>
    </div>
  );
}

/*
This reusable card component displays a title, value, subtitle, and dynamic icon
with customizable background colors for dashboard widgets.
*/
