interface HistoryEmptyStateProps {
  Variant: 'loading' | 'error' | 'empty';
  ErrorMessage?: string;
  ShowTestAction?: boolean;
  IsCreatingTest?: boolean;
  TestWriteError?: string;
  OnCreateTest?: () => void;
}

export const HistoryEmptyState = ({
  Variant,
  ErrorMessage,
  ShowTestAction,
  IsCreatingTest,
  TestWriteError,
  OnCreateTest,
}: HistoryEmptyStateProps) => (
  <div className={`history-empty history-empty--${Variant}`}>
    {Variant === 'loading' && (
      <>
        <span className="history-empty__spinner" aria-hidden="true" />
        <h3>Cargando historial</h3>
        <p>Obteniendo datos desde Firebase...</p>
      </>
    )}

    {Variant === 'error' && (
      <>
        <span className="history-empty__icon" aria-hidden="true">
          !
        </span>
        <h3>No se pudo cargar el historial</h3>
        <p>
          Revisa las reglas y permisos de Firestore para la colección <strong>history</strong>.
        </p>
        {ErrorMessage && <p className="history-empty__error">{ErrorMessage}</p>}
      </>
    )}

    {Variant === 'empty' && (
      <>
        <span className="history-empty__icon" aria-hidden="true">
          ◷
        </span>
        <h3>Sin registros</h3>
        <p>No se encontraron acciones con los filtros seleccionados.</p>
        {ShowTestAction && OnCreateTest && (
          <div className="history-empty__actions">
            <p className="history-empty__hint">
              Si esperabas ver registros, Firestore puede estar vacío o las reglas bloquean la escritura.
            </p>
            <button
              type="button"
              className="history-btn history-btn--primary"
              onClick={OnCreateTest}
              disabled={IsCreatingTest}
            >
              {IsCreatingTest ? 'Creando...' : 'Crear registro de prueba'}
            </button>
            {TestWriteError && <p className="history-empty__error">{TestWriteError}</p>}
          </div>
        )}
      </>
    )}
  </div>
);
