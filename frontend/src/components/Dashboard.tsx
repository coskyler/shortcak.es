import { TextField } from "@mui/material";
import { Button } from "@mui/material";

function Dashboard() {
  return (
    <div className="bg-gray-100 min-h-screen flex flex-col items-center justify-center">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-center mb-6">
          Enter a URL to shorten
        </h2>
        <div className="space-y-4">
          <TextField
            fullWidth
            label="Enter URL"
            variant="outlined"
            id="firstName"
          />
          <TextField
            fullWidth
            label="Enter alias"
            variant="outlined"
            id="lastName"
          />
          <Button fullWidth variant="contained" color="primary">
            Shorten
          </Button>
        </div>
      </div>

      <div className="mt-8 bg-white shadow-md rounded-lg p-8 max-w-4xl w-full">
        <div className="flex items-center justify-between mb-6">
          <TextField label="Search" variant="outlined" id="username" />
          <Button variant="outlined">Sort By</Button>
        </div>
        {/* Array of displayInfo */}
      </div>
    </div>
  );
}
export default Dashboard;
