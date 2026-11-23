import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Download, Film, Loader2, Play, Pause, Upload } from 'lucide-react';
import type { Lang } from '../data/cyberData';

interface VideoAnimatorToolProps {
  lang: Lang;
}

type AspectPreset = '16:9' | '9:16';
type MotionStyle = 'zoom' | 'scan' | 'pulse';

export function VideoAnimatorTool({ lang }: VideoAnimatorToolProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const [imageName, setImageName] = useState<string | null>(null);
  const [imageReady, setImageReady] = useState(false);
  const [aspect, setAspect] = useState<AspectPreset>('16:9');
  const [motionStyle, setMotionStyle] = useState<MotionStyle>('scan');
  const [caption, setCaption] = useState(
    'STAY ALERT · NEVER SHARE OTP OR UPI PIN · CALL 1930',
  );
  const [subCaption, setSubCaption] = useState('Cyber Security Awareness · cybercrime.gov.in');
  const [isPlaying, setIsPlaying] = useState(true);
  const [recording, setRecording] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);

  const width = aspect === '16:9' ? 960 : 540;
  const height = aspect === '16:9' ? 540 : 960;

  // Generate a crisp default starter graphic on mount so preview is immediately alive
  useEffect(() => {
    const starterCanvas = document.createElement('canvas');
    starterCanvas.width = 960;
    starterCanvas.height = 540;
    const sctx = starterCanvas.getContext('2d');
    if (sctx) {
      const grad = sctx.createLinearGradient(0, 0, 960, 540);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(0.55, '#0c4a6e');
      grad.addColorStop(1, '#1e293b');
      sctx.fillStyle = grad;
      sctx.fillRect(0, 0, 960, 540);

      // Subtle architectural grid
      sctx.strokeStyle = 'rgba(56, 189, 248, 0.14)';
      sctx.lineWidth = 1;
      for (let x = 0; x < 960; x += 48) {
        sctx.beginPath();
        sctx.moveTo(x, 0);
        sctx.lineTo(x, 540);
        sctx.stroke();
      }
      for (let y = 0; y < 540; y += 48) {
        sctx.beginPath();
        sctx.moveTo(0, y);
        sctx.lineTo(960, y);
        sctx.stroke();
      }

      // Shield emblem
      sctx.fillStyle = '#0284c7';
      sctx.beginPath();
      sctx.moveTo(480, 110);
      sctx.lineTo(590, 155);
      sctx.lineTo(575, 290);
      sctx.lineTo(480, 365);
      sctx.lineTo(385, 290);
      sctx.lineTo(370, 155);
      sctx.closePath();
      sctx.fill();

      sctx.fillStyle = '#ffffff';
      sctx.font = 'bold 54px sans-serif';
      sctx.textAlign = 'center';
      sctx.fillText('1930', 480, 255);
    }

    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      setImageReady(true);
    };
    img.src = starterCanvas.toDataURL('image/png');
  }, []);

  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, [videoUrl]);

  // Continuous preview render loop
  useEffect(() => {
    if (!imageReady) return;
    let rafId = 0;
    const startTime = performance.now();

    const drawFrame = (now: number) => {
      const canvas = canvasRef.current;
      const img = imageRef.current;
      if (!canvas || !img) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const t = isPlaying ? ((now - startTime) % 5000) / 5000 : 0.35;
      const w = canvas.width;
      const h = canvas.height;

      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, w, h);

      // Compute cover fit + smooth motion transform
      const imgRatio = img.width / img.height;
      const canvasRatio = w / h;
      let drawW = w;
      let drawH = h;
      if (imgRatio > canvasRatio) {
        drawH = h;
        drawW = h * imgRatio;
      } else {
        drawW = w;
        drawH = w / imgRatio;
      }

      let scale = 1.04;
      let panX = 0;
      let panY = 0;
      if (motionStyle === 'zoom') {
        scale = 1.0 + Math.sin(t * Math.PI) * 0.14;
        panX = Math.sin(t * Math.PI * 2) * 14;
      } else if (motionStyle === 'scan') {
        scale = 1.08;
        panX = (t - 0.5) * 28;
        panY = Math.sin(t * Math.PI) * 10;
      } else {
        scale = 1.02 + Math.sin(t * Math.PI * 2) * 0.05;
      }

      ctx.save();
      ctx.translate(w / 2 + panX, h / 2 + panY);
      ctx.scale(scale, scale);
      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();

      // Cinematic dark gradient vignette for crisp text readability
      const grad = ctx.createLinearGradient(0, h * 0.45, 0, h);
      grad.addColorStop(0, 'rgba(2, 6, 23, 0.12)');
      grad.addColorStop(1, 'rgba(2, 6, 23, 0.88)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Animated Cyber Scan Line (if scan style)
      if (motionStyle === 'scan') {
        const scanY = t * h;
        const scanGrad = ctx.createLinearGradient(0, scanY - 30, 0, scanY + 6);
        scanGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
        scanGrad.addColorStop(0.85, 'rgba(56, 189, 248, 0.25)');
        scanGrad.addColorStop(1, 'rgba(56, 189, 248, 0.85)');
        ctx.fillStyle = scanGrad;
        ctx.fillRect(0, scanY - 30, w, 36);
      }

      // Shield Pulse Ring (if pulse style)
      if (motionStyle === 'pulse') {
        const radius = 60 + t * Math.min(w, h) * 0.35;
        ctx.beginPath();
        ctx.arc(w / 2, h * 0.42, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(56, 189, 248, ${Math.max(0, 0.65 - t * 0.65)})`;
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Awareness Caption Lower-Third
      const padX = Math.round(w * 0.06);
      const bottomY = h - Math.round(h * 0.09);

      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(padX, bottomY - 56, 6, 48);

      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${aspect === '16:9' ? 24 : 20}px sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText(caption.slice(0, 56), padX + 18, bottomY - 30);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = `${aspect === '16:9' ? 16 : 14}px sans-serif`;
      ctx.fillText(subCaption.slice(0, 64), padX + 18, bottomY - 6);

      if (isPlaying) {
        rafId = requestAnimationFrame(drawFrame);
      }
    };

    rafId = requestAnimationFrame(drawFrame);
    return () => cancelAnimationFrame(rafId);
  }, [imageReady, aspect, motionStyle, caption, subCaption, isPlaying]);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        imageRef.current = img;
        setImageName(file.name);
        setImageReady(true);
      };
      img.src = String(reader.result || '');
    };
    reader.readAsDataURL(file);
  };

  const handleExportVideo = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (typeof MediaRecorder === 'undefined' || !canvas.captureStream) {
      setVideoError(
        lang === 'en'
          ? 'Video recording is not supported in this browser. Try Chrome or Edge.'
          : 'इस ब्राउज़र में वीडियो एक्सपोर्ट उपलब्ध नहीं है। कृपया Chrome या Edge उपयोग करें।',
      );
      return;
    }

    setVideoError(null);
    setRecording(true);
    setIsPlaying(true);

    try {
      const stream = canvas.captureStream(30);
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';
      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) chunks.push(ev.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const nextUrl = URL.createObjectURL(blob);
        setVideoUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return nextUrl;
        });
        setRecording(false);
      };

      recorder.start();
      window.setTimeout(() => {
        if (recorder.state !== 'inactive') {
          recorder.stop();
        }
      }, 4500);
    } catch (err) {
      setRecording(false);
      setVideoError(err instanceof Error ? err.message : 'Unable to record awareness video.');
    }
  };

  return (
    <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Left: Controls & Image Upload */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-sky-700">
          <Film className="h-4 w-4 shrink-0" />
          <span>
            {lang === 'en' ? 'Awareness Motion Studio' : 'जागरूकता वीडियो स्टूडियो'}
          </span>
        </div>
        <h3 className="mt-1.5 text-lg font-bold text-slate-950">
          {lang === 'en' ? 'Animate Image into Safety Reel' : 'फोटो को सुरक्षा वीडियो में बदलें'}
        </h3>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
          {lang === 'en'
            ? 'Upload any photo or poster, choose a motion effect and aspect ratio, and render a 4.5-second animated awareness clip locally in your browser.'
            : 'कोई भी फोटो या पोस्टर अपलोड करें, एनीमेशन स्टाइल चुनें और सीधे ब्राउज़र में जागरूकता वीडियो रील बनाएं।'}
        </p>

        <div className="mt-4 space-y-4">
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-4 text-center hover:border-sky-500 hover:bg-sky-50/40">
            <Upload className="h-5 w-5 text-sky-700" />
            <span className="mt-1.5 text-xs font-semibold text-slate-800">
              {imageName
                ? imageName
                : lang === 'en'
                  ? 'Upload Image / Poster (PNG, JPG)'
                  : 'फोटो या पोस्टर अपलोड करें (PNG / JPG)'}
            </span>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="sr-only" />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="block text-xs font-semibold text-slate-700">
                {lang === 'en' ? 'Aspect Ratio' : 'आकार (Ratio)'}
              </span>
              <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                {(['16:9', '9:16'] as const).map((ratio) => (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() => setAspect(ratio)}
                    className={`rounded-md py-1.5 text-xs font-semibold cursor-pointer ${
                      aspect === ratio
                        ? 'bg-slate-900 text-white'
                        : 'border border-slate-200 bg-slate-50 text-slate-700'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="block text-xs font-semibold text-slate-700">
                {lang === 'en' ? 'Motion Effect' : 'मोशन प्रभाव'}
              </span>
              <select
                value={motionStyle}
                onChange={(e) => setMotionStyle(e.target.value as MotionStyle)}
                className="mt-1.5 w-full rounded-md border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-800"
              >
                <option value="scan">{lang === 'en' ? 'Cyber Scan Sweep' : 'साइबर स्कैन'}</option>
                <option value="zoom">{lang === 'en' ? 'Cinematic Zoom' : 'ज़ूम और पैन'}</option>
                <option value="pulse">{lang === 'en' ? 'Shield Radar Wave' : 'शील्ड रडार तरंग'}</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="reel-headline" className="block text-xs font-semibold text-slate-700">
              {lang === 'en' ? 'Safety Headline Overlay' : 'मुख्य चेतावनी संदेश'}
            </label>
            <input
              id="reel-headline"
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-sky-600 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="reel-sub" className="block text-xs font-semibold text-slate-700">
              {lang === 'en' ? 'Subtitle / Helpline' : 'उप-शीर्षक / हेल्पलाइन'}
            </label>
            <input
              id="reel-sub"
              type="text"
              value={subCaption}
              onChange={(e) => setSubCaption(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-sky-600 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => setIsPlaying((p) => !p)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 cursor-pointer"
            >
              {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              <span>
                {isPlaying
                  ? lang === 'en'
                    ? 'Pause Preview'
                    : 'प्रीव्यू रोकें'
                  : lang === 'en'
                    ? 'Play Preview'
                    : 'प्रीव्यू चलाएं'}
              </span>
            </button>

            <button
              type="button"
              disabled={recording || !imageReady}
              onClick={handleExportVideo}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50 cursor-pointer whitespace-nowrap"
            >
              {recording ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Film className="h-3.5 w-3.5" />}
              <span>
                {recording
                  ? lang === 'en'
                    ? 'Recording 4.5s Clip...'
                    : 'वीडियो रिकॉर्ड हो रहा है...'
                  : lang === 'en'
                    ? 'Render .WEBM Video'
                    : 'वीडियो बनाएं (.WEBM)'}
              </span>
            </button>
          </div>

          {videoError && (
            <p className="text-xs font-medium text-rose-700">{videoError}</p>
          )}
        </div>
      </div>

      {/* Right: Live Animated Canvas & Rendered Video Output */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-7">
        <div className="flex items-center justify-between gap-3">
          <h4 className="text-sm font-bold text-slate-950">
            {lang === 'en' ? 'Live Motion Canvas Preview' : 'लाइव एनीमेशन प्रीव्यू'}
          </h4>
          <span className="font-mono text-xs text-slate-500">
            {width}×{height} ({aspect})
          </span>
        </div>

        <div className="mt-4 flex justify-center rounded-xl border border-slate-200 bg-slate-950 p-3">
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className={aspect === '16:9' ? 'w-full rounded-lg' : 'h-[360px] w-auto rounded-lg'}
          />
        </div>

        {videoUrl && (
          <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-bold text-emerald-950">
                {lang === 'en'
                  ? 'Awareness Video Clip Ready!'
                  : 'आपका जागरूकता वीडियो तैयार है!'}
              </p>
              <a
                href={videoUrl}
                download={`cyber-awareness-${aspect.replace(':', 'x')}.webm`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600"
              >
                <Download className="h-3.5 w-3.5" />
                <span>{lang === 'en' ? 'Download .WEBM' : 'डाउनलोड करें'}</span>
              </a>
            </div>
            <video
              src={videoUrl}
              controls
              loop
              className="mt-3 max-h-[260px] w-full rounded-lg bg-black"
            />
          </div>
        )}
      </div>
    </div>
  );
}
