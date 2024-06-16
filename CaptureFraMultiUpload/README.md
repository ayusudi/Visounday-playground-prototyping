# Framing Video For Each 5 Seconds & Upload to Cloudinary

1. Input env 
```
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
PORT=3003
```

2. Open terminal 
```bash
cd CaptureFMultiUpload
npm i 
node app.js 
# Your server is running in http://localhost:3002
```

3. Open postman and run API 

- Method : POST 
- Routes : /frames
- Body : 
```json
{
  "url": "https://res.cloudinary.com/di1kz1kvd/video/upload/v1718528052/videos/xyps7zrrln44gi8tb9sm.mp4",
  "video_id": "xyps7zrrln44gi8tb9sm"
}
```
- Response :
```json
{
    "url": "https://res.cloudinary.com/di1kz1kvd/video/upload/v1718528052/videos/xyps7zrrln44gi8tb9sm.mp4",
    "frames": [
        "http://res.cloudinary.com/di1kz1kvd/image/upload/v1718555691/extracted_frames/xyps7zrrln44gi8tb9sm-frame-001.png",
        "http://res.cloudinary.com/di1kz1kvd/image/upload/v1718555695/extracted_frames/xyps7zrrln44gi8tb9sm-frame-002.png",
        "http://res.cloudinary.com/di1kz1kvd/image/upload/v1718555700/extracted_frames/xyps7zrrln44gi8tb9sm-frame-003.png",
        "http://res.cloudinary.com/di1kz1kvd/image/upload/v1718555709/extracted_frames/xyps7zrrln44gi8tb9sm-frame-004.png"
    ]
}
```