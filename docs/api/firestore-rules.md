# Reglas de seguridad — Firestore

> **Nota:** Aplican mientras se usa Firebase. Al migrar a Supabase, esto se reemplaza por Row Level Security (RLS) de PostgreSQL.

## Reglas por colección

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // === USUARIOS ===
    match /users/{userId} {
      // El usuario puede leer su propio perfil
      // Admin puede leer todos
      allow read: if request.auth.uid == userId
                  || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';

      // Solo el propio usuario o admin pueden escribir
      allow write: if request.auth.uid == userId
                   || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';

      // Nadie puede cambiar el role excepto admin
      allow update: if request.auth.uid == userId
                     && (!request.resource.data.diff(resource.data).affectedKeys().hasAny(['role'])
                     || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }

    // === CATEGORÍAS ===
    match /categories/{categoryId} {
      // Todos los autenticados pueden leer
      allow read: if request.auth != null;

      // Solo admin puede crear/editar/eliminar
      allow write: if request.auth.token.role == 'admin';
    }

    // === PRODUCTOS ===
    match /products/{productId} {
      allow read: if request.auth != null;

      // Solo admin puede CRUD
      allow write: if request.auth.token.role == 'admin';

      // stock nunca puede ser negativo
      allow update: if request.auth.token.role == 'admin'
                    && request.resource.data.stock >= 0;
    }

    // === PEDIDOS ===
    match /orders/{orderId} {
      // Empleado y admin pueden leer todos
      // Cliente solo los suyos
      allow read: if request.auth.token.role in ['admin', 'employee']
                  || resource.data.customerId == request.auth.uid;

      // Cualquier rol autenticado puede crear un pedido
      allow create: if request.auth != null;

      // Admin y employee pueden actualizar estados
      // Cliente solo puede cancelar si está en 'pending'
      allow update: if request.auth.token.role in ['admin', 'employee']
                  || (resource.data.customerId == request.auth.uid
                      && resource.data.status == 'pending'
                      && request.resource.data.status == 'cancelled');

      allow delete: if request.auth.token.role == 'admin';
    }

    // === ORDER ITEMS ===
    match /order_items/{itemId} {
      allow read, write: if request.auth.token.role in ['admin', 'employee'];
    }

    // === DELIVERIES ===
    match /deliveries/{deliveryId} {
      allow read: if request.auth != null;
      allow write: if request.auth.token.role in ['admin', 'employee'];
    }

    // === LOYALTY POINTS ===
    match /loyalty_points/{docId} {
      allow read: if request.auth.uid == resource.data.customerId
                  || request.auth.token.role in ['admin', 'employee'];
      allow write: if request.auth.token.role == 'admin';
    }

    // === POINTS HISTORY ===
    match /points_history/{entryId} {
      allow read, write: if request.auth.token.role in ['admin', 'employee'];
    }

    // === PROMOTIONS ===
    match /promotions/{promotionId} {
      allow read: if request.auth != null;
      allow write: if request.auth.token.role == 'admin';
    }

    // === COUPONS ===
    match /coupons/{couponId} {
      allow read: if request.auth.uid == resource.data.customerId
                  || request.auth.token.role in ['admin', 'employee'];
      allow write: if request.auth.token.role in ['admin', 'employee'];
    }

    // === TRAINING ===
    match /training/{docId} {
      allow read: if request.auth != null;
      allow write: if request.auth.token.role == 'admin';
    }

    // === NOTIFICACIONES ===
    match /notifications/{notificationId} {
      allow read: if request.auth.uid == resource.data.userId;
      allow write: if request.auth.token.role == 'admin';
    }
  }
}
```
