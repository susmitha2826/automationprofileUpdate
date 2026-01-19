# Naukri Resume Auto-Updater (Node.js)

Automatically update your Naukri resume daily using Node.js and scheduled tasks.

## Features

- 🔄 Automatic daily resume updates
- 📅 Built-in scheduling with node-cron
- 📝 Detailed logging
- ⚙️ Easy configuration with .env file
- 🚀 Works on Windows, Mac, and Linux
- 📦 No external cron setup needed

## Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)
- Your resume in .docx format

## Installation

### 1. Install Node.js

If you don't have Node.js installed:
- Visit https://nodejs.org/
- Download and install the LTS version

### 2. Setup Project

```bash
# Create project directory
mkdir naukri-updater
cd naukri-updater

# Copy all project files here
# - package.json
# - index.js
# - update-resume.js
# - .env.example

# Install dependencies
npm install
```

### 3. Add Your Resume

Place your resume file in the project directory and name it `Susmitha_Gopireddy_Full_Stack_Developer.docx`

```
naukri-updater/
├── index.js
├── update-resume.js
├── package.json
├── .env
└── Susmitha_Gopireddy_Full_Stack_Developer.docx  ← Your resume here
```

### 4. Configure Environment Variables

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your details
# Use any text editor
```

Update the `.env` file with your Naukri credentials:

```env
NAUKRI_AUTH_TOKEN=your_actual_token_here
```

## Getting Your Auth Token

1. Open Chrome/Firefox and login to Naukri
2. Press F12 to open Developer Tools
3. Go to the "Network" tab
4. On Naukri, click to update your resume
5. In Network tab, look for requests to `naukri.com`
6. Click on a request and find "Request Headers"
7. Copy the value of the `authorization` header (starts with "Bearer ")
8. Paste it in your `.env` file

## Usage

### Option 1: Run with Built-in Scheduler (Recommended)

This keeps the process running and executes daily at 9 AM:

```bash
npm start
```

The scheduler will:
- Run in the background
- Execute at 9:00 AM daily
- Log all activities
- Keep running until you stop it (Ctrl+C)

### Option 2: Manual Update

To update your resume immediately:

```bash
npm run update
```

### Option 3: Use System Cron (Linux/Mac)

If you prefer system cron:

```bash
# Edit crontab
crontab -e

# Add this line (adjust path):
0 9 * * * cd /path/to/naukri-updater && node update-resume.js
```

### Option 4: Use Windows Task Scheduler

For Windows users who want system-level scheduling:

1. Open "Task Scheduler"
2. Create New Task
3. Trigger: Daily at 9:00 AM
4. Action: Start a program
   - Program: `node`
   - Arguments: `update-resume.js`
   - Start in: `C:\path\to\naukri-updater`

## Configuration Options

### Changing Schedule Time

Edit `index.js` and modify the cron pattern:

```javascript
// Daily at 9:00 AM
cron.schedule('0 0 9 * * *', ...)

// Daily at 6:00 AM
cron.schedule('0 0 6 * * *', ...)

// Daily at 11:00 PM
cron.schedule('0 0 23 * * *', ...)

// Every Monday at 9:00 AM
cron.schedule('0 0 9 * * 1', ...)

// Twice daily (9 AM and 6 PM)
cron.schedule('0 0 9,18 * * *', ...)
```

### Cron Pattern Format

```
* * * * * *
│ │ │ │ │ │
│ │ │ │ │ └─ Day of Week (0-7, 0 or 7 = Sunday)
│ │ │ │ └─── Month (1-12)
│ │ │ └───── Day of Month (1-31)
│ │ └─────── Hour (0-23)
│ └───────── Minute (0-59)
└─────────── Second (0-59, optional)
```

### Changing Timezone

Edit `index.js`:

```javascript
timezone: "Asia/Kolkata"  // India
timezone: "America/New_York"  // US East
timezone: "Europe/London"  // UK
```

## Running as Background Service

### Using PM2 (Recommended for production)

```bash
# Install PM2 globally
npm install -g pm2

# Start the app
pm2 start index.js --name naukri-updater

