export default function ItemSize({ text, property1 = "default", className }) {
  return (
    <div
      className={`inline-flex items-center justify-center px-4 py-2 border border-white rounded ${
        property1 === "active" ? "bg-black text-white" : "bg-white text-black"
      } ${className}`}
    >
      {text}
    </div>
  );
}
