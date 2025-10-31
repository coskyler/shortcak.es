import { TextField, Button } from "@mui/material";

function Login() {
  function doLogin(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    alert("doIt()");
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-center mb-6">PLEASE LOG IN</h2>
        <form onSubmit={doLogin} className="space-y-4">
          <TextField fullWidth label="Username" variant="outlined" />
          <TextField
            fullWidth
            label="Password"
            type="password"
            variant="outlined"
          />
          <div className="flex justify-between items-center">
            <Button type="submit" variant="contained" color="primary">
              Login
            </Button>
            <Button variant="text">Sign up</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
