"use client";

import type { MediaBlock, Locale } from "@/lib/types";
import { pick } from "@/lib/types";

interface MediaBlockRendererProps {
  block: MediaBlock;
  locale: Locale;
}

export default function MediaBlockRenderer({ block, locale }: MediaBlockRendererProps) {
  switch (block.type) {
    case "video":
      return <VideoBlock url={block.videoUrl || ""} />;
    
    case "gallery":
      return <GalleryBlock images={block.images || []} />;
    
    case "instagram":
      return <InstagramBlock url={block.instagramUrl || ""} />;
    
    case "twitter":
      return <TwitterBlock url={block.twitterUrl || ""} />;
    
    case "quote":
      return (
        <QuoteBlock
          text={block.quoteText ? pick(block.quoteText, locale) : ""}
          author={block.quoteAuthor || ""}
        />
      );
    
    case "html":
      return <HTMLBlock html={block.html || ""} />;
    
    case "divider":
      return <DividerBlock style={block.dividerStyle || "solid"} />;
    
    default:
      return null;
  }
}

function VideoBlock({ url }: { url: string }) {
  const embedUrl = getVideoEmbedUrl(url);
  
  if (!embedUrl) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
        ⚠️ Yanlış video URL: {url}
      </div>
    );
  }

  return (
    <div className="aspect-video w-full bg-gray-100 rounded-lg overflow-hidden">
      <iframe
        src={embedUrl}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

function GalleryBlock({ images }: { images: { url: string; caption: string }[] }) {
  if (images.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {images.map((image, index) => (
        <div key={index} className="space-y-1">
          <img
            src={image.url}
            alt={image.caption}
            className="w-full h-48 object-cover rounded-lg"
          />
          {image.caption && (
            <p className="text-xs text-gray-600 text-center">{image.caption}</p>
          )}
        </div>
      ))}
    </div>
  );
}

function InstagramBlock({ url }: { url: string }) {
  return (
    <div className="max-w-lg mx-auto p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <div className="text-sm text-gray-600 mb-2">📷 Instagram Post:</div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline break-all"
      >
        {url}
      </a>
      <div className="mt-3 text-xs text-gray-500">
        (Post saytda görünəcək - bu preview-dir)
      </div>
    </div>
  );
}

function TwitterBlock({ url }: { url: string }) {
  return (
    <div className="max-w-lg mx-auto p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <div className="text-sm text-gray-600 mb-2">🐦 Twitter/X Post:</div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline break-all"
      >
        {url}
      </a>
      <div className="mt-3 text-xs text-gray-500">
        (Tweet saytda görünəcək - bu preview-dir)
      </div>
    </div>
  );
}

function QuoteBlock({ text, author }: { text: string; author: string }) {
  return (
    <blockquote className="border-l-4 border-gray-300 pl-4 py-2 italic text-gray-700 bg-gray-50 rounded-r">
      <p className="text-lg mb-2">"{text}"</p>
      {author && <cite className="text-sm text-gray-600 not-italic">— {author}</cite>}
    </blockquote>
  );
}

function HTMLBlock({ html }: { html: string }) {
  return (
    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <div className="text-xs text-gray-600 mb-2">💻 Custom HTML:</div>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

function DividerBlock({ style }: { style: "solid" | "dashed" | "dotted" | "stars" }) {
  if (style === "stars") {
    return (
      <div className="text-center text-2xl text-gray-400 my-6">
        ✦ ✦ ✦
      </div>
    );
  }

  const borderStyle = {
    solid: "border-solid",
    dashed: "border-dashed",
    dotted: "border-dotted",
  }[style];

  return <hr className={`my-6 border-gray-300 ${borderStyle}`} />;
}

// Helper: Video URL-dən embed URL düzəlt
function getVideoEmbedUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    
    // YouTube
    if (urlObj.hostname.includes("youtube.com") || urlObj.hostname.includes("youtu.be")) {
      let videoId = "";
      if (urlObj.hostname.includes("youtu.be")) {
        videoId = urlObj.pathname.slice(1);
      } else {
        videoId = urlObj.searchParams.get("v") || "";
      }
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }
    
    // Vimeo
    if (urlObj.hostname.includes("vimeo.com")) {
      const videoId = urlObj.pathname.split("/")[1];
      return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
    }
    
    return null;
  } catch {
    return null;
  }
}
