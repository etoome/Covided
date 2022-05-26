<h1 align="center">
    Covided
</h1>

<p align="center">
    Demo covid data visualizer
</p>

<div align="center">
  <img width="325" src="https://github.com/etoome/covided/blob/main/screenshots/login.png">
  <img width="325" src="https://github.com/etoome/covided/blob/main/screenshots/register.png">
</div>

<div align="center">
  <img width="325" src="https://github.com/etoome/covided/blob/main/screenshots/dashboard.png">
</div>

<div align="center">
  <img width="325" src="https://github.com/etoome/covided/blob/main/screenshots/request.png">
</div>

# Development

## Generate database

```bash
python3 docker/static/csv_to_sql.py
```

## Create and start containers

```bash
docker-compose -f docker/docker-compose.yaml up
```

## Connect to the app container

Go to http://localhost:3000
