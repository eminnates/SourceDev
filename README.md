# SourceDev

SourceDev; geliştiricilerin blog yazıları yayınlayıp etkileşim kurabildiği, GitHub OAuth destekli, Next.js + .NET 9.0 tabanlı uçtan uca bir içerik platformudur. Bu döküman projeyi GitHub’da yayınlarken ihtiyaç duyacağınız teknik özet, mimari kararlar, ortam değişkenleri ve API yüzeyini bir arada sunar.

## Genel Bakış

- **Amaç:** Topluluk yazıları, etiketler, yorumlar ve reaksiyonlar etrafında sosyal bir deneyim sağlamak.
- **Katmanlar:** Next.js 16 App Router ile SSR/ISR ön yüz, ASP.NET Core 9.0 ile REST API, SQL Server veri katmanı.
- **Güvenlik:** ASP.NET Identity + JWT kimlik doğrulama, token blacklist, role-based admin uçları, dinamik CORS.
- **Üretkenlik:** AutoMapper, FluentValidation, Repository + Unit of Work, özel logging/exception middleware’leri.

## Teknik Yığın

| Katman | Teknolojiler |
| --- | --- |
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS 4, Axios |
| Backend | ASP.NET Core 9.0, Entity Framework Core 9, ASP.NET Identity, AutoMapper, FluentValidation |
| Veri | SQL Server, EF Core Code First + göçler (`Migrations/`) |
| DevOps | DotNetEnv ile `.env`, OpenAPI (development’ta `/swagger`), JWT tabanlı auth |

## Klasör Yapısı

```
SourceDev/
├─ backend/SourceDev.API/        # ASP.NET Core REST API
│  ├─ Controllers/               # Auth, Post, Comment, Reaction, Tag, Follow, Admin, Users
│  ├─ Services/, Repositories/   # Domain servisleri + Unit of Work
│  ├─ DTOs/, Validators/         # Taşıyıcı modeller + FluentValidation kuralları
│  ├─ Middlewares/               # Logging, Exception, Dynamic CORS
│  └─ Migrations/                # EF Core migration dosyaları
└─ frontend/                     # Next.js uygulaması
   ├─ app/                       # App Router sayfaları (dashboard, latest, tag/[slug], vb.)
   ├─ components/                # Bölünmüş UI parçaları
   └─ utils/api/                 # Axios tabanlı API istemcileri
```

## Kurulum ve Çalıştırma

### 1. Gereksinimler

- .NET 9 SDK
- Node.js 20+ (Next.js 16 için)
- SQL Server örneği (lokal ya da uzak)

### 2. Ortam Değişkenleri

Backend (`backend/SourceDev.API/env.example.txt`):

```
CONNECTION_STRING=Server=localhost;Database=SourceDev;User Id=...;
JWT_SECRET_KEY=super-secret
JWT_ISSUER=SourceDev
JWT_AUDIENCE=SourceDevAudience
JWT_EXPIRATION_MINUTES=60
ALLOWED_ORIGINS=http://localhost:3000
ASPNETCORE_ENVIRONMENT=Development
```

