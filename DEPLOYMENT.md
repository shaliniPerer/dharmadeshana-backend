# Production Deployment Guide

## Current Status
✅ Database URLs fixed (localhost → production)
⚠️ Files need to be accessible at production server

## Files Updated in Database
- 6 Events with images/proofs
- 4 Danweem with videos/proofs

## Deploy to Production

### Step 1: Update Production Environment Variables

On your production server, ensure `.env` has:
```env
NODE_ENV=production
BASE_URL=https://backend.dharmadeshana.lk
FRONTEND_URL=https://dharmadeshana.lk
ADMIN_FRONTEND_URL=https://admin.dharmadeshana.lk

# Option A: Use S3 (Recommended)
USE_S3=true
AWS_ACCESS_KEY_ID=your_real_access_key
AWS_SECRET_ACCESS_KEY=your_real_secret_key
S3_BUCKET_NAME=dharmadeshana-uploads
AWS_REGION=ap-south-1

# Option B: Use Local Storage
USE_S3=false
```

### Step 2A: Deploy with S3

1. **Configure AWS S3 Bucket**:
   - Create bucket: `dharmadeshana-uploads`
   - Region: `ap-south-1` (or your preferred region)
   - Enable public read access
   - Add bucket policy:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::dharmadeshana-uploads/*"
       }
     ]
   }
   ```

2. **Update AWS credentials** in production `.env`

3. **Run migration on production server**:
   ```bash
   node scripts/migrateToS3.js
   ```

4. **Restart server**

### Step 2B: Deploy with Local Storage

1. **Copy uploads folder to production**:
   ```bash
   # From your local machine
   scp -r uploads/ user@your-server:/path/to/dharmadeshana-backend/
   
   # Or use SFTP, FTP, or your hosting provider's file manager
   ```

2. **Verify folder structure on server**:
   ```
   dharmadeshana-backend/
   ├── uploads/
   │   ├── events/
   │   │   ├── 433f646b-d498-40ea-9aa4-cb70cc73acba.jpeg
   │   │   ├── 2910aaf8-dccd-4980-adb7-1dbb06a91295.jpeg
   │   │   └── ...
   │   ├── danweem/
   │   │   ├── e923a3a6-3490-4c59-b6f0-dac240ad160e.mp4
   │   │   └── ...
   │   └── proofs/
   │       └── ...
   ```

3. **Set correct permissions**:
   ```bash
   chmod -R 755 uploads/
   ```

4. **Restart server**

### Step 3: Verify Deployment

Test these URLs in browser:
- https://backend.dharmadeshana.lk/api/health
- https://backend.dharmadeshana.lk/uploads/events/433f646b-d498-40ea-9aa4-cb70cc73acba.jpeg
- https://backend.dharmadeshana.lk/uploads/danweem/e923a3a6-3490-4c59-b6f0-dac240ad160e.mp4

Check frontend sites:
- https://dharmadeshana.lk (images should display)
- https://admin.dharmadeshana.lk (images should display)

### Step 4: Push Code to Production

1. **Commit recent changes**:
   ```bash
   git add .
   git commit -m "Fix production URLs and add S3 migration support"
   git push
   ```

2. **Pull on production server** and restart

## Files to Upload

Current files in uploads/:
```
uploads/
├── events/
│   ├── 433f646b-d498-40ea-9aa4-cb70cc73acba.jpeg
│   ├── 2910aaf8-dccd-4980-adb7-1dbb06a91295.jpeg
│   ├── 34d00def-fa41-4cf7-88f8-2bd441e34ec7.jpeg
│   ├── ad4b77fb-8375-47c6-bef3-306ce5179cc8.jpeg
│   ├── 01e94125-b864-4c64-bec0-39f462ace83a.jpeg
│   └── 3fcee807-c37f-4f87-88fc-40b1dcb1437c.jpeg
├── danweem/
│   ├── e923a3a6-3490-4c59-b6f0-dac240ad160e.mp4
│   ├── 147439bf-9f1a-4bf8-b575-fd67f93ee685.mp4
│   ├── f6bba42c-55d7-4fca-b342-8779b16ed3ae.mp4
│   └── 4a03538f-b93a-4167-a56e-114154e82527.mp4
└── proofs/
    ├── 6f772674-a56a-4e32-bd44-059840f386c0.pdf
    ├── ce292140-b867-409b-8a5b-d69fe0fd02f6.pdf
    ├── b84242e6-034a-4c20-b298-89673a113641.pdf
    ├── e0c00e2b-5aab-4c67-87eb-19df45a6e123.pdf
    ├── b8c52383-7ec6-41f4-baf7-5649360aece0.pdf
    ├── 079ea9ea-7890-4d32-b736-ac422b48c7ff.pdf
    └── c1bbe481-4685-40dc-96d1-a0d08830062e.pdf
```

## Troubleshooting

### Images still not loading?
1. Check browser console for errors
2. Verify files exist on server: `ls -la uploads/events/`
3. Check file permissions: `chmod -R 755 uploads/`
4. Verify BASE_URL in production `.env`
5. Restart backend server
6. Clear browser cache

### S3 upload fails?
1. Verify AWS credentials are correct
2. Check S3 bucket exists and is in correct region
3. Verify bucket has public read policy
4. Check IAM permissions for access keys

### CORS errors?
- Backend CORS is already configured for production domains
- Should work automatically once files are accessible
