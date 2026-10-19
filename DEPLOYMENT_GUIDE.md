# Ghid de Lansare în Producție — TopinStock Marketplace

Acest ghid conține pașii exacți pentru a publica platforma **TopinStock** pe internet pe propriul tău domeniu (ex: `https://topinstock.ro`).

---

## 1. Modelul de Afaceri Simplificat (E-Commerce Direct cu Posibilitate 0% Comision)

### Este legal comisionul de 0% pentru vânzătorii terți?
**DA, 100% legal.** În România (Legea comerțului electronic 365/2002 și OUG 34/2014):
- Dacă alegi să nu percepi comision (0%), este o decizie comercială legitimă (model freemium / portal de listing).
- **Facturare directă**: Vânzătorii terți emit factură direct pe firma lor (CUI) către cumpărătorul final. Tu **NU** ești intermediar fiscal și **NU** colectezi TVA pentru ei.
- **Încasări pe cardul lor**: Banii intră direct în contul bancar al vânzătorului (prin Stripe Connect Direct Charges sau ramburs virat de curier direct în contul vânzătorului).
- **Expediere & Garanție**: Fiecare vânzător își generează propriul AWB de curierat și răspunde direct pentru garanție și retur.

### Faza Curentă: Focus pe Magazinul Tău E-Commerce
Deoarece momentan nu ai alți vânzători înscriși:
- Magazinul este configurat să funcționeze ca un **magazin online direct**:
  - Tu ești vânzătorul principal (**TopinStock Oficial**).
  - Comenzile intră direct în panoul tău de administrare: `https://topinstock.ro/admin/comenzi`.
  - Tu emiți factura pe firma ta (ex: prin SmartBill, FGO, Oblio).
  - Tu expediazi coletele prin curier (Sameday, Fan Courier, DPD etc.).
  - Încasezi banii la livrare (ramburs în contul tău) sau online prin procesator de carduri.

---

## 2. Opțiuni de Găzduire Recomandate

### Opțiunea A: Server VPS Ubuntu (Recomandat — Cost ~4-5 EUR/lună)
*Exemple de furnizori: Hetzner Cloud, Hostinger VPS, DigitalOcean.*
**Avantaj**: Păstrează baza de date SQLite actuală (`topinstock.db`) cu toate cele 3.369+ produse fără costuri suplimentare pentru baze de date externe.

#### Pași pe VPS Ubuntu:
```bash
# 1. Conectare prin SSH la VPS
ssh root@ip-ul-serverului-tau

# 2. Instalare Node.js 20 și PM2
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs nginx git certbot python3-certbot-nginx
npm install -g pm2

# 3. Clonare proiect sau copiere fișiere
git clone <url-ul-tau-github> /var/www/topinstock
cd /var/www/topinstock/topinstock-marketplace/topinstock-app

# 4. Instalare dependințe și build
npm ci
cp .env.production.example .env.production
# Editează .env.production cu domeniul tău: nano .env.production
npx prisma generate
npm run build

# 5. Pornire serviciu cu PM2 (auto-restart la reboot)
pm2 start npm --name "topinstock" -- start
pm2 save
pm2 startup

# 6. Configurare Nginx Reverse Proxy
# Redirecționează traficul de pe portul 80/443 către portul 3000
nano /etc/nginx/sites-available/topinstock
```

Exemplu bloc Nginx:
```nginx
server {
    server_name topinstock.ro www.topinstock.ro;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/topinstock /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# 7. Activare Certificat SSL Gratuit (HTTPS)
certbot --nginx -d topinstock.ro -d www.topinstock.ro
```

---

### Opțiunea B: Deploy cu Docker Compose
Dacă ai Docker instalat pe server:
```bash
docker compose up -d --build
```
Aplicația va porni automat pe portul 3000, iar baza de date SQLite va fi mapată persistent în `./prisma/topinstock.db`.

---

### Opțiunea C: Vercel (Serverless)
Dacă vrei să găzduiești pe Vercel (gratuit pe tier-ul Hobby):
1. Conectezi depozitul GitHub la contul tău Vercel.
2. La Environment Variables adaugi:
   - `NEXT_PUBLIC_APP_URL` = `https://topinstock.ro`
   - `NEXTAUTH_SECRET` = `<cheie_secreta>`
   - `DATABASE_URL` = Necesită o bază de date hosted (deoarece pe Vercel fișierele locale SQLite sunt read-only). Poți folosi gratuit:
     * **Supabase** (PostgreSQL gratuit)
     * **Neon.tech** (PostgreSQL serverless gratuit)
     * **Turso** (SQLite/LibSQL hosted gratuit)

---

## 3. Checklist Înainte de Lansarea Publică

1. **Domeniu Web**: Cumpără domeniul (ex: de pe RoTLD sau Namecheap/Hostinger) și setează înregistrările DNS de tip `A` către IP-ul serverului tău.
2. **Date Companie**: Actualizează în `.env.production` numele firmei tale, CUI-ul, numărul de la Registrul Comerțului și adresa de email de contact.
3. **Cont Curierat**: Fă un contract de expediere cu un curier (Sameday, Fan Courier sau DPD) pentru a beneficia de tarife preferențiale la expediere și încasare ramburs în cont.
4. **Google Search Console**: Înscrie domeniul și adaugă sitemap-ul oficial:
   `https://topinstock.ro/sitemap.xml`
