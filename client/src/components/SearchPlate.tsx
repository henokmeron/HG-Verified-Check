import React from 'react';
import { Search } from 'lucide-react';

interface SearchPlateProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export default function SearchPlate({ 
  value, 
  onChange, 
  onSubmit,
  placeholder = "ENTER REG",
  disabled = false,
  className = ""
}: SearchPlateProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !disabled) {
      onSubmit();
    }
  };

  return (
    <div className={`uk-plate-container ${className}`}>
      <div className="uk-plate">
        {/* UK flag band */}
        <div className="uk-band">
          <div className="uk-flag">
            <span className="uk-flag-gb">GB</span>
          </div>
        </div>
        
        {/* Input field */}
        <input
          type="text"
          className="uk-plate-input"
          aria-label="Vehicle registration"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          maxLength={8}
          autoComplete="off"
          spellCheck={false}
        />
      </div>
      
      {/* Search button */}
      <button 
        className="uk-search-btn"
        onClick={onSubmit}
        disabled={disabled}
        type="button"
        aria-label="Search vehicle"
      >
        <Search className="h-5 w-5" />
        <span>Search</span>
      </button>
    </div>
  );
}