import { TextField } from "@mui/material";
import { Button } from "@mui/material";

function Login() {
  function doLogin(event: any): void {
    event.preventDefault();
    alert("doIt()");
  }
  return (
    <div id="loginDiv">
      <span id="inner-title">PLEASE LOG IN</span>
      <br />
      <TextField type="text" id="loginName" placeholder="Username" />
      <br />
      <TextField type="password" id="loginPassword" placeholder="Password" />
      <br />
      <Button> Login </Button>
      <Button> Sign up </Button>
      <span id="loginResult"></span>
    </div>
  );
}
export default Login;
