// Renders clip.html at 60 fps (2x pixels) straight into ffmpeg; pairs of frames are averaged into 30 fps (light motion blur).
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');   // PLAYWRIGHT=/path/to/node_modules/playwright if not installed here
const { spawn } = require('child_process');
(async () => {
  const b = await chromium.launch({ channel: 'chrome', headless: true });
  const p = await b.newPage({ viewport: { width: 800, height: 560 }, deviceScaleFactor: 2 });
  await p.goto('file://' + __dirname + '/clip.html'); await p.evaluate(() => document.fonts.ready);
  if (!(await p.evaluate(() => document.fonts.check('600 16px Inter')))) throw new Error('Inter not loaded');
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-c:v', 'png', '-framerate', '60', '-i', '-',
    '-vf', "tmix=frames=2,select='mod(n\\,2)',setpts=N/30/TB", '-r', '30', '-c:v', 'libx264', '-crf', '10', '-preset', 'slow', '-pix_fmt', 'yuv420p', 'master.mp4'], { stdio: ['pipe', 'inherit', 'inherit'] });
  const N = Math.round(await p.evaluate(() => T) * 60);
  for (let i = 0; i < N; i++) {
    await p.evaluate(c => render(c), i / 60);
    const buf = await p.screenshot({ type: 'png' });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); await b.close(); console.log('done');
})();
