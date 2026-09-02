import React from 'react';

const FifaCard = ({ player, media, equipo, className = '' }) => {
  if (!player || !media) return null;

  // Mapeo corto de posiciones para la carta
  const posMapeo = {
    arquero: 'POR',
    defensa: 'DEF',
    mediocampo: 'MED',
    delantero: 'DEL'
  };

  const posStr = posMapeo[player.posicion_preferida] || 'MED';
  
  // Nombres de stats. En arquero cambian en el mundo FIFA, pero usaremos las bases
  const isGK = player.posicion_preferida === 'arquero';
  const statsCols = isGK 
    ? [
        { label: 'DIV', val: media.def },
        { label: 'HAN', val: media.pas },
        { label: 'KIC', val: media.sho },
        { label: 'REF', val: media.def + 2 },
        { label: 'SPD', val: media.pac },
        { label: 'POS', val: media.dri },
      ]
    : [
        { label: 'PAC', val: media.pac },
        { label: 'SHO', val: media.sho },
        { label: 'PAS', val: media.pas },
        { label: 'DRI', val: media.dri },
        { label: 'DEF', val: media.def },
        { label: 'PHY', val: media.phy },
      ];

  return (
    <div className={`relative w-72 h-[26rem] group perspective-1000 ${className} mx-auto`}>
      {/* Glow Effect on Hover */}
      <div className="absolute inset-0 bg-purple-600 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-40 transition duration-700"></div>
      
      {/* Main Card Body - Shield layout */}
      <div 
        className="relative w-full h-full transform transition duration-500 hover:scale-105 preserve-3d"
      >
        {/* Dark Purple Premium Background with border and rounding */}
        <div 
          className="absolute inset-0 rounded-[2rem] border-[3px] border-purple-400/40 bg-gradient-to-br from-indigo-950 via-purple-900 to-fuchsia-950 shadow-2xl overflow-hidden"
          style={{ clipPath: 'polygon(0 0, 100% 0, 100% 93%, 50% 100%, 0 93%)' }}
        >
          
          {/* Textures and patterns */}
          <div className="absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-400/20 via-transparent to-black" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
          
          {/* Player Image area - Edge to edge background style with bottom fade */}
          <div className="absolute top-0 left-0 w-full h-[65%] pointer-events-none z-0">
            {player.avatar_url ? (
              <img 
                src={player.avatar_url} 
                alt={player.nombre}
                className="w-full h-full object-cover object-center"
                style={{ 
                  filter: 'contrast(1.1) brightness(1.05)',
                  maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)'
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center pt-8">
                <span className="text-9xl font-black text-white/10">
                  {player.nombre.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* Top Left Info (OVR & POS) - Ensure it is above the image */}
          <div className="absolute top-8 left-6 flex flex-col items-center z-10">
            <span className="text-5xl font-black text-white drop-shadow-md leading-none tracking-tighter">
              {media.ovr}
            </span>
            <span className="text-lg font-bold text-purple-200 tracking-wider uppercase mt-1 drop-shadow-md">
              {posStr}
            </span>
          </div>

          {/* Player Name */}
          <div className="absolute top-[54%] w-full text-center flex flex-col justify-center items-center h-12 px-3 z-10">
            <h2 className="text-[17px] leading-tight font-black uppercase text-white tracking-wider drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] line-clamp-2">
              {player.nombre}
            </h2>
            <div className="w-4/5 h-[1px] bg-purple-300/30 mt-1.5"></div>
          </div>

          {/* Stats Grid - Horizontal Layout */}
          <div className="absolute top-[65%] w-full px-4">
            <div className="flex justify-between items-center text-center">
              {statsCols.map((stat, idx) => (
                <div key={idx} className="flex flex-col items-center flex-1">
                  <span className="text-[11px] font-bold text-purple-300/90 uppercase mb-0.5 tracking-tighter">
                    {stat.label}
                  </span>
                  <span className="font-black text-[17px] text-white tracking-tighter drop-shadow-sm">
                    {stat.val}
                  </span>
                </div>
              ))}
            </div>
            <div className="w-3/5 mx-auto h-[1px] bg-purple-300/20 mt-3"></div>
          </div>
          
          {/* Logos at the bottom */}
          <div className="absolute bottom-6 w-full flex justify-center items-center gap-3">
            {/* Nation Flag */}
            <img 
              src="https://flagcdn.com/w40/cl.png" 
              alt="Chile" 
              className="w-7 shadow-[0_2px_4px_rgba(0,0,0,0.5)] rounded-sm" 
            />
            {/* Team Logo */}
            {equipo && equipo.logo_url && (
              <img 
                src={equipo.logo_url} 
                alt={equipo.nombre} 
                className="w-7 h-7 object-contain drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]" 
              />
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default FifaCard;
