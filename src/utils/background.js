import defaultImg from '@/assets/voetbal.jpg';

export function applyPersistentBackground() {
  const savedBackground = localStorage.getItem('appBackground') || 
    `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${defaultImg}) no-repeat center center`;
  
  const html = document.documentElement;
  html.style.background = savedBackground;
  html.style.backgroundSize = 'cover';
  html.style.minHeight = '100vh';
}