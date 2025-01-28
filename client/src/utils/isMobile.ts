export default function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check if the userAgent contains mobile-specific keywords
  const mobileKeywords = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  
  return (
    mobileKeywords.test(navigator.userAgent) ||
    // Check if the screen width is typical for mobile devices (less than 768px)
    window.innerWidth <= 768
  );
} 