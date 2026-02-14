# Production Deployment Steps

## What We Fixed
- ✅ Database URLs migrated (6 events, 4 danweem) from localhost to production
- ✅ Added smart URL handling (works with S3 or local storage)
- ✅ Added debug endpoints for troubleshooting
- ✅ Enhanced error logging
- ✅ Code pushed to GitHub

## Next: Deploy to Production Server

### Step 1: SSH to Your Production Server
```bash
ssh your-user@backend.dharmadeshana.lk
```

### Step 2: Pull Latest Code
```bash
cd /path/to/dharmadeshana-backend
git pull origin main
```

### Step 3: Transfer uploads Folder
On your local machine:
```bash
# The uploads-backup.zip file is in: E:\Freelancing\dharmadeshana\dharmadeshana-backend\uploads-backup.zip
# Upload it to your production server using SCP, FTP, or your hosting control panel
```

Using SCP (if you have SSH access):
```bash
scp E:\Freelancing\dharmadeshana\dharmadeshana-backend\uploads-backup.zip your-user@backend.dharmadeshana.lk:/path/to/dharmadeshana-backend/
```

### Step 4: Extract Uploads on Production Server
On production server:
```bash
cd /path/to/dharmadeshana-backend
unzip uploads-backup.zip
chmod -R 755 uploads/
```

### Step 5: Configure Production Environment
On production server, edit `.env` file:
```bash
nano .env
```

Add/update these lines:
```
NODE_ENV=production
USE_S3=false
BASE_URL=https://backend.dharmadeshana.lk
```

### Step 6: Restart Backend Service
Depending on your setup:
```bash
# If using PM2:
pm2 restart dharmadeshana-backend

# If using systemctl:
sudo systemctl restart dharmadeshana-backend

# Or if running directly:
# Stop current process and restart with: node server.js
```

### Step 7: Verify Deployment
1. Check debug endpoint:
   ```
   https://backend.dharmadeshana.lk/api/debug/config
   ```
   You should see your configuration and uploads directory structure

2. Test static file access:
   ```
   https://backend.dharmadeshana.lk/uploads/events/2910aaf8-dccd-4980-adb7-1dbb06a91295.jpeg
   ```
   (Replace with actual filename from your database)

3. Test upload from admin dashboard:
   - Go to https://admin.dharmadeshana.lk
   - Try uploading a new event with an image
   - Check if it appears correctly

### Step 8: Check Frontend Image Display
- Visit https://dharmadeshana.lk
- Check if event images and videos display correctly
- Visit https://admin.dharmadeshana.lk
- Verify danweem videos display

## Troubleshooting

### If uploads still fail with 500 error:
1. Check server logs for detailed error messages
2. Verify uploads directory exists and has correct permissions (755)
3. Check debug endpoint: `https://backend.dharmadeshana.lk/api/debug/config`

### If images don't display:
1. Verify files exist in /uploads directory on production server
2. Check CORS headers are being sent (use browser DevTools Network tab)
3. Verify BASE_URL is set correctly in .env

### If you see "permission denied" errors:
```bash
chmod -R 755 uploads/
chown -R your-web-user:your-web-group uploads/
```

## Files Included in Upload
- 6 event images (.jpeg files)
- 4 danweem videos (.mp4 files)
- 7 proof documents (.pdf files)
- **Total: 28 files**

## Important Notes
- ⚠️ Keep .env file secure - never commit to Git
- ⚠️ uploads/ directory is in .gitignore - always transfer manually
- ⚠️ USE_S3=false means files are stored locally, not in AWS S3
- ⚠️ If you switch to S3 later, you'll need valid AWS credentials
