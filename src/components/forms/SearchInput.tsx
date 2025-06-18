
import { forwardRef } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, onClear, ...props }, ref) => {
    return (
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        
        <Input
          ref={ref}
          className={cn(
            "pl-10 input-base",
            className
          )}
          placeholder="Buscar..."
          {...props}
        />
        
        {props.value && onClear && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={onClear}
          >
            <span className="text-gray-400 hover:text-gray-600">×</span>
          </button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';
