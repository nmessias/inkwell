FROM oven/bun:1-debian

# Install dependencies for Playwright Firefox (lighter than Chromium)
RUN apt-get update && apt-get install -y \
    libgtk-3-0 \
    libdbus-glib-1-2 \
    libxt6 \
    libx11-xcb1 \
    libasound2 \
    libpango-1.0-0 \
    libcairo2 \
    libfontconfig1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package.json bun.lockb* ./

# Install dependencies
RUN bun install --frozen-lockfile || bun install

# Install Playwright Firefox browser (uses ~40% less RAM than Chromium)
RUN bunx playwright install firefox

# Copy source code
COPY . .

# Create data directory for SQLite persistence
RUN mkdir -p /app/data

# Make startup script executable
RUN chmod +x /app/scripts/start.sh

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production

# Start with startup script (runs migrations, then starts server)
CMD ["/app/scripts/start.sh"]
