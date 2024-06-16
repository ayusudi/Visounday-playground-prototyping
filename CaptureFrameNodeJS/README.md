# Framing Video For Each 5 Seconds

1. Input env 
```
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
PORT=3002
```

2. Open terminal 
```bash
cd CaptureFrameNodeJS
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
  "url": "https://res.cloudinary.com/di1kz1kvd/video/upload/v1718528052/videos/xyps7zrrln44gi8tb9sm.mp4"
}
```

- Response 
```json
{
  "url": "https://res.cloudinary.com/di1kz1kvd/video/upload/v1718528052/videos/xyps7zrrln44gi8tb9sm.mp4",
  "frames": [
    "http://localhost:3002/frames/frame-001.png",
    "http://localhost:3002/frames/frame-002.png",
    "http://localhost:3002/frames/frame-003.png",
    "http://localhost:3002/frames/frame-004.png"
  ]
}
```

![image1](./frames/frame-001.png)
![image2](./frames/frame-002.png)
![image3](./frames/frame-003.png)
![image4](./frames/frame-004.png)