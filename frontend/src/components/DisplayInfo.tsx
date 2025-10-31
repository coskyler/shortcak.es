import { Button } from "@mui/material";

function DisplayInfo() {
  return (
    <div className="w-full max-w-4xl mx-auto bg-white shadow-md rounded-lg p-8 mt-8">
      <div className="grid grid-cols-5 gap-4 text-center font-bold text-gray-700 border-b pb-4 mb-4">
        <span>Name</span>
        <span>Clicks</span>
        <span>Link</span>
        <span>Redirects To</span>
        <span>Date</span>
      </div>
    </div>
  );
}
export default DisplayInfo;
