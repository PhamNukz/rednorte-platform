/* ── Utilidades para RUT chileno ─────────────────────────────────────────── */

// Elimina puntos, espacios y convierte K a mayúscula
export function limpiarRut(rut) {
  return rut.replace(/\./g, '').replace(/\s/g, '').toUpperCase();
}

// Valida formato Y dígito verificador (módulo 11)
export function validarRut(rut) {
  const clean = limpiarRut(rut);
  if (!/^\d{7,8}-[\dK]$/.test(clean)) return false;

  const [cuerpo, dv] = clean.split('-');
  let suma = 0;
  let mul = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i], 10) * mul;
    mul = mul === 7 ? 2 : mul + 1;
  }
  const resto = 11 - (suma % 11);
  const dvEsperado = resto === 11 ? '0' : resto === 10 ? 'K' : String(resto);
  return dv === dvEsperado;
}

// Formatea RUT mientras el usuario escribe: agrega guion antes del último carácter
export function formatearRutInput(valor) {
  const clean = valor.replace(/\./g, '').replace(/-/g, '').replace(/\s/g, '').toUpperCase();
  if (clean.length <= 1) return clean;
  const cuerpo = clean.slice(0, -1);
  const dv = clean.slice(-1);
  return `${cuerpo}-${dv}`;
}
