import Input from '../ui/Input';

export default function SearchBar({ value, onChange, placeholder = 'Search...' }) {
  return (
    <Input
      className="search-bar"
      placeholder={placeholder}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}
