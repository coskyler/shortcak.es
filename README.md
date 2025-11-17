# shortcak.es

shortcak.es doesn’t just shorten links — it gives you deep insight into how they’re used.

A modern, analytics-focused URL shortener built on the **MERN stack** with a **React + Vite + Tailwind** frontend, a **Node/Express** backend, **MongoDB Atlas**, and **Firebase Authentication**.
Fully Dockerized and served via Nginx on the same origin for reliability, speed, and scalability.

---

## Screenshots

<div align="center">
  <table>
    <tr>
      <td align="center">
        <strong>Analytics View</strong><br/>
        <img src="shortcakes_analytics.png" alt="shortcak.es analytics view" width="450"/>
      </td>
      <td align="center">
        <strong>Dashboard</strong><br/>
        <img src="shortcakes_dashboard.png" alt="shortcak.es dashboard" width="450"/>
      </td>
    </tr>
  </table>
</div>

---

## Features

- **Fast URL Shortening**
  - Create branded short links
  - Asynchronous analytics for fast redirects

- **Rich Analytics**
  - Total clicks per link
  - Unique clicks (cookie-based)
  - Clicks by device (mobile / desktop)
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
- **Database:** MongoDB Atlas  
- **Auth:** Firebase Authentication  
- **Infrastructure:**  
  - Docker for backend containers  
  - Nginx reverse proxy (same-origin serving)  
  - Cookie-based unique visitor tracking  
  - RESTful JSON APIs  