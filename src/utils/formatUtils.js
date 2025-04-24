export const formatKleedkamer = (kleedkamer) => {
    return kleedkamer ? kleedkamer : '---';
  };
  
  export const formatVeld = (veld) => {
    if (!veld) return '-';
    return veld.charAt(0).toUpperCase() + veld.slice(1);
  };