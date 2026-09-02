export const generateGoogleCalendarUrl = (partido) => {
  const title = encodeURIComponent(`Partido Nablus FC - ${partido.formato || 'Fútbol'}`);
  const location = encodeURIComponent(partido.ubicacion || '');
  const details = encodeURIComponent('Convocatoria oficial de Nablus FC. ¡No faltes!');
  
  const startDate = new Date(partido.fecha);
  const endDate = new Date(startDate.getTime() + 90 * 60000); // 90 minutos de partido estimado

  // Google Calendar format requires YYYYMMDDTHHmmssZ
  const formatDateString = (date) => date.toISOString().replace(/-|:|\.\d\d\d/g, '');

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatDateString(startDate)}/${formatDateString(endDate)}&details=${details}&location=${location}`;
};

export const downloadIcsFile = (partido) => {
  const startDate = new Date(partido.fecha);
  const endDate = new Date(startDate.getTime() + 90 * 60000);
  const now = new Date();

  const formatDateString = (date) => date.toISOString().replace(/-|:|\.\d\d\d/g, '');

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Nablus FC//App//ES',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `DTSTAMP:${formatDateString(now)}`,
    `DTSTART:${formatDateString(startDate)}`,
    `DTEND:${formatDateString(endDate)}`,
    `SUMMARY:Partido Nablus FC - ${partido.formato || 'Fútbol'}`,
    `DESCRIPTION:Convocatoria oficial Nablus FC`,
    `LOCATION:${partido.ubicacion || ''}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `partido-nablus-${startDate.getTime()}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
