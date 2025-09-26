# BIDV Meeting Scheduler - Deploy Guide

## 🚀 Deploy lên Netlify với Cloud Storage

### Bước 1: Prepare Code
```bash
npm run build
```

### Bước 2: Setup JSONBin.io (Free Cloud Storage)
1. Đăng ký tại [jsonbin.io](https://jsonbin.io) (Free 100k requests/month)
2. Tạo một bin mới
3. Copy API Key và Bin ID

### Bước 3: Config Environment Variables trên Netlify
Trong Netlify Dashboard → Site Settings → Environment Variables:
```
JSONBIN_API_KEY=your_api_key_here
JSONBIN_BIN_ID=your_bin_id_here
```

### Bước 4: Deploy
1. Connect GitHub repo với Netlify
2. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`

### Bước 5: Custom Domain (Optional)
- Thay đổi `ORG_ID` trong `src/utils/storageKeys.ts` cho từng tổ chức:
  ```typescript
  const ORG_ID = 'bidv-hanoi'; // Unique cho từng chi nhánh
  ```

## 🔧 Multi-Organization Setup

### Cho từng chi nhánh/tổ chức riêng:
1. **Fork repo** cho từng tổ chức
2. **Thay đổi ORG_ID** trong storageKeys.ts:
   ```typescript
   // BIDV Hà Nội
   const ORG_ID = 'bidv-hanoi';
   
   // BIDV TP.HCM  
   const ORG_ID = 'bidv-hcm';
   
   // Công ty ABC
   const ORG_ID = 'company-abc';
   ```
3. **Deploy riêng** trên subdomain:
   - `bidv-hanoi.netlify.app`
   - `bidv-hcm.netlify.app`
   - `company-abc.netlify.app`

## 📊 Features
✅ **Multi-user data persistence**  
✅ **Cloud storage với fallback localStorage**  
✅ **Auto-sync data giữa users**  
✅ **Namespace riêng cho từng tổ chức**  
✅ **Free tier: 100k requests/month**  

## 🛠 Technical Stack
- **Frontend**: React Native Web (Expo)
- **Backend**: Netlify Functions
- **Storage**: JSONBin.io (Free tier)
- **Fallback**: localStorage + memory

## 🔄 Data Flow
```
User Action → App → Netlify Function → JSONBin.io → All Users
```

Mọi thay đổi sẽ được sync real-time cho tất cả users trong cùng organization!
