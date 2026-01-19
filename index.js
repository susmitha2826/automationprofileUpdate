const express = require('express');
const cron = require('node-cron');
const { updateNaukriResume } = require('./update-resume'); 
// 👆 rename if your file name is different

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- Helper ----------
async function safeRun(label) {
  console.log(`\n⏰ Job triggered at ${label} | ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
  try {
    await updateNaukriResume();
    console.log(`✅ Completed successfully at ${label}`);
  } catch (err) {
    console.error(`❌ Failed at ${label}`, err.message);
  }
}

// ---------- CRON SCHEDULES (IST) ----------
cron.schedule('0 8 * * *', () => safeRun('08:00 AM'), { timezone: 'Asia/Kolkata' });
cron.schedule('30 8 * * *', () => safeRun('08:30 AM'), { timezone: 'Asia/Kolkata' });
cron.schedule('45 8 * * *', () => safeRun('08:45 AM'), { timezone: 'Asia/Kolkata' });
cron.schedule('0 9 * * *', () => safeRun('09:00 AM'), { timezone: 'Asia/Kolkata' });

// ---------- Health check ----------
app.get('/', (req, res) => {
  res.json({
    status: 'running',
    message: 'Naukri resume cron server is active',
    time: new Date().toISOString()
  });
});

app.get('/run-now', async (req, res) => {
  try {
    await safeRun('MANUAL TEST');
    res.send('Job executed manually. Check logs.');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// ---------- Start server ----------
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log('🕗 Cron scheduled for 08:00, 08:30, 08:45, 09:00 IST');
});
