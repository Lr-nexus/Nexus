export function formatTime(date) {
  const d = new Date(date);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function formatDate(date) {
  const d = new Date(date);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return formatTime(d);

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';

  const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: 'short' });

  return d.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });
}

export function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  const map = [
    [60, 's'], [60, 'm'], [24, 'h'], [7, 'd'], [4.345, 'w'], [12, 'mo'],
  ];
  let val = seconds;
  let unit = 's';
  for (let i = 0; i < map.length; i++) {
    if (val < map[i][0]) {
      unit = map[i][1];
      break;
    }
    val = val / map[i][0];
    unit = map[i][1];
  }
  return `${Math.floor(val)}${unit}`;
}

export function isToday(date) {
  return new Date(date).toDateString() === new Date().toDateString();
}