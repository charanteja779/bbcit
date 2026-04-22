// Header.js
export default function Header() {
  return (
    <div className="bg-white border-b p-4 flex justify-between">
      <h1 className="text-lg font-medium">Dashboard</h1>
      <input
        type="text"
        placeholder="Search..."
        className="border px-2 py-1 rounded"
      />
    </div>
  );
}