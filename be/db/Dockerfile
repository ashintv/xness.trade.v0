
FROM timescale/timescaledb:2.15.1-pg15
WORKDIR /app
COPY . .
RUN  psql -U postgres -d xnessdbdev < ./init/schema.sql  
EXPOSE 5