# Make it start on system boot
pm2 startup
pm2 save

# View logs
pm2 logs naukri-updater

# Stop/restart
pm2 stop naukri-updater
pm2 restart naukri-updater
```

### Using nohup (Linux/Mac)

```bash
nohup node index.js > output.log 2>&1 &
```

### Using Forever

```bash
npm install -g forever
forever start index.js
```

## Monitoring & Logs

### Check Logs

```bash
# View log file
cat naukri_update.log

# Live tail
tail -f naukri_update.log

# Last 20 lines
tail -20 naukri_update.log
```

### PM2 Logs (if using PM2)

```bash
pm2 logs naukri-updater
pm2 logs naukri-updater --lines 100
```

## Troubleshooting

### Token Expired Error

**Problem**: Getting 401 Unauthorized errors

**Solution**: 
1. Get a fresh auth token from browser (see "Getting Your Auth Token")
2. Update `.env` file
3. Restart the application

### Resume File Not Found

**Problem**: Error says resume file not found

**Solution**:
```bash
# Check file exists
ls -la Susmitha_Gopireddy_Full_Stack_Developer.docx

# Make sure filename is exact
mv "your-Susmitha_Gopireddy_Full_Stack_Developer.docx" "Susmitha_Gopireddy_Full_Stack_Developer.docx"
```

### Dependencies Not Installed

**Problem**: Module not found errors

**Solution**:
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

### Port/Process Already Running

**Problem**: App won't start, port in use

**Solution**:
```bash
# Find and kill existing process
ps aux | grep node
kill -9 <process_id>

# Or use PM2
pm2 delete naukri-updater
pm2 start index.js --name naukri-updater
```

### Network Errors

**Problem**: Connection timeout or network errors

**Solution**:
- Check internet connection
- Verify Naukri website is accessible
- Check if behind a proxy/VPN
- Try updating resume manually first to verify credentials

## Project Structure

```
naukri-updater/
├── index.js              # Main scheduler
├── update-resume.js      # Resume update logic
├── package.json          # Dependencies
├── .env                  # Configuration (not in git)
├── .env.example          # Example configuration
├── Susmitha_Gopireddy_Full_Stack_Developer.docx           # Your resume
├── naukri_update.log     # Activity logs
└── node_modules/         # Dependencies (auto-created)
```

## Updating Your Resume

When you want to update your resume:

1. Replace `Susmitha_Gopireddy_Full_Stack_Developer.docx` with your new resume
2. The scheduler will automatically use the new file at next run
3. Or trigger manually: `npm run update`

## Security Notes

⚠️ **Important Security Considerations:**

- Never commit `.env` file to git
- Keep your auth token private
- Token expires periodically - update when needed
- Don't share the project folder with sensitive data
- Use environment variables for sensitive data

## Common Cron Schedules

```javascript
// Every day at 9:00 AM
'0 0 9 * * *'

// Every day at 6:00 AM
'0 0 6 * * *'

// Every weekday at 9:00 AM
'0 0 9 * * 1-5'

// Every Monday at 9:00 AM
'0 0 9 * * 1'

// Twice daily at 9 AM and 6 PM
'0 0 9,18 * * *'

// Every 6 hours
'0 0 */6 * * *'

// Every Sunday at 8:00 AM
'0 0 8 * * 0'
```

## API Reference

### uploadResume()
Uploads the resume file to Naukri's file validation service.

**Returns**: `fileKey` for the uploaded file

### updateProfile(fileKey)
Updates the Naukri profile with the uploaded resume.

**Parameters**:
- `fileKey`: The key returned from file upload

**Returns**: `true` on success

### updateNaukriResume()
Main function that orchestrates the complete update process.

**Returns**: `true` on success, exits with code 1 on failure

## Support & Contributing

If you encounter issues:
1. Check the logs: `cat naukri_update.log`
2. Verify your auth token is valid
3. Ensure resume file exists
4. Check Node.js version: `node --version`

## License

MIT

## Disclaimer

This tool is for personal use only. Respect Naukri's terms of service and rate limits.