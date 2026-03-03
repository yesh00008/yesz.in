import { useEffect } from "react";

interface AdBannerProps {
  format?: "auto" | "fluid" | "autorelaxed";
  slot: string;
  layoutKey?: string;
  className?: string;
}

const AdBanner = ({ format = "auto", slot, layoutKey, className = "" }: AdBannerProps) => {
  useEffect(() => {
    try {
      // Push ads for display
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("AdSense error:", e);
    }
  }, []);

  return (
    <div className={`ads-container my-8 ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-7549396915435502"
        data-ad-slot={slot}
        data-ad-format={format}
        {...(layoutKey && { "data-ad-layout-key": layoutKey })}
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdBanner;
