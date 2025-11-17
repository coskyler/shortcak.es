# shortcak.es

shortcak.es doesn’t just shorten links — it gives you deep insight into how they’re used.

A modern, analytics-focused URL shortener built on the **MERN stack** with a **React + Vite + Tailwind** frontend, a **Node/Express** backend, **MongoDB**, and **Firebase Authentication**.
Fully Dockerized and served via Nginx on the same origin for reliability, speed, and scalability.

---

## Features

- **Fast URL Shortening**
  - Create branded short links
  - Asynchronous analytics for fast redirects

- **Rich Analytics**
  - Total clicks per link
  - Unique clicks (cookie-based)
  - Clicks by device (mobile / desktop / tablet / other)
  - Referrer breakdown (traffic sources)
  - Region breakdown (country/region)
  - Daily click-history timeseries (clicks per day)

- **Dashboard**
  - View aggregated data across all links
  - Sort and inspect key metrics quickly
  - Drill into each link’s analytics in detail

- **Authentication**
  - Email/password signup & login
  - Email verification flow
  - Password reset via email
  - Protected dashboards & APIs

---

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS  
- **Backend:** Node.js, Express  
- **Database:** MongoDB  
- **Auth:** Firebase Authentication  
- **Infrastructure:**  
  - Docker for backend containers  
  - Nginx reverse proxy (same-origin serving)  
  - Cookie-based unique visitor tracking  
  - RESTful JSON APIs  