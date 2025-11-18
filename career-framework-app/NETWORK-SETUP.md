# Network Setup Guide

Run the Career Framework App on your network so your entire team can access it from their computers!

## Quick Setup for Network Access

### Option 1: Using the Built-in Server Script (Recommended)

This is the easiest way - the script automatically configures everything:

```bash
npm run server
```

This will:
- ✅ Start the server on your network
- ✅ Show both local and network URLs
- ✅ Automatically open your browser
- ✅ Display your network IP for sharing

**Output Example:**
```
========================================
🚀 Starting Career Framework App Server
========================================

📍 Local Access:
   http://localhost:3000

🌐 Network Access (share with team):
   http://192.168.1.100:3000

💡 Others on your network can access using the Network URL
========================================
```

### Option 2: Standard Next.js Dev Server

```bash
npm run dev
```

Then visit `http://localhost:3000`

## Network Access Scenarios

### Scenario 1: Shared Computer (Same Machine)

Multiple users access the app on the same computer:

1. Start the server: `npm run server`
2. Everyone accesses: `http://localhost:3000`
3. Each user logs in with their own account

### Scenario 2: Local Network (Different Computers)

Multiple users on the same WiFi/LAN network:

1. **On Host Computer** (runs the server):
   ```bash
   npm run server
   ```

2. **Note the Network URL** shown in terminal:
   ```
   http://192.168.1.100:3000
   ```

3. **Share URL with team** - they open it in their browser

4. **Everyone logs in** with their own credentials

### Scenario 3: Shared Network Drive

Install the app on a shared drive so anyone can start it:

1. **Download the app package**:
   - Log in as admin
   - Go to **Downloads** section
   - Click **Download App Package**

2. **Extract to shared drive**:
   ```
   \\SharedDrive\CareerFramework\
   or
   /mnt/shared/CareerFramework/
   ```

3. **Anyone can start the server**:
   - Navigate to the shared folder
   - Run `npm run server`
   - Server will be accessible to everyone on the network

4. **Access from any computer**:
   - Use the network URL shown when server starts
   - Each person logs in with their credentials

## Firewall Configuration

If team members can't connect, you may need to allow port 3000:

### Windows Firewall

```powershell
New-NetFirewallRule -DisplayName "Career Framework App" -Direction Inbound -Port 3000 -Protocol TCP -Action Allow
```

Or manually:
1. Open Windows Defender Firewall
2. Advanced Settings → Inbound Rules → New Rule
3. Port → TCP → Specific local ports: 3000
4. Allow the connection
5. Name it "Career Framework App"

### macOS Firewall

```bash
# Allow Node.js through firewall
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/local/bin/node
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --unblockapp /usr/local/bin/node
```

### Linux (UFW)

```bash
sudo ufw allow 3000/tcp
sudo ufw reload
```

## Finding Your Network IP

### Windows

```cmd
ipconfig
```

Look for "IPv4 Address" under your active network adapter.

### macOS/Linux

```bash
ifconfig
# or
ip addr show
```

Look for `inet` address (not 127.0.0.1).

## Troubleshooting

### Issue: Team members get "Connection Refused"

**Solutions:**
1. Check firewall settings (see above)
2. Ensure server is running: `npm run server`
3. Verify you're using the network IP, not localhost
4. Confirm everyone is on the same network

### Issue: "Address already in use"

**Solution:**
```bash
# Kill process on port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:3000 | xargs kill -9
```

### Issue: IP Address changed

**Why:** DHCP may assign different IPs when you reconnect

**Solutions:**
1. Restart the server to see new IP
2. Set static IP on your computer (advanced)
3. Use hostname instead: `http://COMPUTERNAME:3000`

### Issue: Slow performance

**Solutions:**
1. Install on SSD, not HDD
2. Close unnecessary applications
3. Increase Node.js memory:
   ```bash
   NODE_OPTIONS="--max-old-space-size=4096" npm run server
   ```

## Best Practices

### For Small Teams (2-10 people)

- ✅ Install on one person's computer
- ✅ That person starts server each day
- ✅ Others access via network URL
- ✅ Keep the host computer on during work hours

### For Larger Teams (10+ people)

- ✅ Install on shared network drive
- ✅ Anyone can start the server
- ✅ Use a dedicated computer if possible
- ✅ Consider cloud deployment for better reliability

### For Production Use

Consider deploying to a cloud service:
- **Vercel** (easiest, free tier available)
- **Railway** (includes PostgreSQL)
- **DigitalOcean** (more control)
- **AWS/Azure** (enterprise)

## Security Considerations

### On Local Network

- ✅ App is secure within your private network
- ✅ Passwords are encrypted
- ✅ Sessions use JWT tokens
- ⚠️ Use HTTPS for internet deployment

### Authentication

- Each user has their own login
- Roles control access (Admin/Leader/Agent)
- Sessions expire after inactivity

### Data Privacy

- Database stored locally (SQLite)
- No data sent to external servers
- Full control over your data

## Advanced: Custom Port

To use a different port:

```bash
PORT=8080 npm run server
```

## Advanced: Running as Service

### Windows (Task Scheduler)

1. Create batch file `start-career-app.bat`:
   ```batch
   cd C:\path\to\career-framework-app
   npm run server
   ```

2. Task Scheduler → Create Basic Task
3. Trigger: At startup
4. Action: Start a program → select batch file

### Linux (systemd)

```ini
# /etc/systemd/system/career-framework.service
[Unit]
Description=Career Framework App
After=network.target

[Service]
Type=simple
User=youruser
WorkingDirectory=/path/to/career-framework-app
ExecStart=/usr/bin/npm run server
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable:
```bash
sudo systemctl enable career-framework.service
sudo systemctl start career-framework.service
```

## Downloads & Distribution

### Admin Features

1. **Download Package**:
   - Login as admin
   - Navigate to Downloads
   - Click "Download App Package"

2. **Track Usage**:
   - View download statistics
   - Monitor app usage
   - See team activity

3. **Distribute to Team**:
   - Share ZIP file via email/drive
   - Include INSTALL.txt instructions
   - Provide support for setup

## Need Help?

- Check main [README.md](./README.md) for detailed docs
- See [QUICKSTART.md](./QUICKSTART.md) for quick setup
- Review firewall settings above
- Ensure all team members are on same network

---

**🎉 Happy Networking!**

Once set up, your entire team can collaborate on career development assessments seamlessly!
