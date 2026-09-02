import { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { X, Download, Share2, MapPin } from 'lucide-react';
import Button from './Button';

const MatchGraphicModal = ({ isOpen, onClose, partido, equipoA, equipoB, equipo }) => {
  const graphicRef = useRef(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !partido) return null;

  const formatFecha = (f) =>
    new Date(f).toLocaleDateString('es-CL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

  const formatHora = (f) =>
    new Date(f).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });

  const handleDownload = async () => {
    if (!graphicRef.current) return;
    try {
      setLoading(true);
      const dataUrl = await toPng(graphicRef.current, { 
        quality: 1.0, 
        pixelRatio: 2,
        cacheBust: true,
      });
      const link = document.createElement('a');
      link.download = `partido-${partido.lugar.replace(/\s+/g, '-').toLowerCase()}-${new Date(partido.fecha).getTime()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error al generar la imagen', err);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!graphicRef.current) return;
    try {
      setLoading(true);
      const dataUrl = await toPng(graphicRef.current, { quality: 1.0, pixelRatio: 2 });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'partido.png', { type: blob.type });

      if (navigator.share) {
        await navigator.share({
          title: `Partido en ${partido.lugar}`,
          text: `Alineaciones para el partido en ${partido.lugar}`,
          files: [file],
        });
      } else {
        alert('Compartir no está soportado en este navegador. Usa el botón de descargar.');
      }
    } catch (err) {
      console.error('Error al compartir', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Gráfica del Partido</h3>
          <button 
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col items-center bg-gray-50">
          
          {/* El contenedor que será capturado (1080x1920 ratio appx, usaremos 400x711 px ratio) */}
          <div 
            ref={graphicRef}
            className="w-[360px] h-[640px] relative overflow-hidden rounded-xl shadow-2xl bg-[#0B0F19] flex flex-col"
          >
            {/* Fondo complejo: Degradados oscuros y luz corporativa */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-[#0B0F19] to-purple-950/80" />
            
            {/* Texto de fondo gigante "MATCH DAY" */}
            <div className="absolute top-10 -left-10 opacity-[0.03] transform -rotate-12 pointer-events-none">
              <h1 className="text-[9rem] font-black italic tracking-tighter text-white leading-none">MATCH</h1>
              <h1 className="text-[9rem] font-black italic tracking-tighter text-white leading-none -mt-8 ml-8">DAY</h1>
            </div>

            {/* Grid Pattern sutil */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none mix-blend-overlay"></div>
            
            {/* Acento luminoso en la esquina */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/30 blur-[80px] rounded-full pointer-events-none" />

            {/* Contenido Principal */}
            <div className="relative z-10 flex flex-col h-full p-6 text-white text-center">
              
              {/* Header: Logo y Texto Match Day */}
              <div className="flex flex-col items-center mt-2 mb-6">
                {equipo?.logo_url ? (
                  <img src={equipo.logo_url} alt="Logo" className="w-20 h-20 object-contain drop-shadow-[0_0_15px_rgba(168,85,247,0.4)] mb-3" />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center mb-3 border border-white/20 shadow-lg">
                    <span className="text-3xl font-black text-white drop-shadow-md">N</span>
                  </div>
                )}
                
                <h1 className="text-4xl font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300 drop-shadow-sm leading-none">
                  Match Day
                </h1>
                
                <div className="flex items-center gap-2 mt-3 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10">
                  <span className="text-[10px] font-bold tracking-widest text-purple-200 uppercase">
                    {formatFecha(partido.fecha)}
                  </span>
                  <div className="w-1 h-1 rounded-full bg-purple-400"></div>
                  <span className="text-[10px] font-bold tracking-widest text-purple-200 uppercase">
                    {formatHora(partido.fecha)}
                  </span>
                </div>
                <div className="mt-2 text-xs font-semibold text-gray-400 tracking-wider flex items-center justify-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {partido.lugar}
                </div>
              </div>

              {/* Verses Layout */}
              <div className="flex-1 flex flex-col relative w-full px-2 mt-2">
                
                {/* VS Badge Floating */}
                <div className="absolute top-[48%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.5)] border-4 border-[#0B0F19]">
                    <span className="text-base font-black italic text-white leading-none">VS</span>
                  </div>
                </div>

                <div className="flex w-full gap-3 h-full">
                  {/* Equipo A */}
                  <div className="flex-1 flex flex-col items-center">
                    <h3 className="text-xl font-black italic uppercase tracking-wider text-white mb-3">Equipo A</h3>
                    <div className="w-full flex-1 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3 flex flex-col gap-1.5 shadow-inner">
                      {equipoA.length > 0 ? equipoA.map((j) => (
                        <div key={j.id} className="text-[11px] font-bold tracking-wide text-gray-200 uppercase bg-white/5 py-1 px-2 rounded-md truncate border border-white/5">
                          {j.jugador?.nombre || 'Jugador'}
                        </div>
                      )) : (
                        <div className="text-[10px] text-gray-500 italic mt-4">Sin confirmar</div>
                      )}
                    </div>
                  </div>

                  {/* Equipo B */}
                  <div className="flex-1 flex flex-col items-center">
                    <h3 className="text-xl font-black italic uppercase tracking-wider text-purple-400 mb-3">Equipo B</h3>
                    <div className="w-full flex-1 bg-purple-900/20 backdrop-blur-sm border border-purple-500/20 rounded-xl p-3 flex flex-col gap-1.5 shadow-inner">
                      {equipoB.length > 0 ? equipoB.map((j) => (
                        <div key={j.id} className="text-[11px] font-bold tracking-wide text-purple-100 uppercase bg-purple-500/10 py-1 px-2 rounded-md truncate border border-purple-500/20">
                          {j.jugador?.nombre || 'Jugador'}
                        </div>
                      )) : (
                        <div className="text-[10px] text-gray-500 italic mt-4">Sin confirmar</div>
                      )}
                    </div>
                  </div>
                </div>

              </div>
              
              {/* Footer */}
              <div className="mt-4 pb-2">
                <p className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">
                  {equipo?.nombre || 'Nablus Fútbol'} Oficial
                </p>
              </div>

            </div>
          </div>
          
        </div>

        {/* Footer Controls */}
        <div className="p-4 bg-white border-t border-gray-100 flex gap-3 justify-end">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cerrar
          </Button>
          <Button variant="secondary" onClick={handleShare} disabled={loading} icon={Share2}>
            Compartir
          </Button>
          <Button onClick={handleDownload} loading={loading} icon={Download}>
            Descargar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MatchGraphicModal;
