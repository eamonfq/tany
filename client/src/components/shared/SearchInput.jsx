import { Search } from 'lucide-react';

export default function SearchInput({ value, onChange, placeholder = 'Buscar...' }) {
  return (
    <div className="relative">
      <Search
        size={18}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="input-field pl-10"
      />
    </div>
  );
}