Frontend (`frontend/env.example.txt`):

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GITHUB_OAUTH_REDIRECT=http://localhost:3000/api/oauth/github/callback
GITHUB_OAUTH_PEPPER=random-string
```

Örnek dosyaları kopyalayıp değerleri doldurun:

```bash
cp backend/SourceDev.API/env.example.txt backend/SourceDev.API/.env
cp frontend/env.example.txt frontend/.env.local
```

### 3. Backend’i Çalıştırma

```bash
cd backend/SourceDev.API
dotnet ef database update   # ilk kurulumda
dotnet run                  # API varsayılan olarak http://localhost:5000
```

- EF Core `AppDbContext` SQL Server’a bağlanır, global `NoTracking` ve 60 sn komut timeout’u aktiftir.
- `MiddlewareExtensions` üzerinden logging, hata ve dinamik CORS sırasıyla devreye alınır.
- Development ortamında `app.MapOpenApi()` ile Swagger/OpenAPI yayına çıkar.

### 4. Frontend’i Çalıştırma

```bash
cd frontend
npm install
npm run dev      # http://localhost:3000
```

- `NEXT_PUBLIC_API_URL` mutlaka backend taban URL’sine işaret etmeli.
- GitHub OAuth akışı `app/api/oauth/github` route’ları üzerinden yürütülür.

## API Yapısı

Tüm uçlar `api/<controller>` kalıbıyla versiyonlanmamış REST uçlarıdır. JWT gerektiren uçlarda `Authorization: Bearer <token>` zorunludur. Seçilmiş uçlar:

### AuthController (`/api/auth`)

| HTTP | Route | Açıklama |
| --- | --- | --- |
| POST | `/register` | Yeni kullanıcı kaydı (`RegisterDto`) |
| POST | `/login` | E-posta/kullanıcı adı + parola ile giriş |
| POST | `/change-password` | Mevcut parolayı değiştirir (auth) |
| POST | `/validate-token` | Raw JWT doğrulaması |
| POST | `/logout` | Token’ı blacklist’e ekler |
| GET  | `/profile` | Token’dan gelen temel profil verisi |
| PUT  | `/profile` | Profil bilgilerini günceller |

### PostController (`/api/post`)

| HTTP | Route | Açıklama |
| --- | --- | --- |
| GET | `/{id}` / `/slug/{slug}` | Post detayları (anonim) |
| GET | `/latest`, `/top`, `/relevant` | Listeleme/paging uçları |
| GET | `/user/{userId}`, `/tag/{tagSlug}` | Kullanıcı veya etikete göre filtre |
| GET | `/drafts`, `/bookmarks` | Auth kullanıcının taslakları/kayıtlıları |
| POST | `/` | `CreatePostDto` ile yeni post |
| PUT | `/{id}` | Post güncelleme; ayrıca `/publish`, `/unpublish` |
| DELETE | `/{id}` | Post silme |
| POST | `/{id}/like`, `/{id}/save` | Like/bookmark toggle |
| POST | `/{id}/tags` | Post’a etiket ekleme |
| DELETE | `/{id}/tags/{tagId}` | Etiket kaldırma |
| GET | `/search?query=` | Tam metin arama, sayfalama limitleri var |

### CommentController (`/api/comment`)

| HTTP | Route | Açıklama |
| --- | --- | --- |
| GET | `/post/{postId}` | Yorum listesi, sayfalama |
| GET | `/post/{postId}/count` | Toplam yorum |
| POST | `/post/{postId}` | Yeni yorum / yanıt (auth) |
| DELETE | `/{commentId}` | Sahiplik kontrolüyle silme |
| GET | `/search?query=` | İçerik araması |

### ReactionController (`/api/reaction`)

| HTTP | Route | Açıklama |
| --- | --- | --- |
| POST | `/post/{postId}` | Reaction toggle (`reactionType` body) |
| DELETE | `/post/{postId}?reactionType=` | Belirli reaksiyonu kaldırma |
| GET | `/post/{postId}/summary` | Reaksiyon toplamları |

### FollowController (`/api/follow`)

| HTTP | Route | Açıklama |
| --- | --- | --- |
| POST | `/{userId}` | Kullanıcıyı takip et |
| DELETE | `/{userId}` | Takibi bırak |
| GET | `/check/{userId}` | Auth kullanıcısı takip ediyor mu |
| GET | `/followers-count/{userId}` | Toplam takipçi |
| GET | `/following-count/{userId}` | Toplam takip edilen |

### TagController (`/api/tag`)

| HTTP | Route | Açıklama |
| --- | --- | --- |
| GET | `/` | Tüm etiketler |
| GET | `/popular?limit=` | En popüler etiketler |
| GET | `/search?query=` | İsim araması |
| GET | `/{id}` / `/name/{name}` | Etiket detayı |

### UsersController (`/api/users`)

| HTTP | Route | Açıklama |
| --- | --- | --- |
| GET | `/` | Tüm kullanıcılar |
| GET | `/active` | Aktif kullanıcılar |
| GET | `/search?query=` | Kullanıcı araması |
| GET | `/{id}` | Kullanıcı profili DTO |

### AdminController (`/api/admin`) *(Yalnızca `Admin` rolü)*

| HTTP | Route | Açıklama |
| --- | --- | --- |
| GET | `/stats` | Dashboard metrikleri |
| GET | `/posts` | Moderasyon listesi (paging, durum filtresi) |
| PUT | `/posts/{id}/approve|reject` | Post durumunu değiştir |
| DELETE | `/posts/{id}` | Kalıcı silme |
| GET | `/users` | Kullanıcı listesi |
| PUT | `/users/{id}/ban|unban` | Ban yönetimi |
| POST | `/users/{id}/roles` | Rol atama (`UpdateUserRoleDto`) |
| DELETE | `/users/{id}/roles/{role}` | Rol kaldırma |

## Ön Uç Route’ları (App Router)

| Route | Açıklama |
| --- | --- |
| `/` | Feed (latest/relevant) |
| `/latest`, `/top`, `/reading-list`, `/drafts` | Hazır liste sayfaları |
| `/post/[id or slug]` | Post detay |
| `/tag/[tagname]`, `/search`, `/discussions`, `/user/[username]` | Topluluk keşfi |
| `/dashboard`, `/create-post`, `/settings` | Auth gerektiren alanlar |
| `/login`, `/register`, `/forgot-password`, `/change-password` | Auth akışı |
| `/api/oauth/github/*` | GitHub OAuth callback ve proxy uçları |

App Router yapısı sayesinde route segmentleri server component olarak render edilir; `utils/api/apiClient.js` dosyası Axios instance’ını `NEXT_PUBLIC_API_URL` üzerinden yapılandırır.

## Kalite ve Geliştirme Notları

- FluentValidation tüm DTO’lara otomatik uygulanır (`builder.Services.AddFluentValidationAutoValidation()`).
- Repository/Service katmanı test yazmayı kolaylaştıracak şekilde soyutlanmıştır (`IUnitOfWork`, `IUserRepository`, vb.).
- `DynamicCorsMiddleware` `.env`’deki `ALLOWED_ORIGINS` değerini runtime’da okuyarak çoklu domain desteği sağlar.
- `TokenBlacklistService` bellek içi çalışır; üretimde dağıtık bir store (Redis) önerilir.
- Migration’lar zaten ekli; yeni değişiklikler için `dotnet ef migrations add <Name>` kullanabilirsiniz.

## Katkı Rehberi

1. Yeni özellik için issue açın veya mevcut bir issue’yu sahiplenin.
2. Backend’de yeni uç eklerken DTO + Validator + Service + Controller katmanlarını beraber güncelleyin.
3. Frontend’de API çağrılarını `utils/api` altına ekleyin, tip güvenliği için ortak yanıt modellerini paylaşın.
4. PR açıklamasında test adımlarını ve ilgili ekran görüntülerini paylaşın.

## Lisans

Bu depo henüz lisanslanmadı. Açık kaynak yapmak istiyorsanız uygun bir lisans dosyası eklemeyi unutmayın.

