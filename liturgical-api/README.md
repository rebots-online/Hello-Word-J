# Liturgical API

HTTP API for generating complete liturgical texts (Mass and Breviary) based on dynamic calculations from SQLite database.

## Features

- **Dynamic calculation**: No pre-calculated data, generates liturgical texts on-demand
- **Complete Mass texts**: All parts of the Traditional Latin Mass (1962 Missal)
- **Complete Breviary texts**: All canonical hours
- **Liturgical calendar**: Accurate season and rank calculations
- **RESTful endpoints**: Easy integration with any client application

## API Endpoints

### Calendar
- `GET /calendar/{date}` - Get liturgical calendar information
- `GET /liturgical-year/{date}` - Get liturgical year details

### Mass
- `GET /mass/{date}` - Get complete Mass texts for date

### Breviary
- `GET /breviary/{date}` - Get all breviary hours for date
- `GET /breviary/{date}/{hour}` - Get specific breviary hour

Available hours: `Matins`, `Lauds`, `Prime`, `Terce`, `Sext`, `None`, `Vespers`, `Compline`

### Health
- `GET /health` - API health check

## Usage

```bash
# Start server
npm start

# Test endpoints
curl http://localhost:3000/mass/2025-07-06
curl http://localhost:3000/breviary/2025-07-06/Lauds
curl http://localhost:3000/calendar/2025-07-06
```

## Response Format

All responses include:
- **Latin text**: Original liturgical Latin
- **English translation**: Accurate traditional translation
- **Biblical references**: Scripture citations where applicable
- **Liturgical context**: Season, rank, and calendar information

## Database

Uses SQLite database with dynamic calculation engine. No pre-stored liturgical data - all texts generated based on liturgical rules and calendar calculations.

## Architecture

- **Express server**: HTTP API layer
- **LiturgicalEngine**: Core calculation logic
- **SQLite database**: Text storage and retrieval
- **Dynamic calculation**: Real-time liturgical determinations