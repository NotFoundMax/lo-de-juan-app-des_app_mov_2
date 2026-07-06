# Arquitectura general

## Diagrama de contexto (C4 Nivel 1)

```mermaid
graph TB
    subgraph "Sistema Lo de Juan"
        APP["App Móvil + Web<br/>React Native + Expo"]
    end

    ADMIN["👤 Administrador<br/>(dueño/gerente)"]
    EMPLOYEE["👤 Empleado<br/>(mostrador/cocina)"]
    CUSTOMER["👤 Cliente<br/>(comprador final)"]

    ADMIN -->|Gestiona| APP
    EMPLOYEE -->|Opera POS| APP
    CUSTOMER -->|Compra y sigue pedidos| APP

    APP -->|Auth + DB + Realtime| SUPABASE[("Supabase<br/>(Auth, Postgres, Realtime, Storage)")]
    APP -->|Pagos| GATEWAY["Pasarela de pagos<br/>(Yape, Plin, Tarjetas)"]
```

## Diagrama de contenedores (C4 Nivel 2)

```mermaid
graph TB
    subgraph "Cliente"
        MOBILE["App React Native<br/>Expo<br/>Android + iOS"]
        WEB["App Web<br/>Expo + React Native Web"]
    end

    subgraph "Backend (Supabase)"
        PG[("PostgreSQL<br/>Base de datos SQL")]
        AUTH["Auth Service<br/>Email + Magic Link"]
        REALTIME["Realtime Service<br/>WebSockets + Push"]
        STORAGE["Storage Service<br/>Imágenes + PDFs"]
        EDGE["Edge Functions<br/>Lógica del backend"]
    end

    subgraph "Externo"
        YAPE["Yape API<br/>Pagos móviles"]
        PLIN["Plin API<br/>Pagos interoperables"]
        TARJETAS["Gateway Tarjetas<br/>Visa / Mastercard"]
    end

    MOBILE -->|HTTP / WebSocket| AUTH
    MOBILE -->|SQL queries| PG
    MOBILE -->|Suscribe| REALTIME
    MOBILE -->|Upload/Download| STORAGE

    WEB -->|HTTP / WebSocket| AUTH
    WEB -->|SQL queries| PG
    WEB -->|Suscribe| REALTIME
    WEB -->|Upload/Download| STORAGE

    EDGE -->|Webhook| YAPE
    EDGE -->|Webhook| PLIN
    EDGE -->|API REST| TARJETAS
```

## Stack tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| **Frontend** | React Native + Expo | 0.81 / 54 |
| **Estilos** | NativeWind + Tailwind CSS | 4.2 / 3.4 |
| **Backend** | Supabase (PostgreSQL) | — |
| **Auth** | Supabase Auth | Email + Magic Link |
| **Base de datos** | PostgreSQL (Supabase) | — |
| **Realtime** | Supabase Realtime | WebSockets |
| **Storage** | Supabase Storage | Imágenes y PDFs |
| **Pagos** | Yape + Plin + Gateway | — |
