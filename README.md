# Sunrise Sunset

Aplicación hecha con React y D3, sirve para obtener información sobre la luz solar en determinada localización. Utiliza las coordenadas del usuario o el nombre de cualquier ciudad que se busque para obtener la duración de los crepúsculos astronómico, náutico y civil, del día, horas doradas, medio día y media noche.

Demo: https://sunrise-sunset-data.herokuapp.com/

## API
```/city/```
- GET: Obtiene el nombre del país y/o zona horaria de una ciudad.

```/match_cities/```
- GET: Obtiene un array de 5 ciudades cuyos nombres coinciden con la búsqueda.

## Instalación

Clona el repositorio
```
git clone https://github.com/mateo-agl/sunrise-sunset.git
cd sunrise-sunset
npm install
```

## Scripts

### npm run client
Para iniciar el servidor de desarrollo en http://localhost:3000.

### npm run start
Para iniciar el servidor de producción.

### npm run dev-start
Para iniciar el servidor de desarrollo.

### npm run build
Arma el bundle de la app, que se puede iniciar declarando dentro de un archivo .env `NODE_ENV=production`.
