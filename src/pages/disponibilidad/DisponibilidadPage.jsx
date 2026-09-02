import { useState, useEffect } from 'react';
import { Clock, CheckCircle2, Save, Calendar, Loader2 } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { diasSemana, diasSemanaFull, horasDisponibles } from '../../data/mockData';
import { dbService } from '../../services/dbService';

const DisponibilidadPage = () => {
  const { user } = useAuth();
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  const createEmptyGrid = () => {
    const grid = {};
    for (let d = 0; d < 7; d++) {
      grid[d] = {};
      for (const h of horasDisponibles) {
        grid[d][h] = false;
      }
    }
    return grid;
  };

  const [disponibilidad, setDisponibilidad] = useState(createEmptyGrid);

  useEffect(() => {
    let isMounted = true;
    const loadDisp = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const rows = await dbService.getDisponibilidad(user.id);
        if (isMounted) {
          const grid = createEmptyGrid();
          (rows || []).forEach((disp) => {
            const startH = parseInt(disp.hora_inicio?.split(':')[0]);
            const endH = parseInt(disp.hora_fin?.split(':')[0]);
            for (let h = startH; h < endH; h++) {
              const key = `${h.toString().padStart(2, '0')}:00`;
              if (grid[disp.dia_semana]) {
                grid[disp.dia_semana][key] = true;
              }
            }
          });
          setDisponibilidad(grid);
        }
      } catch (err) {
        console.error('Error cargando disponibilidad:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadDisp();
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const [isDragging, setIsDragging] = useState(false);
  const [dragValue, setDragValue] = useState(false);

  const handleMouseDown = (dia, hora) => {
    const newVal = !disponibilidad[dia][hora];
    setDragValue(newVal);
    setIsDragging(true);
    setDisponibilidad((prev) => ({
      ...prev,
      [dia]: { ...prev[dia], [hora]: newVal },
    }));
  };

  const handleMouseEnter = (dia, hora) => {
    if (!isDragging) return;
    setDisponibilidad((prev) => ({
      ...prev,
      [dia]: { ...prev[dia], [hora]: dragValue },
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const horasFutbol = horasDisponibles.filter((h) => {
    const hour = parseInt(h);
    return hour >= 17 && hour <= 22;
  });

  const totalSlots = Object.values(disponibilidad).reduce((sum, dia) => {
    return sum + Object.values(dia).filter(Boolean).length;
  }, 0);

  const handleGuardar = async () => {
    if (!user?.id) return;
    const slots = [];
    for (let dia = 0; dia < 7; dia++) {
      for (const hora of horasFutbol) {
        if (disponibilidad[dia]?.[hora]) {
          const startH = parseInt(hora);
          const endH = startH + 1;
          slots.push({
            dia_semana: dia,
            hora_inicio: `${startH.toString().padStart(2, '0')}:00:00`,
            hora_fin: `${endH.toString().padStart(2, '0')}:00:00`,
          });
        }
      }
    }
    await dbService.saveDisponibilidad(user.id, slots);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in" onMouseUp={handleMouseUp}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Disponibilidad Horaria</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Indica los días y horarios que tienes libres para jugar • {totalSlots} horas seleccionadas
          </p>
        </div>
        <Button icon={Save} onClick={handleGuardar}>
          Guardar disponibilidad
        </Button>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-800 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>¡Disponibilidad actualizada exitosamente!</span>
        </div>
      )}

      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
            <Clock className="w-4 h-4 text-nablus-primary" />
            <span>Haz clic o arrastra sobre las celdas para marcar tus horarios</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded bg-nablus-primary border border-nablus-primary-dark" />
              <span className="text-xs text-gray-600 font-medium">Disponible</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded bg-gray-100 border border-gray-200" />
              <span className="text-xs text-gray-400 font-medium">No disponible</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[640px]">
            {/* Header Días */}
            <div className="grid grid-cols-8 gap-2 mb-2">
              <div className="p-2 text-center text-xs font-bold text-gray-400 uppercase">Hora</div>
              {diasSemana.map((dia, idx) => (
                <div key={idx} className="p-2 text-center bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-xs font-bold text-gray-800">{dia}</span>
                </div>
              ))}
            </div>

            {/* Grid Horas */}
            <div className="space-y-1.5 select-none">
              {horasFutbol.map((hora) => (
                <div key={hora} className="grid grid-cols-8 gap-2 items-center">
                  <div className="text-center">
                    <span className="text-xs font-mono font-semibold text-gray-500">{hora}</span>
                  </div>
                  {Array.from({ length: 7 }, (_, dia) => {
                    const active = disponibilidad[dia]?.[hora];
                    return (
                      <button
                        key={`${dia}-${hora}`}
                        type="button"
                        onMouseDown={() => handleMouseDown(dia, hora)}
                        onMouseEnter={() => handleMouseEnter(dia, hora)}
                        className={`h-9 rounded-xl transition-all duration-150 cursor-pointer border ${
                          active
                            ? 'bg-nablus-primary text-white border-nablus-primary-dark shadow-sm'
                            : 'bg-white border-gray-200/80 hover:border-gray-300'
                        }`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Resumen Semanal */}
      <Card className="p-6">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">
          Resumen Semanal de tus Horarios
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {diasSemanaFull.map((dia, idx) => {
            const horasActivas = Object.entries(disponibilidad[idx] || {})
              .filter(([_, v]) => v)
              .map(([h]) => h)
              .sort();

            return (
              <div key={idx} className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-center space-y-2">
                <p className="text-xs font-bold text-gray-800">{dia.slice(0, 3)}</p>
                {horasActivas.length > 0 ? (
                  <div className="space-y-1">
                    {horasActivas.map((h) => (
                      <div
                        key={h}
                        className="text-[10px] font-mono font-bold text-nablus-primary-dark bg-purple-100/60 rounded px-1 py-0.5"
                      >
                        {h}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-gray-400 py-1">-</p>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default DisponibilidadPage;
