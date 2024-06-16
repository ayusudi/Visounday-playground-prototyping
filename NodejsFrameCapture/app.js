require('dotenv').config();
const express = require('express');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const { v2: cloudinary } = require('cloudinary');

const app = express();
const port = process.env.PORT || 3000;
const outputDir = path.join(__dirname, 'frames');

// Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Middleware to parse JSON bodies
app.use(express.urlencoded({ extended: false }));

// Function to download video from Cloudinary
async function downloadVideo(url, outputPath) {
  const writer = fs.createWriteStream(outputPath);
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream'
  });
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

// Function to extract frames every 5 seconds
function extractFrames(videoPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .on('end', resolve)
      .on('error', reject)
      .output(`${outputDir}/frame-%03d.png`)
      .outputOptions([
        '-vf', 'fps=1/5' // Extract one frame every 5 seconds
      ])
      .run();
  });
}

// Endpoint to receive video URL and process it
app.post('/frames', async (req, res) => {
  const { url } = req.body
  if (!url) {
    return res.status(400).send('Video URL is required');
  }

  const videoFilePath = path.join(__dirname, 'video.mp4');

  try {
    // Download the video
    await downloadVideo(url, videoFilePath);

    // Extract frames
    await extractFrames(videoFilePath);

    // Get the list of extracted frames
    const frames = fs.readdirSync(outputDir).map(file => `http://localhost:${port}/frames/${file}`);

    res.json({ url, frames });
  } catch (error) {
    console.error('Error processing video:', error);
    res.status(500).send('Error processing video');
  }
});


// Serve extracted frames
app.get('/frames/:filename', (req, res) => {
  const filePath = path.join(outputDir, req.params.filename);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('Frame not found');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
