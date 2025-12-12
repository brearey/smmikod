# Бэкенд сервис для записи к стоматологу

start DB
make up

start prod
npm run build && npm run prod

pm2 logs
pm2 monit
pm2 ps
pm2 stop 0
pm2 delete 0

Пример запроса от IDENT:
GET | /GetTickets | dateTimeFrom = 2025-12-16T00:00:00+07:00  | dateTimeTo =2200-01-01T23:59:59+07:00 | limit = undefined | offset = undefined