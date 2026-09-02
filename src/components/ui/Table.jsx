import { useState } from 'react';
import { ChevronUp, ChevronDown, Search } from 'lucide-react';

const Table = ({ 
  columns, 
  data, 
  searchable = true, 
  searchPlaceholder = 'Buscar...', 
  onRowClick,
  emptyMessage = 'No hay datos disponibles',
  toolbar = null,
}) => {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  let filtered = data;
  if (search && searchable) {
    const q = search.toLowerCase();
    filtered = data.filter(row =>
      columns.some(col => {
        const val = col.accessor ? (typeof col.accessor === 'function' ? col.accessor(row) : row[col.accessor]) : '';
        return String(val).toLowerCase().includes(q);
      })
    );
  }

  if (sortKey) {
    const col = columns.find(c => c.key === sortKey);
    if (col) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = typeof col.accessor === 'function' ? col.accessor(a) : a[col.accessor];
        const bVal = typeof col.accessor === 'function' ? col.accessor(b) : b[col.accessor];
        if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
    }
  }

  return (
    <div className="space-y-4">
      {(searchable || toolbar) && (
        <div className="flex items-center gap-3">
          {searchable && (
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-nablus-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="input-field pl-10 py-2.5 text-sm w-full"
              />
            </div>
          )}
          {toolbar && <div className="ml-auto">{toolbar}</div>}
        </div>
      )}

      <div className="overflow-x-auto rounded-nablus-md border border-nablus-gray-600/30">
        <table className="w-full">
          <thead>
            <tr className="border-b border-nablus-gray-600/30 bg-nablus-gray-800/40">
              {columns.map(col => (
                <th
                  key={col.key}
                  className={`table-header text-left px-4 py-3 ${col.sortable ? 'cursor-pointer select-none hover:text-nablus-gray-200' : ''}`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.sortable && sortKey === col.key && (
                      sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-12 text-nablus-gray-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              filtered.map((row, idx) => (
                <tr
                  key={row.id || idx}
                  className={`border-b border-nablus-gray-600/20 transition-colors hover:bg-nablus-gray-700/30 ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map(col => (
                    <td key={col.key} className="px-4 py-3 text-sm">
                      {col.render
                        ? col.render(row)
                        : typeof col.accessor === 'function'
                          ? col.accessor(row)
                          : row[col.accessor]
                      }
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
