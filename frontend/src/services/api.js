import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:80';

const api = axios.create({ baseURL: API_URL });

// Agrega el token JWT a todas las peticiones
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Maneja expiración de token.
// IMPORTANTE: NO redirigir si es el endpoint de login (401 = credenciales inválidas,
// no sesión expirada). Redirigir solo cuando el token de una sesión activa expiró.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isLoginEndpoint = err.config?.url?.includes('/auth/login');
    if (err.response?.status === 401 && !isLoginEndpoint) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authService = {
  login:    (rut, password) => api.post('/api/lista-espera/auth/login', { rut, password }),
  checkRut: (rut)           => api.get(`/api/lista-espera/auth/check/${encodeURIComponent(rut)}`),
  register: (data)          => api.post('/api/lista-espera/auth/register', data),
};

export const listaEsperaService = {
  listar: (params) => api.get('/api/lista-espera/solicitudes', { params }),
  obtener: (id) => api.get(`/api/lista-espera/solicitudes/${id}`),
  registrar: (data) => api.post('/api/lista-espera/solicitudes', data),
  actualizarEstado: (id, estado, comentario) =>
    api.patch(`/api/lista-espera/solicitudes/${id}/estado`, { estado, comentario }),
  historial: (id) => api.get(`/api/lista-espera/solicitudes/${id}/historial`),
  resumen: () => api.get('/api/lista-espera/solicitudes/resumen'),
};

export const pacientesService = {
  obtener: (id) => api.get(`/api/pacientes/pacientes/${id}`),
  buscarPorRut: (rut) => api.get(`/api/pacientes/pacientes/rut/${rut}`),
  historialCitas: (id) => api.get(`/api/pacientes/pacientes/${id}/historial`),
  notificaciones: (id) => api.get(`/api/pacientes/pacientes/${id}/notificaciones`),
};

export const agendaService = {
  horasDisponibles: (params) => api.get('/api/agenda/horas/disponibles', { params }),
  medicos: (especialidad) => api.get('/api/agenda/medicos', { params: { especialidad } }),
  reservarHora: (id, data) => api.patch(`/api/agenda/horas/${id}/reservar`, data),
  liberarHora: (id) => api.patch(`/api/agenda/horas/${id}/liberar`),
  crearHora: (data) => api.post('/api/agenda/horas', data),
};

export const reportesService = {
  dashboard: () => api.get('/api/reportes/reportes/dashboard'),
  cancelaciones: () => api.get('/api/reportes/reportes/cancelaciones'),
  disponibilidad: () => api.get('/api/reportes/reportes/disponibilidad'),
};

export default api;
