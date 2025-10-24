import { TextField } from "@mui/material";
import { Button } from "@mui/material";

function Dashboard() {
  function doLogin(event: any): void {
    event.preventDefault();
    alert("doIt()");
  }
  return (
    <div id="loginDiv">
      <div>
        <span id="inner-title">Enter a URL to shorten</span>
        <br />
        <TextField type="text" id="firstName" />
        <br />
        <span id="inner-title">Enter alias</span>
        <TextField type="text" id="lastName" />
      </div>

      <div>
        <TextField type="text" id="username" placeholder="Search"/>
        <Button> Sort By </Button>
        {/* Array of displayInfo */}
      </div>
    </div>
  );
}
export default Dashboard;
