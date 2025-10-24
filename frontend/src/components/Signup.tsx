import { TextField } from "@mui/material";
import { Button } from "@mui/material";

function Signup() {
  function doLogin(event: any): void {
    event.preventDefault();
    alert("doIt()");
  }
  return (
    <div id="loginDiv">
      <span id="inner-title">Signup</span>
      <br />
      <TextField type="text" id="firstName" placeholder="First Name" />
      <br />
      <TextField type="text" id="lastName" placeholder="Last Name" />
      <br />
      <TextField type="text" id="username" placeholder="Username" />
      <br />
      <TextField type="password" id="password" placeholder="Password" />
      <br />
      <Button> Sign up </Button>
    </div>
  );
}
export default Signup;
