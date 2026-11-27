// Único punto para integrar las secciones de los compañeros.
// Ejemplo: import SalesSection from './SalesSection.jsx';
// Luego cambiar ventas: null por ventas: SalesSection.
import SalesSection from "./SalesSection.jsx";
export const teamSections = {
  ventas: SalesSection,
  logistica: null,
  prediccion: null,
};
