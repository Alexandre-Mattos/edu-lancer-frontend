# API Documentation - Blaster Node.js API

## Base URL

```
https://your-domain.com/api/v1
```

## Autenticação

A maioria dos endpoints requer autenticação via Bearer Token no header:

```
Authorization: Bearer {token}
```

---

## 📋 Índice

- [Autenticação](#autenticação-endpoints)
- [Usuários](#usuários)
- [Empresas](#empresas)
- [Papéis (Roles)](#papéis-roles)
- [Permissões](#permissões)
- [Pessoas](#pessoas)
- [Estudantes](#estudantes)
- [Lições](#lições)
- [Aulas (Classes)](#aulas-classes)
- [Notas](#notas)
- [Propriedades](#propriedades)
- [Reservas (Bookings)](#reservas-bookings)

---

## Autenticação Endpoints

### POST /auth/login

**Descrição:** Realiza login e retorna token de autenticação  
**Autenticação:** Não requerida

**Request Body:**

```typescript
{
  email: string; // Email válido
  password: string; // Senha (mínimo 1 caractere)
}
```

**Response (200):**

```typescript
{
  bearerToken: string;
  refreshToken: string;
  expiresAt: string;
}
```

---

### GET /auth/authenticated-user

**Descrição:** Retorna dados do usuário autenticado  
**Autenticação:** Requerida

**Response (200):**

```typescript
{
  id: string;
  email: string;
  companyId: string;
  roleId: string;
  personId: string;
  person?: {
    name: string;
    document: string;
    // ... outros campos
  };
  company?: {
    corporateName: string;
    fantasyName: string;
    // ... outros campos
  };
  role?: {
    name: string;
    description: string;
    // ... outros campos
  };
}
```

---

## Usuários

### POST /users

**Descrição:** Cria novo usuário  
**Autenticação:** Requerida  
**Permissão:** `user:create`

**Request Body:**

```typescript
{
  email: string;                    // Email válido
  password: string;                 // Mínimo 6 caracteres
  companyId: string;                // UUID da empresa
  roleId: string;                   // UUID do papel
  person: {
    name: string;                   // Mínimo 2 caracteres
    document: string;               // Mínimo 11 caracteres (CPF/CNPJ)
    birthDate?: Date;
    gender?: string;
    nationality?: string;
    maritalStatus?: string;
    occupation?: string;
    contacts: Array<{
      type: "EMAIL" | "PHONE" | "MOBILE" | "WHATSAPP" | "OTHER";
      value: string;
      isMain?: boolean;             // Default: false
    }>;
    address: Array<{
      street: string;               // Mínimo 2 caracteres
      number: string;
      complement?: string;
      neighborhood: string;         // Mínimo 2 caracteres
      city: string;                 // Mínimo 2 caracteres
      state: string;                // Mínimo 2 caracteres
      country: string;              // Mínimo 2 caracteres
      zipCode: string;              // Mínimo 5 caracteres
      isMain?: boolean;             // Default: false
    }>;
  };
}
```

**Response (201):**

```typescript
{
  id: string;
  email: string;
  companyId: string;
  roleId: string;
  personId: string;
  createdAt: Date;
  message: "Usuário criado com sucesso";
}
```

---

### GET /users

**Descrição:** Lista usuários  
**Autenticação:** Requerida  
**Permissão:** `user:read`

**Query Parameters:**

```typescript
{
  page?: number;         // Default: 1
  pageSize?: number;     // Default: 10
  email?: string;
  companyId?: string;
  roleId?: string;
}
```

**Response (200):**

```typescript
{
  data: Array<{
    id: string;
    email: string;
    companyId: string;
    roleId: string;
    personId: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
```

---

## Empresas

### POST /companies

**Descrição:** Cria nova empresa  
**Autenticação:** Requerida  
**Permissão:** `company:create`

**Request Body:**

```typescript
{
  corporateName: string;       // Mínimo 3 caracteres
  fantasyName: string;         // Mínimo 2 caracteres
  document: string;            // Mínimo 11 caracteres (CNPJ)
  isActive?: boolean;          // Default: true
  isMainCompany?: boolean;     // Default: false
}
```

**Response (201):**

```typescript
{
  id: string;
  corporateName: string;
  fantasyName: string;
  document: string;
  isActive: boolean;
  isMainCompany: boolean;
  createdAt: Date;
  message: "Empresa criada com sucesso";
}
```

---

### PUT /companies/:id

**Descrição:** Atualiza empresa  
**Autenticação:** Requerida  
**Permissão:** `company:update`

**Request Body:**

```typescript
{
  corporateName?: string;      // Mínimo 3 caracteres
  fantasyName?: string;        // Mínimo 2 caracteres
  document?: string;           // Mínimo 11 caracteres
  isActive?: boolean;
  isMainCompany?: boolean;
}
```

**Response (200):**

```typescript
{
  message: "Empresa atualizada com sucesso";
  data: {
    id: string;
    // ... campos atualizados
  }
}
```

---

### POST /companies/subsidiary

**Descrição:** Adiciona subsidiária a uma empresa  
**Autenticação:** Requerida  
**Permissão:** `company:manage`

**Request Body:**

```typescript
{
  parentId: string;                  // UUID da empresa principal
  subsidiary: {
    corporateName: string;           // Mínimo 3 caracteres
    fantasyName: string;             // Mínimo 2 caracteres
    document: string;                // Mínimo 11 caracteres
    isActive?: boolean;              // Default: true
  };
}
```

---

### DELETE /companies/subsidiary

**Descrição:** Remove subsidiária de uma empresa  
**Autenticação:** Requerida  
**Permissão:** `company:manage`

**Request Body:**

```typescript
{
  parentId: string; // UUID da empresa principal
  subsidiaryId: string; // UUID da subsidiária
}
```

---

### GET /companies/:id/subsidiaries

**Descrição:** Lista subsidiárias de uma empresa  
**Autenticação:** Requerida  
**Permissão:** `company:read`

**Response (200):**

```typescript
{
  data: Array<{
    id: string;
    corporateName: string;
    fantasyName: string;
    document: string;
    isActive: boolean;
    parentId: string;
  }>;
}
```

---

## Papéis (Roles)

### POST /roles

**Descrição:** Cria novo papel  
**Autenticação:** Requerida  
**Permissão:** `role:create`

**Request Body:**

```typescript
{
  name: string;
  description?: string;
  type?: string;
  companyId?: string;
  subsidiaryId?: string;
}
```

---

### GET /roles

**Descrição:** Lista papéis  
**Autenticação:** Requerida  
**Permissão:** `role:read`

---

### GET /roles/:id

**Descrição:** Busca papel por ID  
**Autenticação:** Requerida  
**Permissão:** `role:read`

---

### PUT /roles/:id

**Descrição:** Atualiza papel  
**Autenticação:** Requerida  
**Permissão:** `role:update`

---

### DELETE /roles/:id

**Descrição:** Deleta papel (soft delete)  
**Autenticação:** Requerida  
**Permissão:** `role:delete`

---

### POST /roles/:id/restore

**Descrição:** Restaura papel deletado  
**Autenticação:** Requerida  
**Permissão:** `role:restore`

---

### POST /roles/:id/permissions

**Descrição:** Adiciona permissão a um papel  
**Autenticação:** Requerida  
**Permissões:** `permission:create` e `role:update`

---

## Permissões

### POST /permissions

**Descrição:** Cria nova permissão  
**Autenticação:** Requerida  
**Permissão:** `permission:create`

**Request Body:**

```typescript
{
  moduleId: string;
  name: string;
  description?: string;
  action: string;
}
```

---

## Pessoas

### POST /persons

**Descrição:** Cria nova pessoa  
**Autenticação:** Requerida  
**Permissão:** `person:create`

**Request Body:**

```typescript
{
  name: string;                    // Mínimo 2 caracteres
  document: string;                // Mínimo 11 caracteres
  birthDate?: Date;
  gender?: string;
  nationality?: string;
  maritalStatus?: string;
  occupation?: string;
  companyId: string;               // UUID
  contacts: Array<{
    type: "EMAIL" | "PHONE" | "MOBILE" | "WHATSAPP" | "OTHER";
    value: string;
    isMain?: boolean;
  }>;
  address: Array<{
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    isMain?: boolean;
  }>;
}
```

---

### GET /persons

**Descrição:** Lista pessoas  
**Autenticação:** Requerida  
**Permissão:** `person:list`

**Query Parameters:**

```typescript
{
  name?: string;
  document?: string;
  companyId?: string;
}
```

---

### GET /persons/:id

**Descrição:** Busca pessoa por ID  
**Autenticação:** Requerida  
**Permissão:** `person:read`

---

### PUT /persons/:id

**Descrição:** Atualiza pessoa  
**Autenticação:** Requerida  
**Permissão:** `person:update`

**Request Body:** Mesmos campos do POST, todos opcionais

---

### DELETE /persons/:id

**Descrição:** Deleta pessoa (soft delete)  
**Autenticação:** Requerida  
**Permissão:** `person:delete`

---

### POST /persons/:id/restore

**Descrição:** Restaura pessoa deletada  
**Autenticação:** Requerida  
**Permissão:** `person:restore`

---

## Estudantes

### POST /students

**Descrição:** Cria novo estudante  
**Autenticação:** Requerida

**Request Body:**

```typescript
{
  personId: string; // UUID da pessoa
  teacherId: string; // UUID do professor (usuário)
  companyId: string; // UUID da empresa
  level: string; // Nível do estudante
  progress: string; // Progresso do estudante
}
```

**Response (201):**

```typescript
{
  id: string;
  personId: string;
  teacherId: string;
  companyId: string;
  level: string;
  progress: string;
  createdAt: Date;
  message: "Estudante criado com sucesso";
}
```

---

### GET /students

**Descrição:** Lista estudantes  
**Autenticação:** Requerida

**Query Parameters:**

```typescript
{
  teacherId?: string;
  companyId?: string;
  level?: string;
  page?: number;
  pageSize?: number;
}
```

---

### GET /students/:id

**Descrição:** Busca estudante por ID  
**Autenticação:** Requerida

---

### PUT /students/:id

**Descrição:** Atualiza estudante  
**Autenticação:** Requerida

**Request Body:**

```typescript
{
  personId?: string;
  teacherId?: string;
  companyId?: string;
  level?: string;
  progress?: string;
}
```

---

### DELETE /students/:id

**Descrição:** Deleta estudante (soft delete)  
**Autenticação:** Requerida

---

## Lições

### POST /lessons

**Descrição:** Cria nova lição  
**Autenticação:** Requerida

**Request Body:**

```typescript
{
  userId: string;          // UUID do professor
  studentId: string;       // UUID do estudante
  companyId: string;       // UUID da empresa
  title: string;           // Título da lição
  description: string;     // Descrição da lição
  level: string;           // Nível da lição
  materials?: string[];    // Array de materiais (default: [])
}
```

**Response (201):**

```typescript
{
  id: string;
  userId: string;
  studentId: string;
  companyId: string;
  title: string;
  description: string;
  level: string;
  materials: string[];
  createdAt: Date;
  message: "Lição criada com sucesso";
}
```

---

## Aulas (Classes)

### POST /classes

**Descrição:** Cria nova aula  
**Autenticação:** Requerida

**Request Body:**

```typescript
{
  userId: string;              // UUID do professor
  studentId: string;           // UUID do estudante
  lessonId: string;            // UUID da lição
  companyId: string;           // UUID da empresa
  date: Date;                  // Data da aula
  time: string;                // Horário (formato: HH:MM)
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  googleEventId?: string;      // ID do evento no Google Calendar
}
```

**Response (201):**

```typescript
{
  id: string;
  userId: string;
  studentId: string;
  lessonId: string;
  companyId: string;
  date: Date;
  time: string;
  status: string;
  googleEventId?: string;
  createdAt: Date;
  message: "Aula criada com sucesso";
}
```

---

### GET /classes

**Descrição:** Lista aulas  
**Autenticação:** Requerida

**Query Parameters:**

```typescript
{
  userId?: string;
  studentId?: string;
  lessonId?: string;
  companyId?: string;
  status?: ("SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED")[];
  dateFrom?: string;           // ISO 8601 format
  dateTo?: string;             // ISO 8601 format
}
```

---

### GET /classes/:id

**Descrição:** Busca aula por ID  
**Autenticação:** Requerida

---

### DELETE /classes/:id

**Descrição:** Deleta aula (soft delete)  
**Autenticação:** Requerida

---

## Notas

### POST /notes

**Descrição:** Cria nova nota  
**Autenticação:** Requerida

**Request Body:**

```typescript
{
  userId: string; // UUID do professor
  classId: string; // UUID da aula
  studentId: string; // UUID do estudante
  companyId: string; // UUID da empresa
  content: string; // Conteúdo da nota
}
```

**Response (201):**

```typescript
{
  id: string;
  userId: string;
  classId: string;
  studentId: string;
  companyId: string;
  content: string;
  createdAt: Date;
  message: "Nota criada com sucesso";
}
```

---

## Propriedades

### POST /properties

**Descrição:** Cria nova propriedade  
**Autenticação:** Requerida  
**Permissão:** `property:create`

**Request Body:**

```typescript
{
  name: string;
  description?: string;
  propertyType: "APARTMENT" | "HOUSE" | "ROOM" | "STUDIO";
  rentalType: "DAILY" | "MONTHLY" | "BOTH";
  companyId: string;
  maxGuests: number;              // Mínimo 1
  bedrooms: number;               // Mínimo 1
  bathrooms: number;              // Mínimo 1
  area?: number;                  // Em m²
  dailyRate?: number;             // Valor por dia
  monthlyRate?: number;           // Valor por mês
  cleaningFee?: number;           // Taxa de limpeza
  securityDeposit?: number;       // Depósito caução
  isActive?: boolean;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
}
```

**Response (201):**

```typescript
{
  message: "Propriedade criada com sucesso";
  data: {
    id: string;
    name: string;
    propertyType: string;
    rentalType: string;
    companyId: string;
    isActive: boolean;
    createdAt: Date;
  }
}
```

---

### GET /properties

**Descrição:** Lista propriedades  
**Autenticação:** Requerida  
**Permissão:** `property:read`

**Query Parameters:**

```typescript
{
  companyId?: string;
  propertyType?: "APARTMENT" | "HOUSE" | "ROOM" | "STUDIO";
  rentalType?: "DAILY" | "MONTHLY" | "BOTH";
  city?: string;
  state?: string;
  minPrice?: number;
  maxPrice?: number;
  minGuests?: number;
  maxGuests?: number;
  isActive?: boolean;
}
```

---

### GET /properties/:id

**Descrição:** Busca propriedade por ID  
**Autenticação:** Requerida  
**Permissão:** `property:read`

---

### PUT /properties/:id

**Descrição:** Atualiza propriedade  
**Autenticação:** Requerida  
**Permissão:** `property:update`

**Request Body:** Mesmos campos do POST, todos opcionais

---

### DELETE /properties/:id

**Descrição:** Deleta propriedade (soft delete)  
**Autenticação:** Requerida  
**Permissão:** `property:delete`

---

### PATCH /properties/:id/restore

**Descrição:** Restaura propriedade deletada  
**Autenticação:** Requerida  
**Permissão:** `property:update`

---

### GET /properties/:id/availability/check

**Descrição:** Verifica disponibilidade da propriedade  
**Autenticação:** Requerida  
**Permissão:** `property:read`

**Query Parameters:**

```typescript
{
  startDate: Date;                // Data de início
  endDate: Date;                  // Data de fim
  excludeBookingId?: string;      // UUID da reserva a excluir da verificação
}
```

**Response (200):**

```typescript
{
  available: boolean;
  conflictingBookings?: Array<{
    id: string;
    checkInDate: Date;
    checkOutDate: Date;
    status: string;
  }>;
}
```

---

### POST /properties/:id/images

**Descrição:** Faz upload de uma imagem da propriedade  
**Autenticação:** Requerida  
**Permissão:** `property:update`  
**Content-Type:** `multipart/form-data`

**Form Data:**

```typescript
{
  file: File;              // Arquivo de imagem
  caption?: string;        // Legenda da imagem
  order?: number;          // Ordem de exibição (default: 0)
  isMain?: boolean;        // É imagem principal? (default: false)
}
```

---

### POST /properties/:id/images/multiple

**Descrição:** Faz upload de múltiplas imagens da propriedade  
**Autenticação:** Requerida  
**Permissão:** `property:update`  
**Content-Type:** `multipart/form-data`

**Form Data:**

```typescript
{
  files: File[];           // Array de arquivos de imagem
}
```

---

### DELETE /properties/:id/images/:imageId

**Descrição:** Deleta imagem da propriedade  
**Autenticação:** Requerida  
**Permissão:** `property:update`

---

## Reservas (Bookings)

### POST /bookings

**Descrição:** Cria nova reserva  
**Autenticação:** Requerida  
**Permissão:** `booking:create`

**Request Body:**

```typescript
{
  propertyId: string;
  guestPersonId: string;
  companyId: string;
  checkInDate: Date;
  checkOutDate: Date;
  checkInTime?: string;
  checkOutTime?: string;
  guests: number;                    // Mínimo 1
  totalAmount: number;               // Deve ser positivo
  cleaningFee?: number;
  securityDeposit?: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "IN_PROGRESS";
  paymentStatus: "PENDING" | "PARTIAL" | "PAID" | "REFUNDED";
  specialRequests?: string;
  notes?: string;
}
```

**Response (201):**

```typescript
{
  message: "Reserva criada com sucesso";
  data: {
    id: string;
    propertyId: string;
    guestPersonId: string;
    companyId: string;
    checkInDate: Date;
    checkOutDate: Date;
    guests: number;
    totalAmount: number;
    status: string;
    paymentStatus: string;
    numberOfNights: number;
    createdAt: Date;
  }
}
```

---

### GET /bookings

**Descrição:** Lista reservas  
**Autenticação:** Requerida  
**Permissão:** `booking:read`

**Query Parameters:**

```typescript
{
  propertyId?: string;
  guestPersonId?: string;
  companyId?: string;
  status?: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "IN_PROGRESS";
  paymentStatus?: "PENDING" | "PARTIAL" | "PAID" | "REFUNDED";
  checkInDateFrom?: Date;
  checkInDateTo?: Date;
  checkOutDateFrom?: Date;
  checkOutDateTo?: Date;
}
```

---

### GET /bookings/:id

**Descrição:** Busca reserva por ID  
**Autenticação:** Requerida  
**Permissão:** `booking:read`

---

### PUT /bookings/:id

**Descrição:** Atualiza reserva  
**Autenticação:** Requerida  
**Permissão:** `booking:update`

**Request Body:**

```typescript
{
  checkInDate?: Date;
  checkOutDate?: Date;
  checkInTime?: string;
  checkOutTime?: string;
  guests?: number;
  totalAmount?: number;
  cleaningFee?: number;
  securityDeposit?: number;
  status?: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "IN_PROGRESS";
  paymentStatus?: "PENDING" | "PARTIAL" | "PAID" | "REFUNDED";
  specialRequests?: string;
  notes?: string;
}
```

---

### PATCH /bookings/:id/cancel

**Descrição:** Cancela reserva  
**Autenticação:** Requerida  
**Permissão:** `booking:update`

**Request Body:**

```typescript
{
  reason?: string;         // Motivo do cancelamento
}
```

---

### PATCH /bookings/:id/confirm

**Descrição:** Confirma reserva  
**Autenticação:** Requerida  
**Permissão:** `booking:update`

---

## Enums de Referência

### ContactType

```typescript
enum ContactType {
  EMAIL = "EMAIL",
  PHONE = "PHONE",
  MOBILE = "MOBILE",
  WHATSAPP = "WHATSAPP",
  OTHER = "OTHER",
}
```

### PropertyType

```typescript
enum PropertyType {
  APARTMENT = "APARTMENT",
  HOUSE = "HOUSE",
  ROOM = "ROOM",
  STUDIO = "STUDIO",
}
```

### RentalType

```typescript
enum RentalType {
  DAILY = "DAILY",
  MONTHLY = "MONTHLY",
  BOTH = "BOTH",
}
```

### BookingStatus

```typescript
enum BookingStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
  IN_PROGRESS = "IN_PROGRESS",
}
```

### PaymentStatus

```typescript
enum PaymentStatus {
  PENDING = "PENDING",
  PARTIAL = "PARTIAL",
  PAID = "PAID",
  REFUNDED = "REFUNDED",
}
```

### ClassStatus

```typescript
enum ClassStatus {
  SCHEDULED = "SCHEDULED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}
```

---

## Códigos de Erro Comuns

| Código | Descrição                                                 |
| ------ | --------------------------------------------------------- |
| 400    | Bad Request - Dados inválidos ou faltando                 |
| 401    | Unauthorized - Token inválido ou expirado                 |
| 403    | Forbidden - Sem permissão para acessar o recurso          |
| 404    | Not Found - Recurso não encontrado                        |
| 409    | Conflict - Conflito de recursos (ex: email já cadastrado) |
| 500    | Internal Server Error - Erro no servidor                  |

---

## Estrutura de Resposta de Erro

```typescript
{
  status: "error";
  message: string;
  code?: string;
  errors?: Array<{
    path: string;
    message: string;
  }>;
}
```

---

## Paginação

Endpoints que retornam listas usam a seguinte estrutura de paginação:

**Request:**

```typescript
{
  page?: number;        // Default: 1
  pageSize?: number;    // Default: 10
}
```

**Response:**

```typescript
{
  data: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
```
