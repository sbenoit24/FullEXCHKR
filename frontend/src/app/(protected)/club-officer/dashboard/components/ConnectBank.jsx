import * as Icons from "lucide-react";

export default function ConnectBank({
  bgColor = "#FFFFFF",
  title,
  value,
  subtitle,
  icon,
  bgIcon = "#2563EB",
  onConnect,
  onCardClick,
  showButton,
  loading,
  needsRepair, 
}) {
  const LucideIcon = Icons[icon];
  const LinkIcon = Icons.Link;
  const LoaderIcon = Icons.Loader2;
  const AlertIcon = Icons.AlertCircle;

  return (
    <div
      onClick={!loading && !showButton ? onCardClick : undefined}
      className={`
        rounded-2xl p-4 shadow-sm transition duration-300 ease-out transform 
        hover:scale-105 hover:shadow-xl cursor-pointer
        ${needsRepair ? "border-2 border-red-200" : ""}
      `}
      style={{ backgroundColor: bgColor }}
    >
      <div className="flex justify-between items-center mb-2">
        <p className="text-[#122B5B70] text-[14px] font-normal">{title}</p>
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ backgroundColor: bgIcon }}
        >
          {needsRepair ? <AlertIcon size={16} color="#FFFFFF" /> : <LucideIcon size={16} color="#FFFFFF" />}
        </div>
      </div>

      <p className="text-[#122B5B] text-[30px] font-normal leading-none">
        {needsRepair ? "Action Required" : (showButton ? "Not Connected" : value)}
      </p>

      <p className={`text-[12px] font-normal mt-1 ${needsRepair ? "text-red-500 font-semibold" : "text-[#122B5B70]"}`}>
        {needsRepair ? "Bank re-login required" : (subtitle || "Connect your bank")}
      </p>

      {showButton && (
        <div 
          className={`mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-full border-2 bg-[#FFFFFF] transition-colors
            ${needsRepair ? "border-red-500 hover:bg-red-50" : "border-[#C39A4E] hover:bg-gray-50"}`}
        >
          <button
            disabled={loading}
            onClick={(e) => {
              e.stopPropagation();
              if (!loading) onConnect?.();
            }}
            className={`
              flex items-center gap-2 text-[13px] font-medium transition
              ${needsRepair ? "text-red-500" : "text-[#C39A4E]"}
            `}
          >
            {loading ? (
              <>
                <LoaderIcon size={14} className="animate-spin" />
                Processing…
              </>
            ) : (
              <>
                {needsRepair ? <Icons.RefreshCcw size={14} /> : <LinkIcon size={14} />}
                {needsRepair ? "Fix Connection" : "Connect Bank"}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}