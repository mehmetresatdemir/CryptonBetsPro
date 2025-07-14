import React from "react";

interface GameCardProps {
  bgClass: string;
  title: string;
  subtitle?: string;
  titleSize?: "sm" | "md" | "lg" | "xl";
  icon?: string;
  hasNumbers?: boolean;
  additionalText?: string;
  footerContent?: React.ReactNode;
  isSpecial?: boolean;
}

const GameCard: React.FC<GameCardProps> = ({ 
  bgClass, 
  title, 
  subtitle, 
  titleSize = "md", 
  icon, 
  hasNumbers,
  additionalText,
  footerContent,
  isSpecial
}) => {
  // Dinamik sınıf belirleme yerine koşullu render kullanarak sınıfları render edelim
  const getTitleClass = () => {
    if (titleSize === "sm") return "text-sm font-bold text-white";
    if (titleSize === "lg") return "text-lg font-bold text-white";
    if (titleSize === "xl") return "text-xl font-bold text-white";
    return "text-base font-bold text-white";
  };

  return (
    <div className="game-card bg-[#1E1E1E] rounded-lg overflow-hidden">
      <div className={`w-full h-28 relative overflow-hidden ${bgClass}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            {hasNumbers ? (
              <>
                <div className="flex items-center space-x-1">
                  <span className="text-2xl font-bold text-[#FFD700]">7</span>
                  <span className="text-2xl font-bold text-[#FFD700]">7</span>
                  <span className="text-2xl font-bold text-[#FFD700]">7</span>
                </div>
                {subtitle && <div className="text-xs text-white mt-1">{subtitle}</div>}
              </>
            ) : isSpecial ? (
              <div className="w-16 h-16 rounded-full border-2 border-[#FFD700] flex items-center justify-center">
                <div className="text-xs text-white">{title}</div>
              </div>
            ) : icon ? (
              <div className="flex items-center">
                <i className={`${icon} text-xl text-white mr-2`}></i>
                <div className="text-center">
                  <div className={getTitleClass()}>{title}</div>
                </div>
              </div>
            ) : (
              <>
                <div className={getTitleClass()}>{title}</div>
                {subtitle && <div className="text-sm text-white">{subtitle}</div>}
                {additionalText && <div className="text-xs text-white mt-1">{additionalText}</div>}
              </>
            )}
          </div>
        </div>
      </div>
      
      {footerContent && (
        <div className="flex justify-between items-center px-2 py-1 bg-[#121212] text-xs">
          {footerContent}
        </div>
      )}
    </div>
  );
};

export default GameCard;