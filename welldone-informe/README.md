# Generador de Informe Técnico — Welldone

## Deploy en Vercel

1. Sube este proyecto a GitHub (o arrastra la carpeta a vercel.com)
2. Vercel lo detecta automáticamente (sin config extra)
3. Visita la URL generada

## Uso

1. Ingresa tu API Key de Anthropic
2. Sube el PDF de la propuesta comercial
3. Descarga el .pptx con identidad Welldone

## Estructura

```
api/
  generate.js     → Proxy serverless a Claude API (resuelve CORS)
public/
  index.html      → Frontend completo con pptxgenjs
vercel.json       → Configuración de rutas
```
