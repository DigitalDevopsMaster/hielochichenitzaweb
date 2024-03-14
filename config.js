import { initScrollIntegration, initV1 } from "http://lib.digitaldevops.com.mx/v1.js";
// import { initScrollIntegration, initV1 } from "../vendor/v1.js";

initV1({
  style: 'webLayout',
  contactInfo: {
    companyName: "Hielo Chichén Itzá",
    email: "hielochichenitza@email.com",
    phone: "(999) 1148769",
    logo: "./assets/logo.png"
  },
  palette: {
    textColor: '#ffffff',                   // Blanco para texto principal
    textSecondaryColor: '#292929',          // Blanco desaturado para texto secundario
    menuButtonText: '#292929',              // Blanco desaturado para texto secundario

    primaryColor: '#6699cc',                // Azul hielo (para bordes y elementos suaves)
    secondaryColor: '#ffffff',              // Blanco (para elementos adicionales)
    accentColor: '#99ccff',                 // Azul claro (color de acento principal)
    accentSecondaryColor: '#4CAF50',        // Verde brillante (color de acento adicional)

    backgroundColor: '#f0f8ff',             // Azul claro (fondo suave)
    backgroundSecondaryColor: '#c0d9e7',    // Azul medio (para áreas secundarias)

    accentColor1: '#ffffff',                // Blanco (para áreas destacadas)
    accentColor2: '#336699',                // Azul oscuro (para títulos principales)
    accentColor3: '#6699cc',                // Azul hielo (para subtítulos)

    titleTextColor: '#ffffff',              // Blanco para texto de títulos
    subtitleTextColor: '#b3b3b3',           // Blanco desaturado para texto de subtítulos

    breakpoint: 600,
    maxWidth: 1300
  },
  topBarConfig: {
    transparentOnHomeScrollZero: true
  },
  breakpoint: 600,
  maxWidth: 1300
})

initScrollIntegration()


