# URL Shortener Microservice

A modern DevOps gyakorlatokat demonstráló URL Shortener microservice projekt, amely teljes körű containerizált architektúrát és monitoring megoldásokat tartalmaz.

## 🏗️ Architektúra

### Microservices
- **Frontend** (React + Tailwind CSS) - Modern felhasználói felület
- **URL Shortener Service** (Node.js) - URL rövidítés és kezelés
- **Redirect Service** (Node.js) - Rövid URL-ek átirányítása
- **Analytics Service** (Node.js) - Statisztikák és analytics

### Infrastruktúra
- **PostgreSQL** - Fő adatbázis
- **Redis** - Cache és session kezelés
- **Nginx** - Reverse proxy és load balancer
- **Prometheus** - Metrikák gyűjtése
- **Grafana** - Monitoring dashboard

## 🚀 Gyors Indítás

### Docker (Ajánlott)
```bash
# Klónozd a repository-t
git clone https://github.com/joobadam/microservice_projekt.git
cd microservice_projekt

# Indítsd el az összes szolgáltatást
docker-compose up -d

# Alkalmazás elérése: http://localhost
```

### Lokális Fejlesztés
```bash
# Frontend indítása
cd frontend && npm install && npm start

# Backend szolgáltatások indítása (külön terminálokban)
cd shortener-service && npm install && npm start
cd redirect-service && npm install && npm start
cd analytics-service && npm install && npm start
```

## 🌐 Szolgáltatások

| Szolgáltatás | Port | Leírás |
|-------------|------|--------|
| Frontend | 80 | React alkalmazás |
| URL Shortener | 5000 | API szolgáltatás |
| Redirect | 5001 | Átirányítás |
| Analytics | 5002 | Statisztikák |
| PostgreSQL | 5432 | Adatbázis |
| Redis | 6379 | Cache |
| Prometheus | 9090 | Monitoring |
| Grafana | 3000 | Dashboard |

## 🎨 Design Funkciók

- **Modern Glassmorphism Design** - Üvegszerű átlátszó elemek
- **WebGL Animáció** - FaultyTerminal háttér animáció
- **Responsive Layout** - Minden eszközön tökéletes
- **Dark Theme** - Piros terminal stílus
- **Minimalista UI** - Ikon-mentes, tiszta design

## 📊 Monitoring

- **Prometheus:** http://localhost:9090
- **Grafana:** http://localhost:3000 (admin/admin123)

## 🛠️ Technológiai Stack

### Frontend
- React 18
- Tailwind CSS
- WebGL (OGL library)
- Axios

### Backend
- Node.js 18
- Express.js
- PostgreSQL
- Redis
- Nginx

### DevOps
- Docker & Docker Compose
- Prometheus & Grafana
- Health Checks
- Multi-stage builds

## 📁 Projekt Struktúra

```
microservice_projekt/
├── frontend/                 # React alkalmazás
├── shortener-service/        # URL rövidítés API
├── redirect-service/         # Átirányítás szolgáltatás
├── analytics-service/        # Analytics API
├── nginx/                    # Reverse proxy konfig
├── monitoring/               # Prometheus & Grafana
├── docker-compose.yml        # Orchestration
└── DOCKER.md                 # Docker dokumentáció
```

## 🔧 Fejlesztés

### Docker Környezet
```bash
# Szolgáltatások újraépítése
docker-compose build

# Logok megtekintése
docker-compose logs -f

# Container belépés
docker-compose exec shortener-service sh
```

### Lokális Környezet
```bash
# Mock adatbázis használata
# A szolgáltatások automatikusan mock implementációkat használnak
# Adatok: simple-db.json fájlban tárolódnak
```

## 📚 Dokumentáció

- [Docker Setup](DOCKER.md) - Részletes Docker dokumentáció
- [API Documentation](docs/api.md) - API endpoint dokumentáció
- [Deployment Guide](docs/deployment.md) - Production deployment

## 🤝 Közreműködés

1. Fork a repository-t
2. Készíts egy feature branch-et (`git checkout -b feature/amazing-feature`)
3. Commit a változtatásokat (`git commit -m 'Add amazing feature'`)
4. Push a branch-re (`git push origin feature/amazing-feature`)
5. Nyiss egy Pull Request-et

## 📄 Licenc

Ez a projekt MIT licenc alatt áll. Lásd a [LICENSE](LICENSE) fájlt részletekért.

## 👨‍💻 Szerző

**Adam** - DevOps Portfolio Project

---

⭐ Ha tetszik a projekt, adj egy csillagot!
