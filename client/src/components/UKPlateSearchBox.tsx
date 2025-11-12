import React, { useState } from 'react';
import { Search, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UKPlateSearchBoxProps {
  onSearch: (registration: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
}

const UKPlateSearchBox: React.FC<UKPlateSearchBoxProps> = ({
  onSearch,
  isLoading = false,
  placeholder = "ENTER REG",
  className = ''
}) => {
  const [registration, setRegistration] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanReg = registration.toUpperCase().replace(/\s+/g, '');
    if (cleanReg.length >= 2) {
      onSearch(cleanReg);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    // Allow letters, numbers and spaces only
    if (/^[A-Z0-9\s]*$/.test(value)) {
      setRegistration(value);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`w-full max-w-2xl mx-auto ${className}`}>
      <div className="flex flex-col sm:flex-row gap-3">
        {/* UK Plate Style Input */}
        <div className={`
          relative flex-1 transition-all duration-300
          ${isFocused ? 'transform scale-105' : ''}
        `}>
          <div className="
            flex items-center
            bg-black/40
            backdrop-blur-md
            border-4 border-white/60
            rounded-lg 
            overflow-hidden
            shadow-2xl
            hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]
            transition-all
            relative
          " style={{
            background: 'linear-gradient(135deg, rgba(0,0,0,0.6), rgba(30,30,50,0.5))',
            backdropFilter: 'blur(10px)',
            boxShadow: 'inset 0 0 20px rgba(255,255,255,0.1), 0 0 30px rgba(0,0,0,0.5)'
          }}>
            {/* UK Flag Section */}
            <div className="
              flex flex-col items-center justify-center 
              bg-[#012169]/80 
              px-3 py-4
              border-r-2 border-white/30
            ">
              {/* UK Flag */}
              <div className="w-8 h-6 relative">
                <div className="absolute inset-0 bg-[#012169]">
                  {/* Union Jack simplified */}
                  <div className="absolute inset-0">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full h-1 bg-white"></div>
                      <div className="absolute w-1 h-full bg-white"></div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full h-0.5 bg-[#C8102E]"></div>
                      <div className="absolute w-0.5 h-full bg-[#C8102E]"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-[8px] text-white font-bold mt-1">GB</div>
            </div>

            {/* Registration Input */}
            <input
              type="text"
              value={registration}
              onChange={handleInputChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholder}
              maxLength={8}
              disabled={isLoading}
              className="
                flex-1
                bg-transparent 
                text-white 
                text-2xl sm:text-3xl
                font-bold 
                font-mono
                tracking-wider
                text-center
                px-4 py-3
                outline-none
                placeholder-white/60
                disabled:opacity-50
              "
              style={{
                textShadow: '0 0 10px rgba(255,255,255,0.3)',
                letterSpacing: '0.1em'
              }}
            />

            {/* Car Icon */}
            <div className="px-3">
              <Car className="h-6 w-6 text-white/70" />
            </div>
          </div>

          {/* Helper Text */}
          {registration.length > 0 && registration.length < 2 && (
            <div className="absolute -bottom-6 left-0 text-xs text-yellow-400 font-semibold">
              Enter at least 2 characters
            </div>
          )}
        </div>

        {/* Search Button */}
        <Button
          type="submit"
          disabled={isLoading || registration.length < 2}
          className="
            h-[68px] px-8
            bg-gradient-to-r from-blue-600 to-blue-700
            hover:from-blue-700 hover:to-blue-800
            text-white font-bold text-lg
            border-2 border-black
            shadow-lg hover:shadow-xl
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Checking...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              <span>Check Vehicle</span>
            </div>
          )}
        </Button>
      </div>

      {/* Examples */}
      <div className="mt-4 text-center">
        <div className="text-xs text-gray-300">
          Enter registration without spaces: AB12CDE or AB12 CDE
        </div>
      </div>
    </form>
  );
};

export default UKPlateSearchBox;