import { TextField, Button } from "@mui/material";

function Signup() {
  function doSignup(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    alert("doIt()");
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-center mb-6">Signup</h2>
        <form onSubmit={doSignup} className="space-y-4">
          <TextField fullWidth label="First Name" variant="outlined" />
          <TextField fullWidth label="Last Name" variant="outlined" />
          <TextField fullWidth label="Username" variant="outlined" />
          <TextField
            fullWidth
            label="Password"
            type="password"
            variant="outlined"
          />
          <Button type="submit" fullWidth variant="contained" color="primary">
            Sign up
          </Button>
        </form>
      </div>
    </div>
  );
}

export default Signup;
