export default function MediaViewer({ media = [] }) {
  if (!media || media.length === 0) return <div className="text-sm text-gray-500">No media</div>;
  return (
    <div className="grid grid-cols-2 gap-2">
      {media.map((m, i) => (
        <div key={i} className="border rounded overflow-hidden">
          {m.type === 'video' ? (
            <video src={`http://localhost:4000${m.url}`} controls className="w-full h-40 object-cover" />
          ) : (
            <img src={`http://localhost:4000${m.url}`} alt="media" className="w-full h-40 object-cover" />
          )}
        </div>
      ))}
    </div>
  );
}












