require('dotenv').config(); // This loads environment variables from .env into process.env

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
function extractFrames(videoPath, video_id) {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .on('end', resolve)
      .on('error', reject)
      .output(`${outputDir}/${video_id}-frame-%03d.png`)
      .outputOptions([
        '-vf', 'fps=1/5' // Extract one frame every 5 seconds
      ])
      .run();
  });
}

// Function to upload frames to Cloudinary
async function uploadFramesToCloudinary() {
  const frames = fs.readdirSync(outputDir).map(file => path.join(outputDir, file));
  const uploadedResults = [];

  for (const frame of frames) {
    try {
      const result = await cloudinary.uploader.upload(frame, {
        folder: 'extracted_frames', // optional: folder in Cloudinary where frames will be stored
        public_id: path.basename(frame, path.extname(frame)) // optional: use the base filename as public_id
      });

      // Delete the local frame file after successful upload to Cloudinary
      fs.unlinkSync(frame);

      uploadedResults.push(result);
    } catch (error) {
      console.error('Error uploading frame to Cloudinary:', error);
    }
  }

  return uploadedResults;
}

// Endpoint to receive video URL and process it
app.post('/frames', async (req, res) => {
  const { url, video_id } = req.body
  if (!url) {
    return res.status(400).send('Video URL is required');
  }

  const videoFilePath = path.join(__dirname, 'video.mp4');

  try {
    // Download the video
    await downloadVideo(url, videoFilePath);

    // Extract frames
    await extractFrames(videoFilePath, video_id);

    // Upload frames to Cloudinary
    const uploadedFrames = await uploadFramesToCloudinary();
    fs.unlinkSync(videoFilePath)
    // Respond with Cloudinary URLs of uploaded frames
    let frames = uploadedFrames.map(el => el.url)
    res.json({ url, frames });
  } catch (error) {
    console.error('Error processing video:', error);
    res.status(500).send('Error processing video');
  }
});

// Serve extracted frames (local)
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
