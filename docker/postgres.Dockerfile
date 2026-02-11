FROM postgres:16-alpine

# Install additional extensions if needed
RUN apk add --no-cache postgresql-contrib

# Copy custom initialization scripts
COPY ./init-scripts/ /docker-entrypoint-initdb.d/

# Set default environment variables
ENV POSTGRES_USER=admin
ENV POSTGRES_PASSWORD=admin
ENV POSTGRES_DB=lafete-db

EXPOSE 5432