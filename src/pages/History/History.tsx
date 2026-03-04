import { useState, useMemo, useEffect, useCallback } from 'react';
import './History.css';
import { historyService, type HistoryEntry } from '../../utils/historyService';

const formatMonthYear = (dateString: string) => {
  const date = new Date(dateString);
  const month = date.toLocaleString('es-PE', { month: 'long' });
  const year = date.getFullYear();
  return `${month} ${year}`;
};

const getMonthKey = (dateString: string) => {
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

const getDayKey = (dateString: string) => {
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const formatDayLabel = (dateString: string) => {
  const date = new Date(dateString);
  const day = date.getDate();
  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const dayName = dayNames[date.getDay()];
  return `${dayName} ${day}`;
};

export const History = () => {
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [sectionFilter, setSectionFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string>('');
  const [isCreatingTestEntry, setIsCreatingTestEntry] = useState(false);
  const [testWriteError, setTestWriteError] = useState<string>('');

  useEffect(() => {
    // Migración 1 vez: si tenías historial previo en localStorage (legacy), lo subimos a Firestore
    // para que puedas visualizarlo en la nueva versión basada en Firebase.
    historyService.migrateLegacyLocalHistory().catch(() => undefined);

    const unsubscribe = historyService.subscribe(
      { limitCount: 2000 },
      (items) => {
        setHistory(items);
        setIsLoading(false);
        setLoadError('');
      },
      (error) => {
        console.error('Error suscribiéndose al historial:', error);
        const message =
          error instanceof Error ? error.message : 'No se pudo cargar el historial desde Firebase.';
        setLoadError(message);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleCreateTestEntry = async () => {
    if (isCreatingTestEntry) return;
    setIsCreatingTestEntry(true);
    setTestWriteError('');

    try {
      await historyService.addAsync({
        action: 'create',
        section: 'products',
        itemName: 'Registro de prueba',
        itemId: `test-${Date.now()}`,
        details: 'Evento generado desde Historial para validar escritura en Firestore.',
      });
    } catch (error: any) {
      console.error('Error creando registro de prueba:', error);
      setTestWriteError(error?.message || 'No se pudo escribir en Firestore.');
    } finally {
      setIsCreatingTestEntry(false);
    }
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      create: 'Creó',
      update: 'Editó',
      delete: 'Eliminó',
      deactivate: 'Desactivó',
      reactivate: 'Reactivó',
    };
    return labels[action] || action;
  };

  const getActionIcon = (action: string) => {
    const icons: Record<string, string> = {
      create: '➕',
      update: '✏️',
      delete: '🗑️',
      deactivate: '🚫',
      reactivate: '✅',
    };
    return icons[action] || '📝';
  };

  const getSectionLabel = (section: string) => {
    const labels: Record<string, string> = {
      products: 'Productos',
      categories: 'Categorías',
      brands: 'Marcas',
      orders: 'Pedidos',
      users: 'Usuarios',
    };
    return labels[section] || section;
  };

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      create: '#10b981',
      update: '#3b82f6',
      delete: '#ef4444',
      deactivate: '#f59e0b',
      reactivate: '#10b981',
    };
    return colors[action] || '#64748b';
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const normalizeDate = (dateStr: string): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr.trim();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const groupByMonthAndDay = useCallback((entries: HistoryEntry[]) => {
    const grouped: Record<string, Record<string, HistoryEntry[]>> = {};
    
    entries.forEach((entry) => {
      const monthKey = getMonthKey(entry.timestamp);
      const dayKey = getDayKey(entry.timestamp);
      
      if (!grouped[monthKey]) {
        grouped[monthKey] = {};
      }
      
      if (!grouped[monthKey][dayKey]) {
        grouped[monthKey][dayKey] = [];
      }
      
      grouped[monthKey][dayKey].push(entry);
    });

    return Object.entries(grouped)
      .map(([monthKey, days]) => ({
        key: monthKey,
        label: formatMonthYear(Object.values(days)[0][0].timestamp),
        days: Object.entries(days)
          .map(([dayKey, entries]) => ({
            key: dayKey,
            label: formatDayLabel(entries[0].timestamp),
            entries: entries.sort((a, b) => 
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            ),
          }))
          .sort((a, b) => b.key.localeCompare(a.key)),
      }))
      .sort((a, b) => b.key.localeCompare(a.key));
  }, []);

  const filteredHistory = useMemo(() => {
    return history.filter((entry) => {
      const matchesAction = actionFilter === 'all' || entry.action === actionFilter;
      const matchesSection = sectionFilter === 'all' || entry.section === sectionFilter;
      const matchesDate = !dateFilter || normalizeDate(entry.timestamp) === normalizeDate(dateFilter);
      return matchesAction && matchesSection && matchesDate;
    });
  }, [history, actionFilter, sectionFilter, dateFilter]);

  const groupedHistory = useMemo(() => {
    return groupByMonthAndDay(filteredHistory);
  }, [filteredHistory, groupByMonthAndDay]);

  // Nota: anteriormente se mostraba un selector de días. Ahora se muestra el timeline directamente,
  // y el filtro por día se realiza con el input de fecha.\n*** End Patch"}]

  return (
    <div className="history-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Historial</h1>
          <p className="page-description">
            Registro completo de todas las operaciones realizadas en el sistema
          </p>
        </div>
      </div>

      <div className="history-filters-container">
        <div className="history-filters">
          <select 
            className="filter-select"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
          >
            <option value="all">Todas las acciones</option>
            <option value="create">Creaciones</option>
            <option value="update">Ediciones</option>
            <option value="delete">Eliminaciones</option>
            <option value="deactivate">Desactivaciones</option>
            <option value="reactivate">Reactivaciones</option>
          </select>
          <select 
            className="filter-select"
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
          >
            <option value="all">Todas las secciones</option>
            <option value="products">Productos</option>
            <option value="categories">Categorías</option>
            <option value="brands">Marcas</option>
            <option value="orders">Pedidos</option>
            <option value="users">Usuarios</option>
          </select>
          <div className="filter-date-wrapper">
            <input
              type="date"
              className="filter-input"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Backspace' || e.key === 'Delete') {
                  setDateFilter('');
                }
              }}
              placeholder="Filtrar por día"
            />
            {dateFilter && (
              <button
                type="button"
                className="filter-clear-btn"
                onClick={() => setDateFilter('')}
                title="Limpiar filtro de fecha"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="history-content">
        {isLoading ? (
          <div className="empty-state">
            <div className="empty-icon">⏳</div>
            <h2>Cargando historial</h2>
            <p>Obteniendo datos desde Firebase...</p>
          </div>
        ) : loadError ? (
          <div className="empty-state">
            <div className="empty-icon">⚠</div>
            <h2>No se pudo cargar el historial</h2>
            <p>
              Revisa las reglas/permisos de Firestore para la colección <strong>history</strong>.
            </p>
            <p style={{ color: '#64748b' }}>{loadError}</p>
          </div>
        ) : groupedHistory.length > 0 ? (
          <div className="history-timeline">
            {groupedHistory.map(({ key, label, days }) => (
              <div key={key} className="history-month-group">
                <div className="month-header">
                  <div className="month-line"></div>
                  <h2 className="month-title">{label}</h2>
                  <div className="month-line"></div>
                </div>
                {days.map(({ key: dayKey, label: dayLabel, entries }) => (
                  <div key={dayKey} className="history-day-group">
                    <div className="day-header">
                      <h3 className="day-title">{dayLabel}</h3>
                      <span className="day-count">{entries.length} acción{entries.length !== 1 ? 'es' : ''}</span>
                    </div>
                    <div className="day-entries">
                      {entries.map((entry) => (
                        <div key={entry.id} className="history-entry">
                          <div className="entry-timeline">
                            <div 
                              className="entry-dot"
                              style={{ backgroundColor: getActionColor(entry.action) }}
                            ></div>
                            <div className="entry-line"></div>
                          </div>
                          <div className="entry-content">
                            <div className="entry-header">
                              <div className="entry-action">
                                <span className="action-icon">{getActionIcon(entry.action)}</span>
                                <span className="action-text">
                                  <strong>{getActionLabel(entry.action)}</strong>
                                  <span className="item-name">{entry.itemName}</span>
                                  <span className="section-badge" style={{ 
                                    backgroundColor: `${getActionColor(entry.section)}20`,
                                    color: getActionColor(entry.section)
                                  }}>
                                    {getSectionLabel(entry.section)}
                                  </span>
                                </span>
                              </div>
                              <div className="entry-time">
                                {formatDate(entry.timestamp)}
                              </div>
                            </div>
                            {entry.details && (
                              <div className="entry-details">
                                {entry.details}
                              </div>
                            )}
                            {entry.changes && entry.changes.length > 0 && (
                              <div className="entry-changes">
                                <div className="changes-header">
                                  <span className="changes-title">Cambios realizados:</span>
                                </div>
                                <div className="changes-list">
                                  {entry.changes.map((change, idx) => (
                                    <div key={idx} className="change-item">
                                      <div className="change-field">{change.field}:</div>
                                      <div className="change-values">
                                        <span className="change-before">
                                          <span className="change-label">Antes:</span>
                                          <span className="change-value">{change.before}</span>
                                        </span>
                                        <span className="change-arrow">→</span>
                                        <span className="change-after">
                                          <span className="change-label">Después:</span>
                                          <span className="change-value">{change.after}</span>
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h2>No hay registros</h2>
            <p>No se encontraron acciones con los filtros seleccionados.</p>
            {history.length === 0 && actionFilter === 'all' && sectionFilter === 'all' && !dateFilter && (
              <div style={{ marginTop: '1rem' }}>
                <p style={{ color: '#64748b' }}>
                  Si esperabas ver registros, probablemente Firestore está vacío o las reglas están bloqueando la escritura.
                </p>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleCreateTestEntry}
                  disabled={isCreatingTestEntry}
                >
                  {isCreatingTestEntry ? 'Creando...' : 'Crear registro de prueba en Firebase'}
                </button>
                {testWriteError && <p style={{ color: '#ef4444', marginTop: '0.75rem' }}>{testWriteError}</p>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
